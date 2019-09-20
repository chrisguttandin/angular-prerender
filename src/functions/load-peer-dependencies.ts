/*
 * Loading the peer dependencies with this ugly construct is necessary to allow
 * the usage via npx. Currently npx will not install peer dependencies which is
 * fine but it will also not fall back to use the packages which are present in
 * the current working directory. It has to be pointed at those packages
 * explicitly.
 */
export const loadPeerDependencies = async (cwd: string) => {
    const loadPeerDependency = (id: string) => {
        // @todo Use import() instead of require().
        return require(require.resolve(id, { paths: [ cwd ] }));
    };

    loadPeerDependency('zone.js/dist/zone-node');

    const { enableProdMode } = loadPeerDependency('@angular/core');
    const { renderModuleFactory } = loadPeerDependency('@angular/platform-server');

    let provideModuleMap = null;

    // @nguniversal/module-map-ngfactory-loader is an optional peer dependency which is why it may fail to load it.
    try {
        ({ provideModuleMap } = loadPeerDependency('@nguniversal/module-map-ngfactory-loader'));
    } catch { /* */ }

    return { enableProdMode, provideModuleMap, renderModuleFactory };
};
