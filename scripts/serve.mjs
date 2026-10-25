import http from 'node:http';
import path from 'node:path';
import {readFile,stat} from 'node:fs/promises';
import {fileURLToPath} from 'node:url';
const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'../docs');
const mime={'.html':'text/html; charset=utf-8','.css':'text/css; charset=utf-8','.js':'text/javascript; charset=utf-8','.json':'application/json; charset=utf-8','.svg':'image/svg+xml','.png':'image/png','.xml':'application/xml; charset=utf-8','.txt':'text/plain; charset=utf-8'};
export function createServer(){return http.createServer(async(req,res)=>{
 try{
  if(!['GET','HEAD'].includes(req.method)){res.writeHead(405,{'Allow':'GET, HEAD'});return res.end();}
  const pathname=decodeURIComponent(new URL(req.url,'http://localhost').pathname);
  const qaRoot=path.resolve(root,'../tests/qa');
  const servingQA=process.env.SITE_QA==='1'&&pathname.startsWith('/__qa/');
  const allowedRoot=servingQA?qaRoot:root;
  let file=path.resolve(allowedRoot,'.'+(servingQA?pathname.slice(5):pathname));
  if(file!==allowedRoot&&!file.startsWith(allowedRoot+path.sep)){res.writeHead(403);return res.end();}
  let info;try{info=await stat(file);}catch{}
  if(info?.isDirectory()){
   if(!pathname.endsWith('/')){res.writeHead(301,{'Location':pathname+'/'+new URL(req.url,'http://localhost').search});return res.end();}
   file=path.join(file,'index.html');
  }
  let data,status=200;try{data=await readFile(file);}catch{status=404;file=path.join(root,'404.html');data=await readFile(file);}
  res.writeHead(status,{'Content-Type':mime[path.extname(file)]||'application/octet-stream','Cache-Control':'no-cache','X-Content-Type-Options':'nosniff','Content-Length':data.length});
  res.end(req.method==='HEAD'?undefined:data);
 }catch{res.writeHead(400);res.end('Bad request');}
});}
if(process.argv[1]&&path.resolve(process.argv[1])===fileURLToPath(import.meta.url)){
 const port=Number(process.env.PORT||4173);const server=createServer();
 server.listen(port,'127.0.0.1',()=>console.log(`Local: http://127.0.0.1:${port}\nServing docs/ — press Ctrl+C to stop.`));
}
