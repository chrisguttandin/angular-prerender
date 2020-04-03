import { TTargetSpecifier } from '../types';
import { INestedParameterValuesMap } from './nested-parameter-values-map';

export interface ICommandLineArguments {

    browserTarget: TTargetSpecifier;

    config: string;

    excludeRoutes: string[];

    ignoreStatusCode: boolean;

    parameterValues: INestedParameterValuesMap | INestedParameterValuesMap[];

    preserveIndexHtml: boolean;

    serverTarget: TTargetSpecifier;

    verbose: boolean;

}
