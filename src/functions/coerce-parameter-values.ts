import { isParameterValuesMap } from '../guards';
import { IParameterValuesMap } from '../interfaces';

export const coerceParameterValues = (parameterValues: string): IParameterValuesMap => {
    try {
        const parameterValuesMap: unknown = JSON.parse(parameterValues);

        if (typeof parameterValuesMap === 'object'
                && parameterValuesMap !== null
                && !Array.isArray(parameterValuesMap)
                && isParameterValuesMap(parameterValuesMap)) {
            return parameterValuesMap;
        }
    } catch { } // tslint:disable-line:no-empty

    throw new Error(`Please specify valid parameter values. The given value "${ parameterValues }" is invalid.`);
};
