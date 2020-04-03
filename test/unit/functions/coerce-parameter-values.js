const { coerceParameterValues } = require('../../../src/functions/coerce-parameter-values');

describe('coerceParameterValues()', () => {

    describe('with an unparsable string', () => {

        it('should throw an error', () => {
            const parameterValues = '{":/12';

            expect(() => {
                coerceParameterValues(parameterValues);
            }).to.throw(`Please specify valid parameter values. The given value "${ parameterValues }" is invalid.`);
        });

    });

    describe('with an empty object', () => {

        it('should return the parameter values map', () => {
            expect(coerceParameterValues('{}')).to.deep.equal({ });
        });

    });

    describe('with a valid object with one parameter with a single value', () => {

        it('should return the parameter values map', () => {
            expect(coerceParameterValues('{":name":"amelia"}')).to.deep.equal({ ':name': 'amelia' });
        });

    });

    describe('with a valid object with one parameter with an array of values', () => {

        it('should return the parameter values map', () => {
            expect(coerceParameterValues('{":name":["amelia","oliver"]}')).to.deep.equal({ ':name': [ 'amelia', 'oliver' ] });
        });

    });

    describe('with a valid and nested object with one parameter with a single value', () => {

        it('should return the parameter values map', () => {
            expect(coerceParameterValues('{"/x/y/z":{":name":"amelia"}}')).to.deep.equal({ '/x/y/z': { ':name': 'amelia' } });
        });

    });

    describe('with a valid and nested object with one parameter with an array of values', () => {

        it('should return the parameter values map', () => {
            expect(coerceParameterValues('{"/x/y/z":{":name":["amelia","oliver"]}}')).to.deep.equal({ '/x/y/z': { ':name': [ 'amelia', 'oliver' ] } });
        });

    });

    describe('with an invalid object', () => {

        it('should throw an error', () => {
            const parameterValues = '{":name":12}';

            expect(() => {
                coerceParameterValues(parameterValues);
            }).to.throw(`Please specify valid parameter values. The given value "${ parameterValues }" is invalid.`);
        });

    });

    describe('with a valid array with one object with one parameter with a single value', () => {

        it('should return the parameter values map', () => {
            expect(coerceParameterValues('[{":name":"amelia"}]')).to.deep.equal([ { ':name': 'amelia' } ]);
        });

    });

    describe('with a valid array with one object with one parameter with an array of values', () => {

        it('should return the parameter values map', () => {
            expect(coerceParameterValues('[{":name":["amelia","oliver"]}]')).to.deep.equal([ { ':name': [ 'amelia', 'oliver' ] } ]);
        });

    });

    describe('with a valid array with one nested object with one parameter with a single value', () => {

        it('should return the parameter values map', () => {
            expect(coerceParameterValues('[{"/x/y/z":{":name":"amelia"}}]')).to.deep.equal([ { '/x/y/z': { ':name': 'amelia' } } ]);
        });

    });

    describe('with a valid array with one nested object with one parameter with an array of values', () => {

        it('should return the parameter values map', () => {
            expect(coerceParameterValues('[{"/x/y/z":{":name":["amelia","oliver"]}}]')).to.deep.equal([ { '/x/y/z': { ':name': [ 'amelia', 'oliver' ] } } ]);
        });

    });

    describe('with an invalid array', () => {

        it('should throw an error', () => {
            const parameterValues = '["amelia","oliver"]';

            expect(() => {
                coerceParameterValues(parameterValues);
            }).to.throw(`Please specify valid parameter values. The given value "${ parameterValues }" is invalid.`);
        });

    });

});
