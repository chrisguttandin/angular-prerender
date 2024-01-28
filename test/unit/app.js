import { argv } from 'process';

describe('angular-prerender', () => {
    afterEach(() => {
        argv.slice(0, -2);
    });

    beforeEach(() => {
        argv.push('--config', '/dev/null');
    });

    it('should not export anything', async () => {
        const app = await import('../../build/node/app.js');

        expect(Object.keys(app)).to.deep.equal([]);
    });
});
