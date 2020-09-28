/*
 * @todo This is an extremely simplified version of Scully's ScullyConfig interface.
 * https://github.com/scullyio/scully/blob/main/libs/scully/src/lib/utils/interfacesandenums.ts
 */
import { TPluginName } from '../types/plugin-name';

export interface IScullyConfig {
    defaultPostRenderers: TPluginName[];

    distFolder: string;

    outDir: string;
}
