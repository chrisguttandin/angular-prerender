const { env } = require('process');

module.exports = {
    build: [
        'clean:build',
        'sh:build',
        'babel:build'
    ],
    lint: [
        'eslint',
        // @todo Use grunt-lint again when it support the type-check option.
        'sh:lint'
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
