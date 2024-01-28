import { cwd, env } from 'process';
import { join, relative, sep } from 'path';
import { mkdir, mkdtemp, readFile, readFileSync } from 'fs';
import { exec } from 'child_process';
import { promisify } from 'util';
import { rimraf } from 'rimraf';
import { tmpdir } from 'os';

const execAsync = promisify(exec);
const mkdirAsync = promisify(mkdir);
const mkdtempAsync = promisify(mkdtemp);
const readFileAsync = promisify(readFile);
const makeFakedTemporaryDirectory = async () => {
    const fakedTemporaryDirectory = join(cwd(), '..', 'temp');

    await mkdirAsync(fakedTemporaryDirectory);

    return fakedTemporaryDirectory;
};

describe('angular-prerender', () => {
    let angularMajorVersion;
    let peerDependencies;
    let version;

    before(async function () {
        this.timeout(600000);

        ({ peerDependencies, version } = JSON.parse(readFileSync(new URL('../../package.json', import.meta.url), 'utf8')));

        if (env.CI) {
            await execAsync('git config --global user.email "user@example.com"');
            await execAsync('git config --global user.name "user"');
        }

        angularMajorVersion = peerDependencies['@angular/core'].split(/\./).shift();
    });

    for (const standalone of [true, false]) {
        describe(`with the --standalone flag set to "${standalone}"`, () => {
            let directory;
            let projectDirectory;

            after(async function () {
                this.timeout(600000);

                await execAsync(`rm ${join(directory, `angular-prerender-${version}.tgz`)}`);

                await rimraf(directory, { preserveRoot: false });
            });

            beforeEach(async function () {
                this.timeout(600000);

                directory = env.CI ? await makeFakedTemporaryDirectory() : await mkdtempAsync(`${tmpdir()}${sep}`);

                await execAsync(
                    `npx --package @angular/cli@${angularMajorVersion} --call "ng new universe --no-interactive --routing --standalone ${standalone}"`,
                    {
                        cwd: directory
                    }
                );

                projectDirectory = join(directory, 'universe');

                await execAsync(`npx --package @angular/cli@${angularMajorVersion} --call "ng add @angular/ssr --skip-confirmation"`, {
                    cwd: projectDirectory
                });
                await execAsync(
                    `npx --package @angular/cli@${angularMajorVersion} --call "ng config projects.universe.architect.build.options.prerender false"`,
                    {
                        cwd: projectDirectory
                    }
                );
                await execAsync('git add --all', { cwd: projectDirectory });
                await execAsync('git commit --amend --no-edit --no-verify', { cwd: projectDirectory });

                await execAsync('npm pack');
                await execAsync(`mv ${join(cwd(), `angular-prerender-${version}.tgz`)} ${directory}`);

                await execAsync('git checkout .', { cwd: projectDirectory });
                await execAsync('git clean --force', { cwd: projectDirectory });

                await execAsync(`npx --package @angular/cli@${angularMajorVersion} --call "ng build"`, { cwd: projectDirectory });
            });

            describe('when installed as peer dependency', () => {
                it('should render the default URL', async function () {
                    this.timeout(600000);

                    await execAsync(`npm install ${join(directory, `angular-prerender-${version}.tgz`)}`, { cwd: projectDirectory });
                    await execAsync('npx angular-prerender --target universe:build', {
                        cwd: projectDirectory
                    });

                    const content = await readFileAsync(join(projectDirectory, 'dist/universe/browser/index.html'), 'utf8');

                    expect(content).to.match(/<h1.*>Hello, universe<\/h1>/);
                });
            });

            describe('when invoked with npx', () => {
                it('should render the default URL', async function () {
                    this.timeout(600000);

                    await execAsync(
                        `npx ${relative(projectDirectory, join(directory, `angular-prerender-${version}.tgz`))} --target universe:build`,
                        {
                            cwd: projectDirectory
                        }
                    );

                    const content = await readFileAsync(join(projectDirectory, 'dist/universe/browser/index.html'), 'utf8');

                    expect(content).to.match(/<h1.*>Hello, universe<\/h1>/);
                });
            });
        });
    }
});
