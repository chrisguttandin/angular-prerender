import { IMainExports } from '../interfaces';

export const bindRenderFunction = (main: string) => {
    // @todo Use import() instead of require() when dropping support for Node v10.
    const { AppServerModule, renderModule } = <IMainExports>require(main);

    return renderModule.bind(null, AppServerModule);
};
