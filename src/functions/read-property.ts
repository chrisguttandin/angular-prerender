import { TReadPropertyFunction } from '../types';

export const readProperty: TReadPropertyFunction = (projects, defaultProject, targetSpecifier, property) => {
    const projectSpecifier = targetSpecifier[0] === null ? defaultProject : targetSpecifier[0];

    if (projectSpecifier === undefined) {
        throw new Error('Please specify a project or set the default project.');
    }

    const project = projects[projectSpecifier];

    if (project === undefined) {
        throw new Error(`No project with the name "${projectSpecifier}" was found.`);
    }

    // @todo Remove support for the deprecated 'architect' property.
    const targets = project.targets === undefined ? project.architect : project.targets;

    if (targets === undefined) {
        throw new Error(`No target was found for the "${projectSpecifier}" project.`);
    }

    const target = targets[targetSpecifier[1]];

    if (target === undefined) {
        throw new Error(`The target "${targetSpecifier[1]}" was not found inside the configuration of the "${projectSpecifier}" project.`);
    }

    if (targetSpecifier[2] !== null) {
        const configuration = target.configurations === undefined ? undefined : target.configurations[targetSpecifier[2]];

        if (configuration === undefined) {
            throw new Error(
                `The configuration "${targetSpecifier[2]}" was not found for the target "${targetSpecifier[1]}" inside the configuration of the "${projectSpecifier}" project.`
            );
        }

        if (configuration[property] !== undefined) {
            return configuration[property];
        }
    }

    return target.options[property];
};
