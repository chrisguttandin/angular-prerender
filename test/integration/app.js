const { exec } = require('child_process');
const { mkdir, mkdtemp, readFile, writeFile } = require('fs');
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
const rimrafAsync = promisify(rimraf);
const writeFileAsync = promisify(writeFile);
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
    });

    describe('without any peer dependency', () => {

        beforeEach(async function () {
            this.timeout(600000);

            await execAsync('ng build', { cwd: projectDirectory });
            await execAsync('ng run universe:server', { cwd: projectDirectory });
            await execAsync('npm pack');
        });

        describe('when installed as peer dependency', () => {

            it('should render the default URL', async function () {
                this.timeout(600000);

                await execAsync(`npm install ${ join(cwd(), `angular-prerender-${ version }.tgz`) }`, { cwd: projectDirectory });
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

    describe('with @nguniversal/module-map-ngfactory-loader as peer dependency', () => {

        beforeEach(async function () {
            this.timeout(600000);

            await execAsync('npm install @nguniversal/module-map-ngfactory-loader', { cwd: projectDirectory });

            const content = await readFileAsync(join(projectDirectory, 'src/app/app.server.module.ts'), 'utf8');

            await writeFileAsync(
                join(projectDirectory, 'src/app/app.server.module.ts'),
                content
                    .replace(/'@angular\/platform-server';/, "'@angular/platform-server'; import { ModuleMapLoaderModule } from '@nguniversal/module-map-ngfactory-loader';")
                    .replace(/ServerModule,/, 'ServerModule, ModuleMapLoaderModule')
            );

            await execAsync('ng build', { cwd: projectDirectory });
            await execAsync('ng run universe:server', { cwd: projectDirectory });
            await execAsync('npm pack');
        });

        describe('when installed as peer dependency', () => {

            it('should render the default URL', async function () {
                this.timeout(600000);

                await execAsync(`npm install ${ join(cwd(), `angular-prerender-${ version }.tgz`) }`, { cwd: projectDirectory });
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

    describe('with @nguniversal/express-engine as peer dependency', () => {

        beforeEach(async function () {
            this.timeout(600000);

            await execAsync('npm install @nguniversal/express-engine', { cwd: projectDirectory });
        });

        describe('with a status code below 300', () => {

            beforeEach(async function () {
                this.timeout(600000);

                const content = await readFileAsync(join(projectDirectory, 'src/app/app.component.ts'), 'utf8');

                await writeFileAsync(
                    join(projectDirectory, 'src/app/app.component.ts'),
                    content
                        .replace(/}\sfrom\s'@angular\/core';/, ", Inject } from '@angular/core'; import { RESPONSE } from '@nguniversal/express-engine/tokens';")
                        .replace(/title\s=\s'universe';/, "title = 'universe'; constructor(@Inject(RESPONSE) response: any) { response.status(200); }")
                );

                await execAsync('ng build', { cwd: projectDirectory });
                await execAsync('ng run universe:server', { cwd: projectDirectory });
                await execAsync('npm pack');
            });

            describe('when installed as peer dependency', () => {

                it('should render the default URL', async function () {
                    this.timeout(600000);

                    await execAsync(`npm install ${ join(cwd(), `angular-prerender-${ version }.tgz`) }`, { cwd: projectDirectory });
                    await execAsync('angular-prerender  --ignore-status-code false', { cwd: projectDirectory });

                    const content = await readFileAsync(join(projectDirectory, 'dist/universe/index.html'), 'utf8');

                    expect(content).to.match(/<span.*>universe app is running!<\/span>/);
                });

            });

            describe('when invoked with npx', () => {

                it('should render the default URL', async function () {
                    this.timeout(600000);

                    await execAsync(`npx ${ join(cwd(), `angular-prerender-${ version }.tgz  --ignore-status-code false`) }`, { cwd: projectDirectory });

                    const content = await readFileAsync(join(projectDirectory, 'dist/universe/index.html'), 'utf8');

                    expect(content).to.match(/<span.*>universe app is running!<\/span>/);
                });

            });

        });

        describe('with a status code of 300 and above', () => {

            beforeEach(async function () {
                this.timeout(600000);

                const content = await readFileAsync(join(projectDirectory, 'src/app/app.component.ts'), 'utf8');

                await writeFileAsync(
                    join(projectDirectory, 'src/app/app.component.ts'),
                    content
                        .replace(/}\sfrom\s'@angular\/core';/, ", Inject } from '@angular/core'; import { RESPONSE } from '@nguniversal/express-engine/tokens';")
                        .replace(/title\s=\s'universe';/, "title = 'universe'; constructor(@Inject(RESPONSE) response: any) { response.status(404); }")
                );

                await execAsync('ng build', { cwd: projectDirectory });
                await execAsync('ng run universe:server', { cwd: projectDirectory });
                await execAsync('npm pack');
            });

            describe('when installed as peer dependency', () => {

                it('should not render the default URL', async function () {
                    this.timeout(600000);

                    await execAsync(`npm install ${ join(cwd(), `angular-prerender-${ version }.tgz`) }`, { cwd: projectDirectory });
                    await execAsync('angular-prerender  --ignore-status-code false', { cwd: projectDirectory });

                    const content = await readFileAsync(join(projectDirectory, 'dist/universe/index.html'), 'utf8');

                    expect(content).to.not.match(/<span.*>universe app is running!<\/span>/);
                });

            });

            describe('when invoked with npx', () => {

                it('should not render the default URL', async function () {
                    this.timeout(600000);

                    await execAsync(`npx ${ join(cwd(), `angular-prerender-${ version }.tgz`) } --ignore-status-code false`, { cwd: projectDirectory });

                    const content = await readFileAsync(join(projectDirectory, 'dist/universe/index.html'), 'utf8');

                    expect(content).to.not.match(/<span.*>universe app is running!<\/span>/);
                });

            });

        });

    });

    describe('with @nguniversal/hapi-engine as peer dependency', () => {

        beforeEach(async function () {
            this.timeout(600000);

            await execAsync('npm install @nguniversal/hapi-engine hapi', { cwd: projectDirectory });
        });

        describe('with a status code below 300', () => {

            beforeEach(async function () {
                this.timeout(600000);

                const content = await readFileAsync(join(projectDirectory, 'src/app/app.component.ts'), 'utf8');

                await writeFileAsync(
                    join(projectDirectory, 'src/app/app.component.ts'),
                    content
                        .replace(/}\sfrom\s'@angular\/core';/, ", Inject } from '@angular/core'; import { RESPONSE } from '@nguniversal/hapi-engine/tokens';")
                        .replace(/title\s=\s'universe';/, "title = 'universe'; constructor(@Inject(RESPONSE) response: any) { response.code(200); }")
                );

                await execAsync('ng build', { cwd: projectDirectory });
                await execAsync('ng run universe:server', { cwd: projectDirectory });
                await execAsync('npm pack');
            });

            describe('when installed as peer dependency', () => {

                it('should render the default URL', async function () {
                    this.timeout(600000);

                    await execAsync(`npm install ${ join(cwd(), `angular-prerender-${ version }.tgz`) }`, { cwd: projectDirectory });
                    await execAsync('angular-prerender  --ignore-status-code false', { cwd: projectDirectory });

                    const content = await readFileAsync(join(projectDirectory, 'dist/universe/index.html'), 'utf8');

                    expect(content).to.match(/<span.*>universe app is running!<\/span>/);
                });

            });

            describe('when invoked with npx', () => {

                it('should render the default URL', async function () {
                    this.timeout(600000);

                    await execAsync(`npx ${ join(cwd(), `angular-prerender-${ version }.tgz  --ignore-status-code false`) }`, { cwd: projectDirectory });

                    const content = await readFileAsync(join(projectDirectory, 'dist/universe/index.html'), 'utf8');

                    expect(content).to.match(/<span.*>universe app is running!<\/span>/);
                });

            });

        });

        describe('with a status code of 300 and above', () => {

            beforeEach(async function () {
                this.timeout(600000);

                const content = await readFileAsync(join(projectDirectory, 'src/app/app.component.ts'), 'utf8');

                await writeFileAsync(
                    join(projectDirectory, 'src/app/app.component.ts'),
                    content
                        .replace(/}\sfrom\s'@angular\/core';/, ", Inject } from '@angular/core'; import { RESPONSE } from '@nguniversal/hapi-engine/tokens';")
                        .replace(/title\s=\s'universe';/, "title = 'universe'; constructor(@Inject(RESPONSE) response: any) { response.code(404); }")
                );

                await execAsync('ng build', { cwd: projectDirectory });
                await execAsync('ng run universe:server', { cwd: projectDirectory });
                await execAsync('npm pack');
            });

            describe('when installed as peer dependency', () => {

                it('should not render the default URL', async function () {
                    this.timeout(600000);

                    await execAsync(`npm install ${ join(cwd(), `angular-prerender-${ version }.tgz`) }`, { cwd: projectDirectory });
                    await execAsync('angular-prerender  --ignore-status-code false', { cwd: projectDirectory });

                    const content = await readFileAsync(join(projectDirectory, 'dist/universe/index.html'), 'utf8');

                    expect(content).to.not.match(/<span.*>universe app is running!<\/span>/);
                });

            });

            describe('when invoked with npx', () => {

                it('should not render the default URL', async function () {
                    this.timeout(600000);

                    await execAsync(`npx ${ join(cwd(), `angular-prerender-${ version }.tgz`) } --ignore-status-code false`, { cwd: projectDirectory });

                    const content = await readFileAsync(join(projectDirectory, 'dist/universe/index.html'), 'utf8');

                    expect(content).to.not.match(/<span.*>universe app is running!<\/span>/);
                });

            });

        });

    });

});
