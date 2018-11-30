/*
 * Loading the peer dependencies with this ugly construct is necessary to allow
 * the usage via npx. Currently npx will not install peer dependencies which is
 * fine but it will also not fall back to use the packages which are present in
 * the current working directory. At has to be pointed at those packages
 * explicitly.
 */
export const loadPeerDependencies = (cwd: string) => {
    // @todo Use import() instead of require().
    require(require.resolve('zone.js/dist/zone-node', { paths: [ cwd ] }));

    const { enableProdMode } = require(require.resolve('@angular/core', { paths: [ cwd ] }));
    const { renderModuleFactory } = require(require.resolve('@angular/platform-server', { paths: [ cwd ] }));

    return { enableProdMode, renderModuleFactory };
};
