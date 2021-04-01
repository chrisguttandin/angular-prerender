/*
 * @todo This is more or less a copy of Scully's RouteProcess type.
 * https://github.com/scullyio/scully/blob/main/libs/scully/src/lib/pluginManagement/Plugin.interfaces.ts
 */
import { IHandledRoute } from '../interfaces';

export type TRouteProcessPluginFunction = (routes: IHandledRoute[]) => Promise<IHandledRoute[]>;
