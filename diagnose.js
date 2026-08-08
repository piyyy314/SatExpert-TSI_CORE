import { execSync } from 'child_process';
import fs from 'fs';
import path from 'path';

console.log("CWD:", process.cwd());
console.log("ENV VARS:", Object.keys(process.env).reduce((acc, key) => {
  if (key.includes('PATH') || key.includes('DIR') || key.includes('PORT') || key.includes('HOME') || key.includes('NODE')) {
    acc[key] = process.env[key];
  }
  return acc;
}, {}));

const listFolder = (dir) => {
  try {
    const files = fs.readdirSync(dir);
    console.log(`\nFiles in ${dir}:`);
    files.forEach(f => {
      try {
        const stats = fs.statSync(path.join(dir, f));
        console.log(`- ${f}: ${(stats.size / 1024).toFixed(2)} KB [isFile: ${stats.isFile()}]`);
      } catch (err) {
        console.log(`- ${f}: error (${err.message})`);
      }
    });
  } catch (err) {
    console.error(`Failed to read ${dir}:`, err.message);
  }
};

listFolder('.');
listFolder('..');
listFolder('/');
listFolder('/workspace');
listFolder('/root');

