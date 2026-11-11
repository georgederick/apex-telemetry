const Circuits=(()=>{
let sel=null;
const tracks={};
function svg(pts){
const xs=pts.map(p=>p.x),ys=pts.map(p=>p.y);
const x0=Math.min(...xs),x1=Math.max(...xs),y0=Math.min(...ys),y1=Math.max(...ys);
const W=400,H=300,P=26;
const k=Math.min((W-2*P)/((x1-x0)||1),(H-2*P)/((y1-y0)||1));
const ox=(W-(x1-x0)*k)/2,oy=(H-(y1-y0)*k)/2;
const px=p=>(ox+(p.x-x0)*k).toFixed(1),py=p=>(H-oy-(p.y-y0)*k).toFixed(1);
const d=pts.map((p,i)=>(i?'L':'M')+px(p)+' '+py(p)).join('')+'Z';
return'<svg viewBox="0 0 '+W+' '+H+'" role="img" aria-label="Track layout built from OpenF1 location data"><path class="t-out" d="'+d+'"/><path class="t-in" pathLength="1" d="'+d+'"/><circle class="t-s" cx="'+px(pts[0])+'" cy="'+py(pts[0])+'" r="5"/></svg>';
}
async function build(m){
const box=$('#ci-map');
if(Date.parse(m.date_start)>Date.now()){setEmpty(box,'This Grand Prix has not happened yet, so no location data exists.');return}
setLoading(box);
const ss=App.yearSessions.filter(s=>s.meeting_key===m.meeting_key);
const s=ss.find(x=>x.session_name==='Qualifying')||ss.find(x=>x.session_name==='Race')||ss[0];
if(!s){setEmpty(box,'No sessions found for this Grand Prix.');return}
const ds=await Api.drivers({session_key:s.session_key});
if(!ds.length){setEmpty(box,'Track layout is '+NA.toLowerCase()+' for this Grand Prix.');return}
const dn=ds[0].driver_number;
const lap=bestLap(await Api.laps({session_key:s.session_key,driver_number:dn}));
if(!lap){setEmpty(box,'Track layout is '+NA.toLowerCase()+' for this Grand Prix.');return}
const st=Date.parse(lap.date_start);
const pts=await Api.location({session_key:s.session_key,driver_number:dn,'date>=':new Date(st).toISOString(),'date<=':new Date(st+lap.lap_duration*1000).toISOString()});
if(pts.length<20){setEmpty(box,'Location data for this lap is '+NA.toLowerCase()+' in OpenF1.');return}
tracks[m.meeting_key]={html:svg(pts),src:'Built from '+pts.length+' location samples of '+(ds[0].name_acronym||'#'+dn)+', lap '+lap.lap_number+', '+s.session_name+'.'};
show(m);
}
function show(m){
const t=tracks[m.meeting_key];
$('#ci-map').innerHTML=t?t.html+'<p class="muted note">'+esc(t.src)+' Coordinates are OpenF1 telemetry units, not geographic positions.</p>':'<div class="empty">Press Draw track to build the layout from OpenF1 location data.</div>';
}
function select(k){
sel=k;
const m=App.meetings.find(x=>x.meeting_key===k);
if(!m)return;
$$('#ci-list .row').forEach(b=>b.classList.toggle('on',+b.dataset.k===k));
const kv=(a,b)=>'<div class="kv"><span>'+a+'</span><b>'+esc(b||NA)+'</b></div>';
$('#ci-info').innerHTML='<h2>'+Flags.html(m.country_name)+esc(m.circuit_short_name||m.location)+'</h2>'+kv('Grand Prix',m.meeting_name)+kv('Official name',m.meeting_official_name)+kv('Location',m.location)+kv('Country',m.country_name)+kv('Circuit key',m.circuit_key)+kv('Date',fmtDate(m.date_start))
+'<div class="actions"><button class="btn" id="ci-draw">Draw track</button><button class="btn ghost" id="ci-open">Open sessions</button></div>';
$('#ci-draw').onclick=()=>App.run(()=>build(m));
$('#ci-open').onclick=()=>App.run(async()=>{await App.chooseMeeting(m.meeting_key);Nav.show('sessions')});
show(m);
}
function render(){
$('#ci-h').textContent='Circuits, '+(App.year||'');
const list=$('#ci-list');
if(!App.meetings.length){setEmpty(list,'No meetings available for this season.');$('#ci-info').innerHTML='';$('#ci-map').innerHTML='';return}
list.innerHTML=App.meetings.map(m=>'<button class="row" data-k="'+m.meeting_key+'"><b>'+Flags.html(m.country_name)+esc(m.circuit_short_name||m.location)+'</b><span>'+esc(m.country_name)+'</span><em>'+fmtDate(m.date_start)+'</em></button>').join('');
$$('#ci-list .row').forEach(b=>b.onclick=()=>select(+b.dataset.k));
const keep=App.meetings.some(m=>m.meeting_key===sel)?sel:(App.meeting?App.meeting.meeting_key:App.meetings[0].meeting_key);
select(keep);
}
return{render};
})();
