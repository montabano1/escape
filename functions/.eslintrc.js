module.exports = {
  root: true,
  env: {
    es6: true,
    node: true,
  },
  extends: [
    "eslint:recommended",
    "plugin:import/errors",
    "plugin:import/warnings",
    "plugin:import/typescript",
    "google",
    "plugin:@typescript-eslint/recommended",
  ],
  parser: "@typescript-eslint/parser",
  parserOptions: {
    project: ["tsconfig.json"],
    sourceType: "module",
  },
  ignorePatterns: [
    "/lib/**/*", // Ignore built files.
    ".eslintrc.js", // Ignore ESLint config file.
  ],
  plugins: [
    "@typescript-eslint",
    "import",
  ],
  rules: {
    "quotes": ["error", "double"],
    "import/no-unresolved": 0,
    "indent": ["error", 2],
    "max-len": ["error", { "code": 120 }], // Increase line length limit
    "require-jsdoc": "off", // Disable JSDoc requirement
    "@typescript-eslint/no-unused-vars": ["warn", { "argsIgnorePattern": "^_" }], // Allow unused vars starting with _
    "@typescript-eslint/no-non-null-assertion": "warn", // Allow non-null assertions
    "@typescript-eslint/no-explicit-any": "warn", // Allow any type
  },
};

