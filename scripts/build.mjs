import {validateSimulations} from '../src/simulation-system/content.js';
import {readFile,writeFile,mkdir,copyFile} from 'node:fs/promises';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
import {createGuideCatalog} from '../src/guide-system/catalog.mjs';
import {site} from '../src/config.mjs';
import {renderLesson} from '../src/lesson-system/render.mjs';
import {layout,curriculum,modulePage,lessonPage,notFound,modulePath,lessonPath,esc,journey,breadcrumbs} from '../src/templates.mjs';
import {home,about,privacy} from '../src/pages.mjs';
import {reviewDirectory,reviewModule,reviewLesson,reviewModulePath,reviewLessonPath} from '../src/quick-review.mjs';
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
 const reviewIds=await readJSON(path.join(root,'src/data/reviews.json'));
 if(!Array.isArray(reviewIds)||new Set(reviewIds).size!==reviewIds.length)throw Error('Invalid review manifest');
 const allLessons=modules.flatMap(m=>m.sections.flatMap(s=>s.lessons));
 const reviewBanks=new Map();
 for(const id of reviewIds){if(!/^M\d{2}-L\d{2}$/.test(id)||!allLessons.some(l=>l.id===id))throw Error('Unknown review lesson: '+id);reviewBanks.set(id,await readJSON(path.join(root,'src/reviews',id+'.json')));}
 const simulationIds=await readJSON(path.join(root,'src/data/simulations.json'));
 if(!Array.isArray(simulationIds)||new Set(simulationIds).size!==simulationIds.length)throw Error('Invalid simulation manifest');
 const simulationBanks=new Map();
 for(const id of simulationIds){if(!reviewBanks.has(id))throw Error('Simulation needs a published Quick Review');const bank=await readJSON(path.join(root,'src/simulations',id+'-simulations.json'));validateSimulations(bank,reviewBanks.get(id));simulationBanks.set(id,bank);}
 allLessons.forEach(l=>l.reviewStatus=reviewBanks.has(l.id)?'published':'coming-soon');
 // Root publishing: overwrite only generated files. Never recursively clean the project root.
 if(out!==root)throw new Error('Unexpected output directory');
 await mkdir(path.join(out,'assets'),{recursive:true});
 const routes=[];
 const publishedLessons=new Map();
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
    const lesson=await readJSON(path.join(root,'src/lessons',l.id,'lesson.json'));
    const questions=await readJSON(path.join(root,'src/lessons',l.id,'questions.json'));
    publishedLessons.set(l.id,lesson);
    content=renderLesson(m,s,l,lesson,questions);
   }else content=lessonPage(m,s,l);
   await page(lessonPath(l),{title:l.title,description:`${l.id}: ${l.objective}${l.status==='coming-soon'?' This lesson is coming soon.':''}`,content,active:'learn'});
  }
 }
 await page('/quick-review/',{title:'Lesson Questions & Answers',description:'Refresh your understanding with short, practical questions and clear answers. Explore all 8 Quick Review modules and 96 planned lesson reviews.',content:reviewDirectory(modules),active:'review'});
 for(const m of modules){
  await page(reviewModulePath(m),{title:`Quick Review: ${m.title}`,description:`Quick Review for ${m.title}. Explore 12 planned lesson Q&As. ${m.focus}`,content:reviewModule(m,modules),active:'review'});
  for(const s of m.sections)for(const l of s.lessons){
   await page(reviewLessonPath(l),{title:`Quick Review: ${l.title}`,description:`${l.id}: ${l.objective}${reviewBanks.has(l.id)?' Short questions, clear answers and optional listening practice.':' This Quick Review is coming soon.'}`,content:reviewLesson(m,s,l,reviewBanks.get(l.id),simulationBanks.get(l.id)),active:'review'});
  }
 }
 await page('/about/',{title:'About the learning journey',content:about(),active:'about'});
 await page('/privacy/',{title:'Privacy',content:privacy()});
 await page('/404.html',{title:'Page not found',content:notFound(),noindex:true});
 await copyFile(path.join(root,'src/lesson-system/styles.css'),path.join(out,'assets/lesson.css'));
 await copyFile(path.join(root,'src/lesson-system/runtime.js'),path.join(out,'assets/lesson.js'));
 await copyFile(path.join(root,'src/styles.css'),path.join(out,'assets/styles.css'));
 await writeFile(path.join(out,'assets/curriculum.json'),JSON.stringify(modules,null,2));
 await writeFile(path.join(out,'assets/guide-catalog.json'),JSON.stringify(createGuideCatalog(modules)));
 await copyFile(path.join(root,'src/guide-system/config.json'),path.join(out,'assets/guide-config.json'));
 await copyFile(path.join(root,'src/guide-system/runtime.js'),path.join(out,'assets/guide.js'));
 await copyFile(path.join(root,'src/guide-system/protocol.js'),path.join(out,'assets/guide-protocol.js'));
 await copyFile(path.join(root,'src/guide-system/styles.css'),path.join(out,'assets/guide.css'));
 await mkdir(path.join(out,'assets/guide-content'),{recursive:true});
 for(const l of allLessons)if(publishedLessons.has(l.id)||reviewBanks.has(l.id))await writeFile(path.join(out,'assets/guide-content',l.id+'.json'),JSON.stringify({lessonId:l.id,title:l.title,objective:l.objective,lesson:publishedLessons.get(l.id)||null,review:reviewBanks.get(l.id)||null}));
 await mkdir(path.join(out,'assets/simulations'),{recursive:true});
 for(const [id,bank] of simulationBanks)await writeFile(path.join(out,'assets/simulations',id+'.json'),JSON.stringify(bank));
 for(const [source,target]of [['styles.css','simulation.css'],['runtime.js','simulation.js'],['content.js','simulation-content.js']])await copyFile(path.join(root,'src/simulation-system',source),path.join(out,'assets',target));
 await copyFile(path.join(root,'src/review-system/styles.css'),path.join(out,'assets/review.css'));
 await copyFile(path.join(root,'src/review-system/runtime.js'),path.join(out,'assets/review.js'));
 await copyFile(path.join(root,'src/review-system/review-listener.js'),path.join(out,'assets/review-listener.js'));
 await writeFile(path.join(out,'assets/app.js'),(await readFile(path.join(root,'src/app.js'),'utf8')).replace('__JOURNEY__',JSON.stringify(journey)));
 const favicon='<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64"><rect width="64" height="64" rx="14" fill="#f5f7fc"/><path d="M14 36h9v17h-9z" fill="#142b50"/><path d="M28 24h9v29h-9z" fill="#1d4ed8"/><path d="M42 12h9v41h-9z" fill="#60a5fa"/></svg>';
 await writeFile(path.join(out,'assets/favicon.svg'),favicon);
 await writeFile(path.join(out,'assets/social.svg'),'<svg xmlns="http://www.w3.org/2000/svg" width="1200" height="630" viewBox="0 0 1200 630"><rect width="1200" height="630" fill="#f5f7fc"/><rect x="65" y="70" width="9" height="45" fill="#1d4ed8"/><text x="100" y="106" fill="#142b50" font-family="Arial,sans-serif" font-size="26">AI Associate by DeTLeng</text><text x="65" y="280" fill="#142b50" font-family="Arial,sans-serif" font-size="84">Go beyond</text><text x="65" y="380" fill="#1d4ed8" font-family="Arial,sans-serif" font-size="84">the AI answer.</text><text x="65" y="485" fill="#4b5f7d" font-family="Arial,sans-serif" font-size="28">Understand AI. Explore possibilities. Build useful skills.</text><text x="65" y="555" fill="#1d4ed8" font-family="Arial,sans-serif" font-size="20">Free to explore · No account needed</text></svg>');
 await writeFile(path.join(out,'.nojekyll'),'');
 await writeFile(path.join(out,'CNAME'),new URL(site.origin).hostname+'\n');
 await writeFile(path.join(out,'robots.txt'),`User-agent: *\nAllow: /\nSitemap: ${site.origin}/sitemap.xml\n`);
 await writeFile(path.join(out,'sitemap.xml'),`<?xml version="1.0" encoding="UTF-8"?><urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">${routes.map(r=>`<url><loc>${site.origin}${r}</loc></url>`).join('')}</urlset>`);
 await writeFile(path.join(out,'route-manifest.json'),JSON.stringify({pages:routes.length,routes},null,2));
 console.log(`Built ${routes.length} pages + 404 in project root: 8 modules, 24 sections, 96 curriculum lessons + 96 Quick Reviews.`);
 return {modules,routes,out};
}
if(process.argv[1]&&path.resolve(process.argv[1])===fileURLToPath(import.meta.url))await build();
