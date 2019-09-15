/*
 * Loading the peer dependencies with this ugly construct is necessary to allow
 * the usage via npx. Currently npx will not install peer dependencies which is
 * fine but it will also not fall back to use the packages which are present in
 * the current working directory. It has to be pointed at those packages
 * explicitly.
 */
export const loadPeerDependencies = (cwd: string) => {
    // @todo Use import() instead of require().
    require(require.resolve('zone.js/dist/zone-node', { paths: [ cwd ] }));

    const { enableProdMode } = require(require.resolve('@angular/core', { paths: [ cwd ] }));
    const { renderModuleFactory } = require(require.resolve('@angular/platform-server', { paths: [ cwd ] }));

    /*
     * @nguniversal/module-map-ngfactory-loader is a regular dependency of this package but it requires @angular/core which is why it needs
     * to be imported afterwards.
     */
    const { provideModuleMap } = require('@nguniversal/module-map-ngfactory-loader'); // tslint:disable-line:no-require-imports

    return { enableProdMode, provideModuleMap, renderModuleFactory };
};
