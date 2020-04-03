const { mapRoutes } = require('../../../src/functions/map-routes');

const TEST_CASES = [ // eslint-disable-line padding-line-between-statements
    {
        mappedRoutes: [
            {
                parameterValueMaps: [ ],
                route: '/a/route'
            }
        ],
        parameters: { },
        routes: [ '/a/route' ]
    },
    {
        mappedRoutes: [
            {
                parameterValueMaps: [
                    {
                        ':parameter': [ 'value' ]
                    }
                ],
                route: '/a/route/with/one/:parameter'
            }
        ],
        parameters: {
            ':parameter': 'value'
        },
        routes: [ '/a/route/with/one/:parameter' ]
    },
    {
        mappedRoutes: [
            {
                parameterValueMaps: [
                    {
                        ':aParameter': [ 'value' ],
                        ':anotherParameter': [ 'anotherValue' ]
                    }
                ],
                route: '/a/route/with/:aParameter/and/:anotherParameter'
            }
        ],
        parameters: {
            ':aParameter': [ 'value' ],
            ':anotherParameter': [ 'anotherValue' ]
        },
        routes: [ '/a/route/with/:aParameter/and/:anotherParameter' ]
    },
    {
        mappedRoutes: [
            {
                parameterValueMaps: [
                    {
                        ':aParameter': [ 'value' ],
                        ':anotherParameter': [ 'anotherValue' ]
                    },
                    {
                        ':aParameter': [ 'value' ],
                        ':anotherParameter': [ 'yetAnotherValue' ]
                    }
                ],
                route: '/a/route/with/:aParameter/and/:anotherParameter'
            }
        ],
        parameters: [
            {
                ':aParameter': [ 'value' ],
                ':anotherParameter': [ 'anotherValue' ]
            },
            {
                ':aParameter': [ 'value' ],
                ':anotherParameter': [ 'yetAnotherValue' ]
            }
        ],
        routes: [ '/a/route/with/:aParameter/and/:anotherParameter' ]
    },
    {
        mappedRoutes: [
            {
                parameterValueMaps: [
                    {
                        ':aParameter': [ 'value' ],
                        ':anotherParameter': [ 'anotherValue' ]
                    }
                ],
                route: '/a/route/with/:aParameter/and/:anotherParameter'
            },
            {
                parameterValueMaps: [
                    {
                        ':aParameter': [ 'anAdditionalValue', 'value' ],
                        ':anotherParameter': [ 'yetAnotherValue' ]
                    }
                ],
                route: '/another/route/with/:aParameter/and/:anotherParameter'
            }
        ],
        parameters: {
            '/a/route/with': {
                ':anotherParameter': [ 'anotherValue' ]
            },
            '/another/route/with': {
                ':aParameter': [ 'anAdditionalValue' ],
                ':anotherParameter': [ 'yetAnotherValue' ]
            },
            ':aParameter': [ 'value' ]
        },
        routes: [
            '/a/route/with/:aParameter/and/:anotherParameter',
            '/another/route/with/:aParameter/and/:anotherParameter'
        ]
    }
];

describe('mapRoutes()', () => {

    for (const { mappedRoutes, parameters, routes } of TEST_CASES) {

        it('should return the mapped routes', () => {
            expect(mapRoutes(routes, parameters)).to.deep.equal(mappedRoutes);
        });

    }

});
