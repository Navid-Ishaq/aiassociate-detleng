import {prepareListener} from './review-listener.js';
const root=document.querySelector('[data-quick-review]');
if(root){
 const items=JSON.parse(document.getElementById('review-data').textContent);
 const $=s=>document.querySelector(s),dialog=$('#listener-dialog'),language=$('#listener-language'),custom=$('#listener-custom'),open=$('#listener-open'),copy=$('#listener-copy'),status=$('#listener-status');
 let item=null,opener=null,prepared=null;
 function update(){
  $('#listener-copy-status').textContent='';$('#listener-copy-fallback').hidden=true;
  const value=dialog.querySelector('[name="listener-repeat"]:checked').value;
  custom.disabled=value!=='custom';$('#listener-custom-fields').hidden=value!=='custom';
  try{
   const count=value==='custom'?Number(custom.value):Number(value);
   prepared=prepareListener(item,language.value,count);
   copy.disabled=false;copy.textContent=prepared.fits?'Copy text':'Copy one Q&A';
   if(prepared.fits){open.href=prepared.url;open.removeAttribute('aria-disabled');status.textContent=`${count} complete Q&A block${count===1?'':'s'} prepared. In Google Translate, press the English or translated speaker icon.`;}
   else{open.removeAttribute('href');open.setAttribute('aria-disabled','true');status.textContent='This repeat count makes the text or link too long. Choose fewer repeats, or use Copy one Q&A to copy the complete question and answer once for manual practice.';}
  }catch(error){prepared=null;open.removeAttribute('href');open.setAttribute('aria-disabled','true');copy.disabled=true;status.textContent=error.message;}
 }
 document.querySelectorAll('[data-listen]').forEach(button=>button.addEventListener('click',()=>{
  opener=button;item=items[Number(button.dataset.listen)];
  $('#listener-question').textContent=item.question;$('#listener-answer').textContent=item.answer;
  dialog.querySelector('[name="listener-repeat"][value="1"]').checked=true;custom.value='10';update();dialog.showModal();dialog.querySelector('[data-listener-close]').focus();
 }));
 language.addEventListener('change',update);custom.addEventListener('input',update);
 dialog.querySelectorAll('[name="listener-repeat"]').forEach(input=>input.addEventListener('change',update));
 dialog.querySelector('[data-listener-close]').addEventListener('click',()=>dialog.close());
 dialog.addEventListener('close',()=>opener?.focus());
 dialog.addEventListener('click',event=>{if(event.target!==dialog)return;const r=dialog.getBoundingClientRect();if(event.clientX<r.left||event.clientX>r.right||event.clientY<r.top||event.clientY>r.bottom)dialog.close();});
 dialog.addEventListener('keydown',event=>{if(event.key!=='Tab')return;const controls=[...dialog.querySelectorAll('button:not(:disabled),a[href],select:not(:disabled),input:not(:disabled),textarea')].filter(el=>el.getClientRects().length>0),first=controls[0],last=controls.at(-1);if(event.shiftKey&&document.activeElement===first){event.preventDefault();last.focus();}else if(!event.shiftKey&&document.activeElement===last){event.preventDefault();first.focus();}});
 open.addEventListener('click',event=>{if(!prepared?.fits)event.preventDefault();});
 copy.addEventListener('click',async()=>{
  if(!prepared)return;const text=prepared.fits?prepared.text:prepared.baseText;
  try{if(!navigator.clipboard?.writeText)throw Error('Clipboard unavailable');await navigator.clipboard.writeText(text);$('#listener-copy-status').textContent=prepared.fits?'English practice text copied.':'One complete English Q&A copied. No question or answer was shortened.';}
  catch{const fallback=$('#listener-copy-fallback');fallback.hidden=false;const textarea=$('#listener-copy-text');textarea.value=text;textarea.focus();textarea.select();$('#listener-copy-status').textContent='Automatic copying is unavailable. Select the text below and copy it manually.';}
 });
 const search=$('#review-search');search.addEventListener('input',()=>{const words=search.value.trim().toLocaleLowerCase().split(/\s+/).filter(Boolean);let count=0;root.querySelectorAll('[data-review-card]').forEach(card=>{const q=items[Number(card.dataset.reviewCard)],text=(q.question+' '+q.answer).toLocaleLowerCase();card.hidden=!words.every(word=>text.includes(word));if(!card.hidden)count++;});$('#review-search-status').textContent=`${count} of ${items.length} questions${words.length?' match your search':''}`;$('#review-no-results').hidden=count!==0;});
}
