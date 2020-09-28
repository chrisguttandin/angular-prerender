import { yellow } from 'chalk';
import { mkdirSync } from 'fs';
import { dirname, join, resolve, sep } from 'path';
import { IScullyConfig } from '../interfaces';
import { TPluginName, TPlugins, TRenderPluginFunction, TWrappedPlugin } from '../types';

const createFolderFor = (filename: string) => mkdirSync(dirname(filename), { recursive: true });

const logWarn = (...text: unknown[]) => console.log(yellow(...text)); // tslint:disable-line:max-line-length no-console

const getMyConfig = () => {}; // tslint:disable-line:no-empty

export const loadScullyConfigAndPlugins = async (
    cwd: string,
    scullyConfigFile?: string
): Promise<{ config: null; plugins: null } | { config: IScullyConfig; plugins: TPlugins }> => {
    if (scullyConfigFile === undefined) {
        return { config: null, plugins: null };
    }

    const filename = require.resolve('@scullyio/scully', { paths: [cwd] });
    const paths = [];

    let path = dirname(filename);

    while (path !== sep) {
        paths.push(join(path, 'node_modules'));

        path = dirname(path);
    }

    paths.push(join(path, 'node_modules'));

    const originalCache = require.cache[filename];
    const scullyConfig = { defaultPostRenderers: [], distFolder: '', outDir: '' };

    require.cache[filename] = {
        children: [],
        exports: {
            createFolderFor,
            getMyConfig,
            logWarn,
            registerPlugin: (type: 'render', name: TPluginName, plugin: TRenderPluginFunction) => {
                let pluginsOfType = plugins.get(type);

                if (pluginsOfType === undefined) {
                    pluginsOfType = new Map();

                    plugins.set(type, pluginsOfType);
                }

                pluginsOfType.set(
                    name,
                    (
                        ...[partialConfig, html, route]: Parameters<TWrappedPlugin<TRenderPluginFunction>>
                    ): ReturnType<TWrappedPlugin<TRenderPluginFunction>> => {
                        Object.assign(scullyConfig, partialConfig);

                        return plugin(html, route);
                    }
                );
            },
            scullyConfig
        },
        filename,
        id: filename,
        loaded: true,
        parent: require.cache[__dirname],
        path: paths[0],
        paths,
        require
    };

    const plugins = new Map<'render', Map<TPluginName, TWrappedPlugin<TRenderPluginFunction>>>();
    const { config } = <{ config: IScullyConfig }>require(resolve(scullyConfigFile));

    if (originalCache === undefined) {
        delete require.cache[filename]; // tslint:disable-line:no-dynamic-delete
    } else {
        require.cache[filename] = originalCache;
    }

    return { config, plugins };
};
