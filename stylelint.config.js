export default {
  extends: ['stylelint-config-standard'],
  ignoreFiles: ['dist/**', 'build/**', 'node_modules/**'],
  rules: {
    'selector-class-pattern': null,
    'custom-property-pattern': null,
  },
};
