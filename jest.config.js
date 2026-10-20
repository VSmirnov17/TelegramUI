module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  moduleDirectories: ['node_modules', 'src'],
  moduleNameMapper: {
    '\\.css$': '<rootDir>/scripts/jest-css-module.cjs',
  },
};
