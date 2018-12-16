module.exports = {
    transform: {
        '.(ts|tsx|js)': `${__dirname}/node_modules/ts-jest/preprocessor.js`
    },
    testMatch: [
        `${__dirname}/(test)/**/?(*.)(test).ts`,
    ],
    moduleFileExtensions: ['ts', 'js', 'json'],
    globals: {
        'ts-jest': {
            tsConfig: `${__dirname}/tsconfig.json`
        }
    },
    collectCoverageFrom: [
        '{core,modules,lib,app}/**/*.{ts,js,tsx}'
    ],
    coveragePathIgnorePatterns: ['/\.test\.ts/'],
    coverageThreshold: {
        global: {
            branches: 80,
            functions: 80,
            lines: 70,
            statements: 80
        }
    },
    testURL: "http://localhost/"
};
