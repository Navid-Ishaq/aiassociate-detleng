export const reviewLanguages = [
 ['de','German'],['es','Spanish'],['fr','French'],['ur','Urdu'],['ar','Arabic'],['hi','Hindi'],['pt','Portuguese'],['it','Italian'],['zh-CN','Chinese (Simplified)'],['ja','Japanese'],['ko','Korean'],['ru','Russian'],['bn','Bengali']
];
export const MAX_REPEATS=20;
export function prepareListener(item,language,repeats){return prepareTextListener(`Customer: ${item.question}\nYour response: ${item.answer}`,language,repeats);}
export function prepareTextListener(baseText,language,repeats){
 if(typeof baseText!=='string'||!baseText.trim())throw new Error('Choose some practice text first.');
 if(!reviewLanguages.some(([code])=>code===language))throw new Error('Choose a supported target language.');
 if(!Number.isInteger(repeats)||repeats<1||repeats>MAX_REPEATS)throw new Error(`Choose a whole number from 1 to ${MAX_REPEATS}.`);
 const text=Array(repeats).fill(baseText).join('\n\n');
 const url=new URL('https://translate.google.com/');
 url.search=new URLSearchParams({sl:'en',tl:language,text,op:'translate'}).toString();
 const fits=Array.from(text).length<=4500&&url.href.length<=8000;
 return {baseText,text,url:fits?url.href:null,fits,repeats};
}
export function validateReview(bank,lesson){
 if(bank.id!==lesson.id||bank.title!==lesson.title||bank.objective!==lesson.objective)throw Error('Quick Review does not match curriculum: '+lesson.id);
 if(!Array.isArray(bank.items)||bank.items.length<1||bank.items.length>25)throw Error('Quick Review needs 1–25 distinct Q&As');
 const ids=new Set(),questions=new Set();
 for(const item of bank.items){const question=item.question?.trim().toLowerCase();if(!item.id?.startsWith(bank.id+'-R')||ids.has(item.id)||!question||questions.has(question)||!item.answer?.trim())throw Error('Invalid or duplicate review item');ids.add(item.id);questions.add(question);}
}
