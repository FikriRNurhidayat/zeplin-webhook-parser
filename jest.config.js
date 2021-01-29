/*
 * For a detailed explanation regarding each configuration property, visit:
 * https://jestjs.io/docs/en/configuration.html
 */

module.exports = {
  clearMocks: true,
  coverageDirectory: "coverage",
  coveragePathIgnorePatterns: [
    "/node_modules/"
  ],
  coverageProvider: "v8",
  coverageReporters: [
    "text-summary",
    "lcov",
    "cobertura"
  ],
  roots: [ "<rootDir>/tests/" ],
  testEnvironment: "node",
  testMatch: ["**/tests/**/*.spec.js"],
  reporters: [
    "default",
    "jest-junit"
  ]
};
