import type { ApplicationRef, Type } from '@angular/core';

export interface IMainExports {
    default: Type<any> | (() => Promise<ApplicationRef>);
}
