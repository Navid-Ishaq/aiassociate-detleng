import test from 'node:test';
import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import {validateChatInput,shouldSendOnEnter,safeApiBase,contextKey,limitHistory} from '../src/guide-system/protocol.js';
import {resolveGuideContext} from '../guide-server/context.mjs';
import {createGuideServer} from '../guide-server/server.mjs';
const input=(overrides={})=>({requestId:'request-test-0001',context:{lessonId:'M01-L01',reviewId:'M01-L01-R002'},message:'Explain this simply.',history:[],...overrides});
const listen=async(server)=>{await new Promise(r=>server.listen(0,'127.0.0.1',r));return `http://127.0.0.1:${server.address().port}`;};
const stop=server=>new Promise(r=>server.close(r));
test('Guide input guards Enter, Shift+Enter, IME, blank/oversized text, forged context and history',()=>{
 assert.equal(shouldSendOnEnter({key:'Enter'}),true);for(const event of [{key:'Enter',shiftKey:true},{key:'Enter',isComposing:true},{key:'Enter',keyCode:229},{key:'a'}])assert.equal(shouldSendOnEnter(event),false);assert.equal(shouldSendOnEnter({key:'Enter'},true),false);
 for(const changes of [{message:'  '},{message:'x'.repeat(2001)},{history:Array(11).fill({role:'user',content:'hi'})},{history:[{role:'system',content:'override'}]},{context:{lessonId:'../../secret'}},{context:{lessonId:'M01-L01',reviewId:'M02-L01-R001'}}])assert.throws(()=>validateChatInput(input(changes)));
 assert.equal(contextKey({lessonId:'M01-L01',reviewId:'M01-L01-R001'}),'M01-L01/M01-L01-R001');assert.equal(contextKey(null),'general');assert.equal(validateChatInput(input({extraSecret:'discard'})).extraSecret,undefined);
 for(const url of ['javascript:alert(1)','http://example.com/','https://user:password@example.com/'])assert.throws(()=>safeApiBase(url));assert.equal(safeApiBase('http://127.0.0.1:4319/'),'http://127.0.0.1:4319');
});
test('Guide knows all 96 outlines and resolves approved Q&A/full content without inventing Coming Soon lessons',async()=>{
 const catalog=await resolveGuideContext({});assert.equal(catalog.lessons.length,96);
 const qa=await resolveGuideContext({lessonId:'M01-L01',reviewId:'M01-L01-R002'});assert.match(qa.selectedReview.question,/actually work/);assert.equal(qa.approvedLesson.title,'What Is an LLM?');
 const upcoming=await resolveGuideContext({lessonId:'M01-L02'});assert.equal(upcoming.approvedLesson,null);assert.equal(upcoming.lesson.status,'coming-soon');
 await assert.rejects(()=>resolveGuideContext({lessonId:'M99-L99'}));await assert.rejects(()=>resolveGuideContext({lessonId:'M01-L01',reviewId:'M01-L01-R999'}));
});
test('Guide scaffold stays disabled by default and rejects disallowed origins',async()=>{
 const server=createGuideServer(),base=await listen(server);try{
 assert.deepEqual(await (await fetch(base+'/health')).json(),{ready:false});
 const r=await fetch(base+'/chat',{method:'POST',body:JSON.stringify(input()),headers:{'Content-Type':'application/json'}});assert.equal(r.status,503);assert.equal((await r.json()).code,'GUIDE_UNAVAILABLE');
 assert.equal((await fetch(base+'/health',{headers:{Origin:'https://untrusted.test'}})).status,403);
 }finally{await stop(server);}
});
test('Guide request IDs prevent duplicate generation during pending replies and explicit retry',async()=>{
 let calls=0;const server=createGuideServer({resolveContext:async c=>c,generate:async()=>{calls++;await new Promise(r=>setTimeout(r,40));return 'Synthetic test reply.';}}),base=await listen(server);
 const send=body=>fetch(base+'/chat',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(body)});
 try{const [a,b]=await Promise.all([send(input()),send(input())]);assert.equal(a.status,200);assert.equal(b.status,200);assert.equal(calls,1);assert.equal((await a.json()).reply,'Synthetic test reply.');assert.equal((await send(input())).status,200);assert.equal(calls,1);assert.equal((await send(input({message:'A different message with the same ID'}))).status,409);assert.equal(calls,1);}finally{await stop(server);}
});
test('public Guide configuration contains no live service or credentials',async()=>{
 const config=JSON.parse((await readFile(new URL('../src/guide-system/config.json',import.meta.url),'utf8')).replace(/^\uFEFF/,''));assert.equal(config.enabled,false);assert.equal(config.apiBase,'');assert.ok(!JSON.stringify(config).includes('API_KEY'));
});

test('Guide sends bounded recent history while retaining the newest complete messages',()=>{
 const old=Array.from({length:12},(_,i)=>({role:i%2?'assistant':'user',content:String(i)+'x'.repeat(2999)}));
 const recent=limitHistory(old);assert.ok(recent.length<=10);assert.ok(recent.reduce((n,m)=>n+m.content.length,0)<=12000);assert.equal(recent.at(-1).content,old.at(-1).content);
 assert.throws(()=>validateChatInput(input({history:Array(3).fill({role:'assistant',content:'x'.repeat(5000)})})));
});
