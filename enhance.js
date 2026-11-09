import * as THREE from "three";
import {EffectComposer} from "three/addons/postprocessing/EffectComposer.js";
import {RenderPass} from "three/addons/postprocessing/RenderPass.js";
import {UnrealBloomPass} from "three/addons/postprocessing/UnrealBloomPass.js";
import {OutputPass} from "three/addons/postprocessing/OutputPass.js";
const V=THREE.Vector3,dv=n=>Math.max(0,Math.floor(n)).toString().replace(/\d/g,d=>"०१२३४५६७८९"[d]);
function glow(){const c=document.createElement("canvas");c.width=c.height=64;const g=c.getContext("2d"),r=g.createRadialGradient(32,32,0,32,32,32);r.addColorStop(0,"rgba(255,255,255,1)");r.addColorStop(.35,"rgba(255,210,140,.55)");r.addColorStop(1,"rgba(255,160,60,0)");g.fillStyle=r;g.fillRect(0,0,64,64);return new THREE.CanvasTexture(c);}
function sand(){const s=512,c=document.createElement("canvas");c.width=c.height=s;const g=c.getContext("2d");g.fillStyle="#b99764";g.fillRect(0,0,s,s);
 for(let i=0;i<9000;i++){const v=120+Math.random()*90|0;g.fillStyle=`rgba(${v+30},${v},${v-45},.18)`;g.fillRect(Math.random()*s,Math.random()*s,2+Math.random()*3,1+Math.random()*2);}
 g.strokeStyle="rgba(90,60,30,.15)";g.lineWidth=1.4;for(let y=0;y<s;y+=8){g.beginPath();for(let x=0;x<=s;x+=8)g.lineTo(x,y+Math.sin(x*Math.PI/64+y*.3)*2.4);g.stroke();}
 const t=new THREE.CanvasTexture(c);t.wrapS=t.wrapT=THREE.RepeatWrapping;t.repeat.set(26,26);t.colorSpace=THREE.SRGBColorSpace;t.anisotropy=8;return t;}
const CSS=`.fxui{position:absolute;inset:0;pointer-events:none;z-index:6;overflow:hidden;font-family:'Yatra One','Tiro Devanagari Hindi',serif;transition:box-shadow .3s}
.hm{position:absolute;left:50%;top:50%;width:34px;height:34px;margin:-17px;opacity:0;transition:opacity .25s}
.hm:before,.hm:after{content:"";position:absolute;left:50%;top:50%;width:3px;height:26px;margin:-13px -1.5px;background:#fff;box-shadow:0 0 6px #000;transform:rotate(45deg)}
.hm:after{transform:rotate(-45deg)}.hm.k:before,.hm.k:after{background:#ff4a3a}
.dn{position:absolute;color:#fff;font-weight:700;font-size:20px;text-shadow:0 2px 4px #000;transition:transform .7s ease-out,opacity .7s}
.dn.k{color:#ffb12a;font-size:28px}
.feed{position:absolute;right:16px;top:120px;display:flex;flex-direction:column;gap:6px;align-items:flex-end}
.feed b{background:rgba(20,12,6,.72);border-left:3px solid #ffb12a;color:#ffe2a8;padding:6px 12px;font-weight:400;font-size:14px;animation:fxin 3s forwards}
@keyframes fxin{0%{opacity:0;transform:translateX(30px)}8%{opacity:1;transform:none}85%{opacity:1}100%{opacity:0}}
.storm{position:absolute;left:50%;top:78px;transform:translateX(-50%);background:rgba(40,10,60,.68);color:#e9c8ff;padding:6px 14px;border:1px solid #b36bff;border-radius:20px;font-size:14px;white-space:nowrap}
.storm.warn{background:rgba(130,10,30,.85);color:#fff;animation:fxpl .6s infinite alternate}@keyframes fxpl{to{opacity:.55}}`;
export class FX{
 constructor(scene,camera,renderer,sun){
  Object.assign(this,{scene,camera,renderer,sun,t:0,shake:0,pr:0,p:new V(),sT:0,off:false,lvl:"medium",N:400,pi:0,flashT:0});
  renderer.shadowMap.type=THREE.PCFSoftShadowMap;
  scene.fog.color.set(0xd8a06c);scene.fog.density=.0042;scene.background=new THREE.Color(0xd8a06c);
  sun.color.set(0xffc58a);sun.intensity=3.1;scene.add(sun.target);
  // Gouden-uur lucht met zonneschijf
  this.sky=new THREE.Mesh(new THREE.SphereGeometry(100,32,16),new THREE.ShaderMaterial({side:THREE.BackSide,depthWrite:false,depthTest:false,fog:false,uniforms:{sun:{value:sun.position.clone().normalize()}},
   vertexShader:"varying vec3 v;void main(){v=position;gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.);}",
   fragmentShader:"varying vec3 v;uniform vec3 sun;void main(){vec3 d=normalize(v);float h=clamp(d.y,-.1,1.);vec3 c=mix(vec3(1.,.68,.4),vec3(.95,.58,.46),smoothstep(0.,.2,h));c=mix(c,vec3(.18,.36,.68),smoothstep(.1,.8,h));float s=max(dot(d,sun),0.);c+=vec3(1.,.78,.45)*(pow(s,6.)*.4+pow(s,400.)*4.);gl_FragColor=vec4(c,1.);\n#include <tonemapping_fragment>\n#include <colorspace_fragment>\n}"}));
  this.sky.renderOrder=-100;this.sky.frustumCulled=false;scene.add(this.sky);
  // Zand met rimpels en reliëf
  const gr=scene.children.find(o=>o.isMesh&&o.geometry.parameters&&o.geometry.parameters.width===220);
  if(gr){const t=sand();gr.material.map=t;gr.material.bumpMap=t;gr.material.bumpScale=1.6;gr.material.needsUpdate=true;}
  // Vonken, stof en rook
  const N=this.N;this.pp=new Float32Array(N*3).fill(-999);this.pc=new Float32Array(N*3);this.pv=new Float32Array(N*3);this.pl=new Float32Array(N);
  const g=new THREE.BufferGeometry();g.setAttribute("position",new THREE.BufferAttribute(this.pp,3));g.setAttribute("color",new THREE.BufferAttribute(this.pc,3));
  this.parts=new THREE.Points(g,new THREE.PointsMaterial({size:.22,map:glow(),vertexColors:true,transparent:true,blending:THREE.AdditiveBlending,depthWrite:false}));this.parts.frustumCulled=false;scene.add(this.parts);
  this.dp=new Float32Array(140*3);for(let i=0;i<140;i++){this.dp[i*3]=(Math.random()-.5)*44;this.dp[i*3+1]=Math.random()*12;this.dp[i*3+2]=(Math.random()-.5)*44;}
  const dg=new THREE.BufferGeometry();dg.setAttribute("position",new THREE.BufferAttribute(this.dp,3));
  this.dust=new THREE.Points(dg,new THREE.PointsMaterial({size:.09,color:0xffe2b0,transparent:true,opacity:.55,depthWrite:false,blending:THREE.AdditiveBlending}));this.dust.frustumCulled=false;scene.add(this.dust);
  this.flash=new THREE.PointLight(0xffa850,0,16,2);scene.add(this.flash);
  // Storm (Fortnite-achtige krimpende cirkel)
  this.stormMesh=new THREE.Mesh(new THREE.CylinderGeometry(1,1,70,64,1,true),new THREE.MeshBasicMaterial({color:0x9a4dff,transparent:true,opacity:.25,side:THREE.DoubleSide,depthWrite:false,blending:THREE.AdditiveBlending,fog:false}));this.stormMesh.position.y=30;this.stormMesh.frustumCulled=false;scene.add(this.stormMesh);
  // HUD-laag
  const st=document.createElement("style");st.textContent=CSS;document.head.append(st);
  this.ui=document.createElement("div");this.ui.className="fxui";this.hm=document.createElement("div");this.hm.className="hm";this.fd=document.createElement("div");this.fd.className="feed";this.hud=document.createElement("div");this.hud.className="storm";
  this.ui.append(this.hm,this.fd,this.hud);document.getElementById("game-screen").append(this.ui);
 }
 resize(level){
  if(level)this.lvl=level;
  const sc=this.sun.shadow.camera;sc.left=sc.bottom=-58;sc.right=sc.top=58;sc.updateProjectionMatrix();
  const want=!matchMedia("(max-width: 700px)").matches&&this.lvl!=="low";
  if(want&&!this.comp){const rt=new THREE.WebGLRenderTarget(innerWidth,innerHeight,{type:THREE.HalfFloatType,samples:4});this.comp=new EffectComposer(this.renderer,rt);this.comp.addPass(new RenderPass(this.scene,this.camera));this.comp.addPass(new UnrealBloomPass(new THREE.Vector2(innerWidth/2,innerHeight/2),.42,.55,.82));this.comp.addPass(new OutputPass());}
  if(!want&&this.comp){this.comp.dispose?.();this.comp=null;}
  this.sync(true);
 }
 sync(force){if(!this.comp)return;const pr=this.renderer.getPixelRatio();if(force||pr!==this.pr){this.pr=pr;this.comp.setPixelRatio(pr);this.comp.setSize(innerWidth,innerHeight);}}
 emit(p,n,col,sp,life){const c=new THREE.Color(col);for(let k=0;k<n;k++){const i=this.pi++%this.N,j=i*3;this.pp[j]=p.x;this.pp[j+1]=p.y;this.pp[j+2]=p.z;this.pv[j]=(Math.random()-.5)*sp;this.pv[j+1]=Math.random()*sp*.9+sp*.2;this.pv[j+2]=(Math.random()-.5)*sp;this.pc[j]=c.r;this.pc[j+1]=c.g;this.pc[j+2]=c.b;this.pl[i]=life*(.6+Math.random()*.6);}}
 shot(a,b,kind,hit){this.flash.position.copy(a);this.flash.intensity=kind==="shotgun"?30:18;this.flashT=.05;this.shake=Math.min(1,this.shake+(kind==="marksman"?.7:kind==="shotgun"?.55:.18));this.emit(a,3,0xffc070,3,.18);if(!hit)this.emit(b,5,0xd8b890,3.5,.5);}
 hit(pt,dmg,dead){this.emit(pt,dead?30:9,dead?0xff8a3a:0xffe0a0,dead?7:4,.5);this.hm.className="hm"+(dead?" k":"");this.hm.style.opacity=1;clearTimeout(this.hmT);this.hmT=setTimeout(()=>this.hm.style.opacity=0,120);
  const v=pt.clone().project(this.camera),d=document.createElement("div");d.className="dn"+(dead?" k":"");d.textContent=dv(dmg);d.style.left=((v.x*.5+.5)*innerWidth+(Math.random()-.5)*30)+"px";d.style.top=((-v.y*.5+.5)*innerHeight)+"px";this.ui.append(d);
  requestAnimationFrame(()=>{d.style.transform="translateY(-55px)";d.style.opacity=0;});setTimeout(()=>d.remove(),750);
  if(dead)this.feed("विरोधी परास्त ✦ +१२ अनुभव");}
 hurt(){this.shake=Math.min(1,this.shake+.5);}
 feed(m){const b=document.createElement("b");b.textContent=m;this.fd.append(b);setTimeout(()=>b.remove(),3000);}
 reset(training){this.sT=0;this.off=!!training;this.stormMesh.visible=!training;this.hud.style.display=training?"none":"";this.ui.style.boxShadow="none";if(!training)this.feed("आँधी २५ सेकण्ड में आएगी — केन्द्र की ओर बढ़ते रहो");}
 update(dt,pl,hurt){
  this.p.copy(pl.position);if(this.off)return;this.sT+=dt;
  const r=this.sT<25?95:Math.max(12,95-(this.sT-25)*.55);this.stormMesh.scale.set(r,1,r);this.stormMesh.material.opacity=.22+Math.sin(this.t*2)*.06;
  const out=Math.hypot(pl.position.x,pl.position.z)>r;if(out)hurt(dt*(2.5+(95-r)*.04));this.ui.style.boxShadow=out?"inset 0 0 170px rgba(150,60,255,.6)":"none";
  this.hc=(this.hc||0)-dt;if(this.hc<=0){this.hc=.25;this.hud.className="storm"+(out?" warn":"");this.hud.textContent=out?"⚠ आँधी के भीतर! केन्द्र की ओर भागो":this.sT<25?`आँधी आने में ${dv(25-this.sT)} सेकण्ड`:`आँधी सिकुड़ रही है · त्रिज्या ${dv(r)} मी`;}
 }
 render(dt){
  this.t+=dt;const {camera,renderer,scene,p,sun}=this;
  this.sky.position.copy(camera.position);sun.target.position.copy(p);sun.position.set(p.x-38,p.y+58,p.z+24);
  this.flashT-=dt;if(this.flashT<=0)this.flash.intensity=0;
  const pp=this.pp,pv=this.pv,pc=this.pc,pl=this.pl;
  for(let i=0;i<this.N;i++){if(pl[i]<=0)continue;pl[i]-=dt;const k=i*3;if(pl[i]<=0){pp[k+1]=-999;continue;}pv[k+1]-=9*dt;pp[k]+=pv[k]*dt;pp[k+1]+=pv[k+1]*dt;pp[k+2]+=pv[k+2]*dt;const f=Math.max(0,1-dt*2.8);pc[k]*=f;pc[k+1]*=f;pc[k+2]*=f;}
  this.parts.geometry.attributes.position.needsUpdate=true;this.parts.geometry.attributes.color.needsUpdate=true;
  const dp=this.dp;for(let i=0;i<140;i++){const k=i*3;dp[k]+=(Math.sin(this.t*.7+i)*.6+.9)*dt;dp[k+1]+=Math.sin(this.t+i)*.1*dt;dp[k+2]+=Math.cos(this.t*.5+i)*.3*dt;if(dp[k]>22)dp[k]=-22;if(dp[k+2]>22)dp[k+2]=-22;if(dp[k+2]<-22)dp[k+2]=22;}
  this.dust.geometry.attributes.position.needsUpdate=true;this.dust.position.set(camera.position.x,0,camera.position.z);
  this.shake=Math.max(0,this.shake-dt*4);const sh=this.shake*this.shake*.12,off=new V((Math.random()-.5)*sh,(Math.random()-.5)*sh,(Math.random()-.5)*sh);
  camera.position.add(off);
  if(this.comp){this.sync();this.comp.render(dt);}else renderer.render(scene,camera);
  camera.position.sub(off);
 }
}
