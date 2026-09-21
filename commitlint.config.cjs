const scopes = require('./commit-scopes.cjs');

module.exports = {
  extends: ['@commitlint/config-conventional'],
  rules: {
    'scope-enum': [2, 'always', scopes],
    'scope-empty': [2, 'never'],
  },
};
