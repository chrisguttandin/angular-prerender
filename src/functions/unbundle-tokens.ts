import { readFile, writeFile } from 'fs';
import { promisify } from 'util';
import chalk from 'chalk';

const readFileAsync = promisify(readFile);
const writeFileAsync = promisify(writeFile);

// eslint-disable-next-line padding-line-between-statements
const ANGULAR_IMPORT_REGEX = /require\("@angular\/core"\)/;
const INJECTION_TOKEN_REGEX = /const\sRESPONSE=new\sInjectionToken\("RESPONSE"\);/;

export const unbundleTokens = async (expressResponseToken: any, main: string) => {
    const mainContent = await readFileAsync(main, 'utf8');

    if (!ANGULAR_IMPORT_REGEX.test(mainContent) && INJECTION_TOKEN_REGEX.test(mainContent)) {
        if (expressResponseToken === null) {
            console.log(chalk.yellow('No engine was found.')); // eslint-disable-line no-console
        }

        const engine = expressResponseToken !== null ? 'EXPRESS' : null;

        if (engine !== null) {
            const unbundledMain = `${main}.unbundled.cjs`;

            await writeFileAsync(
                unbundledMain,
                mainContent.replace(INJECTION_TOKEN_REGEX, `const RESPONSE="_A_HOPEFULLY_UNIQUE_${engine}_RESPONSE_TOKEN_";`)
            );

            return unbundledMain;
        }
    }

    return main;
};
