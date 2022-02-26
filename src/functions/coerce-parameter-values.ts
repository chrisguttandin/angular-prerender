import { isNestedParameterValuesMapArray } from '../guards/nested-parameter-values-map-array.js';
import { isNestedParameterValuesMap } from '../guards/nested-parameter-values-map.js';
import { INestedParameterValuesMap } from '../interfaces';

export const coerceParameterValues = (parameterValues: string): INestedParameterValuesMap | INestedParameterValuesMap[] => {
    try {
        const json: unknown = JSON.parse(parameterValues);

        if (isNestedParameterValuesMapArray(json) || isNestedParameterValuesMap(json)) {
            return json;
        }
    } catch {} // eslint-disable-line no-empty

    throw new Error(`Please specify valid parameter values. The given value "${parameterValues}" is invalid.`);
};
