import { TTargetSpecifier } from '../types';

export const coerceTargetSpecifier = (target: string): TTargetSpecifier => {
    const parts = target.split(':');

    if (parts.length === 1) {
        return [ null, parts[0], null ];
    }

    if (parts.length === 2) {
        return <[ string, string, null ]> [ ...parts, null ];
    }

    if (parts.length === 3) {
        return <[ string, string, string ]> parts;
    }

    throw new Error('The target is invalid.');
};
