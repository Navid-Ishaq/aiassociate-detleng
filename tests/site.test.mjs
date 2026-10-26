import test,{before,after} from 'node:test';
import assert from 'node:assert/strict';
import {readFile,stat} from 'node:fs/promises';
import path from 'node:path';
import {build,root,validate} from '../scripts/build.mjs';
import {createServer} from '../scripts/serve.mjs';
import {esc,modulePath,lessonPath} from '../src/templates.mjs';
import {reviewModulePath,reviewLessonPath} from '../src/quick-review.mjs';
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
    assert.ok(html.includes(esc(l.objective)),l.id);
    if(l.id==='M01-L01'){
     assert.equal(l.status,'published');assert.ok(html.includes('data-interactive-lesson'));
     assert.ok(html.includes(`<h1>${esc(l.title)}</h1>`));
     assert.ok(!html.includes('This Lesson Is<br><em>Coming Soon</em>'));
    }else{
     assert.ok(html.includes(`<h2>${esc(l.title)}</h2>`),l.id);
     assert.ok(html.includes('This Lesson Is<br><em>Coming Soon</em>'),l.id);
     assert.equal(l.status,'coming-soon');
    }
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
test('all 213 direct routes return 200; no-slash lesson URLs redirect to working pages',async()=>{
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
 assert.equal((sitemap.match(/<loc>/g)||[]).length,213);assert.ok(!sitemap.includes('404.html'));
});


test('root publishing preserves source and does not require docs output',async()=>{
 assert.equal(built.out,root);
 assert.ok((await readFile(path.join(root,'index.html'),'utf8')).includes('Go beyond'));
 for(const file of ['src/config.mjs','src/data/curriculum.json','scripts/build.mjs','scripts/serve.mjs','package.json','README.md'])assert.ok((await stat(path.join(root,file))).isFile(),file);
 await assert.rejects(stat(path.join(root,'docs')),error=>error.code==='ENOENT');
 for(const url of ['/src/config.mjs','/.git/config','/tests/qa/layouts.html','/assets/..%2f.git/config'])assert.equal((await fetch(base+url)).status,404,url);
});

test('every page includes the standard footer navigation and learning message',()=>{
 for(const [route,html] of pages){
  const footer=html.slice(html.indexOf('<footer'),html.indexOf('</footer>'));
  for(const text of ['class="footer-columns"','aria-label="Footer navigation"','aria-label="DeTLeng ecosystem"','Learn with confidence','Login / Create Account','class="footer-base"'])assert.ok(footer.includes(text),`${route}: ${text}`);
  assert.ok(!footer.includes('One curious mind. A wider world.'));
 }
});

test('Quick Review mirrors the exact curriculum without publishing Q&A content',()=>{
 const directory=pages.get('/quick-review/');
 assert.ok(directory.includes('<h1>Lesson Questions &amp; Answers</h1>'));
 assert.ok(directory.includes('Refresh your understanding with short, practical questions and clear answers.'));
 assert.equal((directory.match(/class="module-card review-card"/g)||[]).length,8);
 assert.ok(directory.includes('No Q&amp;A banks are available yet.'));
 for(const m of built.modules){
  assert.ok(directory.includes(`href="${reviewModulePath(m)}"`));
  const module=pages.get(reviewModulePath(m));
  assert.equal((module.match(/class="lesson-row review-lesson"/g)||[]).length,12);
  for(const section of m.sections)for(const lesson of section.lessons){
   assert.ok(module.includes(esc(lesson.title)));assert.ok(module.includes(esc(lesson.objective)));
   assert.ok(module.includes(`href="${reviewLessonPath(lesson)}"`));
   const html=pages.get(reviewLessonPath(lesson));
   for(const text of ['Quick Review<br><em>Coming Soon</em>',`<h2>${esc(lesson.title)}</h2>`,esc(lesson.objective),'QUICK REVIEW IN PREPARATION','Back to Quick Review','Back to Review Module'])assert.ok(html.includes(text),lesson.id);
   assert.ok(html.includes(`href="${lessonPath(lesson)}"`));
   assert.ok(!html.includes('Customer:'));assert.ok(!html.includes('Your response:'));
  }
 }
 assert.equal(built.routes.filter(r=>r.startsWith('/quick-review/')).length,105);
});
test('Quick Review entry points and active section appear correctly across the site',()=>{
 for(const [route,html] of pages){
  const header=html.slice(html.indexOf('<header'),html.indexOf('</header>'));
  const footer=html.slice(html.indexOf('<footer'),html.indexOf('</footer>'));
  assert.ok(header.includes('href="/quick-review/"'));assert.ok(footer.includes('href="/quick-review/"'));
  if(route.startsWith('/quick-review/')){
   assert.ok(header.includes('href="/quick-review/" aria-current="page"'));
   assert.ok(!header.includes('href="/learn/" aria-current="page"'));
  }
 }
});
test('review previous/next links stay in Quick Review and handle module boundaries',()=>{
 for(const m of built.modules){
  const lessons=m.sections.flatMap(s=>s.lessons);
  lessons.forEach((l,i)=>{
   const html=pages.get(reviewLessonPath(l));
   const navigation=html.slice(html.indexOf('<nav class="page-pagination"'));
   if(i>0)assert.ok(navigation.includes(`href="${reviewLessonPath(lessons[i-1])}"`));
   else assert.ok(!navigation.includes('← PREVIOUS REVIEW'));
   if(i<lessons.length-1)assert.ok(navigation.includes(`href="${reviewLessonPath(lessons[i+1])}"`));
   else assert.ok(!navigation.includes('NEXT REVIEW →'));
  });
 }
});
test('direct Quick Review URLs redirect correctly; invalid review routes return 404',async()=>{
 const redirect=await fetch(base+'/quick-review/m03/l10',{redirect:'manual'});assert.equal(redirect.status,301);assert.equal(redirect.headers.get('location'),'/quick-review/m03/l10/');
 const response=await fetch(base+'/quick-review/m03/l10');assert.equal(response.status,200);assert.match(await response.text(),/Quick Review<br><em>Coming Soon/);
 assert.equal((await fetch(base+'/quick-review/m09/l01/')).status,404);
});

test('published lesson has the complete interactive teaching sequence and independent review status',async()=>{
 const html=pages.get('/learn/m01/l01/');
 assert.equal((html.match(/class="learning-section"/g)||[]).length,16);
 assert.equal((html.match(/data-simulation="/g)||[]).length,2);
 assert.equal((html.match(/class="challenge"/g)||[]).length,5);
 for(const marker of ['data-safe-response','data-quiz-stage','data-flashcards','data-work-check','data-final-check','data-finish-lesson','data-timer-start','data-reset-lesson'])assert.ok(html.includes(marker),marker);
 const data=JSON.parse(html.match(/<script type="application\/json" id="lesson-data">([\s\S]*?)<\/script>/)[1]);
 assert.equal(data.questions.length,15);assert.deepEqual(data.simulations.map(s=>s.cases.length),[3,3]);
 assert.ok(!pages.get('/quick-review/m01/l01/').includes('data-quiz-stage'));
 assert.ok(pages.get('/quick-review/m01/l01/').includes('QUICK REVIEW IN PREPARATION'));
 assert.ok(pages.get('/learn/m01/').includes('Open lesson'));assert.ok(pages.get('/').includes('Your first interactive lesson is ready.'));
});
test('lesson validator rejects curriculum drift, broken keys, duplicate options and incomplete feedback',async()=>{
 const {validateLesson}=await import('../src/lesson-system/render.mjs');
 const data=JSON.parse(await readFile(path.join(root,'src/lessons/M01-L01/lesson.json'),'utf8'));
 const questions=JSON.parse(await readFile(path.join(root,'src/lessons/M01-L01/questions.json'),'utf8'));
 const l=built.modules[0].sections[0].lessons[0];validateLesson(data,questions,l);
 for(const mutate of [d=>d.title='Wrong title',d=>d.sections[1].id=d.sections[0].id,d=>d.simulations[0].cases[0].correct=99,d=>d.classifications[0].answers[0]='verification',d=>d.references[0].url='javascript:alert(1)']){const bad=structuredClone(data);mutate(bad);assert.throws(()=>validateLesson(bad,questions,l));}
 for(const mutate of [q=>q[0].correct=-1,q=>q[0].options[1]=q[0].options[0],q=>q[0].feedback.pop(),q=>q[1].id=q[0].id]){const bad=structuredClone(questions);mutate(bad);assert.throws(()=>validateLesson(data,bad,l));}
});
test('source assessment text and keys survive rendering; JSON cannot break out of its script element',async()=>{
 const {renderLesson}=await import('../src/lesson-system/render.mjs');
 const data=JSON.parse(await readFile(path.join(root,'src/lessons/M01-L01/lesson.json'),'utf8'));
 const questions=JSON.parse(await readFile(path.join(root,'src/lessons/M01-L01/questions.json'),'utf8'));
 const html=pages.get('/learn/m01/l01/');
 assert.deepEqual(questions.map(q=>q.correct),[1,2,0,3,1,2,0,3,1,2,1,3,0,2,1]);
 for(const q of questions){assert.ok(html.includes(esc(q.question)));assert.ok(html.includes(esc(q.explanation)));for(const feedback of q.feedback)assert.ok(html.includes(esc(feedback)));}
 const injected=structuredClone(questions);injected[0].question='</script><script>alert("example")</script>';
 const m=built.modules[0],s=m.sections[0],l=s.lessons[0],out=renderLesson(m,s,l,data,injected);
 assert.ok(!out.includes(injected[0].question));const json=out.match(/id="lesson-data">([\s\S]*?)<\/script>/)[1];assert.equal(JSON.parse(json).questions[0].question,injected[0].question);
});
test('recovered references are secure descriptive links without tracking parameters',()=>{
 const html=pages.get('/learn/m01/l01/');
 for(const url of ['https://developers.google.com/machine-learning/crash-course/llm/transformers','https://learn.microsoft.com/en-us/agent-framework/journey/llm-fundamentals','https://help.openai.com/en/articles/8313428-does-chatgpt-tell-the-truth'])assert.ok(html.includes(`href="${url}" target="_blank" rel="noopener noreferrer"`));
 assert.ok(!html.includes('utm_source'));assert.ok(!html.includes('Content version'));assert.ok(!html.includes('Pending editorial approval'));
});
test('lesson assets are local, served successfully, and collect no learner responses',async()=>{
 for(const name of ['lesson.css','lesson.js']){const r=await fetch(base+'/assets/'+name);assert.equal(r.status,200);}
 const js=await readFile(path.join(root,'assets/lesson.js'),'utf8');assert.ok(!/fetch\(|XMLHttpRequest|sendBeacon|localStorage|sessionStorage|document\.cookie|eval\(/.test(js));
 assert.ok(pages.get('/learn/m01/l01/').includes('Your writing stays on this page. It is not sent or automatically graded.'));
});

test('lesson content preserves Unicode punctuation and has no replacement or mojibake characters',async()=>{
 const data=await readFile(path.join(root,'src/lessons/M01-L01/lesson.json'),'utf8');
 assert.ok(data.includes('Case 1 — Travelling'));
 assert.ok(data.includes('€85'));
 assert.ok(!/\uFFFD|â€|â‚|Ã¢/.test(data));
 const schema=JSON.parse((await readFile(path.join(root,'src/lesson-system/lesson.schema.json'),'utf8')).replace(/^\uFEFF/,''));assert.equal(schema.type,'object');
});
