import { IMainExports } from '../interfaces';

export const bindRenderFunction = (main: string) => {
    // @todo Use import() instead of require() when dropping support for Node v10.
    const { AppServerModule, AppServerModuleNgFactory, renderModule, renderModuleFactory } = <IMainExports>require(main);

    if (AppServerModuleNgFactory === undefined) {
        return renderModule.bind(null, AppServerModule);
    }

    return renderModuleFactory.bind(null, AppServerModuleNgFactory);
};
