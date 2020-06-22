const { peerDependencies } = require('../../src/constants');
const { peerDependencies: packagePeerDependencies } = require('../../package');

describe('constants', () => {
    describe('peerDependencies', () => {
        it('should return the keys of the peerDependencies from the package.json file', () => {
            expect(peerDependencies).to.deep.equal(Object.keys(packagePeerDependencies));
        });
    });
});
