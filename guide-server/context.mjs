import {readFile} from 'node:fs/promises';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
export const websiteRoot=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..');
export async function resolveGuideContext(context,root=websiteRoot){
 const catalog=JSON.parse(await readFile(path.join(root,'assets/guide-catalog.json'),'utf8'));
 if(!context.lessonId)return {scope:'curriculum',lessons:catalog.lessons.map(({id,title,objective,moduleTitle,status})=>({id,title,objective,moduleTitle,status}))};
 const lesson=catalog.lessons.find(l=>l.id===context.lessonId);if(!lesson)throw Error('Unknown lesson');
 let content=null;if(lesson.status==='published'||lesson.reviewStatus==='published')content=JSON.parse(await readFile(path.join(root,'assets/guide-content',lesson.id+'.json'),'utf8'));
 const review=context.reviewId?content?.review?.items.find(q=>q.id===context.reviewId):null;
 if(context.reviewId&&!review)throw Error('Unknown review question');
 return {scope:review?'review':'lesson',lesson,approvedLesson:content?.lesson||null,selectedReview:review,review:review?null:content?.review||null};
}
