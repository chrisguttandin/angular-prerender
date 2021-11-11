import { expect, use } from 'chai';
import babelRegister from '@babel/register';
import { readFileSync } from 'fs';
import sinonChai from 'sinon-chai';

babelRegister(JSON.parse(readFileSync(new URL('../babel/test.json', import.meta.url), 'utf8')));

use(sinonChai);

global.expect = expect;
