import { TTargetSpecifier } from '../types';
import { IParameterValuesMap } from './parameter-values-map';

export interface ICommandLineArguments {

    browserTarget: TTargetSpecifier;

    config: string;

    excludeRoutes: string[];

    parameterValues: IParameterValuesMap;

    serverTarget: TTargetSpecifier;

    verbose: boolean;

}
