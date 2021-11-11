import { INestedParameterValuesMap } from '../interfaces';
import { isNestedParameterValuesMapArray } from './nested-parameter-values-map-array.js';
import { isValueArray } from './value-array.js';
import { isValue } from './value.js';

export const isNestedParameterValuesMap = (nestedParameterValuesMap: unknown): nestedParameterValuesMap is INestedParameterValuesMap => {
    return (
        typeof nestedParameterValuesMap === 'object' &&
        nestedParameterValuesMap !== null &&
        !Array.isArray(nestedParameterValuesMap) &&
        Object.values(nestedParameterValuesMap).every(
            (value) => isValue(value) || isValueArray(value) || isNestedParameterValuesMap(value) || isNestedParameterValuesMapArray(value)
        )
    );
};
