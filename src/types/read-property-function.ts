// eslint-disable-next-line import/no-internal-modules, node/file-extension-in-import
import { WorkspaceSchema } from '@schematics/angular/utility/workspace-models';
import { TTargetSpecifier } from '../types';

export type TReadPropertyFunction = (
    projects: WorkspaceSchema['projects'],
    defaultProject: string | undefined,
    targetSpecifier: TTargetSpecifier,
    property: string
) => string;
