import { IParameterValuesMap } from './parameter-values-map';

export interface ICommandLineArguments {

    browserTarget: string;

    config: string;

    parameterValues: IParameterValuesMap;

    serverTarget: string;

    verbose: boolean;

}
