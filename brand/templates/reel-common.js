// Общие помощники анимации: всё считается от времени t (секунды), чтобы кадры рендерились точно.
const clamp=(x,a=0,b=1)=>Math.max(a,Math.min(b,x));
const ease=(x)=>{x=clamp(x);return 1-Math.pow(1-x,3)};
const prog=(t,a,b)=>ease((t-a)/(b-a));
function show(el,t,a,b,out,outEnd,dy=60){ // появление [a,b], исчезновение [out,outEnd]
  const i=prog(t,a,b), o=out?1-prog(t,out,outEnd):1; const v=Math.min(i,o);
  el.style.opacity=v; el.style.transform=`translateY(${(1-i)*dy}px)`;
}
function typeText(el,t,a,b,text){const n=Math.round(clamp((t-a)/(b-a))*text.length);el.textContent=text.slice(0,n);}
