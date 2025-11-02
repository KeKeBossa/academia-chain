module.exports = {
  root: true,
  extends: ['next/core-web-vitals'],
  ignorePatterns: ['node_modules/', 'dist-hardhat/', 'artifacts/', 'cache/'],
  rules: {
    'react/jsx-props-no-spreading': 'off'
  }
};
