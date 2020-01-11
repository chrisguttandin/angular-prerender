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

    describe('with a string that includes too many colons', () => {

        it('should throw an error', () => {
            const target = 'project:target:configuration:anything-else';

            expect(() => {
                coerceTargetSpecifier(target);
            }).to.throw(`Please specify a valid target. The given value "${ target }" is invalid.`);
        });

    });

});
