import baseConfig from '../../eslint.config.js';

export default [
  ...baseConfig,
  {
    files: ['**/package.json'],
    rules: {
      '@nx/dependency-checks': 'off',
    },
  },
  {
    files: ['*.ts', '*.tsx', '*.js', '*.jsx'],
    rules: {},
  },
  {
    files: ['*.ts', '*.tsx'],
    rules: {},
  },
  {
    files: ['*.js', '*.jsx'],
    rules: {},
  },
];
