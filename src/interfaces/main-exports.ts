import { NgModuleFactory, Type } from '@angular/core';
import { TRenderModuleFactoryFunction, TRenderModuleFunction } from '../types';

export interface IMainExports {
    AppServerModule: Type<any>;

    AppServerModuleNgFactory?: NgModuleFactory<any>;

    renderModule: TRenderModuleFunction;

    renderModuleFactory: TRenderModuleFactoryFunction;
}
