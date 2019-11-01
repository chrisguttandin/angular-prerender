import 'core-js/es/reflect'; // tslint:disable-line:no-submodule-imports
import { experimental } from '@angular-devkit/core'; // tslint:disable-line:ordered-imports
import { NgModuleFactory } from '@angular/core';
import chalk from 'chalk';
import { mkdir, readFile, writeFile } from 'fs';
import { parseAngularRoutes } from 'guess-parser';
import { dirname, join } from 'path';
import { cwd } from 'process';
import { promisify } from 'util';
import { IModuleMap, IParameterValuesMap } from '../interfaces';
import {
    TEnableProdModeFunction,
    TProvideModuleMapFunction,
    TReadPropertyFunction,
    TRenderModuleFactoryFunction,
    TTargetSpecifier
} from '../types';
import { resolveRoutes } from './resolve-routes';

const mkdirAsync = promisify(mkdir);
const readFileAsync = promisify(readFile);
const writeFileAsync = promisify(writeFile);

export const prerender = async (
    browserTarget: TTargetSpecifier,
    config: string,
    enableProdMode: TEnableProdModeFunction,
    isVerbose: boolean,
    parameterValuesMap: IParameterValuesMap,
    provideModuleMap: null | TProvideModuleMapFunction,
    readProperty: TReadPropertyFunction,
    renderModuleFactory: TRenderModuleFactoryFunction,
    serverTarget: TTargetSpecifier
) => {
    enableProdMode();

    if (isVerbose) {
        console.log(chalk`{gray The path of the angular.json config file is "${ config }".}`); // tslint:disable-line:max-line-length no-console
    }

    const { defaultProject, projects } = <experimental.workspace.WorkspaceSchema> require(config);

    const browserOutputPath = join(dirname(config), readProperty(projects, defaultProject, browserTarget, 'outputPath'));
    const serverOutputPath = join(dirname(config), readProperty(projects, defaultProject, serverTarget, 'outputPath'));

    if (isVerbose) {
        console.log(chalk`{gray The resolved output path of the browser target is "${ browserOutputPath }".}`); // tslint:disable-line:max-line-length no-console
        console.log(chalk`{gray The resolved output path of the server target is "${ serverOutputPath }".}`); // tslint:disable-line:max-line-length no-console
    }

    const main = join(serverOutputPath, 'main');

    if (isVerbose) {
        console.log(chalk`{gray The path of the main.js file is "${ main }".}`); // tslint:disable-line:max-line-length no-console
    }

    const { AppServerModuleNgFactory, LAZY_MODULE_MAP } = <{

        AppServerModuleNgFactory: NgModuleFactory<any>;

        LAZY_MODULE_MAP: IModuleMap;

    }> require(main);

    const index = join(browserOutputPath, 'index.html');

    if (isVerbose) {
        console.log(chalk`{gray The path of the index.html file is "${ index }".}`); // tslint:disable-line:max-line-length no-console
    }

    const document = await readFileAsync(index, 'utf8');
    const tsConfig = join(cwd(), readProperty(projects, defaultProject, browserTarget, 'tsConfig'));

    if (isVerbose) {
        console.log(chalk`{gray The path of the tsconfig.json file used to retrieve the routes is "${ tsConfig }".}`); // tslint:disable-line:max-line-length no-console
    }

    const routes: { path: string }[] = parseAngularRoutes(tsConfig);

    if (routes.length === 0) {
        console.log(chalk`{yellow No routes could be retrieved thus the default route at "/" will be added.}`); // tslint:disable-line:max-line-length no-console

        routes.push({ path: '/' });
    }

    const renderableRoutes = routes
        .map(({ path }) => path)
        .filter((route) => {
            if (route.match(/\*\*/) !== null) {
                console.log(chalk`{yellow The route at "${ route }" will not be rendered because it contains a wildcard.}`); // tslint:disable-line:max-line-length no-console

                return false;
            }

            return route
                .split(/\//)
                .every((segment) => {
                    if (segment.startsWith(':') && parameterValuesMap[segment] === undefined) {
                        console.log(chalk`{yellow The route at "${ route }" will not be rendered because it contains a segement with an unspecified parameter "${ segment }".}`); // tslint:disable-line:max-line-length no-console

                        return false;
                    }

                    return true;
                });
        });

    const resolvedRoutes = resolveRoutes(renderableRoutes, parameterValuesMap);

    for (const route of resolvedRoutes) {
        const path = join(browserOutputPath, route);

        await mkdirAsync(path, { recursive: true });

        const html = await renderModuleFactory(AppServerModuleNgFactory, {
            document,
            extraProviders: (provideModuleMap === null)
                ? [ ]
                : [ provideModuleMap(LAZY_MODULE_MAP) ],
            url: route
        });

        await writeFileAsync(join(path, 'index.html'), html);

        console.log(chalk`{green The route at "${ route }" was rendered successfully.}`); // tslint:disable-line:no-console
    }
};
