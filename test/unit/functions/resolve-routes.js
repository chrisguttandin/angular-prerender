const { resolveRoutes } = require('../../../src/functions/resolve-routes');

describe('resolveRoutes()', () => {

    describe('without any parameters', () => {

        let routes;

        beforeEach(() => {
            routes = [ '/a/route/without/any/parameter' ];
        });

        it('should return the given routes', () => {
            expect(resolveRoutes(routes, [ ])).to.deep.equal(routes);
        });

    });

    describe('with a single parameter', () => {

        let routes;

        beforeEach(() => {
            routes = [ '/a/route/with/one/:parameter' ];
        });

        it('should resolve the given routes with the given parameter', () => {
            expect(resolveRoutes(routes, { ':parameter': [ 'value' ] })).to.deep.equal([ '/a/route/with/one/value' ]);
        });

    });

    describe('with two parameters', () => {

        let routes;

        beforeEach(() => {
            routes = [ '/a/route/with/:aParameter/and/:anotherParameter' ];
        });

        describe('with a single value per parameter', () => {

            let parameterValuesMap;

            beforeEach(() => {
                parameterValuesMap = { ':aParameter': [ 'aValue' ], ':anotherParameter': [ 'anotherValue' ] };
            });

            it('should resolve the given routes with the given parameters', () => {
                expect(resolveRoutes(routes, parameterValuesMap)).to.deep.equal([ '/a/route/with/aValue/and/anotherValue' ]);
            });

        });

        describe('with multiple values per parameter', () => {

            let parameterValuesMap;

            beforeEach(() => {
                parameterValuesMap = {
                    ':aParameter': [ 'aValue', 'aSecondValue', 'aThirdValue' ],
                    ':anotherParameter': [ 'anotherValue', 'yetAnotherValue' ]
                };
            });

            it('should resolve the given routes with the given parameters', () => {
                expect(resolveRoutes(routes, parameterValuesMap)).to.deep.equal([
                    '/a/route/with/aValue/and/anotherValue',
                    '/a/route/with/aSecondValue/and/anotherValue',
                    '/a/route/with/aThirdValue/and/yetAnotherValue',
                    '/a/route/with/aValue/and/yetAnotherValue',
                    '/a/route/with/aSecondValue/and/anotherValue',
                    '/a/route/with/aThirdValue/and/anotherValue'
                ]);
            });

        });

    });

});
