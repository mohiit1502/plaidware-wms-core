module.exports = {
  root: true,
  env: {
    node: true,
    es2021: true,
  },
  extends: ["eslint:recommended", "google"],
  parserOptions: {
    ecmaVersion: 12,
  },
  rules: {
    "indent": ["error", 2, { SwitchCase: 1 }],
    "object-curly-spacing": ["error", "always"],
    "max-len": ["error", { code: 150 }],
    "space-before-function-paren": 0,
    "valid-jsdoc": 0,
    "camelcase": 0,
    "new-cap": 0,
    "quotes": 0,
    "comma-dangle": 0,
    'operator-linebreak': 0
  },
};
