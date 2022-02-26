import { TPluginName } from './plugin-name.js';
import { TPostProcessByHtmlPluginFunction } from './post-process-by-html-plugin-function.js';
import { TRouteProcessPluginFunction } from './route-process-plugin-function.js';

export type TRegisterPluginFunction =
    | ((type: 'postProcessByHtml' | 'render', name: TPluginName, plugin: TPostProcessByHtmlPluginFunction) => void)
    | ((type: 'routeProcess', name: TPluginName, plugin: TRouteProcessPluginFunction, priority?: number) => void);
