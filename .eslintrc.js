module.exports = {
  extends: 'next/core-web-vitals',
  rules: {
    // Disable the rule for escaping quotes in JSX
    'react/no-unescaped-entities': 'off',
    
    // Make dependency rules warnings instead of errors
    'react-hooks/exhaustive-deps': 'warn',
    
    // Disable/downgrade TypeScript-specific rules that are noisy
    '@typescript-eslint/no-unused-vars': 'warn',
    '@typescript-eslint/no-explicit-any': 'warn',
    '@typescript-eslint/no-unused-expressions': 'warn',
    
    // Other rules that might be annoying
    'no-console': 'off',
    'react/display-name': 'off'
  },
  // Make all errors warnings instead
  errorOnWarning: false,
  emitWarningAsError: false
}; 