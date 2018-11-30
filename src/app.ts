#!/usr/bin/env node

import { join } from 'path';
import { cwd } from 'process';
import * as yargs from 'yargs';
import { ICommandLineArguments } from './interfaces';

// @todo Sync this array with the actual peer dependencies.
const peerDependencies = [
    '@angular-devkit/core',
    '@angular/core',
    '@angular/platform-server',
    'zone.js'
];

const missingPeerDependencies = peerDependencies
    .filter((peerDependency) => {
        try {
            require.resolve(peerDependency);
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
    const { browserTarget, config, parameterValues: parameterValuesMap, serverTarget, verbose: isVerbose } = <ICommandLineArguments> yargs
        .help()
        .option('browser-target', {
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
            default: 'server',
            describe: 'specify the target inside your angular.json file which is used to build the server side code',
            type: 'string'
        })
        .option('v', {
            alias: 'verbose',
            default: false,
            describe: 'set this flag if you prefer more detailed log messages',
            type: 'boolean'
        })
        .strict()
        .argv;

    // @todo Use import() instead of require().
    const { prerender } = require('./functions/prerender'); // tslint:disable-line:no-require-imports

    prerender(browserTarget, config, isVerbose, parameterValuesMap, serverTarget);
})();
