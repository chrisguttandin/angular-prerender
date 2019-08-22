const { env } = require('process');

module.exports = {
    build: [
        'clean:build',
        'sh:build',
        'babel:build'
    ],
    lint: [
        'sh:lint-config',
        'sh:lint-src',
        'sh:lint-test'
    ],
    test: [
        'build',
        ...(env.TYPE === 'integration')
            ? [
                'sh:test-integration'
            ]
            : (env.TYPE === 'unit')
                ? [
                    'sh:test-unit'
                ]
                : [
                    'sh:test-integration',
                    'sh:test-unit'
                ]
    ]
};
