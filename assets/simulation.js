import {validateSimulations,composeGuide} from './simulation-content.js';
const root=document.querySelector('[data-simulation-bank]');
if(root){
 const $=s=>document.querySelector(s),dialog=$('#simulation-dialog'),items=JSON.parse($('#review-data').textContent),states=new Map();
 let bank=null,loading=null,current=null,opener=null,suspended=false;
 const state=()=>states.get(current.reviewId);
 const node=(tag,text,cls='')=>{const n=document.createElement(tag);n.textContent=text;n.className=cls;return n;};
 async function load(){if(bank)return bank;if(!loading)loading=fetch(root.dataset.simulationBank).then(r=>{if(!r.ok)throw Error('Unavailable');return r.json();}).then(data=>bank=validateSimulations(data,{id:root.dataset.simulationLesson,items})).catch(error=>{loading=null;throw error;});return loading;}
 function update(){const s=state(),guide=composeGuide(current,s.selected);$('#simulation-guide').textContent=guide||'Choose at least one point to prepare your speaking guide.';$('#simulation-count').textContent=`${s.selected.size} of 4 points selected`;$('#simulation-copy').disabled=!guide;$('#simulation-listen').disabled=$('#simulation-listen-mode').value==='guide'&&!guide;$('#simulation-professional').hidden=!s.reveal;$('#simulation-reveal').setAttribute('aria-expanded',String(s.reveal));$('#simulation-reveal').textContent=s.reveal?'Hide Professional Response':'Reveal Professional Response';$('#simulation-copy-fallback').hidden=true;$('#simulation-copy-status').textContent='';dialog.querySelectorAll('[data-speaking-point]').forEach(input=>input.checked=s.selected.has(input.value));}
 document.querySelectorAll('[data-speaking-review]').forEach(button=>button.addEventListener('click',async()=>{
  if(button.disabled)return;button.disabled=true;try{
   const data=await load(),simulation=data.items.find(s=>s.reviewId===button.dataset.speakingReview);if(!simulation)throw Error('Missing simulation');
   current=simulation;opener=button;if(!states.has(current.reviewId))states.set(current.reviewId,{selected:new Set(),reveal:false});
   $('#simulation-question').textContent=items.find(i=>i.id===current.reviewId).question;$('#simulation-goal').textContent=current.goal;$('#simulation-response').textContent=current.professionalResponse;$('#simulation-listen-mode').value='guide';
   const points=$('#simulation-points');points.replaceChildren();for(const p of current.points){const label=node('label','','simulation-point'),input=document.createElement('input');input.type='checkbox';input.value=p.id;input.dataset.speakingPoint='';const content=node('div','');content.append(node('strong',p.title),node('p',p.explanation));const help=document.createElement('details');help.append(node('summary','Speaking help'),node('p',p.sentence));label.append(input,content);const card=node('div','','simulation-point-wrap');card.append(label,help);points.append(card);input.addEventListener('change',()=>{input.checked?state().selected.add(p.id):state().selected.delete(p.id);update();});}
   update();dialog.showModal();dialog.scrollTop=0;$('#simulation-close').focus({preventScroll:true});
  }catch{$('#simulation-launch-status').textContent='Speaking Practice could not load. Please try again. Your Q&A is still available.';}
  finally{button.disabled=false;}
 }));
 $('#simulation-all').onclick=()=>{state().selected=new Set(current.points.map(p=>p.id));update();};$('#simulation-clear').onclick=()=>{state().selected.clear();update();};
 $('#simulation-reveal').onclick=()=>{state().reveal=!state().reveal;update();};$('#simulation-listen-mode').onchange=update;
 $('#simulation-copy').onclick=async()=>{const text=composeGuide(current,state().selected);if(!text)return;try{if(!navigator.clipboard?.writeText)throw Error();await navigator.clipboard.writeText(text);$('#simulation-copy-status').textContent='Speaking guide copied.';}catch{$('#simulation-copy-fallback').hidden=false;const field=$('#simulation-copy-text');field.value=text;field.focus();field.select();$('#simulation-copy-status').textContent='Select the text and copy it manually.';}};
 $('#simulation-listen').onclick=()=>{const professional=$('#simulation-listen-mode').value==='professional',text=professional?current.professionalResponse:composeGuide(current,state().selected);if(!text)return;suspended=true;dialog.close();document.dispatchEvent(new CustomEvent('practice-listen',{detail:{text,title:professional?'Professional Response':'My Speaking Guide',returnToSimulation:true}}));};
 document.addEventListener('practice-listener-closed',()=>{if(!suspended)return;suspended=false;dialog.showModal();$('#simulation-listen').focus({preventScroll:true});});
 $('#simulation-close').onclick=()=>dialog.close();dialog.addEventListener('close',()=>{if(!suspended)opener?.focus({preventScroll:true});});
 dialog.addEventListener('keydown',event=>{if(event.key!=='Tab')return;const controls=[...dialog.querySelectorAll('button:not(:disabled),input,select,summary,textarea')].filter(n=>n.getClientRects().length);const first=controls[0],last=controls.at(-1);if(event.shiftKey&&document.activeElement===first){event.preventDefault();last.focus();}else if(!event.shiftKey&&document.activeElement===last){event.preventDefault();first.focus();}});
}
