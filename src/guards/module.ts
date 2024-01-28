import { ApplicationRef, Type } from '@angular/core';

export const isModule = (bootstrapOrModule: Type<any> | (() => Promise<ApplicationRef>)): bootstrapOrModule is Type<any> =>
    'ɵmod' in bootstrapOrModule;
