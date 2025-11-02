const securityPlugin = require('eslint-plugin-security');

module.exports = {
  root: true,
  extends: ['next/core-web-vitals'],
  ignorePatterns: ['node_modules/', 'dist-hardhat/', 'artifacts/', 'cache/'],
  plugins: ['security'],
  rules: {
    'react/jsx-props-no-spreading': 'off'
  },
  overrides: [
    {
      files: ['**/*.{js,jsx,ts,tsx}'],
      rules: {
        ...securityPlugin.configs.recommended?.rules,
        'security/detect-object-injection': 'off'
      }
    }
  ]
};
