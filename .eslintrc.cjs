module.exports = {
  env: {
    es2021: true,
    node: true,
    jest: true,
  },
  extends: [
    "eslint:recommended",
    "plugin:@typescript-eslint/recommended",
    "plugin:import/recommended",
    "plugin:import/typescript",
  ],
  parser: "@typescript-eslint/parser",
  parserOptions: {
    ecmaVersion: 12,
    sourceType: "module",
  },
  settings: {
    "import/resolver": {
      node: {
        extensions: [".js", ".jsx", ".ts", ".tsx"],
      },
      typescript: {
        alwaysTryTypes: true, // always try to resolve types under `<root>@types` directory even it doesn't contain any source code, like `@types/unist`
        project: ".",
      },
    },
  },
  plugins: ["@typescript-eslint"],
  rules: {
    "import/extensions": [
      2,
      {
        js: "always",
        ts: "never", // TODO: fix this
      },
    ],
  },
  overrides: [
    {
      files: ["src/__tests__/*.ts"],
      rules: {
        "import/extensions": [
          2,
          {
            js: "always",
            ts: "never",
          },
        ],
      },
    },
  ],
};
