const { coerceTargetSpecifier } = require('../../../src/functions/coerce-target-specifier');

describe('coerceTargetSpecifier()', () => {

    describe('with a string that only includes a target', () => {

        it('should return the target specifier', () => {
            expect(coerceTargetSpecifier('target')).to.deep.equal([ null, 'target', null ]);
        });

    });

    describe('with a string that includes a project prefix', () => {

        it('should return the target specifier', () => {
            expect(coerceTargetSpecifier('project:target')).to.deep.equal([ 'project', 'target', null ]);
        });

    });

    describe('with a string that includes a project prefix and a configuration suffix', () => {

        it('should return the target specifier', () => {
            expect(coerceTargetSpecifier('project:target:configuration')).to.deep.equal([ 'project', 'target', 'configuration' ]);
        });

    });

});
