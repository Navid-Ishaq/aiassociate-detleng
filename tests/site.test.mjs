import test,{before,after} from 'node:test';
import assert from 'node:assert/strict';
import {readFile,stat} from 'node:fs/promises';
import path from 'node:path';
import {build,root,validate} from '../scripts/build.mjs';
import {createServer} from '../scripts/serve.mjs';
import {esc,modulePath,lessonPath} from '../src/templates.mjs';
let built,server,base,pages;
before(async()=>{
 built=await build();
 pages=new Map(await Promise.all([...built.routes,'/404.html'].map(async route=>[route,await readFile(route==='/404.html'?path.join(built.out,'404.html'):path.join(built.out,route,'index.html'),'utf8')])));
 server=createServer();await new Promise(resolve=>server.listen(0,'127.0.0.1',resolve));base=`http://127.0.0.1:${server.address().port}`;
});
after(()=>new Promise(resolve=>server.close(resolve)));
test('curriculum has the exact 8 × 3 × 4 structure and predictable IDs',()=>{
 assert.equal(validate(built.modules),96);
 const bad=structuredClone(built.modules);bad[0].sections[0].lessons[0].id='M01-L02';assert.throws(()=>validate(bad));
 const badStatus=structuredClone(built.modules);badStatus[0].sections[0].lessons[0].status='live-ish';assert.throws(()=>validate(badStatus));
});
test('every official title and objective is present on its module and lesson page',()=>{
 for(const m of built.modules){
  const module=pages.get(modulePath(m));assert.equal((module.match(/class="lesson-row"/g)||[]).length,12);
  for(const s of m.sections){assert.ok(module.includes(esc(s.title)));
   for(const l of s.lessons){
    const html=pages.get(lessonPath(l));
    assert.ok(module.includes(esc(l.title)),l.id);assert.ok(module.includes(esc(l.objective)),l.id);
    assert.ok(html.includes(`<h2>${esc(l.title)}</h2>`),l.id);assert.ok(html.includes(esc(l.objective)),l.id);
    assert.ok(html.includes('This Lesson Is<br><em>Coming Soon</em>'),l.id);
    assert.equal(l.status,'coming-soon');
   }
  }
 }
});
test('all internal links, asset references, and fragment targets resolve in generated files',async()=>{
 for(const [route,html] of pages){
  for(const match of html.matchAll(/(?:href|src)="([^"]+)"/g)){
   const href=match[1].replaceAll('&amp;','&');if(/^(https?:|mailto:)/.test(href))continue;
   const url=new URL(href,'https://local.test'+route);let target;
   if(pages.has(url.pathname)){target=pages.get(url.pathname);}
   else{assert.ok(url.pathname.startsWith('/assets/'),`${route}: unknown route ${href}`);target=await readFile(path.join(built.out,url.pathname),'utf8');}
   if(url.hash)assert.ok(target.includes(`id="${url.hash.slice(1)}"`),`${route}: missing fragment ${href}`);
  }
 }
});
test('all 108 direct routes return 200; no-slash lesson URLs redirect to working pages',async()=>{
 for(let i=0;i<built.routes.length;i+=12){await Promise.all(built.routes.slice(i,i+12).map(async r=>{const response=await fetch(base+r);assert.equal(response.status,200,r);assert.match(response.headers.get('content-type'),/text\/html/);}));}
 const response=await fetch(base+'/learn/m03/l10',{redirect:'manual'});assert.equal(response.status,301);assert.equal(response.headers.get('location'),'/learn/m03/l10/');
 const lesson=await fetch(base+'/learn/m03/l10');assert.match(await lesson.text(),/HTTP 429 and Rate Limits/);
});
test('unknown pages show a useful 404 with HTTP 404 status',async()=>{
 const r=await fetch(base+'/learn/m99/l99/');assert.equal(r.status,404);assert.match(await r.text(),/This page isn’t here/);
 const post=await fetch(base+'/',{method:'POST'});assert.equal(post.status,405);
});
test('every page has metadata, one H1, landmarks, unique IDs, and labelled inactive account dialog',()=>{
 for(const [route,html] of pages){
  assert.equal((html.match(/<h1[ >]/g)||[]).length,1,route);
  for(const fragment of ['<html lang="en">','name="viewport"','name="description"','rel="canonical"','<main id="main"','<footer','Skip to content','<dialog id="account-dialog"','aria-labelledby="account-title"','aria-describedby="account-description"','Continue Free','Account features are being prepared. No account is required right now.','You’re early — enjoy AI Associate by DeTLeng free'])assert.ok(html.includes(fragment),`${route}: ${fragment}`);
  assert.ok(!/type="(?:password|email)"/.test(html),route);
  const ids=[...html.matchAll(/\bid="([^"]+)"/g)].map(m=>m[1]);assert.equal(new Set(ids).size,ids.length,route);
 }
});
test('ecosystem destinations have secure new-tab attributes and fixed footer order',()=>{
 for(const [route,html] of pages){
  const footer=html.slice(html.indexOf('<footer'));let previous=-1;
  for(const u of ['https://www.detleng.com/','https://lfds.detleng.com/','https://network.detleng.com/']){
   const i=footer.indexOf(`href="${u}"`);assert.ok(i>previous,route);previous=i;
   assert.ok(footer.includes(`href="${u}" target="_blank" rel="noopener noreferrer"`));
  }
  assert.ok(html.includes('href="https://automation.detleng.com/#desk" target="_blank" rel="noopener noreferrer"'));
 }
});
test('script has no unresolved build tokens, credential service, analytics, or remote asset dependencies',async()=>{
 const js=await readFile(path.join(built.out,'assets/app.js'),'utf8');
 assert.ok(!js.includes('__JOURNEY__'));assert.ok(!/localStorage|sessionStorage|document\.cookie|supabase|firebase|gtag\(/.test(js));
 for(const html of pages.values())assert.ok(!/<(?:script|img)[^>]+src="https?:/.test(html));
 assert.equal(esc('<script>"&\''),'&lt;script&gt;&quot;&amp;&#39;');
});
test('sitemap, CNAME, and production output agree with the configured hostname',async()=>{
 const {site}=await import('../src/config.mjs');
 assert.equal((await readFile(path.join(built.out,'CNAME'),'utf8')).trim(),new URL(site.origin).hostname);
 const sitemap=await readFile(path.join(built.out,'sitemap.xml'),'utf8');
 assert.equal((sitemap.match(/<loc>/g)||[]).length,108);assert.ok(!sitemap.includes('404.html'));
});


test('root publishing preserves source and does not require docs output',async()=>{
 assert.equal(built.out,root);
 assert.ok((await readFile(path.join(root,'index.html'),'utf8')).includes('Go beyond'));
 for(const file of ['src/config.mjs','src/data/curriculum.json','scripts/build.mjs','scripts/serve.mjs','package.json','README.md'])assert.ok((await stat(path.join(root,file))).isFile(),file);
 await assert.rejects(stat(path.join(root,'docs')),error=>error.code==='ENOENT');
 for(const url of ['/src/config.mjs','/.git/config','/tests/qa/layouts.html','/assets/..%2f.git/config'])assert.equal((await fetch(base+url)).status,404,url);
});
