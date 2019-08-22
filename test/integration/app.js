const { exec } = require('child_process');
const { mkdir, mkdtemp, readFile, writeFile } = require('fs');
const { tmpdir } = require('os');
const { join } = require('path');
const { env } = require('process');
const { promisify } = require('util');
const rimraf = require('rimraf');
const { dependencies } = require('../../package');

// @todo If the EventEmitter gets patched during the test it will throw an RangeError "Maximum call stack size exceeded".
global.__Zone_disable_EventEmitter = true; // eslint-disable-line camelcase

const execAsync = promisify(exec);
const mkdirAsync = promisify(mkdir);
const mkdtempAsync = promisify(mkdtemp);
const readFileAsync = promisify(readFile);
const rimrafAsync = (path) => new Promise((resolve, reject) => rimraf(path, (err) => (err === null) ? resolve() : reject(err)));
const writeFileAsync = promisify(writeFile);

describe('angular-prerender', () => {

    it('should render the default URL', async function () {
        this.timeout(600000);

        const makeFakedTemporaryDirectory = async () => {
            const fakedTemporaryDirectory = join(__dirname, 'temp');

            await mkdirAsync(fakedTemporaryDirectory);

            return fakedTemporaryDirectory;
        };
        const directory = (env.TRAVIS) ? await makeFakedTemporaryDirectory() : await mkdtempAsync(tmpdir());

        await execAsync('npx @angular/cli new universe --no-interactive --routing', { cwd: directory });

        const projectDirectory = join(directory, 'universe');

        await execAsync('ng generate universal --client-project universe', { cwd: projectDirectory });
        await execAsync('ng build', { cwd: projectDirectory });
        await execAsync('ng run universe:server', { cwd: projectDirectory });
        await execAsync('npm install angular-prerender --save-dev', { cwd: projectDirectory });

        const projectNodeModulesDirectory = join(projectDirectory, 'node_modules');

        await rimrafAsync(join(projectNodeModulesDirectory, 'angular-prerender/build/node'));
        await execAsync(`cp -r ${ join(__dirname, '../../build/node') } ${ join(projectNodeModulesDirectory, 'angular-prerender/build') }`);

        const packageAsString = await readFileAsync(join(projectNodeModulesDirectory, 'angular-prerender/package.json'), 'utf8');

        await writeFileAsync(join(projectNodeModulesDirectory, 'angular-prerender/package.json'), JSON.stringify({ ...JSON.parse(packageAsString), dependencies }, null, 2));
        await execAsync(`mv ${ join(projectNodeModulesDirectory, 'angular-prerender') } ${ join(projectDirectory, 'angular-prerender') }`);
        await execAsync(`rm -rf ${ projectNodeModulesDirectory }`);
        await execAsync(`mkdir ${ projectNodeModulesDirectory }`);
        await execAsync(`mv ${ join(projectDirectory, 'angular-prerender') } ${ join(projectNodeModulesDirectory, 'angular-prerender') }`);
        await execAsync(`rm -rf ${ join(projectNodeModulesDirectory, 'angular-prerender/node_modules') }`);
        await execAsync(`rm ${ join(projectDirectory, 'package-lock.json') }`);
        await execAsync('npm install', { cwd: projectDirectory });
        await execAsync('npm dedupe', { cwd: projectDirectory });

        await execAsync('node node_modules/angular-prerender/build/node/app.js', { cwd: projectDirectory });

        const content = await readFileAsync(join(projectDirectory, 'dist/universe/index.html'), 'utf8');

        expect(content).to.match(/<h1.*> Welcome to universe! <\/h1>/);

        await rimrafAsync(directory);
    });

});
