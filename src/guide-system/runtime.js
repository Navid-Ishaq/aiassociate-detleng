import {contextKey,safeApiBase,shouldSendOnEnter,limitHistory,reviewDraft,topicDraft,preserveDraft} from './guide-protocol.js';
const panel=document.getElementById('guide-panel');
if(panel){
 const $=s=>document.querySelector(s),launcher=$('#guide-launcher'),composer=$('#guide-message'),send=$('#guide-send'),log=$('#guide-conversation'),topic=$('#guide-topic');
 const threads=new Map();let active={lessonId:null,reviewId:null},catalog=null,config=null,bootPromise=null,composing=false;
 const reduced=()=>matchMedia('(prefers-reduced-motion: reduce)').matches;
 const thread=()=>{const key=contextKey(active);if(!threads.has(key))threads.set(key,{messages:[],draft:'',pending:false,request:null});return threads.get(key);};
 const latest=()=>requestAnimationFrame(()=>log.scrollTo({top:log.scrollHeight,behavior:reduced()?'auto':'smooth'}));
 function element(tag,cls,text){const n=document.createElement(tag);n.className=cls;if(text)n.textContent=text;return n;}
 function lesson(){return catalog?.lessons.find(l=>l.id===active.lessonId);}
 function reviewItem(){if(!active.reviewId)return null;try{return JSON.parse($('#review-data')?.textContent||'[]').find(q=>q.id===active.reviewId)||thread().review||null;}catch{return null;}}
 function availability(){const l=lesson();return l?`${l.id} · ${l.status==='published'?'Lesson available':'Full lesson coming soon'}`:'Whole curriculum · 96 lesson outlines';}
 function updateControls(){const t=thread();send.disabled=t.pending||!composer.value.trim();send.textContent=t.pending?'Waiting…':'Send';$('#guide-connection').textContent=t.pending?'A reply is in progress.':config?.enabled?'Online replies use the connected AI service.':'Online replies are not connected yet.';$('#guide-processing-note').textContent=config?.enabled?'Sending shares your message and learning context with the online AI service.':'Online AI is not connected. No messages are sent to an AI provider.';}
 function render(){
  const t=thread();log.replaceChildren();log.setAttribute('aria-busy',String(t.pending));
  const intro=element('div','guide-local-note');intro.append(element('p','',availability()));
  intro.append(element('p','',config?.enabled?'Ask a question, request an example, or practise explaining the idea. AI answers can be wrong; check important claims.':'Online replies are being prepared. You can still explore lesson outlines and approved Quick Reviews. Your message will not be sent to an AI provider in this stage.'));
  const links=element('div','guide-resource-links'),l=lesson();
  for(const [label,url] of l?[[l.status==='published'?'Open full lesson':'View lesson outline',l.lessonUrl],[l.reviewStatus==='published'?'Open Quick Review':'View review outline',l.reviewUrl]]:[['Explore curriculum','/learn/'],['Explore Quick Review','/quick-review/']]){const a=element('a','',label);a.href=url;links.append(a);}intro.append(links);log.append(intro);
  for(const message of t.messages){const bubble=element('div','guide-message guide-'+message.role);bubble.append(element('strong','',message.role==='user'?'You':message.role==='assistant'?'AI Guide':'Notice'),element('p','',message.content));if(message.retry){const button=element('button','guide-retry','Try again');button.type='button';button.disabled=t.pending;button.onclick=()=>{composer.focus({preventScroll:true});submit(message.retry);};bubble.append(button);}log.append(bubble);}
  const box=$('#guide-context'),q=reviewItem();box.replaceChildren();box.hidden=!q;
  if(q){box.append(element('strong','','Selected Q&A'));const details=document.createElement('details'),summary=element('summary','',q.question);details.append(summary,element('p','',q.answer));box.append(details);}
  topic.value=active.lessonId||'';updateControls();latest();
 }
 async function boot(){if(bootPromise)return bootPromise;bootPromise=Promise.all([fetch('/assets/guide-catalog.json').then(r=>{if(!r.ok)throw Error('Lesson list unavailable');return r.json();}),fetch('/assets/guide-config.json').then(r=>{if(!r.ok)throw Error('Guide unavailable');return r.json();})]).then(([data,settings])=>{catalog=data;config={...settings,apiBase:safeApiBase(settings.apiBase)};if(config.enabled&&!config.apiBase)config.enabled=false;topic.replaceChildren(new Option('Whole curriculum · 96 lessons',''));for(const m of catalog.modules){const group=document.createElement('optgroup');group.label=`${m.id} · ${m.title}`;catalog.lessons.filter(l=>l.moduleId===m.id).forEach(l=>group.append(new Option(`${l.id} · ${l.title}${l.status==='published'?'':' · Coming soon'}`,l.id)));topic.append(group);}return true;}).catch(()=>{bootPromise=null;config={enabled:false,apiBase:''};$('#guide-connection').textContent='The lesson list could not load. The curriculum links still work.';return false;});return bootPromise;}
 async function open(context){
  panel.hidden=false;launcher.setAttribute('aria-expanded','true');composer.focus({preventScroll:true});
  const ok=await boot();if(context&&ok){thread().draft=composer.value;active={lessonId:context.lessonId||null,reviewId:context.reviewId||null};if(active.lessonId&&!lesson())active={lessonId:null,reviewId:null};if(active.reviewId){const q=reviewItem();if(q)thread().review=q;else active.reviewId=null;}thread().draft=preserveDraft(thread().draft,reviewDraft(reviewItem()));composer.value=thread().draft;}
  else if(ok&&!threads.size){const match=location.pathname.match(/^\/(?:learn|quick-review)\/(m\d{2})\/(l\d{2})\//i);if(match){active={lessonId:`${match[1]}-${match[2]}`.toUpperCase(),reviewId:null};}}
  render();
 }
 launcher.addEventListener('click',()=>panel.hidden?open():close());
 function close(){panel.hidden=true;launcher.setAttribute('aria-expanded','false');launcher.focus({preventScroll:true});}
 $('#guide-close').onclick=close;panel.addEventListener('keydown',e=>{if(e.key==='Escape'){e.stopPropagation();close();}});
 document.addEventListener('click',e=>{const button=e.target.closest('[data-guide-lesson]');if(button)open({lessonId:button.dataset.guideLesson,reviewId:button.dataset.guideReview||null});});
 function select(context){thread().draft=composer.value;active=context;thread().draft=preserveDraft(thread().draft,topicDraft(lesson()));composer.value=thread().draft;render();composer.focus({preventScroll:true});}
 topic.onchange=()=>select({lessonId:topic.value||null,reviewId:null});$('#guide-general').onclick=()=>select({lessonId:null,reviewId:null});
 $('#guide-new-chat').onclick=()=>{const t=thread();if(t.pending){$('#guide-connection').textContent='Wait for the current reply before starting a new conversation.';return;}threads.delete(contextKey(active));composer.value='';render();composer.focus({preventScroll:true});};
 composer.addEventListener('input',()=>{thread().draft=composer.value;updateControls();});composer.addEventListener('compositionstart',()=>composing=true);composer.addEventListener('compositionend',()=>composing=false);
 composer.addEventListener('keydown',event=>{if(shouldSendOnEnter(event,composing)){event.preventDefault();submit();}});
 $('#guide-form').addEventListener('submit',event=>{event.preventDefault();if(!composing){composer.focus({preventScroll:true});submit();}});
 document.querySelectorAll('[data-guide-suggestion]').forEach(button=>button.onclick=()=>{composer.focus({preventScroll:true});submit(null,button.dataset.guideSuggestion);});
 async function timedFetch(url,options,ms){const controller=new AbortController(),timer=setTimeout(()=>controller.abort(),ms);try{return await fetch(url,{...options,signal:controller.signal});}finally{clearTimeout(timer);}}
 async function submit(retry=null,suggestion=null){
  const t=thread(),key=contextKey(active),context={...active};if(t.pending)return;
  const text=(retry?.message||suggestion||composer.value).trim();if(!text||text.length>2000)return;
  const request=retry||{requestId:crypto.randomUUID(),message:text,context,history:limitHistory(t.messages)};
  t.pending=true;if(retry)t.messages=t.messages.filter(m=>m.retry?.requestId!==retry.requestId);if(!retry)t.messages.push({role:'user',content:text});composer.value='';t.draft='';
  const notice={role:'notice',content:'Connecting… The first connection may take a little longer.'};t.messages.push(notice);render();
  const refresh=()=>{if(contextKey(active)===key)render();};
  let chatStarted=false;
  try{
   await boot();if(!config?.enabled){notice.content='Online replies are not connected yet. Your question has not been sent to an AI provider. You can still use the lesson and Quick Review links above.';return;}
   // A health probe can wake a service; it never generates an AI reply. No chat request is automatically resent.
   const healthResponse=await timedFetch(config.apiBase+'/health',{method:'GET',credentials:'omit'},config.connectionTimeoutMs||45000);
   if(!healthResponse.ok)throw Error('connection');const health=await healthResponse.json();if(health.ready!==true)throw Error('waking');
   notice.content='Thinking…';refresh();
   chatStarted=true;
   const response=await timedFetch(config.apiBase+'/chat',{method:'POST',credentials:'omit',headers:{'Content-Type':'application/json'},body:JSON.stringify(request)},config.replyTimeoutMs||60000);
   if(!response.ok){if(response.status===429)throw Error('limit');throw Error('reply');}
   const result=await response.json();if(result.requestId!==request.requestId||typeof result.reply!=='string'||!result.reply.trim()||result.reply.length>6000)throw Error('reply');
   t.messages.splice(t.messages.indexOf(notice),1);t.messages.push({role:'assistant',content:result.reply});
  }catch(error){notice.content=error.message==='limit'?'The Guide is busy or its usage limit has been reached. Please try again later.':error.message==='waking'?'The Guide is still getting ready. Please try connecting again in a moment.':!chatStarted?'We could not connect to the Guide yet. Your message has not been sent to an AI provider. Your lesson and Quick Review are still available.':'We could not confirm a reply. Nothing will be resent automatically. You can choose Try again when ready.';notice.retry=request;}
  finally{t.pending=false;refresh();}
 }
}
