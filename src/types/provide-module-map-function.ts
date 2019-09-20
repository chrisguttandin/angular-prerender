import { NgModuleFactory, StaticProvider, Type } from '@angular/core';

export type TProvideModuleMapFunction = (moduleMap: { [ key: string ]: Type<any> | NgModuleFactory<any> }) => StaticProvider;
