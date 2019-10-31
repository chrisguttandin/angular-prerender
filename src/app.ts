#!/usr/bin/env node

import { join } from 'path';
import { cwd } from 'process';
import yargs from 'yargs';
import { peerDependencies } from './constants';
import { coerceTargetSpecifier } from './functions/coerce-target-specifier';
import { loadPeerDependencies } from './functions/load-peer-dependencies';
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
        .option('parameter-values', {
            coerce: JSON.parse,
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

    // @todo Use import() instead of require().
    const { prerender } = require('./functions/prerender'); // tslint:disable-line:no-require-imports
    const { enableProdMode, provideModuleMap, renderModuleFactory } = await loadPeerDependencies(cwd());

    prerender(browserTarget, config, enableProdMode, isVerbose, parameterValuesMap, provideModuleMap, renderModuleFactory, serverTarget);
})();
