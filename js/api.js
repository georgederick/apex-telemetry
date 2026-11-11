const Api=(()=>{
const BASE='https://api.openf1.org/v1/';
const DAY=864e5;
const sleep=ms=>new Promise(r=>setTimeout(r,ms));
let chain=Promise.resolve();
let last=0;
const pick=(o,ks)=>{const r={};ks.forEach(k=>{r[k]=o[k]});return r};
const buildUrl=(ep,p)=>BASE+ep+'?'+Object.entries(p).map(([k,v])=>/[<>]=?$/.test(k)?k+encodeURIComponent(v):k+'='+encodeURIComponent(v)).join('&');
const throttled=fn=>{
const run=chain.then(async()=>{
const wait=last+400-Date.now();
if(wait>0)await sleep(wait);
try{return await fn()}finally{last=Date.now()}
});
chain=run.catch(()=>{});
return run;
};
async function request(u){
for(let i=0;i<4;i++){
const res=await throttled(()=>fetch(u).catch(()=>null));
if(!res)throw new Error('Network error. Check your connection and try again.');
if(res.status===429){await sleep(2000*(i+1));continue}
if(res.status===404)return[];
if(!res.ok)throw new Error('OpenF1 returned status '+res.status+'. Try again in a moment.');
const j=await res.json().catch(()=>[]);
return Array.isArray(j)?j:[];
}
throw new Error('OpenF1 rate limit reached (HTTP 429). Wait a few seconds and press Refresh data.');
}
async function get(ep,p,o={}){
const u=buildUrl(ep,p);
const c=Store.cacheGet(u,o.ttl||DAY);
if(c!==null)return c;
let d=await request(u);
if(o.reduce)d=o.reduce(d);
Store.cacheSet(u,d);
return d;
}
const byDate=(a,b)=>a.date<b.date?-1:a.date>b.date?1:0;
const slimLaps=r=>r.map(l=>pick(l,['driver_number','lap_number','date_start','lap_duration','duration_sector_1','duration_sector_2','duration_sector_3','i1_speed','i2_speed','st_speed','is_pit_out_lap']));
const slimCar=r=>r.sort(byDate).map(c=>({t:Date.parse(c.date),speed:c.speed,throttle:c.throttle,brake:c.brake,rpm:c.rpm,n_gear:c.n_gear,drs:c.drs}));
const slimLoc=r=>{const v=r.sort(byDate).filter(p=>typeof p.x==='number'&&typeof p.y==='number'&&(p.x!==0||p.y!==0));const s=Math.max(1,Math.ceil(v.length/400));return v.filter((p,i)=>i%s===0).map(p=>({x:p.x,y:p.y}))};
const lastPos=r=>{const o={};r.sort(byDate).forEach(p=>{o[p.driver_number]=p.position});return o};
const avg=(r,k)=>{const v=r.map(x=>x[k]).filter(n=>typeof n==='number');return v.length?v.reduce((a,b)=>a+b,0)/v.length:null};
const sumWeather=r=>{
if(!r.length)return{n:0};
const w=r.map(x=>x.wind_speed).filter(n=>typeof n==='number');
return{n:r.length,air:avg(r,'air_temperature'),track:avg(r,'track_temperature'),hum:avg(r,'humidity'),wind:w.length?Math.max(...w):null,rain:r.some(x=>x.rainfall>0)};
};
const dedupe=r=>{const m={};r.forEach(d=>{m[d.driver_number]=d});return Object.values(m)};
return{
meetings:p=>get('meetings',p),
sessions:p=>get('sessions',p),
drivers:p=>get('drivers',p,{reduce:dedupe}),
laps:p=>get('laps',p,{reduce:slimLaps}),
carData:p=>get('car_data',p,{reduce:slimCar}),
location:p=>get('location',p,{reduce:slimLoc}),
position:p=>get('position',p,{reduce:lastPos}),
pit:p=>get('pit',p),
stints:p=>get('stints',p),
weather:p=>get('weather',p,{reduce:sumWeather}),
raceControl:p=>get('race_control',p,{reduce:r=>r.slice(-12).map(x=>pick(x,['date','message','flag']))})
};
})();
