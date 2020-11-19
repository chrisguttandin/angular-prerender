import { WorkspaceSchema } from '@schematics/angular/utility/workspace-models'; // tslint:disable-line:no-submodule-imports
import { TTargetSpecifier } from '../types';

export type TReadPropertyFunction = (
    projects: WorkspaceSchema['projects'],
    defaultProject: WorkspaceSchema['defaultProject'],
    targetSpecifier: TTargetSpecifier,
    property: string
) => string;
