import { readFile } from 'fs';
import { promisify } from 'util';

const readFileAsync = promisify(readFile);

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

    /*
     * @nguniversal/module-map-ngfactory-loader is a regular dependency of this package but it requires @angular/core which is why it needs
     * to be imported like this to make sure it can resolve @angular/core correctly.
     */
    const source = await readFileAsync(require.resolve('@nguniversal/module-map-ngfactory-loader'), 'utf8');
    const proxyRequire = (id: string) => {
        if (id === '@angular/core') {
            return loadPeerDependency('@angular/core');
        }

        return require(id);
    };
    const { provideModuleMap } = Function(
        'module',
        'require',
        `return ((exports) => {${ source }\nreturn exports })({ })`
    )(null, proxyRequire);

    return { enableProdMode, provideModuleMap, renderModuleFactory };
};
