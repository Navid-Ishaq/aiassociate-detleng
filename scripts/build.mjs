import {readFile,writeFile,mkdir,copyFile} from 'node:fs/promises';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
import {site} from '../src/config.mjs';
import {layout,curriculum,modulePage,lessonPage,notFound,modulePath,lessonPath,esc,journey,breadcrumbs} from '../src/templates.mjs';
import {home,about,privacy} from '../src/pages.mjs';
export const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const out = root;
export const readJSON = async filename => JSON.parse((await readFile(filename,'utf8')).replace(/^\uFEFF/,''));
export function validate(modules){
 if(modules.length!==8) throw new Error('Expected 8 modules');
 const ids=new Set();
 modules.forEach((m,i)=>{
  if(m.id!==`M${String(i+1).padStart(2,'0')}`||m.sections.length!==3) throw new Error('Invalid module structure');
  let number=0;
  m.sections.forEach((s,j)=>{
   if(s.id!=='ABC'[j]||!s.title||s.lessons.length!==4) throw new Error('Invalid section structure');
   s.lessons.forEach(l=>{
    number++;
    if(l.id!==`${m.id}-L${String(number).padStart(2,'0')}`||ids.has(l.id)||!l.title||!l.objective||!['coming-soon','published'].includes(l.status)) throw new Error(`Invalid lesson: ${l.id}`);
    ids.add(l.id);
   });
  });
 });
 return ids.size;
}
export async function build(){
 const modules=await readJSON(path.join(root,'src/data/curriculum.json'));
 validate(modules);
 // Root publishing: overwrite only generated files. Never recursively clean the project root.
 if(out!==root)throw new Error('Unexpected output directory');
 await mkdir(path.join(out,'assets'),{recursive:true});
 const routes=[];
 async function page(route, options){
  const file=route==='/404.html'?path.join(out,'404.html'):path.join(out,route,'index.html');
  await mkdir(path.dirname(file),{recursive:true});
  await writeFile(file,layout({...options,path:route}));
  if(route!=='/404.html') routes.push(route);
 }
 await page('/',{title:'Home',content:home(modules)});
 await page('/learn/',{title:'Curriculum',content:curriculum(modules),active:'learn',description:'Explore 8 modules, 24 sections, and 96 planned lessons. Find exact lesson titles, learning objectives, and your own starting point.'});
 for(const m of modules){
  await page(modulePath(m),{title:m.title,description:m.focus,content:modulePage(m,modules),active:'learn'});
  for(const s of m.sections) for(const l of s.lessons){
   let content;
   if(l.status==='published'){
    // Publishing is explicit: a reviewed HTML file must exist or the build fails.
    const approved=await readFile(path.join(root,'src/lessons',`${l.id}.html`),'utf8');
    if(!approved.trim())throw new Error(`Published lesson is empty: ${l.id}`);
    content=`<article class="container narrow editorial">${breadcrumbs([['Curriculum','/learn/'],[m.title,modulePath(m)],[s.title,modulePath(m)+'#section-'+s.id.toLowerCase()],[l.title]])}<span class="eyebrow">${esc(l.id)}</span><h1>${esc(l.title)}</h1><p class="intro-lead">${esc(l.objective)}</p>${approved}<a class="inline-link" href="${modulePath(m)}">Back to Module</a></article>`;
   }else content=lessonPage(m,s,l);
   await page(lessonPath(l),{title:l.title,description:`${l.id}: ${l.objective}${l.status==='coming-soon'?' This lesson is coming soon.':''}`,content,active:'learn'});
  }
 }
 await page('/about/',{title:'About the learning journey',content:about(),active:'about'});
 await page('/privacy/',{title:'Privacy',content:privacy()});
 await page('/404.html',{title:'Page not found',content:notFound(),noindex:true});
 await copyFile(path.join(root,'src/styles.css'),path.join(out,'assets/styles.css'));
 await copyFile(path.join(root,'src/data/curriculum.json'),path.join(out,'assets/curriculum.json'));
 await writeFile(path.join(out,'assets/app.js'),(await readFile(path.join(root,'src/app.js'),'utf8')).replace('__JOURNEY__',JSON.stringify(journey)));
 const favicon='<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64"><rect width="64" height="64" rx="14" fill="#f8f7f1"/><path d="M14 36h9v17h-9z" fill="#183d35"/><path d="M28 24h9v29h-9z" fill="#226d61"/><path d="M42 12h9v41h-9z" fill="#70a18c"/></svg>';
 await writeFile(path.join(out,'assets/favicon.svg'),favicon);
 await writeFile(path.join(out,'assets/social.svg'),'<svg xmlns="http://www.w3.org/2000/svg" width="1200" height="630" viewBox="0 0 1200 630"><rect width="1200" height="630" fill="#f8f7f1"/><rect x="65" y="70" width="9" height="45" fill="#226d61"/><text x="100" y="106" fill="#183d35" font-family="Arial,sans-serif" font-size="26">AI Associate by DeTLeng</text><text x="65" y="280" fill="#183d35" font-family="Georgia,serif" font-size="84">Go beyond</text><text x="65" y="380" fill="#226d61" font-family="Georgia,serif" font-size="84" font-style="italic">the AI answer.</text><text x="65" y="485" fill="#52665f" font-family="Arial,sans-serif" font-size="28">Understand AI. Explore possibilities. Build useful skills.</text><text x="65" y="555" fill="#226d61" font-family="Arial,sans-serif" font-size="20">Free to explore · No account needed</text></svg>');
 await writeFile(path.join(out,'.nojekyll'),'');
 await writeFile(path.join(out,'CNAME'),new URL(site.origin).hostname+'\n');
 await writeFile(path.join(out,'robots.txt'),`User-agent: *\nAllow: /\nSitemap: ${site.origin}/sitemap.xml\n`);
 await writeFile(path.join(out,'sitemap.xml'),`<?xml version="1.0" encoding="UTF-8"?><urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">${routes.map(r=>`<url><loc>${site.origin}${r}</loc></url>`).join('')}</urlset>`);
 await writeFile(path.join(out,'route-manifest.json'),JSON.stringify({pages:routes.length,routes},null,2));
 console.log(`Built ${routes.length} pages + 404 in project root: 8 modules, 24 sections, 96 lessons.`);
 return {modules,routes,out};
}
if(process.argv[1]&&path.resolve(process.argv[1])===fileURLToPath(import.meta.url))await build();
