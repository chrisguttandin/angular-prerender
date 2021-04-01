import { TPluginName } from './plugin-name';
import { TPostProcessByHtmlPluginFunction } from './post-process-by-html-plugin-function';
import { TRouteProcessPluginFunction } from './route-process-plugin-function';
import { TWrappedPlugin } from './wrapped-plugin-function';

export type TPlugins = Map<'routeProcess', Map<number, [TPluginName, TWrappedPlugin<TRouteProcessPluginFunction>][]>> &
    Map<'postProcessByHtml', Map<number, [TPluginName, TWrappedPlugin<TPostProcessByHtmlPluginFunction>][]>>;
