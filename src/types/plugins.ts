import { TPluginName } from './plugin-name';
import { TPluginType } from './plugin-type';
import { TPostProcessByHtmlPluginFunction } from './post-process-by-html-plugin-function';
import { TWrappedPlugin } from './wrapped-plugin-function';

export type TPlugins = Map<Exclude<TPluginType, 'render'>, Map<TPluginName, TWrappedPlugin<TPostProcessByHtmlPluginFunction>>>;
