const Store=(()=>{
const P='apex:';
const read=k=>{try{return JSON.parse(localStorage.getItem(P+k))}catch(e){return null}};
const write=(k,v)=>{try{localStorage.setItem(P+k,JSON.stringify(v));return true}catch(e){return false}};
const cacheKeys=()=>{const o=[];try{for(let i=0;i<localStorage.length;i++){const k=localStorage.key(i);if(k&&k.startsWith(P+'c:'))o.push(k)}}catch(e){}return o};
return{
pref:(k,d)=>{const v=read('pref:'+k);return v===null?d:v},
setPref:(k,v)=>write('pref:'+k,v),
cacheGet(k,ttl){const e=read('c:'+k);return e&&Date.now()-e.t<ttl?e.d:null},
cacheSet(k,d){const e={t:Date.now(),d};if(!write('c:'+k,e)){this.clearCache();write('c:'+k,e)}},
clearCache(){cacheKeys().forEach(k=>{try{localStorage.removeItem(k)}catch(e){}})},
log(text){const l=read('log')||[];l.unshift({t:Date.now(),text});write('log',l.slice(0,8))},
logs:()=>read('log')||[]
};
})();
