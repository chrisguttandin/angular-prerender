const { exec } = require('child_process');
const { mkdir, mkdtemp, readFile } = require('fs');
const { tmpdir } = require('os');
const { join } = require('path');
const { cwd, env } = require('process');
const { promisify } = require('util');
const rimraf = require('rimraf');
const { version } = require('../../package');

// @todo If the EventEmitter gets patched during the test it will throw an RangeError "Maximum call stack size exceeded".
global.__Zone_disable_EventEmitter = true; // eslint-disable-line camelcase

const execAsync = promisify(exec);
const mkdirAsync = promisify(mkdir);
const mkdtempAsync = promisify(mkdtemp);
const readFileAsync = promisify(readFile);
const rimrafAsync = (path) => new Promise((resolve, reject) => rimraf(path, (err) => (err === null) ? resolve() : reject(err)));
const makeFakedTemporaryDirectory = async () => {
    const fakedTemporaryDirectory = join(__dirname, 'temp');

    await mkdirAsync(fakedTemporaryDirectory);

    return fakedTemporaryDirectory;
};

describe('angular-prerender', () => {

    let directory;
    let projectDirectory;

    afterEach(async function () {
        this.timeout(600000);

        await execAsync(`rm angular-prerender-${ version }.tgz`);

        await rimrafAsync(directory);
    });

    beforeEach(async function () {
        this.timeout(600000);

        directory = (env.TRAVIS) ? await makeFakedTemporaryDirectory() : await mkdtempAsync(tmpdir());

        await execAsync('npx @angular/cli new universe --no-interactive --routing', { cwd: directory });

        projectDirectory = join(directory, 'universe');

        await execAsync('ng generate universal --client-project universe', { cwd: projectDirectory });
        await execAsync('ng build', { cwd: projectDirectory });
        await execAsync('ng run universe:server', { cwd: projectDirectory });
        await execAsync('npm pack');
    });

    describe('when installed a peer dependency', () => {

        it('should render the default URL', async function () {
            this.timeout(600000);

            await execAsync(`npm install ${ join(cwd(), `angular-prerender-${ version }.tgz`) } --save-dev`, { cwd: projectDirectory });
            await execAsync('angular-prerender', { cwd: projectDirectory });

            const content = await readFileAsync(join(projectDirectory, 'dist/universe/index.html'), 'utf8');

            expect(content).to.match(/<span.*>universe app is running!<\/span>/);
        });

    });

    describe('when invoked with npx', () => {

        it('should render the default URL', async function () {
            this.timeout(600000);

            await execAsync(`npx ${ join(cwd(), `angular-prerender-${ version }.tgz`) }`, { cwd: projectDirectory });

            const content = await readFileAsync(join(projectDirectory, 'dist/universe/index.html'), 'utf8');

            expect(content).to.match(/<span.*>universe app is running!<\/span>/);
        });

    });

});
