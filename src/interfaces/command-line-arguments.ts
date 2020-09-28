import { TTargetSpecifier } from '../types';
import { INestedParameterValuesMap } from './nested-parameter-values-map';

export interface ICommandLineArguments {
    browserTarget: TTargetSpecifier;

    config: string;

    excludeRoutes: string[];

    ignoreStatusCode: boolean;

    includeRoutes: string[];

    parameterValues: INestedParameterValuesMap | INestedParameterValuesMap[];

    preserveIndexHtml: boolean;

    scullyConfig?: string;

    serverTarget: TTargetSpecifier;

    verbose: boolean;
}
