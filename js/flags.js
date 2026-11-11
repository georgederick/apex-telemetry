const Flags=(()=>{
const rc=(x,y,w,h,f)=>'<rect x="'+x+'" y="'+y+'" width="'+w+'" height="'+h+'" fill="'+f+'"/>';
const g=(f,c)=>'<g fill="'+f+'">'+c+'</g>';
const circ=(x,y,r,f)=>'<circle cx="'+x+'" cy="'+y+'" r="'+r+'" fill="'+f+'"/>';
const star=(cx,cy,r,n,ratio)=>{
const p=[];
for(let i=0;i<n*2;i++){const a=(-90+i*180/n)*Math.PI/180,R=i%2?r*ratio:r;p.push((cx+R*Math.cos(a)).toFixed(2)+','+(cy+R*Math.sin(a)).toFixed(2))}
return'<polygon points="'+p.join(' ')+'"/>';
};
const h3=(a,b,c)=>rc(0,0,30,6.67,a)+rc(0,6.67,30,6.67,b)+rc(0,13.33,30,6.67,c);
const v3=(a,b,c)=>rc(0,0,10,20,a)+rc(10,0,10,20,b)+rc(20,0,10,20,c);
const zig=(n,bg,fg)=>{
const p=['0,0'];
for(let i=0;i<=n;i++){p.push((i%2?6:9)+','+(i*20/n).toFixed(2))}
p.push('0,20');
return rc(0,0,30,20,bg)+'<polygon points="'+p.join(' ')+'" fill="'+fg+'"/>';
};
const jack=(x,y,w,h)=>'<svg x="'+x+'" y="'+y+'" width="'+w+'" height="'+h+'" viewBox="0 0 60 30" preserveAspectRatio="none"><rect width="60" height="30" fill="#012169"/><path d="M0,0L60,30M60,0L0,30" stroke="#fff" stroke-width="6"/><path d="M0,0L60,30M60,0L0,30" stroke="#C8102E" stroke-width="2"/><path d="M30,0V30M0,15H60" stroke="#fff" stroke-width="10"/><path d="M30,0V30M0,15H60" stroke="#C8102E" stroke-width="6"/></svg>';
const usa=()=>{
let s='';
for(let i=0;i<13;i++)s+=rc(0,(i*20/13).toFixed(2),30,(20/13+.05).toFixed(2),i%2?'#fff':'#B22234');
s+=rc(0,0,12,10.8,'#3C3B6E');
let d='';
for(let r=0;r<4;r++)for(let c=0;c<5;c++)d+=circ(1.5+c*2.3,1.7+r*2.5,.5,'#fff');
return s+d;
};
const D={
brazil:()=>rc(0,0,30,20,'#009C3B')+'<polygon points="15,2 27,10 15,18 3,10" fill="#FFDF00"/>'+circ(15,10,4.2,'#002776'),
italy:()=>v3('#009246','#fff','#CE2B37'),
spain:()=>rc(0,0,30,5,'#AA151B')+rc(0,5,30,10,'#F1BF00')+rc(0,15,30,5,'#AA151B'),
monaco:()=>rc(0,0,30,10,'#CE1126')+rc(0,10,30,10,'#fff'),
netherlands:()=>h3('#AE1C28','#fff','#21468B'),
austria:()=>h3('#ED2939','#fff','#ED2939'),
hungary:()=>h3('#CE2939','#fff','#477050'),
belgium:()=>v3('#000','#FAE042','#ED2939'),
japan:()=>rc(0,0,30,20,'#fff')+circ(15,10,6,'#BC002D'),
singapore:()=>rc(0,0,30,10,'#EF3340')+rc(0,10,30,10,'#fff')+circ(7,5,3.4,'#fff')+circ(8.5,5,3.1,'#EF3340')+g('#fff',[[11.6,2.8],[10.2,4.8],[13,4.8],[10.7,7.2],[12.6,7.2]].map(p=>star(p[0],p[1],.95,5,.4)).join('')),
uk:()=>jack(0,0,30,20),
usa:usa,
canada:()=>rc(0,0,30,20,'#fff')+rc(0,0,7.5,20,'#D52B1E')+rc(22.5,0,7.5,20,'#D52B1E')+g('#D52B1E',star(15,10.4,5.4,6,.55)+'<rect x="14.6" y="13" width=".8" height="3.4"/>'),
australia:()=>rc(0,0,30,20,'#00247D')+jack(0,0,15,10)+g('#fff',star(7.5,15.2,2.6,7,.45)+star(22,13,1.1,5,.4)+star(18,5,1.1,5,.4)+star(26,6,1.1,5,.4)+star(22,18,1.1,5,.4)+star(24.5,9.6,.8,5,.4)),
china:()=>rc(0,0,30,20,'#DE2910')+g('#FFDE00',star(5,5,3,5,.38)+star(10,2,1,5,.38)+star(12,4.2,1,5,.38)+star(12,7,1,5,.38)+star(10,9,1,5,.38)),
qatar:()=>zig(9,'#8A1538','#fff'),
bahrain:()=>zig(5,'#CE1126','#fff'),
saudi:()=>rc(0,0,30,20,'#006C35')+rc(7,6,16,2,'#fff')+rc(9,10,12,1.2,'#fff')+rc(6,14,18,1.2,'#fff'),
uae:()=>rc(0,0,30,20,'#fff')+rc(7.5,0,22.5,6.67,'#00732F')+rc(7.5,13.33,22.5,6.67,'#000')+rc(0,0,7.5,20,'#FF0000'),
azerbaijan:()=>h3('#00B5E2','#EF3340','#509E2F')+circ(14.2,10,3.2,'#fff')+circ(15.1,10,2.6,'#EF3340')+g('#fff',star(18.4,10,1.4,8,.5)),
mexico:()=>v3('#006847','#fff','#CE1126')+circ(15,10,2.6,'#8C6B3A')+circ(15,10,1.6,'#006847')
};
const A={
'brazil':'brazil','italy':'italy','spain':'spain','monaco':'monaco','netherlands':'netherlands','the netherlands':'netherlands','austria':'austria','hungary':'hungary','belgium':'belgium','japan':'japan','singapore':'singapore',
'great britain':'uk','united kingdom':'uk','uk':'uk','united states':'usa','united states of america':'usa','usa':'usa','canada':'canada','australia':'australia','china':'china','qatar':'qatar','bahrain':'bahrain',
'saudi arabia':'saudi','united arab emirates':'uae','uae':'uae','azerbaijan':'azerbaijan','mexico':'mexico'
};
function html(name){
const k=A[String(name||'').trim().toLowerCase()];
if(!k)return'';
return'<svg class="flag" viewBox="0 0 30 20" preserveAspectRatio="none" role="img" aria-label="'+esc(name)+' flag">'+D[k]()+'</svg>';
}
return{html};
})();
