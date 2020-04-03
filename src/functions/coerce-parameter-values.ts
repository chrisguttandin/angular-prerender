import { isNestedParameterValuesMap, isNestedParameterValuesMapArray } from '../guards';
import { INestedParameterValuesMap } from '../interfaces';

export const coerceParameterValues = (parameterValues: string): INestedParameterValuesMap | INestedParameterValuesMap[] => {
    try {
        const json: unknown = JSON.parse(parameterValues);

        if (isNestedParameterValuesMapArray(json) || isNestedParameterValuesMap(json)) {
            return json;
        }
    } catch { } // tslint:disable-line:no-empty

    throw new Error(`Please specify valid parameter values. The given value "${ parameterValues }" is invalid.`);
};
