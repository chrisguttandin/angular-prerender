import { TPostProcessByHtmlPluginFunction } from './post-process-by-html-plugin-function.js';
import { TRouteProcessPluginFunction } from './route-process-plugin-function.js';

export type TPluginFunction = TPostProcessByHtmlPluginFunction | TRouteProcessPluginFunction;
