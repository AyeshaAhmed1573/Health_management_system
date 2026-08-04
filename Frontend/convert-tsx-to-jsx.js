/**
 * Script to convert all .tsx/.ts files to .jsx/.js by stripping TypeScript syntax.
 * Uses esbuild (already installed as a Vite dependency) for reliable type stripping.
 */
const esbuild = require('esbuild');
const fs = require('fs');
const path = require('path');

const SIGNUP_DIR = path.resolve(__dirname, 'src', 'components', 'signup');

// Recursively find all .tsx and .ts files
function findFiles(dir, ext, results = []) {
  const entries = fs.readdirSync(dir, { withFileTypes: true });
  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name);
    if (entry.isDirectory() && entry.name !== 'node_modules') {
      findFiles(fullPath, ext, results);
    } else if (entry.isFile() && (entry.name.endsWith('.tsx') || entry.name.endsWith('.ts'))) {
      // Skip .d.ts files
      if (!entry.name.endsWith('.d.ts')) {
        results.push(fullPath);
      }
    }
  }
  return results;
}

async function convertFile(filePath) {
  const content = fs.readFileSync(filePath, 'utf8');
  const isTsx = filePath.endsWith('.tsx');
  const newExt = isTsx ? '.jsx' : '.js';
  const newPath = filePath.replace(/\.tsx?$/, newExt);

  try {
    const result = await esbuild.transform(content, {
      loader: isTsx ? 'tsx' : 'ts',
      jsx: 'preserve', // Keep JSX syntax as-is, don't convert to createElement
      format: 'esm',
      target: 'es2020',
    });

    let output = result.code;

    // Fix import paths: change .tsx references to .jsx, .ts to .js
    output = output.replace(/(from\s+["'])([^"']+)\.tsx(["'])/g, '$1$2.jsx$3');
    output = output.replace(/(from\s+["'])([^"']+)\.ts(["'])/g, '$1$2.js$3');
    // Also fix dynamic imports
    output = output.replace(/(import\s*\(\s*["'])([^"']+)\.tsx(["']\s*\))/g, '$1$2.jsx$3');
    output = output.replace(/(import\s*\(\s*["'])([^"']+)\.ts(["']\s*\))/g, '$1$2.js$3');

    fs.writeFileSync(newPath, output, 'utf8');
    console.log(`✅ ${path.relative(SIGNUP_DIR, filePath)} → ${path.relative(SIGNUP_DIR, newPath)}`);

    // Delete original file
    if (newPath !== filePath) {
      fs.unlinkSync(filePath);
      console.log(`   🗑️  Deleted ${path.relative(SIGNUP_DIR, filePath)}`);
    }
  } catch (err) {
    console.error(`❌ Error converting ${path.relative(SIGNUP_DIR, filePath)}:`, err.message);
  }
}

async function main() {
  console.log('🔍 Finding TypeScript files in signup directory...');
  const files = findFiles(SIGNUP_DIR);
  console.log(`Found ${files.length} files to convert.\n`);

  for (const file of files) {
    await convertFile(file);
  }

  console.log('\n✨ Conversion complete!');
}

main().catch(console.error);
