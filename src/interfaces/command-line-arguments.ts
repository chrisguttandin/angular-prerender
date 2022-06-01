import { TTargetSpecifier } from '../types';
import { INestedParameterValuesMap } from './nested-parameter-values-map.js';

export interface ICommandLineArguments {
    browserTarget: TTargetSpecifier;

    config: string;

    excludeRoutes: string[];

    ignoreStatusCode: boolean;

    includeRoutes: string[];

    parameterValues: INestedParameterValuesMap | INestedParameterValuesMap[];

    preserveIndexHtml: boolean;

    recursive: boolean;

    scullyConfig?: string;

    serverTarget: TTargetSpecifier;

    verbose: boolean;
}
