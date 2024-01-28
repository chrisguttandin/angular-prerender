import { TTargetSpecifier } from '../types';
import { INestedParameterValuesMap } from './nested-parameter-values-map.js';

export interface ICommandLineArguments {
    config: string;

    excludeRoutes: string[];

    includeRoutes: string[];

    parameterValues: INestedParameterValuesMap | INestedParameterValuesMap[];

    preserveIndexHtml: boolean;

    recursive: boolean;

    scullyConfig?: string;

    target: TTargetSpecifier;

    verbose: boolean;
}
