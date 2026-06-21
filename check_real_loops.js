import fs from 'fs';
import path from 'path';

function findFiles(dir, ext) {
  let results = [];
  const list = fs.readdirSync(dir);
  list.forEach((file) => {
    file = path.join(dir, file);
    const stat = fs.statSync(file);
    if (stat && stat.isDirectory()) {
      results = results.concat(findFiles(file, ext));
    } else if (file.endsWith(ext)) {
      results.push(file);
    }
  });
  return results;
}

const files = [...findFiles('./components', '.tsx'), './App.tsx'];

files.forEach(file => {
  const content = fs.readFileSync(file, 'utf8');
  if (!content.includes('useEffect')) return;

  // Simple regex to match useEffect calls and extract their body
  // Since nested braces can be complex, we can find indices of `useEffect`
  let pos = 0;
  while ((pos = content.indexOf('useEffect', pos)) !== -1) {
    // Find matching parentheses or braces
    let startIdx = pos;
    // Let's grab some context around it (e.g., next 1000 characters)
    let context = content.slice(pos, pos + 1200);
    
    // Attempt to extract the dependency array. It usually looks like `}, [ ... ])`
    // Let's find the closing of useEffect.
    // A robust way is to scan brace balance.
    let braceCount = 0;
    let parenCount = 0;
    let endIdx = -1;
    let foundStart = false;
    
    for (let i = 0; i < context.length; i++) {
      let char = context[i];
      if (char === '(') {
        parenCount++;
        foundStart = true;
      } else if (char === ')') {
        parenCount--;
      } else if (char === '{') {
        braceCount++;
        foundStart = true;
      } else if (char === '}') {
        braceCount--;
      }
      
      if (foundStart && braceCount === 0 && parenCount === 0) {
        endIdx = i;
        break;
      }
    }
    
    const block = endIdx !== -1 ? context.slice(0, endIdx + 1) : context;
    
    // Check if the block has any setState calls and print it
    const setFunctions = [...block.matchAll(/set[A-Z][a-zA-Z0-9]*/g)].map(m => m[0]);
    
    // Parse the dependency array from the block or after it
    // Usually it's at the end, like `[dep1, dep2]`
    const depMatch = block.match(/\]\s*\)\s*;?$/) || block.match(/,\s*\[([^\]]*)\]/);
    const deps = depMatch ? depMatch[0] : 'UNKNOWN / NO DEPS';

    if (setFunctions.length > 0) {
      // Print context if it contains sets
      console.log(`\n=========================================`);
      console.log(`FILE: ${file} (char pos: ${pos})`);
      console.log(`DEPS: ${deps.trim()}`);
      console.log(`STATED CHANGERS: ${[...new Set(setFunctions)].join(', ')}`);
      // print first 5 lines of block
      const lines = block.split('\n');
      console.log(`PREVIEW:\n${lines.slice(0, 10).join('\n')}\n...`);
    }
    
    pos += 9; // move past 'useEffect'
  }
});
