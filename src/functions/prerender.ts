import { WorkspaceSchema } from '@schematics/angular/utility/workspace-models'; // tslint:disable-line:no-submodule-imports ordered-imports
import chalk from 'chalk';
import { mkdir, readFile, writeFile } from 'fs';
import { dirname, join, sep } from 'path';
import { cwd } from 'process';
import { promisify } from 'util';
import { INestedParameterValuesMap, IPartialExpressResponse, IPartialHapiResponse, IScullyConfig } from '../interfaces';
import { TEnableProdModeFunction, TPlugins, TReadPropertyFunction, TTargetSpecifier } from '../types';
import { bindRenderFunction } from './bind-render-function.js';
import { mapRoutes } from './map-routes.js';
import { preserveIndexHtml } from './preserve-index-html.js';
import { resolveRoutes } from './resolve-routes.js';
import { retrieveRoutes } from './retrieve-routes.js';
import { unbundleTokens } from './unbundle-tokens.js';

const mkdirAsync = promisify(mkdir);
const readFileAsync = promisify(readFile);
const writeFileAsync = promisify(writeFile);

export const prerender = async (
    browserTarget: TTargetSpecifier,
    config: string,
    enableProdMode: TEnableProdModeFunction,
    excludeRoutes: string[],
    expressResponseToken: any,
    hapiResponseToken: any,
    includeRoutes: string[],
    isVerbose: boolean,
    nestedParameterValues: INestedParameterValuesMap | INestedParameterValuesMap[],
    readProperty: TReadPropertyFunction,
    scullyConfig: null | IScullyConfig,
    scullyPlugins: null | TPlugins,
    serverTarget: TTargetSpecifier,
    shouldIgnoreStatusCode: boolean,
    shouldPreserveIndexHtml: boolean
) => {
    enableProdMode();

    if (isVerbose) {
        console.log(chalk`{gray The path of the angular.json config file is "${config}".}`); // tslint:disable-line:max-line-length no-console
    }

    const { defaultProject, projects } = <WorkspaceSchema>JSON.parse(await readFileAsync(config, 'utf8'));

    const browserOutputPath = join(dirname(config), readProperty(projects, defaultProject, browserTarget, 'outputPath'), sep);
    const serverOutputPath = join(dirname(config), readProperty(projects, defaultProject, serverTarget, 'outputPath'), sep);

    if (isVerbose) {
        console.log(chalk`{gray The resolved output path of the browser target is "${browserOutputPath}".}`); // tslint:disable-line:max-line-length no-console
        console.log(chalk`{gray The resolved output path of the server target is "${serverOutputPath}".}`); // tslint:disable-line:max-line-length no-console
    }

    const main = join(serverOutputPath, 'main.js');

    if (isVerbose) {
        console.log(chalk`{gray The path of the main.js file is "${main}".}`); // tslint:disable-line:max-line-length no-console
    }

    const unbundledMain = await unbundleTokens(expressResponseToken, hapiResponseToken, main);

    if (isVerbose && main !== unbundledMain) {
        console.log(chalk`{gray The main.js contains bundled tokens which have been replaced with classic require statements.}`); // tslint:disable-line:max-line-length no-console
    }

    const render = await bindRenderFunction(unbundledMain);

    const index = join(browserOutputPath, 'index.html');

    if (isVerbose) {
        console.log(chalk`{gray The path of the index.html file is "${index}".}`); // tslint:disable-line:max-line-length no-console
    }

    const document = await readFileAsync(index, 'utf8');
    const tsConfig = join(cwd(), readProperty(projects, defaultProject, browserTarget, 'tsConfig'));

    if (isVerbose) {
        console.log(chalk`{gray The path of the tsconfig.json file used to retrieve the routes is "${tsConfig}".}`); // tslint:disable-line:max-line-length no-console
    }

    const retrievedRoutes = retrieveRoutes(
        tsConfig,
        // tslint:disable-next-line no-console
        (err) => console.log(chalk`{yellow Retrieving the routes statically threw an error with the following message "${err.message}".}`)
    );

    if (includeRoutes.length === 0 && retrievedRoutes.length === 0) {
        // tslint:disable-next-line no-console
        console.log(
            chalk`{yellow No routes could be retrieved and no routes are included manually thus the default route at "/" will be added.}`
        );

        retrievedRoutes.push('/');
    }

    const mappedRoutes = mapRoutes([...includeRoutes, ...retrievedRoutes], nestedParameterValues);
    const renderableRoutesWithParameters = mappedRoutes.filter(({ parameterValueMaps, route }) => {
        if (route.match(/\*\*/) !== null) {
            console.log(chalk`{yellow The route at "${route}" will not be rendered because it contains a wildcard.}`); // tslint:disable-line:max-line-length no-console

            return false;
        }

        if (excludeRoutes.includes(route)) {
            console.log(chalk`{yellow The route at "${route}" was excluded.}`); // tslint:disable-line:max-line-length no-console

            return false;
        }

        return (
            parameterValueMaps.length === 0 ||
            parameterValueMaps.every((parameterValueMap) =>
                Object.entries(parameterValueMap).every(([parameter, values]) => {
                    if (values.length === 0) {
                        // tslint:disable-next-line no-console
                        console.log(
                            chalk`{yellow The route at "${route}" will not be rendered because it contains a segement with an unspecified parameter "${parameter}".}`
                        );

                        return false;
                    }

                    return true;
                })
            )
        );
    });

    const resolvedRoutes = resolveRoutes(renderableRoutesWithParameters);
    const routeProcessPlugins = scullyPlugins === null ? [] : scullyPlugins.get('routeProcess') ?? [];
    const routeProcessPluginEntries = Array.from(routeProcessPlugins.entries());

    routeProcessPluginEntries.sort(([a], [b]) => a - b);

    const processedRoutes = await routeProcessPluginEntries
        .map(([, nameAndPlugin]) => nameAndPlugin.map(([, plugin]) => plugin))
        .flat()
        .reduce(
            (promisedRoutes, routeProcessPlugin) =>
                promisedRoutes.then((partiallyProcessedRoutes) =>
                    routeProcessPlugin({ outDir: browserOutputPath, distFolder: browserOutputPath }, partiallyProcessedRoutes)
                ),
            Promise.resolve(resolvedRoutes.map((route) => ({ route })))
        )
        .then((handledRoutes) => handledRoutes.map(({ route }) => route));

    for (const route of processedRoutes) {
        const path = join(browserOutputPath, route, sep);

        await mkdirAsync(path, { recursive: true });

        let statusCode = 200;

        const expressResponse: IPartialExpressResponse = {
            status: (value) => {
                statusCode = value;

                return expressResponse;
            }
        };

        const hapiResponse: IPartialHapiResponse = {
            code: (value) => {
                statusCode = value;

                return hapiResponse;
            }
        };

        const html = await render({
            document,
            extraProviders: [
                expressResponseToken === null
                    ? []
                    : {
                          provide: '_A_HOPEFULLY_UNIQUE_EXPRESS_RESPONSE_TOKEN_',
                          useValue: expressResponse
                      },
                hapiResponseToken === null
                    ? []
                    : {
                          provide: '_A_HOPEFULLY_UNIQUE_HAPI_RESPONSE_TOKEN_',
                          useValue: hapiResponse
                      }
            ],
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
                          postProcessPlugin({ outDir: browserOutputPath, distFolder: browserOutputPath }, partiallyTransformedHtml, {
                              route
                          })
                      );
                  }, Promise.resolve(html))
                : html;

        if (shouldIgnoreStatusCode || statusCode < 300) {
            if (path === browserOutputPath) {
                if (shouldPreserveIndexHtml) {
                    // tslint:disable-next-line no-console
                    console.log(
                        chalk`{green The index.html file will be preserved as start.html because it would otherwise be overwritten.}`
                    );

                    const didUpdateNgServiceWorker = await preserveIndexHtml(browserOutputPath, document, readFileAsync, writeFileAsync);

                    if (didUpdateNgServiceWorker) {
                        console.log(chalk`{green The ngsw.json file was updated to replace index.html with start.html.}`); // tslint:disable-line:max-line-length no-console
                    }
                } else {
                    // tslint:disable-next-line no-console
                    console.log(
                        chalk`{yellow The index.html file will be overwritten by the following route. This can be prevented by using the --preserve-index-html flag.}`
                    );
                }
            }

            await writeFileAsync(join(path, 'index.html'), transformedHtml);

            console.log(chalk`{green The route at "${route}" was rendered successfully.}`); // tslint:disable-line:no-console
        } else {
            console.log(chalk`{yellow The route at "${route}" was skipped because it's status code was ${statusCode}.}`); // tslint:disable-line:max-line-length no-console
        }
    }
};
