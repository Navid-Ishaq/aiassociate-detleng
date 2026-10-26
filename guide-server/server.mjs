import http from 'node:http';
import {createHash} from 'node:crypto';
import {fileURLToPath} from 'node:url';
import path from 'node:path';
import {validateChatInput} from '../src/guide-system/protocol.js';
import {resolveGuideContext} from './context.mjs';
export function createGuideServer({generate=null,allowedOrigins=['http://127.0.0.1:4173','http://localhost:4173','https://www.aiassociate.detleng.com'],resolveContext=resolveGuideContext}={}){
 const requests=new Map(),limits=new Map();
 return http.createServer(async(req,res)=>{
  const origin=req.headers.origin;
  const headers={'Content-Type':'application/json; charset=utf-8','Cache-Control':'no-store'};
  if(origin){if(!allowedOrigins.includes(origin)){res.writeHead(403,headers);return res.end(JSON.stringify({code:'ORIGIN_NOT_ALLOWED'}));}headers['Access-Control-Allow-Origin']=origin;headers.Vary='Origin';}
  const reply=(status,payload)=>{res.writeHead(status,headers);res.end(JSON.stringify(payload));};
  if(req.method==='OPTIONS'){res.writeHead(204,{...headers,'Access-Control-Allow-Methods':'GET, POST, OPTIONS','Access-Control-Allow-Headers':'Content-Type'});return res.end();}
  const url=new URL(req.url,'http://localhost');
  if(req.method==='GET'&&url.pathname==='/health')return reply(200,{ready:typeof generate==='function'});
  if(req.method!=='POST'||url.pathname!=='/chat')return reply(404,{code:'NOT_FOUND'});
  let input;
  try{let body='';for await(const chunk of req){body+=chunk;if(Buffer.byteLength(body)>65536)return reply(413,{code:'MESSAGE_TOO_LARGE'});}input=validateChatInput(JSON.parse(body));}catch{return reply(400,{code:'INVALID_MESSAGE'});}
  if(!generate)return reply(503,{code:'GUIDE_UNAVAILABLE',requestId:input.requestId});
  const now=Date.now();for(const [id,r]of requests)if(r.done&&r.expires<now)requests.delete(id);
  const hash=createHash('sha256').update(JSON.stringify(input)).digest('hex'),previous=requests.get(input.requestId);
  if(previous){if(previous.hash!==hash)return reply(409,{code:'REQUEST_ID_CONFLICT',requestId:input.requestId});const result=await previous.promise;return reply(result.status,result.body);}
  const client=req.socket.remoteAddress||'unknown';for(const [id,r]of limits)if(r.reset<now)limits.delete(id);
  const limit=limits.get(client)||{count:0,reset:now+60000};if(limit.count>=20||limits.size>1000||requests.size>=500)return reply(429,{code:'PLEASE_WAIT',requestId:input.requestId});limit.count++;limits.set(client,limit);
  const record={hash,done:false,expires:now+120000,promise:null};
  record.promise=(async()=>{try{const context=await resolveContext(input.context);const text=await generate({message:input.message,history:input.history,context});if(typeof text!=='string'||!text.trim()||text.length>6000)throw Error('Invalid response');return {status:200,body:{requestId:input.requestId,reply:text}};}catch{return {status:503,body:{code:'GUIDE_UNAVAILABLE',requestId:input.requestId}};}finally{record.done=true;record.expires=Date.now()+120000;}})();requests.set(input.requestId,record);const result=await record.promise;reply(result.status,result.body);
 });
}
if(process.argv[1]&&path.resolve(process.argv[1])===fileURLToPath(import.meta.url)){const port=Number(process.env.PORT||4319);createGuideServer({allowedOrigins:(process.env.ALLOWED_ORIGINS||'http://127.0.0.1:4173,http://localhost:4173,https://www.aiassociate.detleng.com').split(',')}).listen(port,'127.0.0.1',()=>console.log(`Guide scaffold: http://127.0.0.1:${port} — live AI disabled`));}
