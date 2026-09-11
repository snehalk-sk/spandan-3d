const {test} = require('node:test');
const assert = require('node:assert/strict');
const vm = require('node:vm');
const fs = require('node:fs');
const path = require('node:path');
const read = p => fs.readFileSync(path.join(__dirname, '..', p), 'utf8');
test('image reads run concurrently, share requests and invalidate after deletion', async () => {
 const routes = {}; let downloads = 0; let active = 0; let peak = 0;
 const records = Object.fromEntries(['home-hero','home-idols','home-custom','about-main'].map(s=>['settings/'+s+'.json',{url:'https://example.com/'+s}]));
 const bucket = {
  async download(p) { downloads++; peak = Math.max(peak,++active); await new Promise(r=>setTimeout(r,5)); active--; return records[p] ? {data:{text:async()=>JSON.stringify(records[p])}} : {error:{statusCode:404,message:'not found'}}; },
  async remove(paths) {paths.forEach(p=>delete records[p]);return {};}
 };
 const multer = () => ({single:()=>()=>{}}); multer.memoryStorage = ()=>({});
 const context = {module:{exports:{}},require:n=>n==='multer'?multer:require(n),Buffer,Date,Promise};
 vm.runInNewContext(read('server/site-images.js'),context);
 const app = Object.fromEntries(['get','post','delete'].map(m=>[m,(p,...handlers)=>routes[m+p]=handlers.at(-1)]));
 context.module.exports(app,{storage:{getBucket:async()=>({}),from:()=>bucket}});
 const res = () => ({set(){return this},status(n){this.code=n;return this},json(x){this.body=x;return this}});
 let a=res(),b=res(); await Promise.all([routes['get/api/site-images']({},a),routes['get/api/site-images']({},b)]);
 assert.equal(downloads,4); assert.equal(peak,4); assert.equal(Object.keys(a.body).length,4);
 await routes['get/api/site-images']({},res());assert.equal(downloads,4);
 await routes['delete/api/site-images/:slot']({params:{slot:'home-hero'}},res());
 a=res();await routes['get/api/site-images']({},a);assert.equal(downloads,8);assert.equal(a.body['home-hero'],undefined);
});
test('public homepage limits DB query; admin retains complete catalogue', async()=>{
 const s=read('server/server.js');const a=s.indexOf('app.get(',s.indexOf('// PRODUCTS - GET ALL'));const b=s.indexOf('app.get(',a+8);
 let handler;let calls=[];
 const query={then(resolve){resolve({data:[],error:null})}};
 for(const m of ['select','order','or','eq','limit']) query[m]=(...args)=>{calls.push([m,...args]);return query};
 vm.runInNewContext(s.slice(a,b),{app:{get:(p,h)=>handler=h},supabase:{from:()=>query},requireSupabase:()=>true,formatProduct:p=>p,console});
 await handler({query:{public:'1',limit:'6'}},{json(){}});assert.ok(calls.some(c=>c[0]==='limit'&&c[1]===6));assert.ok(calls.some(c=>c[0]==='or'));
 calls=[];await handler({query:{}},{json(){}});assert.ok(!calls.some(c=>['limit','or'].includes(c[0])));
 calls=[];await handler({query:{public:'1',id:'abc'}},{json(){}});assert.ok(calls.some(c=>c[0]==='eq'&&c[2]==='abc'));
});
test('product cache is bounded and bypassed at checkout; request scopes match pages',async()=>{
 const s=read('js/main.js');const a=s.indexOf('function productRequestPath()');const b=s.indexOf('// SAVE CART',a);
 for(const [path,expected] of [['/index.html','limit=6'],['/product.html','id=123'],['/shop.html','public=1'],['/checkout.html','public=1']]) {
  const c={location:{pathname:path,search:'?id=123'},URLSearchParams,sessionStorage:{getItem:()=>JSON.stringify({time:Date.now(),items:[{id:1}]})},normalizeProduct:p=>p,Date,AbortController,setTimeout,clearTimeout,console};
  vm.createContext(c);vm.runInContext('let products=[];'+s.slice(a,b),c);
  assert.ok(vm.runInContext('productRequestPath()',c).includes(expected));
  assert.equal(vm.runInContext('restoreProducts()',c),path!='/checkout.html');
  c.sessionStorage.getItem=()=>'{broken';assert.equal(vm.runInContext('restoreProducts()',c),false);
 }
});
test('dashboard startup only loads orders; duplicate data requests share a fetch',async()=>{
 const s=read('server/admin/admin.js');const a=s.indexOf('const adminRequests =');let calls=0;let loaded=[];
 const c={API_URL:'https://example.com',AbortController,setTimeout,clearTimeout,fetch:async()=>{calls++;await new Promise(r=>setTimeout(r,5));return {ok:true,json:async()=>[]}},document:{querySelector:()=>({id:'dashboardPage'})},loadOrders:()=>loaded.push('orders'),loadProducts:()=>loaded.push('products'),loadCustomPrints:()=>loaded.push('custom'),resetProductMedia(){},loadSettings(){}};
 vm.createContext(c);vm.runInContext(s.slice(a),c);assert.deepEqual(loaded,['orders']);
 vm.runInContext("loadPageData('products')",c);assert.deepEqual(loaded,['orders','products']);
 await vm.runInContext("Promise.all([adminGet('/api/products'),adminGet('/api/products')])",c);assert.equal(calls,1);
});
