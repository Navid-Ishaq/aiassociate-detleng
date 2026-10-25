// Build a visible, local-only contrast report for rendered text.
function rgb(s){const m=s.match(/[\d.]+/g);return m?m.slice(0,3).map(Number):null;}
function luminance(c){return c.map(v=>{v/=255;return v<=.04045?v/12.92:((v+.055)/1.055)**2.4}).reduce((s,v,i)=>s+v*[.2126,.7152,.0722][i],0);}
function auditContrast(){
 const failures=[];
 for(const f of document.querySelectorAll('iframe')){
  const d=f.contentDocument;if(!d?.body)continue;
  for(const e of d.querySelectorAll('body *')){
   if(![...e.childNodes].some(n=>n.nodeType===3&&n.textContent.trim())||!e.getBoundingClientRect().width||e.closest('[hidden],dialog:not([open]),svg,[aria-hidden="true"]'))continue;
   const st=getComputedStyle(e);if(st.display==='none'||st.visibility==='hidden')continue;
   let bg=e;while(bg&&['rgba(0, 0, 0, 0)','transparent'].includes(getComputedStyle(bg).backgroundColor))bg=bg.parentElement;
   const back=rgb(bg?getComputedStyle(bg).backgroundColor:'rgb(248,247,241)'),front=rgb(st.color);if(!front||!back)continue;
   const a=luminance(front),b=luminance(back),ratio=(Math.max(a,b)+.05)/(Math.min(a,b)+.05);
   const large=parseFloat(st.fontSize)>=24||(parseFloat(st.fontSize)>=18.66&&Number(st.fontWeight)>=700);
   if(ratio<(large?3:4.5))failures.push({frame:f.title,cls:e.className?.baseVal??e.className,text:e.textContent.trim().slice(0,55),ratio:ratio.toFixed(2),size:st.fontSize});
  }
 }
 document.querySelector('#contrast').textContent=JSON.stringify(failures,null,2);
}
window.addEventListener('load',auditContrast);
