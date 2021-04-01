import { TPluginName } from './plugin-name';
import { TPostProcessByHtmlPluginFunction } from './post-process-by-html-plugin-function';
import { TRouteProcessPluginFunction } from './route-process-plugin-function';

export type TRegisterPluginFunction =
    | ((type: 'postProcessByHtml' | 'render', name: TPluginName, plugin: TPostProcessByHtmlPluginFunction) => void)
    | ((type: 'routeProcess', name: TPluginName, plugin: TRouteProcessPluginFunction, priority?: number) => void);
