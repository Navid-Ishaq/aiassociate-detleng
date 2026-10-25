const results=[];
const frames=[...document.querySelectorAll('iframe')];
function audit(){
 results.length=0;
 for(const f of frames){
  const d=f.contentDocument;if(!d?.body)continue;
  const width=d.documentElement.clientWidth;
  const overflow=[...d.querySelectorAll('body *')].filter(e=>{const r=e.getBoundingClientRect();return r.width>0&&(r.right>width+2||r.left< -2)&&!e.closest('[aria-hidden="true"],.hero-art,.skip-link')&&getComputedStyle(e).position!=='fixed'}).map(e=>({tag:e.tagName,cls:e.getAttribute('class'),text:e.textContent.trim().slice(0,45)}));
  results.push({test:f.title,width,scrollWidth:d.documentElement.scrollWidth,overflow});
 }
 document.getElementById('report').textContent=JSON.stringify(results,null,2);
}
frames.forEach(f=>f.addEventListener('load',audit));
window.addEventListener('load',audit);
