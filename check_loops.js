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

files.forEach((filePath) => {
  const content = fs.readFileSync(filePath, 'utf-8');
  if (!content.includes('useEffect')) return;

  // Use a simpler approach: check for useEffect blocks
  const regex = /useEffect\s*\(\s*\(\s*\)\s*=>\s*\{([\s\S]*?)\}\s*,\s*\[([\s\S]*?)\]\s*\)/g;
  let match;
  while ((match = regex.exec(content)) !== null) {
    const block = match[1];
    const depsRaw = match[2].trim();
    if (block.includes('set') && depsRaw.length > 0) {
      // Look for specific setters being called on variables in the dependency array
      const deps = depsRaw.split(',').map(d => d.trim().replace(/\r?\n/g, '')).filter(Boolean);
      deps.forEach(dep => {
        // e.g. dep is 'foo' and block contains 'setFoo' (or similar capitalization)
        const setterName = 'set' + dep.charAt(0).toUpperCase() + dep.slice(1);
        if (block.includes(setterName)) {
          console.log(`[POTENTIAL LOOP] In file ${filePath}:`);
          console.log(`Dependency: "${dep}" triggers setter "${setterName}" within the same useEffect.`);
          console.log(`--- Block Preview ---`);
          console.log(block.substring(0, 300));
          console.log(`---------------------\n`);
        }
      });
    }
  }

  // Also check for useEffect with NO dependency array
  const noDepsRegex = /useEffect\s*\(\s*\(\s*\)\s*=>\s*\{([\s\S]*?)\}\s*(?!\s*,\s*\[)/g;
  let matchNoDeps;
  while ((matchNoDeps = noDepsRegex.exec(content)) !== null) {
    const block = matchNoDeps[1];
    if (block.includes('set')) {
      console.log(`[NO DEPS LOOP] In file ${filePath}:`);
      console.log(`useEffect has NO dependency array but calls a "set" function!`);
      console.log(`--- Block Preview ---`);
      console.log(block.substring(0, 300));
      console.log(`---------------------\n`);
    }
  }
});
