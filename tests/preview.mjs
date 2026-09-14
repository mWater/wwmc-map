import {context} from 'esbuild';
import {fileURLToPath} from 'node:url';
import {mkdirSync,writeFileSync} from 'node:fs';
const root=fileURLToPath(new URL('..',import.meta.url));
const out=new URL('preview-dist/',import.meta.url);
mkdirSync(out,{recursive:true});
writeFileSync(new URL('index.html',out),'<!doctype html><html><head><meta charset="utf-8"><title>WWMC Migration UI Test</title><link rel="stylesheet" href="preview.css"></head><body><main id="root" style="max-width:900px;margin:30px auto;padding:20px"></main><script src="preview.js"></script></body></html>');
const server=await context({absWorkingDir:root,entryPoints:['tests/preview.tsx'],bundle:true,outfile:'tests/preview-dist/preview.js'});
console.log(await server.serve({servedir:fileURLToPath(out),host:'127.0.0.1',port:3137}));
