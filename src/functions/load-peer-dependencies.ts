/*
 * Loading the peer dependencies with this ugly construct is necessary to allow
 * the usage via npx. Currently npx will not install peer dependencies which is
 * fine but it will also not fall back to use the packages which are present in
 * the current working directory. It has to be pointed at those packages
 * explicitly.
 */
// eslint-disable-next-line no-undef
export const loadPeerDependencies = async (cwd: string, require: NodeRequire) => {
    const loadPeerDependency = (id: string) => import(require.resolve(id, { paths: [cwd] }));
    const loadOptionalPeerDependency = async (id: string) => {
        // Optional peer dependencies may not be installed which is why it may fail to load them.
        try {
            return await loadPeerDependency(id);
        } catch {
            // Ignore errors.
        }

        return {};
    };
    const { RESPONSE: expressResponseToken = null } = await loadOptionalPeerDependency('@nguniversal/express-engine/tokens');

    return { expressResponseToken };
};
