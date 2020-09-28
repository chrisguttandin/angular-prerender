/*
 * @todo This is more or less a copy of Scully's RenderPlugin type.
 * https://github.com/scullyio/scully/blob/main/libs/scully/src/lib/pluginManagement/Plugin.interfaces.ts
 */
import { IHandledRoute } from '../interfaces';

export type TRenderPluginFunction = (html: string, route: IHandledRoute) => Promise<string>;
