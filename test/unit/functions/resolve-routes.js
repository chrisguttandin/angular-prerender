const { resolveRoutes } = require('../../../src/functions/resolve-routes');

describe('resolveRoutes()', () => {

    describe('without any parameters', () => {

        let routesWithParameters;

        beforeEach(() => {
            routesWithParameters = [ { parameterValueMaps: [ ], route: '/a/route/without/any/parameter' } ];
        });

        it('should return the given routes', () => {
            expect(resolveRoutes(routesWithParameters)).to.deep.equal([ '/a/route/without/any/parameter' ]);
        });

    });

    describe('with a single parameter', () => {

        let routesWithParameters;

        beforeEach(() => {
            routesWithParameters = [ { parameterValueMaps: [ { ':parameter': [ 'value' ] } ], route: '/a/route/with/one/:parameter' } ];
        });

        it('should resolve the given routes with the given parameter', () => {
            expect(resolveRoutes(routesWithParameters)).to.deep.equal([ '/a/route/with/one/value' ]);
        });

    });

    describe('with two parameters', () => {

        describe('with a single value per parameter', () => {

            let routesWithParameters;

            beforeEach(() => {
                routesWithParameters = [
                    {
                        parameterValueMaps: [ { ':aParameter': [ 'aValue' ], ':anotherParameter': [ 'anotherValue' ] } ],
                        route: '/a/route/with/:aParameter/and/:anotherParameter'
                    }
                ];
            });

            it('should resolve the given routes with the given parameters', () => {
                expect(resolveRoutes(routesWithParameters)).to.deep.equal([ '/a/route/with/aValue/and/anotherValue' ]);
            });

        });

        describe('with multiple values per parameter', () => {

            let routesWithParameters;

            beforeEach(() => {
                routesWithParameters = [
                    {
                        parameterValueMaps: [
                            {
                                ':aParameter': [ 'aValue', 'aSecondValue', 'aThirdValue' ],
                                ':anotherParameter': [ 'anotherValue', 'yetAnotherValue' ]
                            }
                        ],
                        route: '/a/route/with/:aParameter/and/:anotherParameter'
                    }
                ];
            });

            it('should resolve the given routes with the given parameters', () => {
                expect(resolveRoutes(routesWithParameters)).to.deep.equal([
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
