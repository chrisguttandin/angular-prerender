import { join } from 'path';
import { INgServiceWorker } from '../interfaces';

const INDEX_HTML_PATH = '/index.html';
const START_HTML_PATH = '/start.html';

export const preserveIndexHtml = async (
    browserOutputPath: string,
    document: string,
    readFileAsync: (path: string, encoding: 'utf8') => Promise<string>,
    writeFileAsync: (path: string, data: string) => Promise<void>
): Promise<boolean> => {
    await writeFileAsync(join(browserOutputPath, 'start.html'), document);

    try {
        const ngswPath = join(browserOutputPath, 'ngsw.json');
        const ngswString = await readFileAsync(ngswPath, 'utf8');
        const ngswObject: INgServiceWorker = JSON.parse(ngswString);

        if (ngswObject.index === INDEX_HTML_PATH) {
            ngswObject.index = START_HTML_PATH;
        }

        if (ngswObject.assetGroups !== undefined) {
            ngswObject.assetGroups
                .forEach((assetGroup) => {
                    assetGroup.urls = assetGroup.urls
                        .map((url) => {
                            if (url === INDEX_HTML_PATH) {
                                return START_HTML_PATH;
                            }

                            return url;
                        });
                });
        }

        if (ngswObject.hashTable !== undefined && ngswObject.hashTable[INDEX_HTML_PATH] !== undefined) {
            ngswObject.hashTable[START_HTML_PATH] = ngswObject.hashTable[INDEX_HTML_PATH];
            ngswObject.hashTable[INDEX_HTML_PATH] = undefined;
        }

        await writeFileAsync(ngswPath, JSON.stringify(ngswObject));

        return true;
    } catch (err) {
        if (err.code !== 'ENOENT') {
            throw err;
        }

        return false;
    }
};
