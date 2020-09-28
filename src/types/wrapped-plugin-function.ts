import { IScullyConfig } from '../interfaces';

export type TWrappedPlugin<T extends (...args: any) => any> = (config: Partial<IScullyConfig>, ...args: Parameters<T>) => ReturnType<T>;
