import { parseAngularRoutes } from 'guess-parser';

export const retrieveRoutes = (tsConfig: string, errorCallback: (err: any) => void): string[] => {
    try {
        return parseAngularRoutes(tsConfig)
            .map(({ path }) => path);
    } catch (err) {
        errorCallback(err);
    }

    return [ ];
};
