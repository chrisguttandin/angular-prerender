import { INestedParameterValuesMap, IParameterValuesMap } from '../interfaces';
import { mapRoute } from './map-route';

export const mapRoutes = (
    routes: string[],
    nestedParameterValues: INestedParameterValuesMap | INestedParameterValuesMap[]
): { parameterValueMaps: IParameterValuesMap[]; route: string }[] => {
    return routes
        .map((route) => {
            const parameters = route
                .split(/\//)
                .filter((segment) => segment.startsWith(':'));

            if (parameters.length === 0) {
                return { parameterValueMaps: [ ], route };
            }

            const nestedParameterValuesMapAsArray = Array.isArray(nestedParameterValues)
                ? nestedParameterValues
                : [ nestedParameterValues ];

            const parameterValueMaps = nestedParameterValuesMapAsArray
                .map((nestedParameterValuesMap) => {
                    const parameterValueMap: IParameterValuesMap = parameters
                        .reduce<IParameterValuesMap>((partialParameterValueMap, parameter) => {
                            partialParameterValueMap[parameter] = [ ];

                            return partialParameterValueMap;
                        }, { });

                    mapRoute(route, parameters, parameterValueMap, nestedParameterValuesMap);

                    return parameterValueMap;
                });

            return { parameterValueMaps, route };
        });
};
