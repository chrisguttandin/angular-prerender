#!/usr/bin/env node

import { join } from 'path';
import { cwd } from 'process';
import yargs from 'yargs';
import { peerDependencies } from './constants';
import { coerceParameterValues } from './functions/coerce-parameter-values';
import { coerceTargetSpecifier } from './functions/coerce-target-specifier';
import { loadPeerDependencies } from './functions/load-peer-dependencies';
import { readProperty } from './functions/read-property';
import { ICommandLineArguments } from './interfaces';

const missingPeerDependencies = peerDependencies
    .filter((peerDependency) => {
        try {
            require.resolve(peerDependency, { paths: [ cwd() ]});
        } catch {
            return true;
        }

        return false;
    });

if (missingPeerDependencies.length > 0) {
    throw new Error(`Some of the required peer dependencies could not be found. (${ missingPeerDependencies.join(', ') })`);
}

if (require.main !== module) {
    throw new Error('This script is meant to be executed from the command line.');
}

(async () => {
    const {
        browserTarget,
        config,
        excludeRoutes,
        ignoreStatusCode: shouldIgnoreStatusCode,
        parameterValues: parameterValuesMap,
        serverTarget,
        verbose: isVerbose
    } = (<yargs.Argv<ICommandLineArguments>> yargs)
        .help()
        .option('browser-target', {
            coerce: coerceTargetSpecifier,
            default: 'build',
            describe: 'specify the target inside your angular.json file which is used to build the single page app',
            type: 'string'
        })
        .option('config', {
            default: join(cwd(), 'angular.json'),
            describe: 'specify the path to the angular.json file',
            type: 'string'
        })
        .option('exclude-routes', {
            default: [],
            describe: 'specify routes to skip',
            type: 'array'
        })
        .option('ignore-status-code', {
            default: true,
            describe: 'set this to false if you want to not render routes that return a status code of 300 or above',
            type: 'boolean'
        })
        .option('parameter-values', {
            coerce: coerceParameterValues,
            default: '{}',
            describe: 'specify the parameter values which should be replaced with the parameter in the routes',
            type: 'string'
        })
        .option('server-target', {
            coerce: coerceTargetSpecifier,
            default: 'server',
            describe: 'specify the target inside your angular.json file which is used to build the server side code',
            type: 'string'
        })
        .option('verbose', {
            alias: 'v',
            default: false,
            describe: 'set this flag if you prefer more detailed log messages',
            type: 'boolean'
        })
        .strict()
        .argv;

    // @todo Use import() instead of require() when dropping support for Node v10.
    const { prerender }: typeof import('./functions/prerender') = require('./functions/prerender'); // tslint:disable-line:max-line-length no-require-imports
    const { enableProdMode, expressResponseToken, hapiResponseToken } = await loadPeerDependencies(cwd());

    prerender(
        browserTarget,
        config,
        enableProdMode,
        excludeRoutes,
        expressResponseToken,
        hapiResponseToken,
        isVerbose,
        parameterValuesMap,
        readProperty,
        serverTarget,
        shouldIgnoreStatusCode
    );
})();
