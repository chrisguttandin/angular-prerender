import { Arguments } from 'yargs';
import { IParameterValuesMap } from './parameter-values-map';

export interface ICommandLineArguments extends Arguments {

    browserTarget: string;

    config: string;

    parameterValues: IParameterValuesMap;

    serverTarget: string;

}
