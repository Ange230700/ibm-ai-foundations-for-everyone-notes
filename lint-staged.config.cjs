module.exports = {
  '**/*.{js,cjs,mjs,ts,json,jsonc,yml,yaml,css}': ['prettier --write --ignore-unknown'],
  '**/*.md': ['markdownlint-cli2 --fix', 'prettier --write --ignore-unknown'],
};
