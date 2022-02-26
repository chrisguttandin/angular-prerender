import { IParameterValuesMap } from '../interfaces';
import { isNestedParameterValuesMap } from './nested-parameter-values-map.js';

export const isNestedParameterValuesMapArray = (
    nestedParameterValuesMapArray: unknown
): nestedParameterValuesMapArray is IParameterValuesMap[] =>
    Array.isArray(nestedParameterValuesMapArray) && nestedParameterValuesMapArray.every(isNestedParameterValuesMap);
