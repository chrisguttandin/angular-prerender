const { coerceParameterValues } = require('../../../src/functions/coerce-parameter-values');

describe('coerceParameterValues()', () => {

    describe('with a stringified and empty object', () => {

        it('should return the parameter values map', () => {
            expect(coerceParameterValues('{}')).to.deep.equal({ });
        });

    });

    describe('with a stringified and valid object', () => {

        it('should return the parameter values map', () => {
            expect(coerceParameterValues('{":name":["amelia","oliver"]}')).to.deep.equal({ ':name': [ 'amelia', 'oliver' ] });
        });

    });

    describe('with a stringified but invalid object', () => {

        it('should throw an error', () => {
            const parameterValues = '{":name":"amelia"}';

            expect(() => {
                coerceParameterValues(parameterValues);
            }).to.throw(`Please specify valid parameter values. The given value "${ parameterValues }" is invalid.`);
        });

    });

    describe('with a stringified array', () => {

        it('should throw an error', () => {
            const parameterValues = '["amelia","oliver"]';

            expect(() => {
                coerceParameterValues(parameterValues);
            }).to.throw(`Please specify valid parameter values. The given value "${ parameterValues }" is invalid.`);
        });

    });

});
