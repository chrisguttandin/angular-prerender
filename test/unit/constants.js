import { peerDependencies } from '../../build/node/constants.js';
import { readFileSync } from 'fs';

describe('constants', () => {
    let packagePeerDependencies;

    beforeEach(() => {
        ({ peerDependencies: packagePeerDependencies } = JSON.parse(readFileSync(new URL('../../package.json', import.meta.url), 'utf8')));
    });

    describe('peerDependencies', () => {
        it('should return the keys of the peerDependencies from the package.json file', () => {
            expect(peerDependencies).to.deep.equal(Object.keys(packagePeerDependencies));
        });
    });
});
