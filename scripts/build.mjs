import {readFile,writeFile,mkdir,cp} from 'node:fs/promises';
import path from 'node:path';
const read=p=>readFile(p,'utf8');
await mkdir('dist/server',{recursive:true});await mkdir('dist/.openai',{recursive:true});
const assets={};for(const name of ['pdf.mjs','pdf.worker.mjs'])assets['/assets/'+name]=await read('vendor/'+name);
const engine=await read('engine.js'),policy=(await read('policy.js')).replace(/^import .*?;\r?\n/gm,''),server=(await read('server.js')).replace(/^import .*?;\r?\n/gm,'');
const html=await read('ui.html');
await writeFile('dist/server/index.js',engine+'\n'+policy+'\n'+server+'\nconst HTML='+JSON.stringify(html)+';\nconst ASSETS='+JSON.stringify(assets)+';\nexport default {async fetch(request,env){const p=new URL(request.url).pathname;if(p.startsWith("/api/"))return api(request,env);if(ASSETS[p])return new Response(ASSETS[p],{headers:{"content-type":"text/javascript","cache-control":"public,max-age=86400"}});if(p!=="/")return new Response("Not found",{status:404});return new Response(HTML,{headers:{"content-type":"text/html;charset=utf-8","x-content-type-options":"nosniff","referrer-policy":"same-origin"}});}};');
await cp('.openai/hosting.json','dist/.openai/hosting.json');await cp('drizzle','dist/.openai/drizzle',{recursive:true});console.log('Built Worker, UI, PDF reader and database migrations.');
