const App={year:null,meetings:[],yearSessions:[],meeting:null,sessions:[],session:null,drivers:[],lapMemo:{},details:null,page:'overview',pages:{}};

App.run=async fn=>{
document.body.classList.add('busy');
try{await fn()}catch(e){notify(e&&e.message?e.message:'Unexpected error.')}
finally{document.body.classList.remove('busy')}
};

App.getLaps=async dn=>{
const k=App.session.session_key+':'+dn;
if(!App.lapMemo[k])App.lapMemo[k]=await Api.laps({session_key:App.session.session_key,driver_number:dn});
return App.lapMemo[k];
};

App.renderPage=()=>{const f=App.pages[App.page];if(f)f()};

App.loadYear=async()=>{
App.year=+$('#sel-year').value;
Store.setPref('year',App.year);
const meetings=await Api.meetings({year:App.year});
const sessions=await Api.sessions({year:App.year});
const by=(a,b)=>Date.parse(a.date_start)-Date.parse(b.date_start);
App.meetings=meetings.sort(by);
App.yearSessions=sessions.sort(by);
$('#sel-meeting').innerHTML=App.meetings.map(m=>'<option value="'+m.meeting_key+'">'+esc(m.meeting_name)+'</option>').join('');
if(!App.meetings.length){
App.meeting=null;App.sessions=[];App.session=null;App.drivers=[];App.details=null;
$('#sel-session').innerHTML='';
notify('OpenF1 returned no meetings for '+App.year+'.');
App.renderPage();
return;
}
const saved=Store.pref('meeting',null);
const started=App.meetings.filter(m=>Date.parse(m.date_start)<=Date.now());
const pick=App.meetings.find(m=>m.meeting_key===saved)||started[started.length-1]||App.meetings[0];
await App.chooseMeeting(pick.meeting_key);
};

App.chooseMeeting=async key=>{
App.meeting=App.meetings.find(m=>String(m.meeting_key)===String(key));
$('#sel-meeting').value=App.meeting.meeting_key;
Store.setPref('meeting',App.meeting.meeting_key);
App.sessions=App.yearSessions.filter(s=>s.meeting_key===App.meeting.meeting_key);
$('#sel-session').innerHTML=App.sessions.map(s=>'<option value="'+s.session_key+'">'+esc(s.session_name)+'</option>').join('');
if(!App.sessions.length){App.session=null;App.drivers=[];App.details=null;App.renderPage();return}
const past=App.sessions.filter(s=>Date.parse(s.date_start)<=Date.now());
const pool=past.length?past:App.sessions;
const name=Store.pref('sessionName','Race');
const pick=pool.find(s=>s.session_name===name)||pool.find(s=>s.session_name==='Race')||pool[pool.length-1];
await App.chooseSession(pick.session_key);
};

App.chooseSession=async key=>{
App.session=App.sessions.find(s=>String(s.session_key)===String(key));
$('#sel-session').value=App.session.session_key;
Store.setPref('sessionName',App.session.session_name);
App.details=null;
App.lapMemo={};
const ds=await Api.drivers({session_key:App.session.session_key});
App.drivers=ds.sort((a,b)=>a.driver_number-b.driver_number);
App.renderPage();
};

const Overview=(()=>{
const MONTHS=['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
const PAL=['#FF8000','#3399FF','#00D68F','#FF4757','#B388FF','#F5C542','#5EEAD4','#8995A5'];
const ago=t=>{const m=Math.round((Date.now()-t)/60000);return m<1?'just now':m<60?m+' min ago':m<1440?Math.round(m/60)+' h ago':Math.round(m/1440)+' d ago'};
function activity(){
const l=Store.logs();
const el=$('#ov-activity');
if(!l.length){setEmpty(el,'No activity yet. Load session data or run a telemetry analysis.');return}
el.innerHTML=l.map(x=>'<div class="row"><b>'+esc(x.text)+'</b><span></span><em>'+ago(x.t)+'</em></div>').join('');
}
function hero(){
const m=App.meeting;
const logo='<img src="assets/icons/logo-mark.svg" alt="">';
$('#ov-hero').innerHTML=m
?'<div><span class="muted">Season '+App.year+'</span><h2>'+Flags.html(m.country_name)+esc(m.meeting_name)+'</h2><p class="muted">'+esc(m.circuit_short_name||m.location||'')+', '+esc(m.country_name||'')+', '+fmtDate(m.date_start)+(App.session?', '+esc(App.session.session_name):'')+'</p></div>'+logo
:'<div><h2>Apex Telemetry</h2><p class="muted">Choose a season to load Grands Prix from OpenF1.</p></div>'+logo;
}
function render(){
const st=$('#ov-stats');
activity();
hero();
if(!App.meetings.length){
setEmpty(st,'No meetings available for this season.');
Charts.clear('ov-chart');Charts.clear('ov-types');
$('#ov-meetings').innerHTML='';
return;
}
const uniq=k=>new Set(App.meetings.map(m=>m[k]).filter(Boolean)).size;
const cards=[['Grands Prix',App.meetings.length],['Sessions',App.yearSessions.length],['Countries',uniq('country_name')],['Circuits',uniq('circuit_short_name')],['Drivers in selected session',App.drivers.length||NA]];
st.innerHTML=cards.map(c=>'<div class="stat"><span>'+c[0]+'</span><b>'+c[1]+'</b></div>').join('');
const months=new Array(12).fill(0);
App.yearSessions.forEach(s=>{const d=new Date(s.date_start);if(!isNaN(d))months[d.getUTCMonth()]++});
Charts.draw('ov-chart',{type:'bar',data:{labels:MONTHS,datasets:[{label:'Sessions',data:months,backgroundColor:'#FF8000',borderRadius:2}]},options:{responsive:true,maintainAspectRatio:false,plugins:{legend:{display:false}},scales:{y:{beginAtZero:true,ticks:{precision:0},grid:{color:'rgba(38,50,65,.6)'}},x:{grid:{display:false}}}}});
const types={};
App.yearSessions.forEach(s=>{types[s.session_name]=(types[s.session_name]||0)+1});
Charts.draw('ov-types',{type:'doughnut',data:{labels:Object.keys(types),datasets:[{data:Object.values(types),backgroundColor:PAL,borderColor:'#151C26',borderWidth:2}]},options:{responsive:true,maintainAspectRatio:false,cutout:'62%',plugins:{legend:{position:'right'}}}});
const list=$('#ov-meetings');
list.innerHTML=App.meetings.map(m=>'<button class="row'+(App.meeting&&m.meeting_key===App.meeting.meeting_key?' on':'')+'" data-k="'+m.meeting_key+'"><b>'+Flags.html(m.country_name)+esc(m.meeting_name)+'</b><span>'+esc(m.country_name)+'</span><em>'+fmtDate(m.date_start)+'</em></button>').join('');
$$('#ov-meetings .row').forEach(b=>b.onclick=()=>App.run(async()=>{await App.chooseMeeting(b.dataset.k);Nav.show('sessions')}));
}
return{render};
})();

const Sessions=(()=>{
let sortKey='pos',dir=1;
const COLS=[['pos','Pos'],['number','No.'],['driver','Driver'],['team','Team'],['laps','Laps'],['best','Best lap'],['pits','Pit stops'],['tyres','Tyres']];
function rows(){
const d=App.details;
return App.drivers.map(x=>{
const n=x.driver_number;
const laps=d?d.laps.filter(l=>l.driver_number===n):[];
const b=bestLap(laps);
const pit=d?d.pit.filter(p=>p.driver_number===n).length:null;
const ty=d?d.stints.filter(s=>s.driver_number===n).sort((a,c)=>a.stint_number-c.stint_number).map(s=>s.compound?s.compound[0]:'?').join(''):null;
return{d:x,pos:d&&d.pos[n]!=null?d.pos[n]:null,number:n,driver:x.full_name||'',team:x.team_name||'',laps:d?laps.filter(validLap).length:null,best:b?b.lap_duration:null,pits:pit,tyres:ty};
});
}
function teams(){
const sel=$('#ss-team');
const cur=sel.value;
const t=[...new Set(App.drivers.map(d=>d.team_name).filter(Boolean))].sort();
sel.innerHTML='<option value="">All teams</option>'+t.map(x=>'<option>'+esc(x)+'</option>').join('');
sel.value=t.includes(cur)?cur:'';
}
const TY={S:'soft',M:'medium',H:'hard',I:'intermediate',W:'wet'};
const tyreHtml=(v,loaded)=>v==null?(loaded?NA:'-'):v===''?NA:[...v].map(c=>TY[c]?'<img class="tyre" src="assets/icons/tyre-'+TY[c]+'.svg" alt="'+TY[c]+'" title="'+TY[c]+'">':'<span class="muted" title="Unknown compound">?</span>').join('');
function table(){
const box=$('#ss-table');
const q=$('#ss-filter').value.trim().toLowerCase();
const tm=$('#ss-team').value;
let r=rows().filter(x=>(!tm||x.team===tm)&&(!q||(x.driver+' '+x.team+' '+(x.d.name_acronym||'')).toLowerCase().includes(q)));
if(!r.length){setEmpty(box,App.drivers.length?'No drivers match these filters.':'No driver data is available for this session.');return}
r.sort((a,b)=>{
const x=a[sortKey],y=b[sortKey];
if(x==null&&y==null)return a.number-b.number;
if(x==null)return 1;
if(y==null)return-1;
return(typeof x==='string'?x.localeCompare(y):x-y)*dir;
});
const loaded=!!App.details;
const cell=(v,f)=>v==null?(loaded?NA:'-'):f?f(v):v;
box.innerHTML='<table><thead><tr>'+COLS.map(c=>'<th data-k="'+c[0]+'"'+(c[0]===sortKey?' class="sorted"':'')+'>'+c[1]+(c[0]===sortKey?(dir>0?' ▲':' ▼'):'')+'</th>').join('')+'</tr></thead><tbody>'
+r.map(x=>'<tr><td>'+cell(x.pos)+'</td><td>'+x.number+'</td><td><span class="sw" style="background:'+teamColor(x.d)+'"></span>'+esc(x.driver||NA)+'</td><td>'+esc(x.team||NA)+'</td><td>'+cell(x.laps)+'</td><td>'+cell(x.best,fmtLap)+'</td><td>'+cell(x.pits)+'</td><td>'+tyreHtml(x.tyres,loaded)+'</td></tr>').join('')
+'</tbody></table>';
$$('#ss-table th').forEach(h=>h.onclick=()=>{const k=h.dataset.k;if(sortKey===k)dir=-dir;else{sortKey=k;dir=1}table()});
}
function side(){
const w=$('#ss-weather'),rc=$('#ss-rc');
const d=App.details;
if(!d){setEmpty(w,'Press Load session data to see weather.');setEmpty(rc,'Press Load session data to see race control messages.');return}
const x=d.weather;
if(!x||!x.n)setEmpty(w,'Weather is '+NA.toLowerCase()+' for this session.');
else w.innerHTML=[['Air temperature',fmtNum(x.air,' °C',1)],['Track temperature',fmtNum(x.track,' °C',1)],['Humidity',fmtNum(x.hum,' %',0)],['Peak wind speed',fmtNum(x.wind,' m/s',1)],['Rainfall',x.rain?'Recorded':'None recorded']].map(r=>'<div class="kv"><span>'+r[0]+'</span><b>'+r[1]+'</b></div>').join('');
if(!d.rc.length)setEmpty(rc,'Race control messages are '+NA.toLowerCase()+' for this session.');
else rc.innerHTML=d.rc.slice().reverse().map(m=>'<div class="row"><b>'+esc(m.message)+'</b><span>'+esc(m.flag||'')+'</span><em>'+new Date(m.date).toLocaleTimeString('en-GB',{hour:'2-digit',minute:'2-digit'})+'</em></div>').join('');
}
async function load(){
if(!App.session)return;
setLoading($('#ss-table'));
const p={session_key:App.session.session_key};
const laps=await Api.laps(p);
const pos=await Api.position(p);
const pit=await Api.pit(p);
const stints=await Api.stints(p);
const weather=await Api.weather(p);
const rc=await Api.raceControl(p);
App.details={laps,pos,pit,stints,weather,rc};
if(sortKey==='pos'&&!Object.keys(pos).length){sortKey='number'}
table();side();
Store.log('Loaded '+App.meeting.meeting_name+' '+App.session.session_name);
}
function render(){
const s=App.session;
$('#ss-title').textContent=s?App.meeting.meeting_name+', '+s.session_name:'Race Sessions';
$('#ss-sub').textContent=s?(s.circuit_short_name||'')+' '+fmtDate(s.date_start)+', '+(s.country_name||''):'';
$('#ss-load').disabled=!s||!App.drivers.length;
teams();
if(!s){setEmpty($('#ss-table'),App.meetings.length?'No sessions found for this Grand Prix.':'No data loaded for this season.');side();return}
table();side();
}
function init(){
$('#ss-load').onclick=()=>App.run(load);
$('#ss-filter').oninput=table;
$('#ss-team').onchange=table;
}
return{init,render};
})();

App.pages={overview:Overview.render,sessions:Sessions.render,telemetry:Telemetry.render,drivers:Drivers.render,circuits:Circuits.render,about:()=>{}};

App.init=()=>{
Charts.setup();
const now=new Date().getFullYear();
const ys=[];
for(let y=now;y>=2023;y--)ys.push(y);
$('#sel-year').innerHTML=ys.map(y=>'<option>'+y+'</option>').join('');
const saved=Store.pref('year',ys[0]);
$('#sel-year').value=String(ys.includes(saved)?saved:ys[0]);
$('#sel-year').onchange=()=>App.run(App.loadYear);
$('#sel-meeting').onchange=e=>App.run(()=>App.chooseMeeting(e.target.value));
$('#sel-session').onchange=e=>App.run(()=>App.chooseSession(e.target.value));
$('#refresh').onclick=()=>{Store.clearCache();$('#banner').hidden=true;App.run(App.loadYear)};
$('#banner').onclick=()=>{$('#banner').hidden=true};
Telemetry.init();Drivers.init();Sessions.init();
Nav.init();
App.run(App.loadYear);
};

App.init();
