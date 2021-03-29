/*
 * @todo This is more or less a copy of Scully's postProcessByHtmlPlugin type.
 * https://github.com/scullyio/scully/blob/main/libs/scully/src/lib/pluginManagement/Plugin.interfaces.ts
 */
import { IHandledRoute } from '../interfaces';

export type TPostProcessByHtmlPluginFunction = (html: string, route: IHandledRoute) => Promise<string>;
