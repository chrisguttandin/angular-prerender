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
        'sh:test-unit'
    ]
};
