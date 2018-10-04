#!/usr/bin/env node

import 'core-js/es7/reflect'; // tslint:disable-line:no-submodule-imports
import 'zone.js/dist/zone-node';
import { experimental } from '@angular-devkit/core'; // tslint:disable-line:ordered-imports
import { NgModuleFactory, enableProdMode } from '@angular/core';
import { renderModuleFactory } from '@angular/platform-server';
import { provideModuleMap } from '@nguniversal/module-map-ngfactory-loader';
import chalk from 'chalk';
import { mkdir, readFile, writeFile } from 'fs';
import { parseAngularRoutes } from 'guess-parser';
import { dirname, join } from 'path';
import { promisify } from 'util';
import * as yargs from 'yargs';
import { resolveRoutes } from './functions/resolve-routes';
import { ICommandLineArguments, IModuleMap } from './interfaces';

if (require.main !== module) {
    throw new Error('This script is meant to be executed from the command line.');
}

const mkdirAsync = promisify(mkdir);
const readFileAsync = promisify(readFile);
const writeFileAsync = promisify(writeFile);

(async () => {
    enableProdMode();

    const { browserTarget, config, parameterValues: parameterValuesMap, serverTarget } = <ICommandLineArguments> yargs
        .help()
        .option('browser-target', {
            default: 'build',
            describe: 'specify the target inside your angular.json file which is used to build the single page app',
            type: 'string'
        })
        .option('config', {
            default: join(process.cwd(), 'angular.json'),
            describe: 'specify the path to the angular.json file',
            type: 'string'
        })
        .option('parameter-values', {
            coerce: JSON.parse,
            default: '{}',
            describe: 'specify the parameter values which should be replaced with the parameter in the routes',
            type: 'string'
        })
        .option('server-target', {
            default: 'server',
            describe: 'specify the target inside your angular.json file which is used to build the server side code',
            type: 'string'
        })
        .strict()
        .argv;

    const { defaultProject, projects } = <experimental.workspace.WorkspaceSchema> require(config);

    const project = (defaultProject === undefined) ? Object.keys(projects)[0] : defaultProject;

    // @todo Remove support for the deprecated 'architect' property.
    const targets = (projects[ project ].targets === undefined) ? projects[ project ].architect : projects[ project ].targets;

    if (targets === undefined) {
        throw new Error(`No target was found for the "${ project }" project.`);
    }

    const browserOutputPath = join(dirname(config), targets[browserTarget].options.outputPath);
    const serverOutputPath = join(dirname(config), targets[serverTarget].options.outputPath);

    const { AppServerModuleNgFactory, LAZY_MODULE_MAP } = <{
        AppServerModuleNgFactory: NgModuleFactory<any>,
        LAZY_MODULE_MAP: IModuleMap
    }> require(join(serverOutputPath, 'main'));

    const mkdirRecursively = async (path: string) => {
        try {
            await mkdirAsync(path);
        } catch (err) {
            if (err.code === 'ENOENT') {
                await mkdirRecursively(dirname(path));
                await mkdirAsync(path);
            } else if (err.code !== 'EEXIST') {
                throw err; // tslint:disable-line:rxjs-throw-error
            }
        }
    };

    const index = await readFileAsync(join(browserOutputPath, 'index.html'), 'utf8');

    const routes: { path: string }[] = parseAngularRoutes(join(process.cwd(), targets[browserTarget].options.tsConfig));

    if (routes.length === 0) {
        console.log(chalk`{yellow No routes could be retrieved thus the default route at "/" will be added.}`); // tslint:disable-line:max-line-length no-console

        routes.push({ path: '/' });
    }

    const renderableRoutes = routes
        .map(({ path }) => path)
        .filter((route) => {
            if (route.match(/\*\*/)) {
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

        await mkdirRecursively(path);

        const html = await renderModuleFactory(AppServerModuleNgFactory, {
            document: index,
            extraProviders: [
                provideModuleMap(LAZY_MODULE_MAP)
            ],
            url: route
        });

        await writeFileAsync(join(path, 'index.html'), html);

        console.log(chalk`{green The route at "${ route }" was rendered successfully.}`); // tslint:disable-line:no-console
    }
})();
