import chalk from 'chalk';
import { mkdirSync } from 'fs';
import { dirname, join, resolve, sep } from 'path';
import { JsonValue } from 'type-fest';
import { IScullyConfig } from '../interfaces';
import {
    TPluginFunction,
    TPluginName,
    TPluginType,
    TPlugins,
    TPostProcessByHtmlPluginFunction,
    TRegisterPluginFunction,
    TRouteProcessPluginFunction
} from '../types';

const createFolderFor = (filename: string) => mkdirSync(dirname(filename), { recursive: true });

const logWarn = (...text: unknown[]) => console.log(chalk.yellow(...text)); // tslint:disable-line:max-line-length no-console

const createGetMyConfig = (
    pluginConfig: Map<TPluginName, JsonValue>,
    pluginFunctionStore: WeakMap<TPostProcessByHtmlPluginFunction, TPluginName>
) => {
    return (plugin: TPostProcessByHtmlPluginFunction): JsonValue => {
        const name = pluginFunctionStore.get(plugin);

        return name === undefined ? {} : pluginConfig.get(name) ?? {};
    };
};

const createRegisterPlugin = (
    pluginFunctionStore: WeakMap<TPluginFunction, TPluginName>,
    plugins: TPlugins,
    scullyConfig: IScullyConfig
): TRegisterPluginFunction => {
    return (type: TPluginType, name: TPluginName, plugin: TPluginFunction, priority = 100) => {
        const sanitizedType = type === 'render' ? 'postProcessByHtml' : type;

        if (sanitizedType === 'postProcessByHtml') {
            let pluginsOfType = plugins.get(sanitizedType);

            if (pluginsOfType === undefined) {
                pluginsOfType = new Map();

                plugins.set(sanitizedType, pluginsOfType);
            }

            let pluginsWithSamePriority = pluginsOfType.get(priority);

            if (pluginsWithSamePriority === undefined) {
                pluginsWithSamePriority = [];

                pluginsOfType.set(priority, pluginsWithSamePriority);
            }

            pluginsWithSamePriority.push([
                name,
                (
                    partialConfig: Partial<IScullyConfig>,
                    ...args: Parameters<TPostProcessByHtmlPluginFunction>
                ): ReturnType<TPostProcessByHtmlPluginFunction> => {
                    Object.assign(scullyConfig, partialConfig);

                    return (<TPostProcessByHtmlPluginFunction>plugin)(...args);
                }
            ]);
        } else {
            let pluginsOfType = plugins.get(sanitizedType);

            if (pluginsOfType === undefined) {
                pluginsOfType = new Map();

                plugins.set(sanitizedType, pluginsOfType);
            }

            let pluginsWithSamePriority = pluginsOfType.get(priority);

            if (pluginsWithSamePriority === undefined) {
                pluginsWithSamePriority = [];

                pluginsOfType.set(priority, pluginsWithSamePriority);
            }

            pluginsWithSamePriority.push([
                name,
                (
                    partialConfig: Partial<IScullyConfig>,
                    ...args: Parameters<TRouteProcessPluginFunction>
                ): ReturnType<TRouteProcessPluginFunction> => {
                    Object.assign(scullyConfig, partialConfig);

                    return (<TRouteProcessPluginFunction>plugin)(...args);
                }
            ]);
        }

        pluginFunctionStore.set(plugin, name);
    };
};

const createSetPluginConfig = (pluginConfig: Map<TPluginName, JsonValue>) => {
    return (name: TPluginName, config: JsonValue) => pluginConfig.set(name, config);
};

export const loadScullyConfigAndPlugins = async (
    cwd: string,
    require: NodeRequire,
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
    const pluginConfigStore = new Map<TPluginName, JsonValue>();
    const pluginFunctionStore = new WeakMap<TPluginFunction, TPluginName>();
    const plugins: TPlugins = new Map();
    const scullyConfig = { defaultPostRenderers: [], distFolder: '', outDir: '' };

    require.cache[filename] = {
        children: [],
        exports: {
            createFolderFor,
            getMyConfig: createGetMyConfig(pluginConfigStore, pluginFunctionStore),
            logWarn,
            registerPlugin: createRegisterPlugin(pluginFunctionStore, plugins, scullyConfig),
            scullyConfig,
            setPluginConfig: createSetPluginConfig(pluginConfigStore)
        },
        filename,
        id: filename,
        loaded: true,
        parent: require.cache[__dirname],
        path: paths[0],
        paths,
        require
    };

    const { config } = <{ config: Partial<IScullyConfig> }>await import(resolve(scullyConfigFile));

    if (originalCache === undefined) {
        delete require.cache[filename]; // tslint:disable-line:no-dynamic-delete
    } else {
        require.cache[filename] = originalCache;
    }

    return { config: { ...scullyConfig, ...config }, plugins };
};
