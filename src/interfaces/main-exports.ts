import { Type } from '@angular/core';
import { TRenderModuleFunction } from '../types';

export interface IMainExports {
    AppServerModule: Type<any>;

    renderModule: TRenderModuleFunction;
}
