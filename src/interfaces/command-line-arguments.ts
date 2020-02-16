import { TTargetSpecifier } from '../types';
import { IParameterValuesMap } from './parameter-values-map';

export interface ICommandLineArguments {

    browserTarget: TTargetSpecifier;

    config: string;

    excludeRoutes: string[];

    ignoreStatusCode: boolean;

    parameterValues: IParameterValuesMap;

    preserveIndexHtml: boolean;

    serverTarget: TTargetSpecifier;

    verbose: boolean;

}
