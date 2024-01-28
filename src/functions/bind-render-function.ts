import type { StaticProvider } from '@angular/core';
import { isModule } from '../guards/module.js';
import { IMainExports, IRenderUtilsExports } from '../interfaces';
import { TRenderApplicationFunction } from '../types';

export const bindRenderFunction = async (main: string, renderUtils: string) => {
    const { default: bootstrapOrModule } = <IMainExports>await import(main);
    const { renderApplication, renderModule } = <IRenderUtilsExports>await import(renderUtils);

    if (isModule(bootstrapOrModule)) {
        return ({ document, platformProviders, url }: Parameters<TRenderApplicationFunction>[1]) =>
            renderModule(bootstrapOrModule, { document, extraProviders: <undefined | StaticProvider[]>platformProviders, url });
    }

    return renderApplication.bind(null, bootstrapOrModule);
};
