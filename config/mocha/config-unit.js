import { expect, use } from 'chai';
import babelRegister from '@babel/register';
import { join } from 'path';
import { readFileSync } from 'fs';
import sinonChai from 'sinon-chai';

babelRegister(JSON.parse(readFileSync(join(import.meta.dirname, '../babel/test.json'))));

use(sinonChai);

global.expect = expect;
