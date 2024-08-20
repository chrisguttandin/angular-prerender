import { mkdir, readFile, writeFile } from 'fs/promises';
import { dirname, join, sep } from 'path';
import { cwd } from 'process';
import { WorkspaceSchema } from '@schematics/angular/utility/workspace-models'; // eslint-disable-line import/no-internal-modules, max-len, node/file-extension-in-import
import chalk from 'chalk';
import { INestedParameterValuesMap, IScullyConfig } from '../interfaces';
import { TPlugins, TReadPropertyFunction, TTargetSpecifier } from '../types';
import { bindRenderFunction } from './bind-render-function.js';
import { mapRoutes } from './map-routes.js';
import { preserveIndexHtml } from './preserve-index-html.js';
import { resolveRoutes } from './resolve-routes.js';
import { retrieveRoutes } from './retrieve-routes.js';
import { scanRoutes } from './scan-routes.js';

export const prerender = async (
    config: string,
    excludeRoutes: string[],
    includeRoutes: string[],
    isRecursive: boolean,
    isVerbose: boolean,
    nestedParameterValues: INestedParameterValuesMap | INestedParameterValuesMap[],
    readProperty: TReadPropertyFunction,
    // eslint-disable-next-line no-undef
    require: NodeRequire,
    scullyConfig: null | IScullyConfig,
    scullyPlugins: null | TPlugins,
    shouldPreserveIndexHtml: boolean,
    target: TTargetSpecifier
) => {
    if (isVerbose) {
        console.log(chalk.gray(`The path of the angular.json config file is "${config}".`)); // eslint-disable-line no-console
    }

    const { defaultProject, projects } = <WorkspaceSchema & { defaultProject?: string }>JSON.parse(await readFile(config, 'utf8'));
    const outputPath = join(dirname(config), readProperty(projects, defaultProject, target, 'outputPath'), sep);
    const browserOutputPath = join(outputPath, 'browser');
    const serverOutputPath = join(outputPath, 'server');

    if (isVerbose) {
        console.log(chalk.gray(`The resolved output path of the browser target is "${browserOutputPath}".`)); // eslint-disable-line max-len, no-console
        console.log(chalk.gray(`The resolved output path of the server target is "${serverOutputPath}".`)); // eslint-disable-line max-len, no-console
    }

    const main = join(serverOutputPath, 'main.server.mjs');
    const renderUtils = join(serverOutputPath, 'render-utils.server.mjs');

    if (isVerbose) {
        console.log(chalk.gray(`The path of the main.server.mjs file is "${main}".`)); // eslint-disable-line no-console
        console.log(chalk.gray(`The path of the render-utils.server.mjs file is "${renderUtils}".`)); // eslint-disable-line no-console
    }

    const render = await bindRenderFunction(main, renderUtils);

    await import(require.resolve('zone.js/node', { paths: [cwd()] }));

    const index = join(browserOutputPath, 'index.html');

    if (isVerbose) {
        console.log(chalk.gray(`The path of the index.html file is "${index}".`)); // eslint-disable-line no-console
    }

    const document = await readFile(index, 'utf8');
    const tsConfig = join(cwd(), readProperty(projects, defaultProject, target, 'tsConfig'));

    if (isVerbose) {
        console.log(chalk.gray(`The path of the tsconfig.json file used to retrieve the routes is "${tsConfig}".`)); // eslint-disable-line max-len, no-console
    }

    const retrievedRoutes = retrieveRoutes(
        tsConfig,
        // eslint-disable-next-line no-console
        (err) => console.log(chalk.yellow(`Retrieving the routes statically threw an error with the following message "${err.message}".`))
    );

    if (includeRoutes.length === 0 && retrievedRoutes.length === 0) {
        // eslint-disable-next-line no-console
        console.log(
            chalk.yellow(`No routes could be retrieved and no routes are included manually thus the default route at "/" will be added.`)
        );

        retrievedRoutes.push('/');
    }

    const mappedRoutes = mapRoutes([...includeRoutes, ...retrievedRoutes], nestedParameterValues);
    const renderableRoutesWithParameters = mappedRoutes.filter(({ parameterValueMaps, route }) => {
        if (route.match(/\*\*/) !== null) {
            console.log(chalk.yellow(`The route at "${route}" will not be rendered because it contains a wildcard.`)); // eslint-disable-line max-len, no-console

            return false;
        }

        if (excludeRoutes.includes(route)) {
            console.log(chalk.yellow(`The route at "${route}" was excluded.`)); // eslint-disable-line no-console

            return false;
        }

        return parameterValueMaps.every((parameterValueMap) =>
            Object.entries(parameterValueMap).every(([parameter, values]) => {
                if (values.length === 0) {
                    // eslint-disable-next-line no-console
                    console.log(
                        chalk.yellow(
                            // eslint-disable-next-line max-len
                            `The route at "${route}" will not be rendered because it contains a segement with an unspecified parameter "${parameter}".`
                        )
                    );

                    return false;
                }

                return true;
            })
        );
    });
    const resolvedRoutes = resolveRoutes(renderableRoutesWithParameters);
    const routeProcessPlugins = scullyPlugins === null ? [] : (scullyPlugins.get('routeProcess') ?? []);
    const routeProcessPluginEntries = Array.from(routeProcessPlugins.entries());

    routeProcessPluginEntries.sort(([a], [b]) => a - b);

    const processedRoutes = await routeProcessPluginEntries
        .map(([, nameAndPlugin]) => nameAndPlugin.map(([, plugin]) => plugin))
        .flat()
        .reduce(
            (promisedRoutes, routeProcessPlugin) =>
                promisedRoutes.then((partiallyProcessedRoutes) =>
                    routeProcessPlugin({ distFolder: browserOutputPath, outDir: browserOutputPath }, partiallyProcessedRoutes)
                ),
            Promise.resolve(resolvedRoutes.map((route) => ({ route })))
        )
        .then((handledRoutes) => handledRoutes.map(({ route }) => route));

    for (const route of processedRoutes) {
        const path = join(browserOutputPath, route, sep);

        await mkdir(path, { recursive: true });

        const html = await render({
            document,
            platformProviders: [],
            url: route
        });
        const transformedHtml =
            scullyConfig !== null && scullyPlugins !== null
                ? await scullyConfig.defaultPostRenderers.reduce<Promise<string>>((promisedHtml, pluginName) => {
                      const postProcessPlugins = scullyPlugins.get('postProcessByHtml');

                      if (postProcessPlugins === undefined) {
                          return promisedHtml;
                      }

                      const postProcessPluginsWithADefaultPriority = postProcessPlugins.get(100);

                      if (postProcessPluginsWithADefaultPriority === undefined) {
                          return promisedHtml;
                      }

                      const [, postProcessPlugin] = postProcessPluginsWithADefaultPriority.find(([name]) => name === pluginName) ?? [];

                      if (postProcessPlugin === undefined) {
                          return promisedHtml;
                      }

                      return promisedHtml.then((partiallyTransformedHtml) =>
                          postProcessPlugin({ distFolder: browserOutputPath, outDir: browserOutputPath }, partiallyTransformedHtml, {
                              route
                          })
                      );
                  }, Promise.resolve(html))
                : html;

        if (path === browserOutputPath) {
            if (shouldPreserveIndexHtml) {
                // eslint-disable-next-line no-console
                console.log(chalk.green(`The index.html file will be preserved as start.html because it would otherwise be overwritten.`));

                const didUpdateNgServiceWorker = await preserveIndexHtml(browserOutputPath, document, readFile, writeFile);

                if (didUpdateNgServiceWorker) {
                    console.log(chalk.green(`The ngsw.json file was updated to replace index.html with start.html.`)); // eslint-disable-line max-len, no-console
                }
            } else {
                // eslint-disable-next-line no-console
                console.log(
                    chalk.yellow(
                        // eslint-disable-next-line max-len
                        `The index.html file will be overwritten by the following route. This can be prevented by using the --preserve-index-html flag.`
                    )
                );
            }
        }

        await writeFile(join(path, 'index.html'), transformedHtml);

        console.log(chalk.green(`The route at "${route}" was rendered successfully.`)); // eslint-disable-line no-console

        if (isRecursive) {
            const additionalRoutes = scanRoutes(html, route).filter((additionalRoute) => !processedRoutes.includes(additionalRoute));

            for (const additionalRoute of additionalRoutes) {
                if (excludeRoutes.includes(additionalRoute)) {
                    console.log(chalk.yellow(`The route at "${additionalRoute}" was excluded.`)); // eslint-disable-line no-console

                    continue;
                }

                processedRoutes.push(additionalRoute);
            }
        }
    }
};
