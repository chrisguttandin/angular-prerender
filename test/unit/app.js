describe('angular-prerender', () => {

    it('should not allow to be imported', () => {
        expect(() => {
            require('../../build/node/app');
        }).to.throw(Error, 'This script is meant to be executed from the command line.');
    });

});
