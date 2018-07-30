// @todo This is a copy of an unexported interface used by @nguniversal/module-map-ngfactory-loader.

import { NgModuleFactory, Type } from '@angular/core';

export interface IModuleMap {

    [ key: string ]: Type<any> | NgModuleFactory<any>;

}
