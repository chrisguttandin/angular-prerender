import { IMainExports } from '../interfaces';

export const bindRenderFunction = async (main: string) => {
    const {
        default: { AppServerModule, renderModule }
    } = <{ default: IMainExports }>await import(main);

    return renderModule.bind(null, AppServerModule);
};
