import { IParameterValuesMap } from '../interfaces';

export const isParameterValuesMap = (parameterValuesMap: object): parameterValuesMap is IParameterValuesMap => {
    return Object
        .values(parameterValuesMap)
        .every((values) => Array.isArray(values) && values.every((value) => typeof value === 'string'));
};
