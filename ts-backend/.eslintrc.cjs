module.exports = {
  root: true,
  env: {
    node: true,
    es2021: true,
  },
  parser: '@typescript-eslint/parser',
  parserOptions: {
    project: ['./tsconfig.json'],
    sourceType: 'module',
  },
  plugins: ['@typescript-eslint', 'prettier'],
  extends: [
    'eslint:recommended',
    'plugin:@typescript-eslint/recommended',
    // Integración con prettier:
    'plugin:prettier/recommended', // <--- activa prettier y muestra errores como ESLint
  ],
  rules: {
    // Opcionales, ajusta a tu estilo
    '@typescript-eslint/no-unused-vars': ['warn'],
    'prettier/prettier': 'warn',
  },
};
