const Telemetry=(()=>{
const M={
speed:{k:'speed',l:'Speed (km/h)'},
throttle:{k:'throttle',l:'Throttle (%)'},
brake:{k:'brake',l:'Brake (%)',st:true},
rpm:{k:'rpm',l:'Engine RPM'},
gear:{k:'n_gear',l:'Gear',st:true},
delta:{l:'Cumulative time delta (s)'}
};
let metric='speed';
let data=null;
let sig=null;
const options=ds=>ds.map(d=>'<option value="'+d.driver_number+'">'+esc(driverLabel(d))+'</option>').join('');
const lapOptions=laps=>{
const v=laps.filter(validLap);
const b=bestLap(v);
if(!v.length)return'<option value="">No timed laps</option>';
return'<option value="best">Fastest, '+fmtLap(b.lap_duration)+' (lap '+b.lap_number+')</option>'+v.map(l=>'<option value="'+l.lap_number+'">Lap '+l.lap_number+', '+fmtLap(l.lap_duration)+'</option>').join('');
};
async function fillLaps(side){
const dn=+$('#tl-'+side).value;
if(!dn){$('#tl-l'+side).innerHTML='';return}
$('#tl-l'+side).innerHTML=lapOptions(await App.getLaps(dn));
}
async function pickLap(side,dn){
const laps=(await App.getLaps(dn)).filter(validLap);
const v=$('#tl-l'+side).value;
return!v||v==='best'?bestLap(laps):laps.find(l=>String(l.lap_number)===v);
}
async function fetchCar(dn,lap){
const s=Date.parse(lap.date_start);
const e=s+lap.lap_duration*1000;
const rows=await Api.carData({session_key:App.session.session_key,driver_number:dn,'date>=':new Date(s).toISOString(),'date<=':new Date(e).toISOString()});
return rows.filter(r=>r.t>=s&&r.t<=e).map(r=>Object.assign({},r,{x:(r.t-s)/1000}));
}
function colors(){
const a=teamColor(data.a.d);
const b=teamColor(data.b.d);
return[a,b===a?'#F1F5F9':b];
}
const cum=car=>{
const d=[0];
for(let i=1;i<car.length;i++)d.push(d[i-1]+((car[i].speed||0)+(car[i-1].speed||0))/7.2*(car[i].x-car[i-1].x));
return d;
};
const at=(xs,ys,v)=>{
let lo=0,hi=xs.length-1;
if(v<=xs[0])return ys[0];
if(v>=xs[hi])return ys[hi];
while(hi-lo>1){const m=(lo+hi)>>1;if(xs[m]>v)hi=m;else lo=m}
return ys[lo]+(ys[hi]-ys[lo])*((v-xs[lo])/((xs[hi]-xs[lo])||1));
};
function delta(){
const A=data.a.car,B=data.b.car;
const da=cum(A),db=cum(B);
const ta=A.map(r=>r.x),tb=B.map(r=>r.x);
const L=Math.min(da[da.length-1],db[db.length-1]);
const out=[];
for(let m=0;m<=L;m+=5)out.push({x:m,y:at(db,tb,m)-at(da,ta,m)});
return out;
}
function drawChart(){
if(!data)return;
const m=M[metric];
const c=colors();
let ds,xt;
if(metric==='delta'){
ds=[{label:data.b.acr+' relative to '+data.a.acr,data:delta(),borderColor:'#FF8000',backgroundColor:'rgba(255,128,0,.14)',fill:'origin',borderWidth:2,pointRadius:0,pointHoverRadius:4}];
xt='Estimated distance (m)';
$('#tl-note').textContent='Positive values mean Driver B is behind Driver A at that point. Distance is estimated by integrating speed, so treat it as an approximation.';
}else{
ds=[data.a,data.b].map((s,i)=>({label:s.acr+', lap '+s.lap.lap_number,data:s.car.filter(r=>r[m.k]!=null).map(r=>({x:r.x,y:r[m.k]})),borderColor:c[i],backgroundColor:c[i],borderWidth:2,pointRadius:0,pointHoverRadius:4,stepped:m.st?'before':false,tension:0}));
xt='Time since lap start (s)';
$('#tl-note').textContent=metric==='brake'?'OpenF1 reports brake as pressed (100) or not pressed (0).':'';
}
$('#tl-cv').hidden=false;
$('#tl-msg').innerHTML='';
Charts.draw('tl-chart',{type:'line',data:{datasets:ds},options:{
responsive:true,maintainAspectRatio:false,animation:{duration:450},
interaction:{mode:'nearest',axis:'x',intersect:false},
scales:{x:{type:'linear',title:{display:true,text:xt},grid:{color:'rgba(38,50,65,.6)'}},y:{title:{display:true,text:m.l},grid:{color:'rgba(38,50,65,.6)'},ticks:metric==='gear'?{stepSize:1}:{}}},
plugins:{tooltip:{callbacks:{title:i=>(metric==='delta'?i[0].parsed.x.toFixed(0)+' m':i[0].parsed.x.toFixed(2)+' s'),label:i=>i.dataset.label+': '+i.parsed.y.toFixed(metric==='delta'?3:0)}}}
}});
}
function summary(){
const el=$('#tl-sum');
el.innerHTML=[data.a,data.b].map((s,i)=>{
const sp=s.car.map(r=>r.speed).filter(isNum);
const n=s.car.length;
const th=s.car.filter(r=>r.throttle>=99).length/n*100;
const br=s.car.filter(r=>r.brake>0).length/n*100;
const kv=(k,v)=>'<div class="kv"><span>'+k+'</span><b>'+v+'</b></div>';
return'<div class="card"><div class="drv"><span class="sw" style="background:'+colors()[i]+'"></span><strong>'+esc(s.d.full_name||s.acr)+'</strong><span class="muted">'+esc(s.d.team_name||NA)+'</span></div>'
+kv('Lap',s.lap.lap_number)+kv('Lap time',fmtLap(s.lap.lap_duration))
+kv('Sector 1',fmtSec(s.lap.duration_sector_1))+kv('Sector 2',fmtSec(s.lap.duration_sector_2))+kv('Sector 3',fmtSec(s.lap.duration_sector_3))
+kv('Top speed in lap',sp.length?Math.max(...sp)+' km/h':NA)+kv('Average speed',sp.length?(sp.reduce((a,b)=>a+b,0)/sp.length).toFixed(1)+' km/h':NA)
+kv('Time at full throttle',th.toFixed(0)+'%')+kv('Time on brakes',br.toFixed(0)+'%')+kv('Telemetry samples',n)+'</div>';
}).join('');
}
async function analyze(){
if(!App.session)return;
const a=+$('#tl-a').value,b=+$('#tl-b').value;
if(!a||!b){notify('Select both drivers first.');return}
setLoading($('#tl-msg'));
$('#tl-cv').hidden=true;
const la=await pickLap('a',a),lb=await pickLap('b',b);
if(!la||!lb){setEmpty($('#tl-msg'),'No timed lap is available for one of the selected drivers.');return}
const ca=await fetchCar(a,la),cb=await fetchCar(b,lb);
if(ca.length<5||cb.length<5){data=null;$('#tl-sum').innerHTML='';Charts.clear('tl-chart');setEmpty($('#tl-msg'),'Telemetry for these laps is '+NA.toLowerCase()+' in OpenF1.');return}
const da=App.drivers.find(d=>d.driver_number===a),db=App.drivers.find(d=>d.driver_number===b);
data={a:{d:da,lap:la,car:ca,acr:da.name_acronym||'#'+a},b:{d:db,lap:lb,car:cb,acr:db.name_acronym||'#'+b}};
drawChart();
summary();
Store.log('Telemetry: '+data.a.acr+' vs '+data.b.acr+', '+App.meeting.meeting_name+' '+App.session.session_name);
}
function render(){
if(!App.session||!App.drivers.length){
sig=null;data=null;
['#tl-a','#tl-b','#tl-la','#tl-lb'].forEach(s=>{$(s).innerHTML=''});
$('#tl-cv').hidden=true;$('#tl-sum').innerHTML='';$('#tl-note').textContent='';
Charts.clear('tl-chart');
setEmpty($('#tl-msg'),App.meetings.length?'No driver data is available for this session.':'No data loaded for this season.');
return;
}
if(sig===App.session.session_key)return;
sig=App.session.session_key;
data=null;
Charts.clear('tl-chart');
$('#tl-cv').hidden=true;$('#tl-sum').innerHTML='';$('#tl-note').textContent='';
setEmpty($('#tl-msg'),'Choose two drivers and their laps, then press Analyze.');
$('#tl-a').innerHTML=options(App.drivers);
$('#tl-b').innerHTML=options(App.drivers);
if(App.drivers[1])$('#tl-b').value=App.drivers[1].driver_number;
App.run(async()=>{await fillLaps('a');await fillLaps('b')});
}
function init(){
$('#tl-a').onchange=()=>App.run(()=>fillLaps('a'));
$('#tl-b').onchange=()=>App.run(()=>fillLaps('b'));
$('#tl-go').onclick=()=>App.run(analyze);
$$('#tl-tabs button').forEach(b=>b.onclick=()=>{
metric=b.dataset.m;
$$('#tl-tabs button').forEach(x=>x.classList.toggle('on',x===b));
drawChart();
});
}
return{init,render};
})();
