const Charts=(()=>{
const inst={};
const setup=()=>{
if(typeof Chart==='undefined'){notify('The chart library could not be loaded. Check your connection and reload the page.');return}
const d=Chart.defaults;
d.color='#8995A5';
d.borderColor='#263241';
d.font.family="Inter,'Segoe UI',sans-serif";
d.plugins.legend.labels.usePointStyle=true;
d.plugins.tooltip.backgroundColor='#0b0f15';
d.plugins.tooltip.borderColor='#263241';
d.plugins.tooltip.borderWidth=1;
d.plugins.tooltip.padding=10;
};
const clear=id=>{if(inst[id]){inst[id].destroy();delete inst[id]}};
const draw=(id,cfg)=>{
clear(id);
const el=document.getElementById(id);
if(!el||typeof Chart==='undefined')return null;
inst[id]=new Chart(el,cfg);
return inst[id];
};
return{setup,draw,clear};
})();
