const {test}=require('node:test');const assert=require('node:assert/strict');const vm=require('node:vm');const fs=require('node:fs');const path=require('node:path');
const source=fs.readFileSync(path.join(__dirname,'../js/main.js'),'utf8');
test('corrupted or malicious saved cart cannot crash storefront',()=>{
 const part=source.slice(source.indexOf('function readSavedCart()'),source.indexOf('let cart = readSavedCart()'));
 for(const raw of ['{broken','null','[]','42','{"__proto__":2,"1":-1,"2":1.5,"3":100}']){
  const c={localStorage:{getItem:()=>raw}};vm.createContext(c);vm.runInContext(part,c);assert.equal(JSON.stringify(vm.runInContext('readSavedCart()',c)),'{}');
 }
 const c={localStorage:{getItem:()=>'{"1":2}'}};vm.createContext(c);vm.runInContext(part,c);assert.equal(JSON.stringify(vm.runInContext('readSavedCart()',c)), '{"1":2}');
});
test('stock limit is shared across colours and quantities are integers',()=>{
 const part=source.slice(source.indexOf('function addToCart('),source.indexOf('// TOAST',source.indexOf('function addToCart(')));
 const c={products:[{id:1,stock:3,colors:['Red','Blue']}],cart:{},saveCart(){},toast(){},window:{location:{}},cartItems:()=>Object.entries(c.cart).map(([key,qty])=>({id:JSON.parse(key)[0],qty}))};vm.createContext(c);vm.runInContext(part,c);
 assert.equal(vm.runInContext("addToCart(1,2.8,'Red')",c),true);
 assert.equal(vm.runInContext("addToCart(1,2,'Blue')",c),true);
 assert.equal(vm.runInContext("addToCart(1,1,'Red')",c),false);
 assert.equal(Object.values(c.cart).reduce((a,b)=>a+b,0),3);
 assert.equal(vm.runInContext("addToCart(1,1,'Green')",c),false);
});
