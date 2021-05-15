const { exec } = require('child_process');
const { mkdir, mkdtemp, readFile, writeFile } = require('fs');
const { tmpdir } = require('os');
const { join, sep } = require('path');
const { cwd, env } = require('process');
const { promisify } = require('util');
const rimraf = require('rimraf');
const { version } = require('../../package');

// eslint-disable-next-line padding-line-between-statements
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

    after(async function () {
        this.timeout(600000);

        await execAsync(`rm angular-prerender-${version}.tgz`);

        await rimrafAsync(directory);
    });

    before(async function () {
        this.timeout(600000);

        directory = env.CI ? await makeFakedTemporaryDirectory() : await mkdtempAsync(`${tmpdir()}${sep}`);

        if (env.CI) {
            await execAsync('git config --global user.email "user@example.com"');
            await execAsync('git config --global user.name "user"');
        }

        await execAsync('npx --package @angular/cli --call "ng new universe --no-interactive --routing"', { cwd: directory });

        projectDirectory = join(directory, 'universe');

        await execAsync('npx --package @angular/cli --call "ng generate universal --project universe"', { cwd: projectDirectory });
        await execAsync('git add --all', { cwd: projectDirectory });
        await execAsync('git commit --amend --no-edit', { cwd: projectDirectory });

        await execAsync('npm pack');
    });

    beforeEach(async () => {
        await execAsync('git checkout .', { cwd: projectDirectory });
        await execAsync('git clean --force', { cwd: projectDirectory });
    });

    for (const renderer of ['Ivy', 'ViewEngine']) {
        describe(`with the ${renderer} renderer`, () => {
            if (renderer === 'ViewEngine') {
                beforeEach(async () => {
                    const content = await readFileAsync(join(projectDirectory, 'tsconfig.app.json'), 'utf8');

                    await writeFileAsync(
                        join(projectDirectory, 'tsconfig.app.json'),
                        content.replace(/]\n}/, '], "angularCompilerOptions": { "enableIvy": false } }')
                    );
                });
            }

            describe('without any peer dependency', () => {
                beforeEach(async function () {
                    this.timeout(600000);

                    await execAsync('npx --package @angular/cli --call "ng build"', { cwd: projectDirectory });
                    await execAsync('npx --package @angular/cli --call "ng run universe:server"', { cwd: projectDirectory });
                });

                describe('when installed as peer dependency', () => {
                    it('should render the default URL', async function () {
                        this.timeout(600000);

                        await execAsync(`npm install ${join(cwd(), `angular-prerender-${version}.tgz`)}`, { cwd: projectDirectory });
                        await execAsync('npx angular-prerender', { cwd: projectDirectory });

                        const content = await readFileAsync(join(projectDirectory, 'dist/universe/browser/index.html'), 'utf8');

                        expect(content).to.match(/<span.*>universe app is running!<\/span>/);
                    });
                });

                describe('when invoked with npx', () => {
                    it('should render the default URL', async function () {
                        this.timeout(600000);

                        await execAsync(`npx ${join(cwd(), `angular-prerender-${version}.tgz`)}`, { cwd: projectDirectory });

                        const content = await readFileAsync(join(projectDirectory, 'dist/universe/browser/index.html'), 'utf8');

                        expect(content).to.match(/<span.*>universe app is running!<\/span>/);
                    });
                });
            });

            describe('with @nguniversal/express-engine as peer dependency', () => {
                beforeEach(async function () {
                    this.timeout(600000);

                    await execAsync('npm install @nguniversal/express-engine express', { cwd: projectDirectory });
                    await execAsync('npm install @types/express --save-dev', { cwd: projectDirectory });

                    const content = await readFileAsync(join(projectDirectory, 'tsconfig.server.json'), 'utf8');

                    await writeFileAsync(
                        join(projectDirectory, 'tsconfig.server.json'),
                        content.replace(/"node"\n/, '"express",\n      "node"')
                    );
                });

                describe('with a status code below 300', () => {
                    beforeEach(async function () {
                        this.timeout(600000);

                        const content = await readFileAsync(join(projectDirectory, 'src/app/app.component.ts'), 'utf8');

                        await writeFileAsync(
                            join(projectDirectory, 'src/app/app.component.ts'),
                            content
                                .replace(
                                    /\s*}\sfrom\s'@angular\/core';/,
                                    ", Inject } from '@angular/core'; import { RESPONSE } from '@nguniversal/express-engine/tokens';"
                                )
                                .replace(
                                    /title\s=\s'universe';/,
                                    "title = 'universe'; constructor(@Inject(RESPONSE) response: any) { response.status(200); }"
                                )
                        );

                        await execAsync('npx --package @angular/cli --call "ng build"', { cwd: projectDirectory });
                        await execAsync('npx --package @angular/cli --call "ng run universe:server"', { cwd: projectDirectory });
                    });

                    describe('when installed as peer dependency', () => {
                        it('should render the default URL', async function () {
                            this.timeout(600000);

                            await execAsync(`npm install ${join(cwd(), `angular-prerender-${version}.tgz`)}`, { cwd: projectDirectory });
                            await execAsync('npx angular-prerender --ignore-status-code false', { cwd: projectDirectory });

                            const content = await readFileAsync(join(projectDirectory, 'dist/universe/browser/index.html'), 'utf8');

                            expect(content).to.match(/<span.*>universe app is running!<\/span>/);
                        });
                    });

                    describe('when invoked with npx', () => {
                        it('should render the default URL', async function () {
                            this.timeout(600000);

                            await execAsync(`npx ${join(cwd(), `angular-prerender-${version}.tgz --ignore-status-code false`)}`, {
                                cwd: projectDirectory
                            });

                            const content = await readFileAsync(join(projectDirectory, 'dist/universe/browser/index.html'), 'utf8');

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
                                .replace(
                                    /\s*}\sfrom\s'@angular\/core';/,
                                    ", Inject } from '@angular/core'; import { RESPONSE } from '@nguniversal/express-engine/tokens';"
                                )
                                .replace(
                                    /title\s=\s'universe';/,
                                    "title = 'universe'; constructor(@Inject(RESPONSE) response: any) { response.status(404); }"
                                )
                        );

                        await execAsync('npx --package @angular/cli --call "ng build"', { cwd: projectDirectory });
                        await execAsync('npx --package @angular/cli --call "ng run universe:server"', { cwd: projectDirectory });
                    });

                    describe('when installed as peer dependency', () => {
                        it('should not render the default URL', async function () {
                            this.timeout(600000);

                            await execAsync(`npm install ${join(cwd(), `angular-prerender-${version}.tgz`)}`, { cwd: projectDirectory });
                            await execAsync('npx angular-prerender --ignore-status-code false', { cwd: projectDirectory });

                            const content = await readFileAsync(join(projectDirectory, 'dist/universe/browser/index.html'), 'utf8');

                            expect(content).to.not.match(/<span.*>universe app is running!<\/span>/);
                        });
                    });

                    describe('when invoked with npx', () => {
                        it('should not render the default URL', async function () {
                            this.timeout(600000);

                            await execAsync(`npx ${join(cwd(), `angular-prerender-${version}.tgz`)} --ignore-status-code false`, {
                                cwd: projectDirectory
                            });

                            const content = await readFileAsync(join(projectDirectory, 'dist/universe/browser/index.html'), 'utf8');

                            expect(content).to.not.match(/<span.*>universe app is running!<\/span>/);
                        });
                    });
                });
            });

            describe('with @nguniversal/hapi-engine as peer dependency', () => {
                beforeEach(async function () {
                    this.timeout(600000);

                    await execAsync('npm install @hapi/hapi @nguniversal/hapi-engine', { cwd: projectDirectory });
                    await execAsync('npm install @types/hapi__hapi --save-dev', { cwd: projectDirectory });

                    const content = await readFileAsync(join(projectDirectory, 'tsconfig.server.json'), 'utf8');

                    await writeFileAsync(
                        join(projectDirectory, 'tsconfig.server.json'),
                        content.replace(/"node"\n/, '"hapi__hapi",\n      "node"')
                    );
                });

                describe('with a status code below 300', () => {
                    beforeEach(async function () {
                        this.timeout(600000);

                        const content = await readFileAsync(join(projectDirectory, 'src/app/app.component.ts'), 'utf8');

                        await writeFileAsync(
                            join(projectDirectory, 'src/app/app.component.ts'),
                            content
                                .replace(
                                    /\s*}\sfrom\s'@angular\/core';/,
                                    ", Inject } from '@angular/core'; import { RESPONSE } from '@nguniversal/hapi-engine/tokens';"
                                )
                                .replace(
                                    /title\s=\s'universe';/,
                                    "title = 'universe'; constructor(@Inject(RESPONSE) response: any) { response.code(200); }"
                                )
                        );

                        await execAsync('npx --package @angular/cli --call "ng build"', { cwd: projectDirectory });
                        await execAsync('npx --package @angular/cli --call "ng run universe:server"', { cwd: projectDirectory });
                    });

                    describe('when installed as peer dependency', () => {
                        it('should render the default URL', async function () {
                            this.timeout(600000);

                            await execAsync(`npm install ${join(cwd(), `angular-prerender-${version}.tgz`)}`, { cwd: projectDirectory });
                            await execAsync('npx angular-prerender --ignore-status-code false', { cwd: projectDirectory });

                            const content = await readFileAsync(join(projectDirectory, 'dist/universe/browser/index.html'), 'utf8');

                            expect(content).to.match(/<span.*>universe app is running!<\/span>/);
                        });
                    });

                    describe('when invoked with npx', () => {
                        it('should render the default URL', async function () {
                            this.timeout(600000);

                            await execAsync(`npx ${join(cwd(), `angular-prerender-${version}.tgz --ignore-status-code false`)}`, {
                                cwd: projectDirectory
                            });

                            const content = await readFileAsync(join(projectDirectory, 'dist/universe/browser/index.html'), 'utf8');

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
                                .replace(
                                    /\s*}\sfrom\s'@angular\/core';/,
                                    ", Inject } from '@angular/core'; import { RESPONSE } from '@nguniversal/hapi-engine/tokens';"
                                )
                                .replace(
                                    /title\s=\s'universe';/,
                                    "title = 'universe'; constructor(@Inject(RESPONSE) response: any) { response.code(404); }"
                                )
                        );

                        await execAsync('npx --package @angular/cli --call "ng build"', { cwd: projectDirectory });
                        await execAsync('npx --package @angular/cli --call "ng run universe:server"', { cwd: projectDirectory });
                    });

                    describe('when installed as peer dependency', () => {
                        it('should not render the default URL', async function () {
                            this.timeout(600000);

                            await execAsync(`npm install ${join(cwd(), `angular-prerender-${version}.tgz`)}`, { cwd: projectDirectory });
                            await execAsync('npx angular-prerender --ignore-status-code false', { cwd: projectDirectory });

                            const content = await readFileAsync(join(projectDirectory, 'dist/universe/browser/index.html'), 'utf8');

                            expect(content).to.not.match(/<span.*>universe app is running!<\/span>/);
                        });
                    });

                    describe('when invoked with npx', () => {
                        it('should not render the default URL', async function () {
                            this.timeout(600000);

                            await execAsync(`npx ${join(cwd(), `angular-prerender-${version}.tgz`)} --ignore-status-code false`, {
                                cwd: projectDirectory
                            });

                            const content = await readFileAsync(join(projectDirectory, 'dist/universe/browser/index.html'), 'utf8');

                            expect(content).to.not.match(/<span.*>universe app is running!<\/span>/);
                        });
                    });
                });
            });
        });
    }
});
