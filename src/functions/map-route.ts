import { isValue, isValueArray } from '../guards';
import { INestedParameterValuesMap, IParameterValuesMap } from '../interfaces';

export const mapRoute = (
    route: string,
    parameters: string[],
    parameterValueMap: IParameterValuesMap,
    nestedParameterValuesMap: INestedParameterValuesMap
) => {
    Object.entries(nestedParameterValuesMap).forEach(([parameter, valueOrValueArray]) => {
        if (isValue(valueOrValueArray)) {
            if (parameter.startsWith(':') && parameters.includes(parameter)) {
                parameterValueMap[parameter] = [...parameterValueMap[parameter], valueOrValueArray];
            }
        } else if (isValueArray(valueOrValueArray)) {
            if (parameter.startsWith(':') && parameters.includes(parameter)) {
                parameterValueMap[parameter] = [...parameterValueMap[parameter], ...valueOrValueArray];
            }
        } else {
            if (route.startsWith(parameter)) {
                if (Array.isArray(valueOrValueArray)) {
                    valueOrValueArray.forEach(mapRoute.bind(null, route.slice(parameter.length), parameters, parameterValueMap));
                } else {
                    mapRoute(route.slice(parameter.length), parameters, parameterValueMap, valueOrValueArray);
                }
            }
        }
    });
};
