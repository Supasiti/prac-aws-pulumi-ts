
export const tsJestConfig = {
    tsconfig: 'tsconfig.json',
    isolatedModules: true, // Disables type checking --> faster!
    useESM: true,
};

const config = {
    coveragePathIgnorePatterns: [
        '<rootDir>/src/dao/docClient.ts',
        '<rootDir>/src/testData/',
    ],
    coverageReporters: ['lcov', 'json-summary', 'text', 'text-summary'],
    coverageThreshold: {
        // Across the package...
        global: { statements: 80, branches: 80, functions: 80, lines: 80 },
        // ...and for each file...
        'src/**/*': { statements: 80, branches: 80, functions: 80, lines: 80 },
    },
    // To get Jest to work with .js file names (from https://kulshekhar.github.io/ts-jest/docs/next/guides/esm-support/#examples)
    moduleNameMapper: { '^(\\.{1,2}/.*)\\.js$': '$1' },
    moduleDirectories: ['node_modules', '<rootDir>'],
    preset: 'ts-jest/presets/default-esm',
    reporters: ['jest-standard-reporter'], // Causes Jest to output normal-output to stdout, instead of stderr.
    roots: ['<rootDir>'],
    setupFilesAfterEnv: ['<rootDir>/config/jest.setup.js'],
    testMatch: ['**/*.(spec|test).(ts|tsx|js)'],
    transform: { '^.+\\.(ts|tsx)$': ['ts-jest', tsJestConfig] },
    verbose: true,
};

export default config
