const {test} = require('node:test');
const assert = require('node:assert/strict');
const fs = require('fs/promises');
const os = require('os');
const path = require('path');
const handler = require('../server/product-media');
const response = () => ({status(n) {this.code=n;return this;}, json(data) {this.body=data;return this;}});
async function file(dir, name, mimetype='image/png') {
 const target=path.join(dir,name);await fs.writeFile(target,'sample media');return {path:target,mimetype};
}
test('main/gallery/video persist beyond staging cleanup and handler restart',async()=>{
 const dir=await fs.mkdtemp(path.join(os.tmpdir(),'spandan-media-'));
 const objects=new Map();let exists=false;let created=0;
 const store={upload:async(k,b)=>{objects.set(k,b);return {};},getPublicUrl:k=>({data:{publicUrl:'https://storage.example/'+k}}),remove:async keys=>keys.forEach(k=>objects.delete(k))};
 const supabase={storage:{getBucket:async()=>exists?{data:{public:true}}:{error:{statusCode:404,message:'not found'}},createBucket:async()=>{exists=true;created++;return {};},from:()=>store}};
 try {
  const files={mainImage:[await file(dir,'main')],galleryImages:[await file(dir,'gallery')],productVideo:[await file(dir,'video','video/mp4')]};
  const res=response();await handler(supabase)({files},res);
  assert.equal(res.body.success,true);assert.equal(objects.size,3);assert.equal(res.body.galleryImages.length,1);
  for(const f of Object.values(files).flat()) await assert.rejects(fs.access(f.path));
  assert.ok(res.body.mainImage.startsWith('https://storage.example/'));
  const res2=response();await handler(supabase)({files:{mainImage:[await file(dir,'next')]}},res2);
  assert.equal(res2.body.success,true);assert.equal(objects.size,4);assert.equal(created,1);
 } finally {await fs.rm(dir,{recursive:true,force:true});}
});
test('partial upload failure rolls back and does not return temporary URLs',async()=>{
 const dir=await fs.mkdtemp(path.join(os.tmpdir(),'spandan-media-'));let count=0;let removed=[];
 const store={upload:async()=>++count===2?{error:new Error('storage unavailable')}:{},getPublicUrl:k=>({data:{publicUrl:'https://storage.example/'+k}}),remove:async keys=>{removed=keys;return {};}};
 try {
  const files={mainImage:[await file(dir,'main')],galleryImages:[await file(dir,'gallery')]};const res=response();
  await handler({storage:{getBucket:async()=>({data:{public:true}}),from:()=>store}})({files},res);
  assert.equal(res.code,503);assert.equal(res.body.success,false);assert.equal(res.body.mainImage,undefined);assert.equal(removed.length,1);
  for(const f of Object.values(files).flat()) await assert.rejects(fs.access(f.path));
 }finally{await fs.rm(dir,{recursive:true,force:true});}
});
test('missing storage fails explicitly and cleans staged files',async()=>{
 const dir=await fs.mkdtemp(path.join(os.tmpdir(),'spandan-media-'));
 try {const main=await file(dir,'main');const res=response();await handler(null)({files:{mainImage:[main]}},res);assert.equal(res.code,503);await assert.rejects(fs.access(main.path));}
 finally{await fs.rm(dir,{recursive:true,force:true});}
});
