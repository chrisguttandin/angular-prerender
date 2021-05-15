import chalk from 'chalk';
import { readFile, writeFile } from 'fs';
import { promisify } from 'util';

const readFileAsync = promisify(readFile);
const writeFileAsync = promisify(writeFile);

const ANGULAR_IMPORT_REGEX = /require\("@angular\/core"\)/;
const INJECTION_TOKEN_REGEX = /const\sRESPONSE=new\sInjectionToken\("RESPONSE"\);/;

export const unbundleTokens = async (expressResponseToken: any, hapiResponseToken: any, main: string) => {
    const mainContent = await readFileAsync(`${main}.js`, 'utf8');

    if (!ANGULAR_IMPORT_REGEX.test(mainContent)) {
        if (INJECTION_TOKEN_REGEX.test(mainContent)) {
            if (expressResponseToken === null && hapiResponseToken === null) {
                console.log(chalk`{yellow No engine was found.}`); // tslint:disable-line:no-console
            }

            if (expressResponseToken !== null && hapiResponseToken !== null) {
                console.log(chalk`{yellow Both engines were found.}`); // tslint:disable-line:no-console
            }

            const engine = expressResponseToken !== null ? 'express' : hapiResponseToken !== null ? 'hapi' : null;

            if (engine !== null) {
                await writeFileAsync(
                    `${main}.unbundled.js`,
                    mainContent.replace(INJECTION_TOKEN_REGEX, `const {RESPONSE}=require("@nguniversal/${engine}-engine/tokens");`)
                );

                return `${main}.unbundled`;
            }
        }
    }

    return main;
};
