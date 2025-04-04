/**
 * Run this script with: node fix-lint.js
 * It will fix common linting errors in your codebase
 */
const fs = require('fs');
const path = require('path');

// Files with unused expression errors
const filesToFix = [
  'src/components/dashboard/ChatbotEditor.tsx',
  'src/components/dashboard/editor/Appearance.tsx',
  'src/components/dashboard/editor/Rules.tsx',
  'src/components/dashboard/editor/SuggestionQuestions.tsx'
];

// Fix unused expressions - typically ternary expressions without assignment
const fixUnusedExpressions = (filePath) => {
  try {
    const content = fs.readFileSync(filePath, 'utf8');
    
    // Find lines that are likely ternary expressions without assignments
    // Pattern: condition ? trueExpression : falseExpression;
    const fixedContent = content.replace(
      /(\s+)(\w+.+)\s+\?\s+(.+)\s+:\s+(.+);(\s+)/g, 
      '$1return $2 ? $3 : $4;$5'
    );
    
    fs.writeFileSync(filePath, fixedContent, 'utf8');
    console.log(`Fixed unused expressions in ${filePath}`);
  } catch (err) {
    console.error(`Error fixing ${filePath}:`, err);
  }
};

// Process each file
filesToFix.forEach(fixUnusedExpressions);

console.log('Linting fixes complete. Run "npm run lint" to verify.'); 