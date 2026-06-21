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
      results.push({ path: file, mtime: stat.mtime });
    }
  });
  return results;
}

const files = [...findFiles('./components', '.tsx'), { path: './App.tsx', mtime: fs.statSync('./App.tsx').mtime }];
files.sort((a, b) => b.mtime - a.mtime);

console.log("Most recently modified files:");
files.slice(0, 15).forEach(f => {
  console.log(`${f.path} - ${f.mtime.toISOString()}`);
});
