const Nav=(()=>{
const titles={overview:'Overview',sessions:'Race Sessions',telemetry:'Telemetry Lab',drivers:'Driver Comparison',circuits:'Circuits',about:'About'};
function show(p){
if(!titles[p])p='overview';
App.page=p;
$$('.page').forEach(s=>s.classList.toggle('on',s.id==='page-'+p));
$$('#nav button').forEach(b=>b.classList.toggle('on',b.dataset.page===p));
$('#title').textContent=titles[p];
document.title=titles[p]+' | Apex Telemetry';
Store.setPref('page',p);
$('#side').classList.remove('open');
if(location.hash.slice(1)!==p)history.replaceState(null,'','#'+p);
App.renderPage();
window.scrollTo(0,0);
}
function init(){
$$('#nav button').forEach(b=>b.onclick=()=>show(b.dataset.page));
$('#burger').onclick=()=>$('#side').classList.toggle('open');
window.addEventListener('hashchange',()=>show(location.hash.slice(1)));
show(location.hash.slice(1)||Store.pref('page','overview'));
}
return{init,show};
})();
