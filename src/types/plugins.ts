import { TPluginName } from './plugin-name';
import { TRenderPluginFunction } from './render-plugin-function';
import { TWrappedPlugin } from './wrapped-plugin-function';

export type TPlugins = Map<'render', Map<TPluginName, TWrappedPlugin<TRenderPluginFunction>>>;
