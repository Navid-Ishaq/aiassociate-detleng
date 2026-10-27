import {prepareListener,prepareTextListener} from './review-listener.js';
const root=document.querySelector('[data-quick-review]');
if(root){
 const items=JSON.parse(document.getElementById('review-data').textContent);
 const $=s=>document.querySelector(s),dialog=$('#listener-dialog'),language=$('#listener-language'),custom=$('#listener-custom'),open=$('#listener-open'),copy=$('#listener-copy'),status=$('#listener-status');
 let item=null,opener=null,prepared=null,practice=null;
 function show(itemValue,button,material=null){opener=button;item=itemValue;practice=material;const roles=dialog.querySelectorAll('.listener-preview .review-role');roles[0].textContent=practice?'Practice material:':'Customer:';roles[1].textContent=practice?'English text:':'Your response:';$('#listener-question').textContent=practice?practice.title:item.question;$('#listener-answer').textContent=practice?practice.text:item.answer;$('#listener-note').textContent='Opens Google Translate and shares this '+(practice?'practice':'Q&A')+' text with Google. Press a speaker icon there to listen in English or the selected language. Playback, pauses, translation and audio availability depend on Google.';dialog.querySelector('[name="listener-repeat"][value="1"]').checked=true;custom.value='10';update();dialog.showModal();dialog.querySelector('[data-listener-close]').focus();}
 document.addEventListener('practice-listen',event=>show(null,null,event.detail));
 function update(){
  $('#listener-copy-status').textContent='';$('#listener-copy-fallback').hidden=true;
  const value=dialog.querySelector('[name="listener-repeat"]:checked').value;
  custom.disabled=value!=='custom';$('#listener-custom-fields').hidden=value!=='custom';
  try{
   const count=value==='custom'?Number(custom.value):Number(value);
   prepared=practice?prepareTextListener(practice.text,language.value,count):prepareListener(item,language.value,count);
   copy.disabled=false;copy.textContent=prepared.fits?'Copy text':practice?'Copy once':'Copy one Q&A';
   if(prepared.fits){open.href=prepared.url;open.removeAttribute('aria-disabled');status.textContent=`${count} complete ${practice?'practice':'Q&A'} block${count===1?'':'s'} prepared. In Google Translate, press the English or translated speaker icon.`;}
   else{open.removeAttribute('href');open.setAttribute('aria-disabled','true');status.textContent=practice?'This repeat count makes the text or link too long. Choose fewer repeats, or copy the complete practice text once.':'This repeat count makes the text or link too long. Choose fewer repeats, or use Copy one Q&A to copy the complete question and answer once for manual practice.';}
  }catch(error){prepared=null;open.removeAttribute('href');open.setAttribute('aria-disabled','true');copy.disabled=true;status.textContent=error.message;}
 }
 document.querySelectorAll('[data-listen]').forEach(button=>button.addEventListener('click',()=>{
  show(items[Number(button.dataset.listen)],button);
 }));
 language.addEventListener('change',update);custom.addEventListener('input',update);
 dialog.querySelectorAll('[name="listener-repeat"]').forEach(input=>input.addEventListener('change',update));
 dialog.querySelector('[data-listener-close]').addEventListener('click',()=>dialog.close());
 dialog.addEventListener('close',()=>{if(practice?.returnToSimulation)document.dispatchEvent(new CustomEvent('practice-listener-closed'));else opener?.focus({preventScroll:true});});
 dialog.addEventListener('click',event=>{if(event.target!==dialog)return;const r=dialog.getBoundingClientRect();if(event.clientX<r.left||event.clientX>r.right||event.clientY<r.top||event.clientY>r.bottom)dialog.close();});
 dialog.addEventListener('keydown',event=>{if(event.key!=='Tab')return;const controls=[...dialog.querySelectorAll('button:not(:disabled),a[href],select:not(:disabled),input:not(:disabled),textarea')].filter(el=>el.getClientRects().length>0),first=controls[0],last=controls.at(-1);if(event.shiftKey&&document.activeElement===first){event.preventDefault();last.focus();}else if(!event.shiftKey&&document.activeElement===last){event.preventDefault();first.focus();}});
 open.addEventListener('click',event=>{if(!prepared?.fits)event.preventDefault();});
 copy.addEventListener('click',async()=>{
  if(!prepared)return;const text=prepared.fits?prepared.text:prepared.baseText;
  try{if(!navigator.clipboard?.writeText)throw Error('Clipboard unavailable');await navigator.clipboard.writeText(text);$('#listener-copy-status').textContent=prepared.fits?'English practice text copied.':practice?'Complete English practice text copied once.':'One complete English Q&A copied. No question or answer was shortened.';}
  catch{const fallback=$('#listener-copy-fallback');fallback.hidden=false;const textarea=$('#listener-copy-text');textarea.value=text;textarea.focus();textarea.select();$('#listener-copy-status').textContent='Automatic copying is unavailable. Select the text below and copy it manually.';}
 });
 const search=$('#review-search');search.addEventListener('input',()=>{const words=search.value.trim().toLocaleLowerCase().split(/\s+/).filter(Boolean);let count=0;root.querySelectorAll('[data-review-card]').forEach(card=>{const q=items[Number(card.dataset.reviewCard)],text=(q.question+' '+q.answer).toLocaleLowerCase();card.hidden=!words.every(word=>text.includes(word));if(!card.hidden)count++;});$('#review-search-status').textContent=`${count} of ${items.length} questions${words.length?' match your search':''}`;$('#review-no-results').hidden=count!==0;});
}
