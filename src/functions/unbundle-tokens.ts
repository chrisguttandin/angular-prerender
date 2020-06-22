import { readFile, writeFile } from 'fs';
import { promisify } from 'util';

const readFileAsync = promisify(readFile);
const writeFileAsync = promisify(writeFile);

const TOKENS_REGEX = /__webpack_require__\(\/\*!\s(?<tokens>@nguniversal\/[a-z]+-engine\/tokens)\s\*\/\s"[^"]+"\)/g;

export const unbundleTokens = async (main: string) => {
    const mainContent = await readFileAsync(`${main}.js`, 'utf8');

    if (TOKENS_REGEX.test(mainContent)) {
        await writeFileAsync(`${main}.unbundled.js`, mainContent.replace(TOKENS_REGEX, 'require("$<tokens>")'));

        return `${main}.unbundled`;
    }

    return main;
};
