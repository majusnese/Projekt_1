module.exports =  {
    parser:  '@typescript-eslint/parser',  // Specifies the ESLint parser
    extends:  [
      'plugin:@typescript-eslint/recommended',
      'prettier/@typescript-eslint',
      'plugin:prettier/recommended',
    ],
   parserOptions:  {
      ecmaVersion:  2018,
      sourceType:  'module',
    },
    rules:  {
      "@typescript-eslint/explicit-function-return-type": false,
      "@typescript-eslint/no-var-requires": false,
      "@typescript-eslint/explicit-member-accessibility": false,
      "@typescript-eslint/no-use-before-define": false,
      "@typescript-eslint/no-unused-vars": false
    },
  };