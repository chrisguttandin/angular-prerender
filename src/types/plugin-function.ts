import { TPostProcessByHtmlPluginFunction } from './post-process-by-html-plugin-function';
import { TRouteProcessPluginFunction } from './route-process-plugin-function';

export type TPluginFunction = TPostProcessByHtmlPluginFunction | TRouteProcessPluginFunction;
