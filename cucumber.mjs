export default {
    paths: ['tests/e2e/features/**/*.feature'],
    import: [
        'tests/e2e/support/**/*.js',
        'tests/e2e/step-definitions/**/*.js',
    ],
    format: ['progress'],
    parallel: 1,
    defaultTimeout: 15_000,
}
