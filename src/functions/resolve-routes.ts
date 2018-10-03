import { IParameterValuesMap } from '../interfaces';

export const resolveRoutes = (routes: string[], parameterValuesMap: IParameterValuesMap) => {
    return routes
        .map((route) => {
            const parameters = route
                .split(/\//)
                .filter((segment) => segment.startsWith(':'));

            if (parameters.length === 0) {
                return [ route ];
            }

            const numberOfPermutations = parameters
                .reduce((sum, parameter) => (sum * parameterValuesMap[parameter].length), 1);
            const resolvedRoutes: string[] = [ ];

            for (let i = 0; i < numberOfPermutations; i += 1) {
                resolvedRoutes.push(parameters
                    .map((parameter, index) => {
                        const parameterValues = parameterValuesMap[parameter];

                        return parameterValues[Math.floor(i / (index + 1)) % parameterValues.length];
                    })
                    .reduce((resolvedRoute, value, index) => {
                        return resolvedRoute.replace(parameters[index], value);
                    }, route));
            }

            return resolvedRoutes;
        })
        .reduce((allResolvedRoutes, resolvedRoutesOfOneRoute) => [ ...allResolvedRoutes, ...resolvedRoutesOfOneRoute ], [ ]);
};
