// Local browser fixture only: synthetic replies, no provider, no API keys.
import {readFile} from 'node:fs/promises';
import {createServer} from '../scripts/serve.mjs';
import {createGuideServer} from '../guide-server/server.mjs';
import {layout} from '../src/templates.mjs';
const port=4174,base=`http://127.0.0.1:${port}`;
let healthCalls=0;
const guide=createGuideServer({allowedOrigins:[base],generate:async({message})=>{await new Promise(r=>setTimeout(r,1000));if(message.includes('fail'))throw Error('Synthetic failure');return '[Synthetic local test reply] This is a test of the chat panel only. No online AI provider was contacted.';}});
const server=createServer(),serve=server.listeners('request')[0];server.removeAllListeners('request');
server.on('request',async(req,res)=>{
 const url=new URL(req.url,base);
 if(url.pathname==='/assets/guide-config.json'){res.writeHead(200,{'Content-Type':'application/json','Cache-Control':'no-store'});return res.end(JSON.stringify({enabled:true,apiBase:base+'/guide-api',connectionTimeoutMs:3000,replyTimeoutMs:3000}));}
 if(url.pathname.startsWith('/guide-api/')){req.url=req.url.replace('/guide-api','');if(req.url==='/health'&&++healthCalls===1){res.writeHead(200,{'Content-Type':'application/json'});return res.end(JSON.stringify({ready:false}));}return guide.emit('request',req,res);}
 if(url.pathname==='/guide-fixture/'){const reviews=JSON.parse(await readFile(new URL('../src/reviews/M01-L01.json',import.meta.url),'utf8'));res.writeHead(200,{'Content-Type':'text/html; charset=utf-8'});return res.end(layout({title:'Local Guide test fixture',path:'/guide-fixture/',content:`<div class="container"><h1>Local Guide test fixture</h1><p>Replies on this port are synthetic test messages. No online AI provider is connected.</p><button type="button" data-guide-lesson="M01-L01" data-guide-review="M01-L01-R002">Open Q&A context</button></div><script type="application/json" id="review-data">${JSON.stringify(reviews.items)}</script>`}));}
 serve(req,res);
});
server.listen(port,'127.0.0.1',()=>console.log(`Synthetic browser fixture: ${base}/guide-fixture/`));
