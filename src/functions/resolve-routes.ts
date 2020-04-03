import { IParameterValuesMap } from '../interfaces';

export const resolveRoutes = (routesWithParameters: { parameterValueMaps: IParameterValuesMap[]; route: string }[]) => {
    return routesWithParameters
        .map(({ route, parameterValueMaps }) => {
            if (parameterValueMaps.length === 0) {
                return [ route ];
            }

            const resolvedRoutes: string[] = [ ];

            for (const parameterValueMap of parameterValueMaps) {
                const numberOfPermutations = Object
                    .values(parameterValueMap)
                    .reduce((sum, values) => sum * values.length, 1);

                for (let i = 0; i < numberOfPermutations; i += 1) {
                    resolvedRoutes.push(Object
                        .entries(parameterValueMap)
                        .map(([ parameter, values ], index) => [ parameter, values[Math.floor(i / (index + 1)) % values.length] ])
                        .reduce((resolvedRoute, [ parameter, value ]) => resolvedRoute.replace(parameter, value), route));
                }
            }

            return resolvedRoutes;
        })
        .reduce((allResolvedRoutes, resolvedRoutesOfOneRoute) => [ ...allResolvedRoutes, ...resolvedRoutesOfOneRoute ], [ ]);
};
