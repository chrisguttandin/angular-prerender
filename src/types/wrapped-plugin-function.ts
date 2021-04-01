import { IScullyConfig } from '../interfaces';

export type TWrappedPlugin<T> = T extends (...args: infer U) => infer V ? (config: Partial<IScullyConfig>, ...args: U) => V : never;
