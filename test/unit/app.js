// @todo If the EventEmitter gets patched during the test it will throw an RangeError "Maximum call stack size exceeded".
global.__Zone_disable_EventEmitter = true; // eslint-disable-line camelcase

describe('angular-prerender', () => {

    it('should not allow to be imported', () => {
        expect(() => {
            require('../../build/node/app');
        }).to.throw(Error, 'This script is meant to be executed from the command line.');
    });

});
