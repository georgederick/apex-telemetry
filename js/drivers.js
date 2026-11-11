const Drivers=(()=>{
let sig=null;
const min=(laps,k)=>{const v=laps.map(l=>l[k]).filter(n=>isNum(n)&&n>0);return v.length?Math.min(...v):null};
async function stats(dn){
const laps=await App.getLaps(dn);
const sp=laps.flatMap(l=>[l.i1_speed,l.i2_speed,l.st_speed]).filter(n=>isNum(n)&&n>0);
const b=bestLap(laps);
return{best:b?b.lap_duration:null,s1:min(laps,'duration_sector_1'),s2:min(laps,'duration_sector_2'),s3:min(laps,'duration_sector_3'),vmax:sp.length?Math.max(...sp):null,n:laps.filter(validLap).length};
}
const ROWS=[
{l:'Best lap',k:'best',f:fmtLap,low:true,u:'s'},
{l:'Best sector 1',k:'s1',f:fmtSec,low:true,u:'s'},
{l:'Best sector 2',k:'s2',f:fmtSec,low:true,u:'s'},
{l:'Best sector 3',k:'s3',f:fmtSec,low:true,u:'s'},
{l:'Top recorded speed',k:'vmax',f:v=>fmtNum(v,' km/h'),low:false,u:'km/h'},
{l:'Timed laps',k:'n',f:v=>String(v),low:null}
];
function table(a,b,sa,sb){
const head=d=>'<th><span class="sw" style="background:'+teamColor(d)+'"></span>'+esc(d.name_acronym||d.driver_number)+'</th>';
const meta=(l,fa,fb)=>'<tr><td>'+l+'</td><td>'+fa+'</td><td>'+fb+'</td><td></td></tr>';
const body=ROWS.map(r=>{
const x=sa[r.k],y=sb[r.k];
let diff='',ca='',cb='';
if(isNum(x)&&isNum(y)&&r.low!==null){
const d=x-y;
diff=(d>0?'+':'')+d.toFixed(r.u==='s'?3:0)+' '+r.u;
if(d!==0){const aw=r.low?d<0:d>0;if(aw)ca='win';else cb='win'}
}else if(r.low!==null)diff=NA;
return'<tr><td>'+r.l+'</td><td class="'+ca+'">'+(isNum(x)?r.f(x):NA)+'</td><td class="'+cb+'">'+(isNum(y)?r.f(y):NA)+'</td><td>'+diff+'</td></tr>';
}).join('');
return'<table><thead><tr><th>Metric</th>'+head(a)+head(b)+'<th>A minus B</th></tr></thead><tbody>'
+meta('Driver',esc(a.full_name||NA),esc(b.full_name||NA))
+meta('Number','#'+a.driver_number,'#'+b.driver_number)
+meta('Team',esc(a.team_name||NA),esc(b.team_name||NA))
+body+'</tbody></table>';
}
function radar(a,b,sa,sb){
const keys=['best','s1','s2','s3','vmax'];
if(!keys.every(k=>isNum(sa[k])&&isNum(sb[k]))){Charts.clear('dc-radar');$('#dc-cv').hidden=true;setEmpty($('#dc-msg'),'The radar needs lap, sector and speed data for both drivers, and some of it is unavailable.');return}
const sc=(k,v,o)=>k==='vmax'?v/Math.max(v,o)*100:Math.min(v,o)/v*100;
const ra=keys.map(k=>sc(k,sa[k],sb[k])),rb=keys.map(k=>sc(k,sb[k],sa[k]));
const raw=s=>[fmtLap(s.best),fmtSec(s.s1),fmtSec(s.s2),fmtSec(s.s3),s.vmax+' km/h'];
const ca=teamColor(a),cb=teamColor(b)===ca?'#F1F5F9':teamColor(b);
const mk=(d,r,c,s)=>({label:d.name_acronym||d.driver_number,data:r,raw:raw(s),borderColor:c,backgroundColor:c+'33',pointBackgroundColor:c,borderWidth:2});
$('#dc-msg').innerHTML='';
$('#dc-cv').hidden=false;
Charts.draw('dc-radar',{type:'radar',data:{labels:['Best lap','Sector 1','Sector 2','Sector 3','Top speed'],datasets:[mk(a,ra,ca,sa),mk(b,rb,cb,sb)]},options:{
responsive:true,maintainAspectRatio:false,
scales:{r:{suggestedMin:Math.floor(Math.min(...ra,...rb)-3),suggestedMax:100,angleLines:{color:'#263241'},grid:{color:'#263241'},pointLabels:{color:'#F1F5F9'},ticks:{display:false}}},
plugins:{tooltip:{callbacks:{label:i=>i.dataset.label+': '+i.dataset.raw[i.dataIndex]}}}
}});
}
async function compare(){
if(!App.session)return;
const a=App.drivers.find(d=>d.driver_number===+$('#dc-a').value);
const b=App.drivers.find(d=>d.driver_number===+$('#dc-b').value);
if(!a||!b)return;
setLoading($('#dc-table'));
const sa=await stats(a.driver_number),sb=await stats(b.driver_number);
$('#dc-table').innerHTML=table(a,b,sa,sb);
radar(a,b,sa,sb);
Store.log('Comparison: '+(a.name_acronym||a.driver_number)+' vs '+(b.name_acronym||b.driver_number)+', '+App.meeting.meeting_name+' '+App.session.session_name);
}
function render(){
if(!App.session||!App.drivers.length){
sig=null;
$('#dc-a').innerHTML='';$('#dc-b').innerHTML='';
setEmpty($('#dc-table'),App.meetings.length?'No driver data is available for this session.':'No data loaded for this season.');
Charts.clear('dc-radar');$('#dc-cv').hidden=true;$('#dc-msg').innerHTML='';
return;
}
if(sig===App.session.session_key)return;
sig=App.session.session_key;
const o=App.drivers.map(d=>'<option value="'+d.driver_number+'">'+esc(driverLabel(d))+'</option>').join('');
$('#dc-a').innerHTML=o;$('#dc-b').innerHTML=o;
if(App.drivers[1])$('#dc-b').value=App.drivers[1].driver_number;
Charts.clear('dc-radar');$('#dc-cv').hidden=true;
setEmpty($('#dc-table'),'Choose two drivers and press Compare.');
setEmpty($('#dc-msg'),'The radar appears after a comparison.');
}
function init(){$('#dc-go').onclick=()=>App.run(compare)}
return{init,render};
})();
