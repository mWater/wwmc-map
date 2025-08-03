import esbuild from 'esbuild';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import { copyFileSync, existsSync, mkdirSync, readdirSync, statSync } from 'fs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const isWatch = process.argv.includes('--watch');

// Recursive copy function
function copyRecursive(src, dest) {
  if (!existsSync(dest)) {
    mkdirSync(dest, { recursive: true });
  }
  
  const items = readdirSync(src);
  for (const item of items) {
    const srcPath = join(src, item);
    const destPath = join(dest, item);
    
    if (statSync(srcPath).isDirectory()) {
      copyRecursive(srcPath, destPath);
    } else {
      copyFileSync(srcPath, destPath);
    }
  }
}

// Copy static assets
function copyAssets() {
  const distDir = join(__dirname, 'dist');
  const assetsDir = join(__dirname, 'assets');
  const vendorDir = join(__dirname, 'vendor');
  
  if (!existsSync(distDir)) {
    mkdirSync(distDir, { recursive: true });
  }
  
  // Copy HTML file
  copyFileSync(join(assetsDir, 'index.html'), join(distDir, 'index.html'));
  
  // Copy images
  const imgDir = join(distDir, 'img');
  if (!existsSync(imgDir)) {
    mkdirSync(imgDir, { recursive: true });
  }
  copyFileSync(join(assetsDir, 'img', 'brand.png'), join(imgDir, 'brand.png'));
  
  // Copy vendor files
  const vendorDistDir = join(distDir, 'vendor');
  copyRecursive(vendorDir, vendorDistDir);
  
  // Create js directory
  const jsDir = join(distDir, 'js');
  if (!existsSync(jsDir)) {
    mkdirSync(jsDir, { recursive: true });
  }
}

const buildOptions = {
  entryPoints: ['src/index.tsx'],
  bundle: true,
  outfile: 'dist/js/index.js',
  format: 'iife',
  platform: 'browser',
  target: 'es2020',
  sourcemap: true,
  define: {
    'process.env.NODE_ENV': '"development"',
    'global': 'window'
  },
  loader: {
    '.css': 'css',
    '.png': 'file',
    '.jpg': 'file',
    '.jpeg': 'file',
    '.gif': 'file',
    '.svg': 'file'
  }
};

// Copy assets before building
copyAssets();

if (isWatch) {
  const ctx = await esbuild.context(buildOptions);
  await ctx.watch();
  console.log('Watching for changes...');
  
  // Serve files
  await ctx.serve({
    servedir: 'dist',
    port: 3001,
    host: 'localhost'
  });
  console.log('Server running at http://localhost:3001');
} else {
  await esbuild.build(buildOptions);
  console.log('Build complete');
}