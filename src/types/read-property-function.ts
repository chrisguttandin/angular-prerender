import { experimental } from '@angular-devkit/core';
import { TTargetSpecifier } from '../types';

export type TReadPropertyFunction = (
    projects: experimental.workspace.WorkspaceSchema['projects'],
    defaultProject: experimental.workspace.WorkspaceSchema['defaultProject'],
    targetSpecifier: TTargetSpecifier,
    property: string
) => string;
