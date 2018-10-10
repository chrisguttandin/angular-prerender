const { exec } = require('child_process');
const { mkdir, mkdtemp, readFile } = require('fs');
const { tmpdir } = require('os');
const { join } = require('path');
const { env } = require('process');
const { promisify } = require('util');
const rimraf = require('rimraf');

// @todo If the EventEmitter gets patched during the test it will throw an RangeError "Maximum call stack size exceeded".
global.__Zone_disable_EventEmitter = true; // eslint-disable-line camelcase

const execAsync = promisify(exec);
const mkdirAsync = promisify(mkdir);
const mkdtempAsync = promisify(mkdtemp);
const readFileAsync = promisify(readFile);
const rimrafAsync = (path) => new Promise((resolve, reject) => rimraf(path, (err) => (err === null) ? resolve() : reject(err)));

describe('angular-prerender', () => {

    it('should not allow to be imported', () => {
        expect(() => {
            require('../../build/node/app');
        }).to.throw(Error, 'This script is meant to be executed from the command line.');
    });

    it('should render the default URL', async function () {
        this.timeout(240000);

        const makeFakedTemporaryDirectory = async () => {
            const fakedTemporaryDirectory = join(__dirname, 'temp');

            await mkdirAsync(fakedTemporaryDirectory);

            return fakedTemporaryDirectory;
        };
        const directory = (env.TRAVIS) ? await makeFakedTemporaryDirectory() : await mkdtempAsync(tmpdir());

        await execAsync('npx --package @angular/cli ng new universe --routing', { cwd: directory });

        const projectDirectory = join(directory, 'universe');

        await execAsync('ng generate universal --client-project universe', { cwd: projectDirectory });
        await execAsync('ng build', { cwd: projectDirectory });
        await execAsync('ng run universe:server', { cwd: projectDirectory });
        await execAsync('npm install angular-prerender --save-dev', { cwd: projectDirectory });
        await rimrafAsync(join(directory, 'build/node'));
        await execAsync(`cp -r ${ join(__dirname, '../../build/node') } ${ join(projectDirectory, '/node_modules/angular-prerender/build') }`);
        await execAsync('node node_modules/angular-prerender/build/node/app.js', { cwd: projectDirectory });

        const content = await readFileAsync(join(projectDirectory, 'dist/universe/index.html'), 'utf8');

        expect(content).to.match(/<h1(.*)> Welcome to universe! <\/h1>/);

        await rimrafAsync(directory);
    });

});
