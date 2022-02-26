import { TPluginName } from './plugin-name.js';
import { TPostProcessByHtmlPluginFunction } from './post-process-by-html-plugin-function.js';
import { TRouteProcessPluginFunction } from './route-process-plugin-function.js';
import { TWrappedPlugin } from './wrapped-plugin-function.js';

export type TPlugins = Map<'routeProcess', Map<number, [TPluginName, TWrappedPlugin<TRouteProcessPluginFunction>][]>> &
    Map<'postProcessByHtml', Map<number, [TPluginName, TWrappedPlugin<TPostProcessByHtmlPluginFunction>][]>>;
