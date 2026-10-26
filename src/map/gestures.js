// Browser Pointer Events cover mouse, pen, and independent touch contacts.
export function installMapGestures(scene,onTap){
 const canvas=scene.game.canvas,pointers=new Map();
 let pinch=null;
 const point=e=>{const r=canvas.getBoundingClientRect();return {x:(e.clientX-r.left)*scene.scale.width/r.width,y:(e.clientY-r.top)*scene.scale.height/r.height};};
 const pair=()=>{const [a,b]=[...pointers.values()];return {x:(a.x+b.x)/2,y:(a.y+b.y)/2,distance:Math.max(1,Math.hypot(a.x-b.x,a.y-b.y))};};
 const down=e=>{
  if(e.pointerType==='mouse'&&e.button!==0)return;
  e.preventDefault();scene.panTween?.stop();canvas.setPointerCapture(e.pointerId);
  const p=point(e);pointers.set(e.pointerId,{...p,startX:p.x,startY:p.y,moved:false});
  if(pointers.size>=2){for(const p of pointers.values())p.moved=true;pinch=pair();}
 };
 const move=e=>{
  const p=pointers.get(e.pointerId);if(!p)return;
  e.preventDefault();const next=point(e),previous={x:p.x,y:p.y};
  Object.assign(p,next);if(Math.hypot(p.x-p.startX,p.y-p.startY)>6)p.moved=true;
  if(pointers.size>=2){
   const nextPair=pair();
   if(pinch)scene.zoomAt(nextPair.distance/pinch.distance,pinch,nextPair);
   pinch=nextPair;
  }else if(p.moved){
   const c=scene.cameras.main;c.scrollX-=(p.x-previous.x)/c.zoom;c.scrollY-=(p.y-previous.y)/c.zoom;scene.constrain();
  }
 };
 const up=e=>{
  const p=pointers.get(e.pointerId);if(!p)return;
  const tap=!p.moved&&pointers.size===1&&e.type==='pointerup';
  pointers.delete(e.pointerId);pinch=null;
  for(const remaining of pointers.values()){remaining.moved=true;remaining.startX=remaining.x;remaining.startY=remaining.y;}
  if(canvas.hasPointerCapture(e.pointerId))canvas.releasePointerCapture(e.pointerId);
  if(tap)onTap(point(e));
 };
 const wheel=e=>{e.preventDefault();scene.zoomAt(Math.exp(-e.deltaY*0.0015),point(e));};
 const clear=()=>{pointers.clear();pinch=null;};
 const listeners={pointerdown:down,pointermove:move,pointerup:up,pointercancel:up,lostpointercapture:up,wheel};
 for(const [name,handler] of Object.entries(listeners))canvas.addEventListener(name,handler,{passive:false});
 window.addEventListener('blur',clear);
 scene.events.once('shutdown',()=>{for(const [name,handler] of Object.entries(listeners))canvas.removeEventListener(name,handler);window.removeEventListener('blur',clear);});
}
