/*
 * Loading the peer dependencies with this ugly construct is necessary to allow
 * the usage via npx. Currently npx will not install peer dependencies which is
 * fine but it will also not fall back to use the packages which are present in
 * the current working directory. It has to be pointed at those packages
 * explicitly.
 */
export const loadPeerDependencies = async (cwd: string) => {
    const loadPeerDependency = (id: string) => {
        // @todo Use import() instead of require() when dropping support for Node v10.
        return require(require.resolve(id, { paths: [cwd] }));
    };

    const loadOptionalPeerDependency = (id: string) => {
        // Optional peer dependencies may not be installed which is why it may fail to load them.
        try {
            return loadPeerDependency(id);
        } catch {
            /* */
        }

        return {};
    };

    loadPeerDependency('zone.js/dist/zone-node');

    const { enableProdMode } = loadPeerDependency('@angular/core');
    const { RESPONSE: expressResponseToken = null } = loadOptionalPeerDependency('@nguniversal/express-engine/tokens');
    const { RESPONSE: hapiResponseToken = null } = loadOptionalPeerDependency('@nguniversal/hapi-engine/tokens');

    return { enableProdMode, expressResponseToken, hapiResponseToken };
};
