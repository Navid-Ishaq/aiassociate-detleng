export const MAX_MESSAGE=2000,MAX_HISTORY=10;
export function contextKey(context){return context?.reviewId?`${context.lessonId}/${context.reviewId}`:context?.lessonId||'general';}
export function validateChatInput(body){
 if(!body||typeof body.requestId!=='string'||!/^[a-zA-Z0-9-]{8,100}$/.test(body.requestId))throw Error('Invalid request ID');
 if(typeof body.message!=='string'||!body.message.trim()||body.message.length>MAX_MESSAGE)throw Error('Enter a message of 1–2000 characters.');
 const context=body.context||{};
 if(context.lessonId!=null&&!/^M\d{2}-L\d{2}$/.test(context.lessonId))throw Error('Invalid lesson');
 if(context.reviewId!=null&&(!context.lessonId||!new RegExp('^'+context.lessonId+'-R\\d{3}$').test(context.reviewId)))throw Error('Invalid review');
 if(!Array.isArray(body.history)||body.history.length>MAX_HISTORY||body.history.some(m=>!['user','assistant'].includes(m.role)||typeof m.content!=='string'||m.content.length>6000))throw Error('Invalid conversation history');
 if(body.history.reduce((n,m)=>n+m.content.length,0)>12000)throw Error('Conversation history is too long');
 return {requestId:body.requestId,message:body.message.trim(),history:body.history.map(({role,content})=>({role,content})),context:{lessonId:context.lessonId||null,reviewId:context.reviewId||null}};
}
export function safeApiBase(value){if(!value)return '';const u=new URL(value);if(u.username||u.password||u.search||u.hash)throw Error('Invalid AI Guide service address');if(u.protocol!=='https:'&&!(u.protocol==='http:'&&['localhost','127.0.0.1'].includes(u.hostname)))throw Error('AI Guide needs HTTPS');return u.href.replace(/\/$/,'');}

export const shouldSendOnEnter=(event,composing=false)=>event.key==='Enter'&&!event.shiftKey&&!event.isComposing&&!composing&&event.keyCode!==229;

export function limitHistory(messages){const recent=messages.filter(m=>['user','assistant'].includes(m.role)).slice(-MAX_HISTORY).map(({role,content})=>({role,content}));while(recent.reduce((n,m)=>n+m.content.length,0)>12000)recent.shift();return recent;}

export function reviewDraft(item){return item ? `Please explain this simply, with a practical example.\n\nCustomer: ${item.question}\nYour response: ${item.answer}` : '';}
export function topicDraft(lesson){return lesson ? `Explain ${lesson.title} simply, with a practical example.` : '';}
export function preserveDraft(existing,suggested){return existing.trim() ? existing : suggested;}

export function createRequestId(cryptoApi=globalThis.crypto){
 if(typeof cryptoApi?.randomUUID==='function')return cryptoApi.randomUUID();
 if(typeof cryptoApi?.getRandomValues!=='function')throw Error('Secure random source unavailable');
 const bytes=cryptoApi.getRandomValues(new Uint8Array(16));bytes[6]=(bytes[6]&15)|64;bytes[8]=(bytes[8]&63)|128;
 const hex=Array.from(bytes,b=>b.toString(16).padStart(2,'0')).join('');return `${hex.slice(0,8)}-${hex.slice(8,12)}-${hex.slice(12,16)}-${hex.slice(16,20)}-${hex.slice(20)}`;
}
