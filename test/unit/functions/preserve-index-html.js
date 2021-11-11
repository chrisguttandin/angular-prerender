import { preserveIndexHtml } from '../../../build/node/functions/preserve-index-html.js';
import sinon from 'sinon';

describe('preserveIndexHtml()', () => {
    let browserOutputPath;
    let document;
    let readFileAsync;
    let writeFileAsync;

    beforeEach(() => {
        browserOutputPath = '/browser/output/path';
        document = '<!DOCTYPE HTML><html lang="en"><head><meta charset="UTF-8"></head><body></body></html>';
        readFileAsync = sinon.stub();
        writeFileAsync = sinon.stub();
    });

    describe('with a missing ngsw.json file', () => {
        beforeEach(() => {
            const err = new Error('a fake error');

            err.code = 'ENOENT';

            readFileAsync.rejects(err);
        });

        it('should save the document as start.html', async () => {
            await preserveIndexHtml(browserOutputPath, document, readFileAsync, writeFileAsync);

            expect(writeFileAsync).to.have.been.calledOnce.and.calledWithExactly(`${browserOutputPath}/start.html`, document);
        });

        it('should read the file at ngsw.json', async () => {
            await preserveIndexHtml(browserOutputPath, document, readFileAsync, writeFileAsync);

            expect(readFileAsync).to.have.been.calledOnce.and.calledWithExactly(`${browserOutputPath}/ngsw.json`, 'utf8');
        });

        it('should return false', async () => {
            expect(await preserveIndexHtml(browserOutputPath, document, readFileAsync, writeFileAsync)).to.equal(false);
        });
    });

    describe('with an unparsable ngsw.json file', () => {
        beforeEach(() => {
            readFileAsync.resolves('an/unparsable[json]document');
        });

        it('should throw an error', (done) => {
            preserveIndexHtml(browserOutputPath, document, readFileAsync, writeFileAsync).catch((err) => {
                expect(err).to.be.an.instanceOf(SyntaxError);

                done();
            });
        });
    });

    describe('with a parsable ngsw.json file', () => {
        let ngswObject;

        beforeEach(() => {
            ngswObject = {};

            readFileAsync.callsFake(() => Promise.resolve(JSON.stringify(ngswObject)));
        });

        it('should write the unchanged ngswObject', async () => {
            await preserveIndexHtml(browserOutputPath, document, readFileAsync, writeFileAsync);

            expect(writeFileAsync).to.have.been.calledTwice.and.calledWithExactly(
                `${browserOutputPath}/ngsw.json`,
                JSON.stringify(ngswObject)
            );
        });

        it('should return true', async () => {
            expect(await preserveIndexHtml(browserOutputPath, document, readFileAsync, writeFileAsync)).to.equal(true);
        });

        describe('with the index.html as index', () => {
            beforeEach(() => (ngswObject.index = '/index.html'));

            it('should replace the index before writing the ngswObject', async () => {
                await preserveIndexHtml(browserOutputPath, document, readFileAsync, writeFileAsync);

                expect(writeFileAsync).to.have.been.calledTwice.and.calledWithExactly(
                    `${browserOutputPath}/ngsw.json`,
                    JSON.stringify({ index: '/start.html' })
                );
            });
        });

        describe('with assetGroups that contain the index.html file as url', () => {
            beforeEach(() => (ngswObject.assetGroups = [{ urls: ['/index.html'] }]));

            it('should replace the url inside of assetGroups before writing the ngswObject', async () => {
                await preserveIndexHtml(browserOutputPath, document, readFileAsync, writeFileAsync);

                expect(writeFileAsync).to.have.been.calledTwice.and.calledWithExactly(
                    `${browserOutputPath}/ngsw.json`,
                    JSON.stringify({ assetGroups: [{ urls: ['/start.html'] }] })
                );
            });
        });

        describe('with a hashTable that contains the index.html with its hash', () => {
            beforeEach(() => (ngswObject.hashTable = { '/index.html': 'a-fake-hash-value' }));

            it('should replace the url inside of the hashTable before writing the ngswObject', async () => {
                await preserveIndexHtml(browserOutputPath, document, readFileAsync, writeFileAsync);

                expect(writeFileAsync).to.have.been.calledTwice.and.calledWithExactly(
                    `${browserOutputPath}/ngsw.json`,
                    JSON.stringify({ hashTable: { '/start.html': 'a-fake-hash-value' } })
                );
            });
        });
    });
});
