import * as THREE from "https://cdn.jsdelivr.net/npm/three@0.161.0/build/three.module.js";

const $ = (id) => document.getElementById(id);
const devanagari = (n) => Math.max(0, Math.floor(n)).toString().replace(/\d/g, d => "०१२३४५६७८९"[d]);
const STORE_KEY = "veerbhoomi_save_v1";
const defaultSave = () => ({
  level:1, xp:0, coins:300, kills:0, wins:0, matches:0, passXp:0,
  premium:false, owned:["साधारण कवच"], selected:"साधारण कवच",
  missions:{kills:0,matches:0,claimed:[]}, sound:true, graphics:"medium", adaptive:true, custom:{scale:0.82,shadows:0,foliage:0.65,view:0.82,fps:120,fov:68}
});
let save = loadSave();
function loadSave(){try{const d=defaultSave(),v={...d,...JSON.parse(localStorage.getItem(STORE_KEY)||"{}")};v.custom={...d.custom,...(v.custom||{})};v.missions={...d.missions,...(v.missions||{})};return v;}catch{return defaultSave();}}
function persist(){localStorage.setItem(STORE_KEY,JSON.stringify(save)); updateHeader();}
function xpNeeded(){return 100+(save.level-1)*25;}
function gainXP(amount){save.xp+=amount;save.passXp+=amount;while(save.xp>=xpNeeded()){save.xp-=xpNeeded();save.level++;save.coins+=40;toast("नया स्तर प्राप्त! ४० रणमुद्राएँ मिलीं।");}persist();}
function toast(message){const el=document.createElement("div");el.className="toast";el.textContent=message;document.body.append(el);setTimeout(()=>el.remove(),2400);}
function updateHeader(){
  $("player-level").textContent=`स्तर ${devanagari(save.level)}`;
  const ranks=["नवदीक्षित योद्धा","धैर्यवान रक्षक","रणकुशल वीर","दुर्ग-विजेता","महावीर"];
  $("player-rank").textContent=ranks[Math.min(ranks.length-1,Math.floor((save.level-1)/5))];
  $("top-xp-fill").style.width=`${save.xp/xpNeeded()*100}%`;
  $("top-xp-text").textContent=`${devanagari(save.xp)} / ${devanagari(xpNeeded())} अनुभव`;
  $("coin-count").textContent=devanagari(save.coins);
  $("pass-level").textContent=`${devanagari(Math.min(20,1+Math.floor(save.passXp/100)))} / २०`;
  $("pass-progress").style.width=`${Math.min(100,save.passXp/2000*100)}%`;
  $("stat-wins").textContent=devanagari(save.wins);$("stat-kills").textContent=devanagari(save.kills);$("stat-matches").textContent=devanagari(save.matches);
  $("mission-kills").textContent=`${devanagari(Math.min(5,save.missions.kills))} / ५ परास्त`;
  $("mission-match").textContent=`${devanagari(Math.min(1,save.missions.matches))} / १ रण`;
}
updateHeader();

const shopItems=[
 {name:"साधारण कवच",icon:"🛡",price:0,desc:"आरम्भिक योद्धा का मूल कवच।"},
 {name:"मरु-रक्षक",icon:"🏜",price:180,desc:"मरुभूमि के रंगों से रँगा दृढ़ कवच।"},
 {name:"मेघ-वीर",icon:"🌧",price:260,desc:"नील और रजत वर्ण का विशेष कवच।"},
 {name:"अग्नि-केतु",icon:"🔥",price:340,desc:"अग्नि-रंग से प्रेरित रण-वेश।"},
 {name:"वन-छाया",icon:"🌿",price:220,desc:"वनभूमि में घुल-मिल जाने वाला वेश।"},
 {name:"सूर्य-चिह्न",icon:"☀",price:400,desc:"स्वर्णिम चिह्नों से अलंकृत कवच।"}
];
const rewards=Array.from({length:20},(_,i)=>({level:i+1,free:i%4===0?80:i%3===0?"अस्त्र-रंग":"अनुभव",premium:i%4===0?"विशेष कवच":i%3===0?150:"अलंकरण"}));
function openPanel(type){
  const panel=$("panel-backdrop"),title=$("panel-title"),kicker=$("panel-kicker"),content=$("panel-content");
  panel.classList.remove("hidden");content.innerHTML="";
  if(type==="arsenal"){
    kicker.textContent="तुम्हारी सज्जा";title.textContent="अस्त्रागार";
    content.innerHTML=`<p class="panel-intro">रण में उतरने से पहले अपना कवच और चार प्रधान अस्त्रों में से एक चुनो। प्रत्येक अस्त्र की प्रहार-शक्ति, दूरी और पुनः सज्ज होने का समय भिन्न है।</p><div class="panel-stat"><span>अग्नि-राइफल</span><b>सन्तुलित प्रहार</b></div><div class="panel-stat"><span>वज्र-वेग अस्त्र</span><b>तीव्र प्रहार</b></div><div class="panel-stat"><span>गर्जन-भेदी</span><b>निकट दूरी</b></div><div class="panel-stat"><span>दूरवेधी अस्त्र</span><b>दीर्घ दूरी</b></div><div class="panel-stat"><span>वर्तमान कवच</span><b>${save.selected}</b></div><p class="panel-intro">१–४ कुञ्जियों से अस्त्र बदलो; R से पुनः सज्ज करो। दायाँ माउस-बटन दबाकर लक्ष्य-समीप दृष्टि प्राप्त करो।</p>`;
  }else if(type==="shop"){
    kicker.textContent="रणमुद्रा से प्राप्त करो";title.textContent="विक्रयशाला";
    content.innerHTML=`<p class="panel-intro">यहाँ अर्जित रणमुद्राओं से केवल रूप-सज्जा के कवच प्राप्त होते हैं। खरीदी गई वस्तुएँ तुम्हारे इस यन्त्र में सुरक्षित रहेंगी।</p><div class="item-grid">${shopItems.map((it,i)=>`<div class="item-card"><div class="item-art">${it.icon}</div><b>${it.name}</b><small>${it.desc}</small><button data-buy="${i}" ${save.owned.includes(it.name)?"disabled":""}>${save.owned.includes(it.name)?"प्राप्त है":it.price===0?"निःशुल्क":`${devanagari(it.price)} ◈ प्राप्त करो`}</button></div>`).join("")}</div>`;
    content.querySelectorAll("[data-buy]").forEach(btn=>btn.addEventListener("click",()=>buyItem(Number(btn.dataset.buy))));
  }else if(type==="pass"){
    kicker.textContent="प्रथम अध्याय · मरु-दुर्ग";title.textContent="ऋतु-पुरस्कार पत्र";
    const tier=Math.min(20,1+Math.floor(save.passXp/100));
    content.innerHTML=`<p class="panel-intro">रण खेलकर अनुभव अर्जित करो। प्रत्येक १०० अनुभव पर एक पुरस्कार-स्तर खुलता है। सामान्य पुरस्कार सभी को मिलते हैं; विशिष्ट पुरस्कार-पथ ६०० रणमुद्राओं से खुलता है।</p><div class="panel-stat"><span>वर्तमान पुरस्कार-स्तर</span><b>${devanagari(tier)} / २०</b></div><div class="panel-stat"><span>विशिष्ट पुरस्कार-पथ</span><b>${save.premium?"उद्घाटित":"अवरोधित"}</b></div>${!save.premium?'<button id="unlock-premium" class="panel-action">६०० रणमुद्राओं से विशिष्ट पथ खोलें</button>':""}<div class="tier-list" style="margin-top:20px">${rewards.map(r=>`<div class="tier ${r.level>tier?"locked":""}"><div class="tier-number">${devanagari(r.level)}</div><div><b>स्तर ${devanagari(r.level)}</b><small>सामान्य: ${r.free} · विशिष्ट: ${r.premium}</small></div><div class="tier-reward">${r.level<=tier?"प्राप्त":"अप्राप्त"}</div></div>`).join("")}</div>`;
    const unlock=$("unlock-premium");if(unlock)unlock.onclick=()=>{if(save.coins<600){toast("पर्याप्त रणमुद्राएँ नहीं हैं।");return;}save.coins-=600;save.premium=true;persist();openPanel("pass");toast("विशिष्ट पुरस्कार-पथ खुल गया।");};
  }else if(type==="missions"){
    kicker.textContent="पराक्रम के लक्ष्य";title.textContent="अभियान";
    const tasks=[{id:"kills",name:"पाँच विरोधियों को परास्त करो",desc:"रण में पाँच विरोधियों को परास्त करो।",progress:Math.min(5,save.missions.kills),goal:5,reward:75},{id:"matches",name:"एक रण पूरा करो",desc:"किसी भी परिणाम के साथ एक रण पूरा करो।",progress:Math.min(1,save.missions.matches),goal:1,reward:50}];
    content.innerHTML=`<p class="panel-intro">अभियान पूरे करके अतिरिक्त रणमुद्राएँ प्राप्त करो।</p><div class="tier-list">${tasks.map(t=>`<div class="tier"><div class="tier-number">✦</div><div><b>${t.name}</b><small>${t.desc} ${devanagari(t.progress)} / ${devanagari(t.goal)}</small></div><button class="item-card-button" data-claim="${t.id}" ${t.progress<t.goal||save.missions.claimed.includes(t.id)?"disabled":""}>${save.missions.claimed.includes(t.id)?"प्राप्त":`+${devanagari(t.reward)}`}</button></div>`).join("")}</div>`;
    content.querySelectorAll("[data-claim]").forEach(b=>b.onclick=()=>{const id=b.dataset.claim;if(save.missions.claimed.includes(id))return;const t=tasks.find(x=>x.id===id);if(t.progress<t.goal)return;save.missions.claimed.push(id);save.coins+=t.reward;persist();openPanel("missions");toast("अभियान-पुरस्कार प्राप्त हुआ।");});
  }else if(type==="settings"){
    kicker.textContent="दृश्य और कार्यक्षमता";title.textContent="दृश्य-विन्यास";
    const choices=[
      {id:"low",name:"अति-प्रदर्शन",desc:"इंटीग्रेटेड चित्रक यन्त्रों के लिए · छाया बन्द · कम दृश्य-भार"},
      {id:"medium",name:"सन्तुलित",desc:"मध्यम श्रेणी के संगणक · 1080p प्रदर्शन-प्रथम"},
      {id:"high",name:"दृश्य-समृद्ध",desc:"अधिक शक्तिशाली चित्रक यन्त्र · बेहतर छाया और स्पष्टता"},
      {id:"ultra",name:"अधिकतम",desc:"उच्च क्षमता वाले पृथक चित्रक यन्त्रों के लिए"},
      {id:"custom",name:"स्वनिर्धारित",desc:"नीचे प्रत्येक विकल्प को स्वयं निर्धारित करो"}
    ];
    const c=save.custom;
    content.innerHTML=`<p class="panel-intro">Iris Xe और Radeon समेकित चित्रक यन्त्रों के लिए पहले ‘अति-प्रदर्शन’ चुनें। 1080p पर लक्ष्य ६०–१२० FPS है; वास्तविक परिणाम उपकरण के अनुसार बदलेंगे।</p>
      <div class="quality-list">${choices.map(q=>`<button class="quality-choice ${save.graphics===q.id?"selected":""}" data-quality="${q.id}"><span><b>${q.name}</b><small>${q.desc}</small></span><i>${save.graphics===q.id?"चयनित":"चुनें"}</i></button>`).join("")}</div>
      <div class="advanced-box"><div class="advanced-heading"><b>सूक्ष्म दृश्य-विन्यास</b><span>स्वनिर्धारित</span></div>
        <label class="range-setting"><span>आन्तरिक दृश्य-आकार <b id="scale-value">${Math.round(c.scale*100)}%</b></span><input id="custom-scale" type="range" min="55" max="125" step="5" value="${Math.round(c.scale*100)}"><small>कम मान से चित्रक यन्त्र पर भार घटता है।</small></label>
        <label class="range-setting"><span>दृश्य-दूरी <b id="view-value">${Math.round(c.view*100)}%</b></span><input id="custom-view" type="range" min="45" max="120" step="5" value="${Math.round(c.view*100)}"><small>दूरस्थ वस्तुओं की दृश्यता और दृश्य-भार नियंत्रित करती है।</small></label>
        <label class="range-setting"><span>वनस्पति घनत्व <b id="foliage-value">${Math.round(c.foliage*100)}%</b></span><input id="custom-foliage" type="range" min="0" max="100" step="10" value="${Math.round(c.foliage*100)}"><small>ताड़-वृक्ष, झाड़ियाँ और शिलाखण्ड।</small></label>
        <label class="range-setting"><span>छाया-गुणवत्ता</span><select id="custom-shadows"><option value="0" ${c.shadows===0?"selected":""}>बन्द — सर्वोत्तम प्रदर्शन</option><option value="512" ${c.shadows===512?"selected":""}>न्यून — ५१२</option><option value="1024" ${c.shadows===1024?"selected":""}>मध्यम — १०२४</option><option value="1536" ${c.shadows===1536?"selected":""}>उच्च — १५३६</option></select></label>
        <label class="range-setting"><span>चित्र-दर सीमा</span><select id="custom-fps"><option value="30" ${c.fps===30?"selected":""}>३० FPS</option><option value="60" ${c.fps===60?"selected":""}>६० FPS</option><option value="90" ${c.fps===90?"selected":""}>९० FPS</option><option value="120" ${c.fps===120?"selected":""}>१२० FPS</option><option value="144" ${c.fps===144?"selected":""}>१४४ FPS</option><option value="0" ${c.fps===0?"selected":""}>असीमित</option></select></label>
        <label class="range-setting"><span>दृष्टि-कोण <b id="fov-value">${c.fov}°</b></span><input id="custom-fov" type="range" min="60" max="90" step="2" value="${c.fov}"></label>
        <button id="apply-custom" class="panel-action">स्वनिर्धारित विन्यास लागू करो</button>
      </div>
      <label class="setting-toggle"><input id="adaptive-toggle" type="checkbox" ${save.adaptive?"checked":""}><span><b>स्वचालित चित्र-दर अनुकूलन</b><small>चित्र-दर गिरने पर दृश्य-आकार घटेगा और स्थिर होने पर धीरे-धीरे बढ़ेगा।</small></span></label>
      <p class="panel-intro setting-note">FPS काउंटर खेल में वास्तविक प्रदर्शित चित्र-दर और प्रति-चित्र समय दिखाता है। १२० FPS के लिए १२० Hz अथवा अधिक आवृत्ति वाला पर्दा भी आवश्यक है।</p>`;
    content.querySelectorAll("[data-quality]").forEach(b=>b.onclick=()=>{save.graphics=b.dataset.quality;persist();if(renderer)applyGraphics();openPanel("settings");toast("दृश्य-विन्यास लागू हुआ।");});
    const bindRange=(id,key,out,suffix="%")=>{const el=$(id),v=$(out);el.oninput=()=>{v.textContent=el.value+suffix;};};
    bindRange("custom-scale","scale","scale-value");bindRange("custom-view","view","view-value");bindRange("custom-foliage","foliage","foliage-value");bindRange("custom-fov","fov","fov-value","°");
    $("apply-custom").onclick=()=>{save.custom={scale:Number($("custom-scale").value)/100,view:Number($("custom-view").value)/100,foliage:Number($("custom-foliage").value)/100,shadows:Number($("custom-shadows").value),fps:Number($("custom-fps").value),fov:Number($("custom-fov").value)};save.graphics="custom";persist();if(renderer)applyGraphics();openPanel("settings");toast("स्वनिर्धारित विन्यास लागू हुआ।");};
    $("adaptive-toggle").onchange=e=>{save.adaptive=e.target.checked;persist();};

  }
}
function buyItem(i){const item=shopItems[i];if(save.owned.includes(item.name))return;if(save.coins<item.price){toast("पर्याप्त रणमुद्राएँ नहीं हैं।");return;}save.coins-=item.price;save.owned.push(item.name);save.selected=item.name;persist();openPanel("shop");toast(`${item.name} प्राप्त हुआ।`);}
document.querySelectorAll("[data-panel],[data-open]").forEach(b=>b.addEventListener("click",()=>openPanel(b.dataset.panel||b.dataset.open)));
$("close-panel").onclick=()=>$("panel-backdrop").classList.add("hidden");
$("panel-backdrop").addEventListener("click",e=>{if(e.target===$("panel-backdrop"))$("panel-backdrop").classList.add("hidden");});
$("sound-toggle").onclick=()=>{save.sound=!save.sound;persist();$("sound-toggle").textContent=save.sound?"♫":"♪";if(save.sound&&running)startAmbient();else stopAmbient();toast(save.sound?"ध्वनि-संकेत चालू।":"ध्वनि-संकेत बन्द।");};

// Three-dimensional match
let scene,camera,renderer,clock,player,playerYaw=0,keys={},bots=[],shots=[],running=false,animationId=0,weaponIndex=0,ammo=30,reserveAmmo=120,reloading=false,reloadTimer=0,gameAudio=null,ambientSource=null,ambientGain=null,frameAccumulator=0,lastFrameAt=0,playerPitch=0,aiming=false,stepTimer=0;
let health=100,killsThisMatch=0,training=false,fireCooldown=0,damageCooldown=0,matchStart=0,playerVelocityY=0,onGround=true,moveClock=0;
const horizontalVelocity=new THREE.Vector3();
let firing=false,sprinting=false,lookPointer=null,aimPointer=null,lastLookX=0,lastLookY=0;
let fpsFrames=0,fpsTime=0,fpsValue=0,fpsStamp=0,qualityScale=1,qualityCheck=0,stableFrames=0,zoneClock=0;
const solidObstacles=[];
function addObstacle(x,z,r){solidObstacles.push({x,z,r});}
const arenaSize=220;
const joystick={x:0,y:0,active:false,pointer:null};
let lastReward=null;
const materialCache=new Map();
function mat(color,rough=.85,metalness=0){const key=`${color}-${rough}-${metalness}`;if(!materialCache.has(key))materialCache.set(key,new THREE.MeshStandardMaterial({color,roughness:rough,metalness}));return materialCache.get(key);}
function noiseTexture(baseA,baseB){const size=256,data=new Uint8Array(size*size*4);for(let i=0;i<size*size;i++){const n=Math.random(),v=baseA+(baseB-baseA)*n;data[i*4]=Math.min(255,v*1.05);data[i*4+1]=Math.min(255,v);data[i*4+2]=Math.min(255,v*.88);data[i*4+3]=255;}const tex=new THREE.DataTexture(data,size,size,THREE.RGBAFormat);tex.wrapS=tex.wrapT=THREE.RepeatWrapping;tex.repeat.set(9,9);tex.colorSpace=THREE.SRGBColorSpace;tex.magFilter=THREE.LinearFilter;tex.minFilter=THREE.LinearMipmapLinearFilter;tex.generateMipmaps=true;tex.needsUpdate=true;return tex;}
const queuedBoxes=[];
function box(w,h,d,color,x,y,z,material=null,shadow=true){const item={w,h,d,color,material,shadow,x,y,z,rotation:{y:0},userData:{}};queuedBoxes.push(item);return item;}
function flushBoxes(){const batches=new Map();for(const b of queuedBoxes){const foliage=!!b.userData.foliage,key=`${b.color}-${b.shadow}-${foliage}`;if(!batches.has(key))batches.set(key,[]);batches.get(key).push(b);}const geo=new THREE.BoxGeometry(1,1,1);for(const items of batches.values()){const first=items[0],mesh=new THREE.InstancedMesh(geo,first.material||mat(first.color),items.length),dummy=new THREE.Object3D();items.forEach((b,i)=>{dummy.position.set(b.x,b.y,b.z);dummy.rotation.set(0,b.rotation.y||0,0);dummy.scale.set(b.w,b.h,b.d);dummy.updateMatrix();mesh.setMatrixAt(i,dummy.matrix);});mesh.instanceMatrix.needsUpdate=true;mesh.castShadow=first.shadow;mesh.receiveShadow=first.shadow;mesh.userData.foliage=!!first.userData.foliage;scene.add(mesh);}queuedBoxes.length=0;}
function instanced(geometry,material,items,cast=false){const mesh=new THREE.InstancedMesh(geometry,material,items.length);const dummy=new THREE.Object3D();items.forEach((v,i)=>{dummy.position.set(v.x,v.y,v.z);dummy.rotation.set(v.rx||0,v.ry||0,v.rz||0);dummy.scale.set(v.sx??1,v.sy??1,v.sz??1);dummy.updateMatrix();mesh.setMatrixAt(i,dummy.matrix);});mesh.instanceMatrix.needsUpdate=true;mesh.castShadow=cast;mesh.receiveShadow=true;scene.add(mesh);return mesh;}
const graphicsProfiles={
 low:{scale:.72,shadows:0,foliage:.35,view:.62,fps:120,fov:70},
 medium:{scale:.86,shadows:0,foliage:.65,view:.82,fps:120,fov:70},
 high:{scale:1.0,shadows:512,foliage:.85,view:1,fps:144,fov:72},
 ultra:{scale:1.15,shadows:1024,foliage:1,view:1.15,fps:0,fov:74}
};
function activeGraphics(){return save.graphics==="custom"?save.custom:(graphicsProfiles[save.graphics]||graphicsProfiles.medium);}
function applyGraphics(){
 if(!renderer)return;const q=activeGraphics();qualityScale=1;
 const mobile=matchMedia("(max-width: 700px)").matches;const dpr=Math.min(window.devicePixelRatio||1,mobile?1:1.15);const scale=mobile?Math.min(q.scale,.82):q.scale;renderer.setPixelRatio(Math.min(dpr*scale,1.15));renderer.setSize(innerWidth,innerHeight,false);
 const shadowSize=mobile?0:q.shadows;renderer.shadowMap.enabled=shadowSize>0;const sun=scene.getObjectByName("sun-light");if(sun){sun.castShadow=shadowSize>0;if(shadowSize){sun.shadow.mapSize.set(shadowSize,shadowSize);sun.shadow.camera.left=-105;sun.shadow.camera.right=105;sun.shadow.camera.top=105;sun.shadow.camera.bottom=-105;sun.shadow.camera.updateProjectionMatrix();}}
 camera.fov=q.fov||70;camera.far=230*(q.view||1);camera.updateProjectionMatrix();
 scene.traverse(o=>{if(o.userData&&o.userData.foliage){o.visible=(q.foliage??1)>0.02;}});
}
function adaptiveQuality(dt){
 if(!save.adaptive||!renderer)return;qualityCheck+=dt;if(qualityCheck<1.5)return;qualityCheck=0;
 const q=activeGraphics(),mobile=matchMedia("(max-width: 700px)").matches,base=mobile?Math.min(q.scale||.85,.82):(q.scale||.85);
 if(fpsValue<52&&qualityScale>.62){qualityScale=Math.max(.62,qualityScale-.08);stableFrames=0;}
 else if(fpsValue>92&&qualityScale<1){stableFrames++;if(stableFrames>=4){qualityScale=Math.min(1,qualityScale+.04);stableFrames=0;}}
 const target=Math.min(Math.min(window.devicePixelRatio||1,mobile?1:1.15)*base*qualityScale,mobile?.72:1.15);renderer.setPixelRatio(target);renderer.setSize(innerWidth,innerHeight,false);
}
function getWeapon(){return weapons[weaponIndex];}
const weapons=[
 {name:"अग्नि-राइफल",kind:"rifle",mag:30,damage:36,rate:.105,range:115,spread:.006,reload:1.65,ammo:30},
 {name:"वज्र-वेग अस्त्र",kind:"smg",mag:36,damage:22,rate:.065,range:75,spread:.018,reload:1.45,ammo:36},
 {name:"गर्जन-भेदी",kind:"shotgun",mag:8,damage:15,rate:.72,range:34,spread:.075,reload:2.05,ammo:8},
 {name:"दूरवेधी अस्त्र",kind:"marksman",mag:10,damage:92,rate:.82,range:180,spread:.001,reload:1.9,ammo:10}
];
function updateWeaponHud(){const w=getWeapon();$("weapon-name").textContent=w.name;$("ammo-count").textContent=`${devanagari(ammo)} / ${devanagari(reserveAmmo)}`;}
function chooseWeapon(i){weaponIndex=(i+weapons.length)%weapons.length;ammo=getWeapon().mag;reloading=false;reloadTimer=0;updateWeaponHud();if(player?.userData.weaponRig){const rig=player.userData.weaponRig;rig.scale.set(weapons[weaponIndex].kind==="shotgun"?1.12:weapons[weaponIndex].kind==="marksman"?1.28:weapons[weaponIndex].kind==="smg"?.78:1,1,1);rig.rotation.x=weapons[weaponIndex].kind==="shotgun"?-.04:0;}const sel=$("weapon-select");if(sel)sel.value=String(weaponIndex);}
function playTone(freq=150,duration=.08,type="sawtooth",end=55){if(!save.sound)return;try{gameAudio=gameAudio||new (window.AudioContext||window.webkitAudioContext)();if(gameAudio.state==="suspended")gameAudio.resume();const o=gameAudio.createOscillator(),g=gameAudio.createGain();o.type=type;o.frequency.setValueAtTime(freq,gameAudio.currentTime);o.frequency.exponentialRampToValueAtTime(Math.max(20,end),gameAudio.currentTime+duration);g.gain.setValueAtTime(.055,gameAudio.currentTime);g.gain.exponentialRampToValueAtTime(.001,gameAudio.currentTime+duration);o.connect(g);g.connect(gameAudio.destination);o.start();o.stop(gameAudio.currentTime+duration);}catch{}}
function startAmbient(){if(!save.sound)return;try{gameAudio=gameAudio||new (window.AudioContext||window.webkitAudioContext)();if(gameAudio.state==="suspended")gameAudio.resume();if(ambientSource)return;const length=gameAudio.sampleRate*2,buffer=gameAudio.createBuffer(1,length,gameAudio.sampleRate),data=buffer.getChannelData(0);for(let i=0;i<length;i++)data[i]=(Math.random()*2-1)*.22;ambientSource=gameAudio.createBufferSource();ambientSource.buffer=buffer;ambientSource.loop=true;const filter=gameAudio.createBiquadFilter();filter.type="lowpass";filter.frequency.value=310;ambientGain=gameAudio.createGain();ambientGain.gain.value=.12;ambientSource.connect(filter);filter.connect(ambientGain);ambientGain.connect(gameAudio.destination);ambientSource.start();}catch{}}
function stopAmbient(){try{ambientSource?.stop();}catch{}ambientSource=null;ambientGain=null;}
function reloadWeapon(){const w=getWeapon();if(reloading||ammo>=w.mag||reserveAmmo<=0)return;reloading=true;reloadTimer=w.reload;playTone(480,.07,"triangle",260);toast("अस्त्र पुनः सज्ज हो रहा है…");}
function mergeStaticParts(parts){
 const materials=[],positions=[],normals=[],uvs=[],indices=[],groups=[];let vertexBase=0;
 for(const mesh of parts){mesh.updateMatrix();const g=mesh.geometry.clone();g.applyMatrix4(mesh.matrix);const p=g.getAttribute("position"),n=g.getAttribute("normal"),uv=g.getAttribute("uv");for(let i=0;i<p.count;i++){positions.push(p.getX(i),p.getY(i),p.getZ(i));normals.push(n?n.getX(i):0,n?n.getY(i):1,n?n.getZ(i):0);uvs.push(uv?uv.getX(i):0,uv?uv.getY(i):0);}const src=g.index?Array.from(g.index.array):Array.from({length:p.count},(_,i)=>i);const mi=materials.indexOf(mesh.material);const materialIndex=mi<0?(materials.push(mesh.material)-1):mi;const start=indices.length;for(const ix of src)indices.push(ix+vertexBase);groups.push({start,count:src.length,materialIndex});vertexBase+=p.count;g.dispose();}
 const merged=new THREE.BufferGeometry();merged.setAttribute("position",new THREE.Float32BufferAttribute(positions,3));merged.setAttribute("normal",new THREE.Float32BufferAttribute(normals,3));merged.setAttribute("uv",new THREE.Float32BufferAttribute(uvs,2));merged.setIndex(indices);for(const g of groups)merged.addGroup(g.start,g.count,g.materialIndex);merged.computeBoundingSphere();return new THREE.Mesh(merged,materials);
}
function makeWarrior(color=0x466e62){
 const group=new THREE.Group(),armor=mat(color,.62,.12),skin=mat(0x9a704f),dark=mat(0x242e29),gold=mat(0xc69b59,.48,.42),chestMat=mat(0x9b8059,.55,.25),packMat=mat(0x493b2d),bootMat=mat(0x171d1b);
 const fixed=[];const addFixed=(geometry,material,x,y,z,rx=0,ry=0,rz=0)=>{const m=new THREE.Mesh(geometry,material);m.position.set(x,y,z);m.rotation.set(rx,ry,rz);fixed.push(m);return m;};
 addFixed(new THREE.CapsuleGeometry(.43,.78,3,7),armor,0,1.28,0);addFixed(new THREE.BoxGeometry(.72,.52,.13),chestMat,0,1.45,.39);addFixed(new THREE.SphereGeometry(.27,10,8),skin,0,2.15,0);addFixed(new THREE.TorusGeometry(.27,.115,6,10),gold,0,2.29,0,Math.PI/2);addFixed(new THREE.SphereGeometry(.16,8,6),mat(0x8e3e2d),0,2.36,0);addFixed(new THREE.BoxGeometry(.62,.72,.25),packMat,0,1.32,-.42);
 const armParts=[];for(const side of [-1,1]){const arm=new THREE.Mesh(new THREE.CapsuleGeometry(.14,.52,2,6),armor);arm.position.set(side*.52,1.34,.02);arm.rotation.z=side*.18;group.add(arm);armParts.push(arm);addFixed(new THREE.SphereGeometry(.22,7,6),gold,side*.53,1.68,.02);}
 addFixed(new THREE.CylinderGeometry(.43,.43,.12,10),gold,0,.88,0);
 const legParts=[];for(const side of [-1,1]){const leg=new THREE.Mesh(new THREE.CapsuleGeometry(.17,.58,2,6),dark);leg.position.set(side*.21,.39,0);group.add(leg);legParts.push(leg);addFixed(new THREE.BoxGeometry(.26,.16,.4),bootMat,side*.21,.12,.1);}
 addFixed(new THREE.CylinderGeometry(.12,.15,.58,7),mat(0x62462e),-.34,1.58,-.42,-.2,0,0);
 const merged=mergeStaticParts(fixed);merged.castShadow=true;merged.receiveShadow=true;group.add(merged);
 const weaponRig=new THREE.Group();const stock=new THREE.Mesh(new THREE.BoxGeometry(.16,.17,.82),mat(0x59432f));stock.position.set(.55,1.42,.12);weaponRig.add(stock);const barrel=new THREE.Mesh(new THREE.CylinderGeometry(.045,.045,.72,7),mat(0x343c3a,.45,.65));barrel.rotation.x=Math.PI/2;barrel.position.set(.55,1.47,.68);weaponRig.add(barrel);const grip=new THREE.Mesh(new THREE.BoxGeometry(.11,.28,.13),mat(0x3d3028));grip.position.set(.55,1.2,.32);weaponRig.add(grip);const scope=new THREE.Mesh(new THREE.CylinderGeometry(.075,.075,.32,8),mat(0x2b3431,.4,.65));scope.rotation.x=Math.PI/2;scope.position.set(.55,1.62,.23);weaponRig.add(scope);const secondBarrel=new THREE.Mesh(new THREE.CylinderGeometry(.035,.035,.68,7),mat(0x343c3a,.45,.65));secondBarrel.rotation.x=Math.PI/2;secondBarrel.position.set(.69,1.47,.68);weaponRig.add(secondBarrel);group.add(weaponRig);group.userData.weaponRig=weaponRig;group.userData.limbs={arms:armParts,legs:legParts};
 return group;
}
function initGame(){
 if(renderer)return;
 solidObstacles.length=0;
 const canvas=$("game-canvas");
 scene=new THREE.Scene();scene.background=new THREE.Color(0xb18b62);scene.fog=new THREE.FogExp2(0xb18b62,.0065);
 camera=new THREE.PerspectiveCamera(66,innerWidth/innerHeight,.1,260);
 renderer=new THREE.WebGLRenderer({canvas,antialias:false,powerPreference:"high-performance",alpha:false,stencil:false,depth:true,precision:"mediump"});
 renderer.outputColorSpace=THREE.SRGBColorSpace;renderer.toneMapping=THREE.ACESFilmicToneMapping;renderer.toneMappingExposure=1.08;
 clock=new THREE.Clock();
 scene.add(new THREE.HemisphereLight(0xffe8c8,0x39483b,2.25));
 const sun=new THREE.DirectionalLight(0xffd7a2,2.6);sun.name="sun-light";sun.position.set(-38,58,24);sun.castShadow=true;sun.shadow.mapSize.set(1024,1024);sun.shadow.camera.near=1;sun.shadow.camera.far=180;sun.shadow.camera.left=-85;sun.shadow.camera.right=85;sun.shadow.camera.top=85;sun.shadow.camera.bottom=-85;sun.shadow.bias=-.00025;scene.add(sun);
 const fill=new THREE.DirectionalLight(0xa9c4bd,.55);fill.position.set(40,22,-35);scene.add(fill);
 // Wide desert terrain and a playable fortified district.
 const groundMat=new THREE.MeshStandardMaterial({color:0xffffff,map:noiseTexture(126,174),roughness:1});const ground=new THREE.Mesh(new THREE.PlaneGeometry(arenaSize,arenaSize),groundMat);ground.rotation.x=-Math.PI/2;ground.receiveShadow=true;scene.add(ground);
 const innerGround=new THREE.Mesh(new THREE.PlaneGeometry(76,76),mat(0xa88a61));innerGround.rotation.x=-Math.PI/2;innerGround.position.y=.012;innerGround.receiveShadow=true;scene.add(innerGround);
 const ridgeItems=[];for(let i=0;i<54;i++){const a=i/54*Math.PI*2,r=94+(i%5)*5;ridgeItems.push({x:Math.cos(a)*r,y:5+(i%4)*1.8,z:Math.sin(a)*r,ry:-a,sx:5+(i%4)*2,sy:8+(i%6)*2,sz:5+(i%3)*2});}const ridges=instanced(new THREE.ConeGeometry(1,1,5),mat(0x6e6552),ridgeItems,false);ridges.userData.foliage=true;
 // Main roads and courtyard stonework.
 const roadMat=mat(0x77654d),stoneMat=mat(0xc1a17a),darkStone=mat(0x66513c);
 const road=new THREE.Mesh(new THREE.PlaneGeometry(11,190),roadMat);road.rotation.x=-Math.PI/2;road.position.set(0,.025,0);scene.add(road);
 const crossRoad=new THREE.Mesh(new THREE.PlaneGeometry(190,10),roadMat);crossRoad.rotation.x=-Math.PI/2;crossRoad.position.set(0,.027,0);scene.add(crossRoad);
 for(const a of [Math.PI/4,-Math.PI/4,3*Math.PI/4,-3*Math.PI/4]){const lane=new THREE.Mesh(new THREE.PlaneGeometry(8,112),roadMat);lane.rotation.set(-Math.PI/2,0,a);lane.position.set(0,.029,0);scene.add(lane);}
 for(let i=-5;i<=5;i++){const tile=new THREE.Mesh(new THREE.BoxGeometry(7.1,.045,7.1),stoneMat);tile.position.set(i*7,.04,0);scene.add(tile);}
 // Fortified perimeter with bastions, battlements and gate.
 const wallMat=0x886747,trimMat=0xc39b68,roofMat=0x593f32;
 for(let i=-4;i<=4;i++){const x=i*10;if(Math.abs(x)>8){box(9,5,1.5,wallMat,x,2.5,-42);box(9,5,1.5,wallMat,x,2.5,42);addObstacle(x,-42,5.0);addObstacle(x,42,5.0);box(1.5,5,9,wallMat,-42,2.5,x);box(1.5,5,9,wallMat,42,2.5,x);addObstacle(-42,x,5.0);addObstacle(42,x,5.0);}}
 // Gatehouse with layered arch-like entrance.
 box(3,8,3,0x9b7651,-4.5,4,-41);box(3,8,3,0x9b7651,4.5,4,-41);box(12,.9,3,trimMat,0,7.5,-41);box(7,.55,3.5,roofMat,0,8.25,-41);
 for(const x of [-6,6]){box(3.4,10,4,0x987653,x,5,-40);box(4,.6,4.6,trimMat,x,10.3,-40);box(2.4,1.8,2.4,roofMat,x,11.2,-40);}
 // Dense but low-draw-call architectural district.
 const buildings=[[-25,-24,7,6],[-25,24,7,6],[25,-24,7,6],[25,24,7,6],[-12,-22,6,5],[13,-19,7,6],[-17,10,6,5],[17,14,7,6],[-2,29,8,5],[29,0,5,8],[-30,0,5,8],[0,-30,8,5]];
 for(const [x,z,w,d] of buildings){
  addObstacle(x,z,Math.max(w,d)*.58);
  box(w,4.6,d,0x987653,x,2.3,z);box(w+.55,.45,d+.55,trimMat,x,4.75,z);box(w*.58,1.4,d*.58,roofMat,x,5.65,z);
  for(const side of [-1,1]){box(.38,1.3,.38,trimMat,x+side*(w*.36),5.4,z+d*.36,null,false);}
  // Dark recessed windows on the street-facing facade.
  for(const wx of [-1,1])box(.72,1.15,.12,0x3c342a,x+wx*w*.22,2.5,z+d/2+.065,null,false);
 }
 // Pillars, low cover walls, market awnings and crates.
 for(const [x,z] of [[-15,-3],[15,2],[-5,15],[8,-25],[27,7],[-27,8],[0,19],[21,-8]]){addObstacle(x,z,1.05);box(1.25,3.2,1.25,trimMat,x,1.6,z);box(1.8,.3,1.8,wallMat,x,3.25,z);}
 for(const [x,z] of [[-8,-8],[9,8],[-25,2],[25,-3],[-4,27],[5,-27]]){addObstacle(x,z,2.5);box(4,.35,3,0x704936,x,2.8,z);box(.22,2.8,.22,0x4e392b,x-1.7,1.4,z-1.2);box(.22,2.8,.22,0x4e392b,x+1.7,1.4,z-1.2);box(.22,2.8,.22,0x4e392b,x-1.7,1.4,z+1.2);box(.22,2.8,.22,0x4e392b,x+1.7,1.4,z+1.2);}
 for(const [x,z] of [[-19,-10],[18,-13],[-20,20],[20,22],[-5,-17],[6,17]]){addObstacle(x,z,1.05);box(1.2,1.1,1.2,0x765239,x,0.55,z);box(.9,.9,.9,0x9b7149,x+.65,.45,z+.2);}
 // Instanced palms, scrub, rocks and dunes: high visual density with few draw calls.
 const palms=[],rocks=[],shrubs=[],dunePatches=[];
 for(let i=0;i<110;i++){const a=i*2.399963,r=72+(i%12)*2.1,x=Math.cos(a)*r,z=Math.sin(a)*r;palms.push({x,y:2.4,z,ry:a,sx:.8+(i%4)*.12,sy:.9+(i%5)*.1,sz:.8+(i%4)*.12});}
 const palmTrunks=instanced(new THREE.CylinderGeometry(.16,.3,4.8,6),mat(0x69472f),palms,false);palmTrunks.userData.foliage=true;
 const fronds=[];for(const p of palms){for(let j=0;j<5;j++){const a=j*Math.PI*2/5;fronds.push({x:p.x+Math.cos(a)*.9,y:5.1,z:p.z+Math.sin(a)*.9,ry:a,rx:-.25,sx:.65,sy:.12,sz:.22});}}
 const palmLeaves=instanced(new THREE.ConeGeometry(.85,2.5,5),mat(0x536b43),fronds,false);palmLeaves.userData.foliage=true;
 for(let i=0;i<360;i++){const a=i*2.17,r=66+(i%19)*1.25;rocks.push({x:Math.cos(a)*r,y:.25,z:Math.sin(a)*r,ry:a,sx:.5+(i%5)*.22,sy:.25+(i%3)*.18,sz:.5+(i%4)*.2});}
 const rockMesh=instanced(new THREE.DodecahedronGeometry(.8,0),mat(0x8c7458),rocks,false);rockMesh.userData.foliage=true;
 for(let i=0;i<260;i++){const a=i*1.73,r=68+(i%17)*1.25;shrubs.push({x:Math.cos(a)*r,y:.45,z:Math.sin(a)*r,ry:a,sx:.7+(i%3)*.25,sy:.5+(i%4)*.12,sz:.7+(i%3)*.2});}
 const shrubMesh=instanced(new THREE.IcosahedronGeometry(.7,0),mat(0x5a6941),shrubs,false);shrubMesh.userData.foliage=true;
 // Four playable outer districts: palace quarter, bazaar lanes, oasis and watch-post.
 const districtBlocks=[
  [-62,-54,16,12,0x9c7954],[-42,-64,12,16,0x896747],[-68,-28,14,12,0xa17b52],
  [58,-58,15,12,0x9a714d],[72,-34,12,15,0x896747],[52,-22,13,11,0xa17b52],
  [-62,48,15,12,0x92704e],[-42,65,12,15,0xa17b52],[-70,25,12,15,0x896747],
  [60,48,16,12,0x9b7651],[43,67,12,14,0x896747],[72,24,13,13,0xa17b52]
 ];
 for(const [x,z,w,d,col] of districtBlocks){addObstacle(x,z,Math.max(w,d)*.55);box(w,5,d,col,x,2.5,z);box(w+.5,.45,d+.5,trimMat,x,5.15,z);box(w*.55,1.2,d*.55,roofMat,x,5.95,z);}
 // Bazaar stalls and fabric canopies create cover without sealing every passage.
 for(const [x,z,col] of [[-54,-10,0x9b4934],[-35,42,0x3f7666],[42,-42,0xb28a4d],[57,12,0x9b4934],[-58,68,0x3f7666],[30,58,0xb28a4d]]){
  box(5,.25,4,0x65462f,x,2.5,z);box(.16,2.5,.16,0x49372b,x-2.2,1.25,z-1.6);box(.16,2.5,.16,0x49372b,x+2.2,1.25,z-1.6);box(.16,2.5,.16,0x49372b,x-2.2,1.25,z+1.6);box(.16,2.5,.16,0x49372b,x+2.2,1.25,z+1.6);const canopy=box(5.2,.16,4.2,col,x,2.65,z,null,false);canopy.userData.foliage=true;
 }
 // Four watchtowers and broken colonnades provide readable silhouettes and combat cover.
 for(const [x,z] of [[-82,-2],[82,-2],[-4,-82],[-4,82]]){addObstacle(x,z,2.3);box(4,8,4,0x806448,x,4,z);box(5,.5,5,trimMat,x,8.25,z);box(2.4,1.5,2.4,roofMat,x,9.2,z);}
 for(const [x,z] of [[-48,-42],[-48,42],[48,-42],[48,42]]){box(9,.35,1,0x806448,x,1.2,z);box(.45,3,.45,trimMat,x-4,1.5,z);box(.45,3,.45,trimMat,x+4,1.5,z);box(9,.3,1,0x806448,x,3,z);}
 // Open oasis basin and a low ruined aqueduct landmark.
 const oasis=new THREE.Mesh(new THREE.CircleGeometry(10,24),new THREE.MeshStandardMaterial({color:0x477d7a,roughness:.28,metalness:.12}));oasis.rotation.x=-Math.PI/2;oasis.position.set(62,.035,4);scene.add(oasis);
 for(let i=0;i<8;i++){const a=i*Math.PI/4;const reed=box(.18,1.2,.18,0x536b43,62+Math.cos(a)*11,.6,4+Math.sin(a)*11,null,false);reed.userData.foliage=true;}
 for(let x=-78;x<=78;x+=13){if(Math.abs(x)<28)continue;box(1.2,3.5,1.2,0x806448,x,1.75,-78);box(1.2,3.5,1.2,0x806448,x,1.75,78);}
 // A raised palace terrace, reached through two open approaches.
 box(26,.8,20,0x806448,-62,0.35,4);box(18,5,2,0x9b7651,-62,3.1,-5);box(2,7,14,0x9b7651,-72,3.5,4);box(2,7,14,0x9b7651,-52,3.5,4);
 // A stepped stone well anchors the central courtyard as a recognisable landmark.
 addObstacle(0,0,4.5);
 const wellBase=new THREE.Mesh(new THREE.CylinderGeometry(4.4,4.8,.65,12),mat(0x806448));wellBase.position.set(0,.32,0);wellBase.castShadow=true;wellBase.receiveShadow=true;scene.add(wellBase);
 const wellRim=new THREE.Mesh(new THREE.TorusGeometry(3.75,.42,8,16),mat(0xc5a477,.62,.12));wellRim.rotation.x=Math.PI/2;wellRim.position.y=.72;wellRim.castShadow=true;scene.add(wellRim);
 const wellWater=new THREE.Mesh(new THREE.CircleGeometry(3.35,20),new THREE.MeshStandardMaterial({color:0x416d70,roughness:.24,metalness:.22}));wellWater.rotation.x=-Math.PI/2;wellWater.position.y=.67;scene.add(wellWater);
 for(let i=0;i<8;i++){const a=i*Math.PI/4;const step=new THREE.Mesh(new THREE.BoxGeometry(1.4,.25,.72),mat(0xa88b68));step.position.set(Math.cos(a)*3.55,.3,Math.sin(a)*3.55);step.rotation.y=-a;scene.add(step);}
 for(let i=0;i<26;i++){const a=i*2.4,r=57+(i%5)*2;dunePatches.push({x:Math.cos(a)*r,y:-.55,z:Math.sin(a)*r,ry:a,sx:5+(i%4)*2,sy:1.1+(i%3)*.4,sz:3+(i%4)});}
 instanced(new THREE.SphereGeometry(1,10,6),mat(0xc49b68),dunePatches,false);
 // Decorative standards along the main approach.
 for(const side of [-1,1])for(let z=-30;z<=30;z+=15){box(.12,5,.12,0x49372b,side*8,2.5,z,null,false);const flag=box(1.5,.85,.06,side===-1?0x9b422e:0x35634f,side*8.7,4.3,z,null,false);flag.rotation.y=side*.12;}
 flushBoxes();player=makeWarrior(0x426a61);player.position.set(0,0,22);scene.add(player);
 camera.position.set(0,5,29);camera.lookAt(0,1,18);
 applyGraphics();
}
function clearBots(){for(const b of bots)scene.remove(b.mesh);bots=[];for(const s of shots)scene.remove(s.mesh);shots=[];}
function spawnBots(){
 clearBots();const count=training?5:10;
 for(let i=0;i<count;i++){
   const a=i/count*Math.PI*2,r=24+Math.random()*20;
   const mesh=makeWarrior([0x914f3d,0x71614b,0x67534a][i%3]);
   mesh.scale.setScalar(.92);mesh.position.set(Math.cos(a)*r,0,Math.sin(a)*r-2);scene.add(mesh);
   bots.push({mesh,hp:training?70:100,speed:training?1.65:1.8+Math.random()*.55,attack:0,phase:Math.random()*6,alive:true});
 }
}
function startMatch(isTraining=false){
 training=isTraining;initGame();startAmbient();$("panel-backdrop").classList.add("hidden");$("game-screen").classList.remove("hidden");$("match-result").classList.add("hidden");
 health=100;killsThisMatch=0;fireCooldown=0;damageCooldown=0;playerYaw=0;playerPitch=0;aiming=false;playerVelocityY=0;onGround=true;lastFrameAt=0;frameAccumulator=0;weaponIndex=0;ammo=getWeapon().mag;reserveAmmo=120;reloading=false;reloadTimer=0;updateWeaponHud();player.position.set(0,0,22);player.rotation.y=0;horizontalVelocity.set(0,0,0);joystick.x=0;joystick.y=0;firing=false;sprinting=false;resetStick();
 $("kill-count").textContent=devanagari(0);$("health-fill").style.width="100%";$("health-text").textContent="१००";
 $("mode-label").textContent=training?"अभ्यास-भूमि":"मरु-दुर्ग · रण";
 $("move-hint").textContent=innerWidth<700?"बाईं ओर चलें · दाईं ओर दृष्टि घुमाएँ":"W A S D — चलें · माउस — लक्ष्य · १–४ अस्त्र · R पुनः सज्ज";
 spawnBots();running=true;matchStart=performance.now();fpsFrames=0;fpsTime=0;fpsValue=0;fpsStamp=performance.now();qualityCheck=0;clock.getDelta();cancelAnimationFrame(animationId);animate();
 if(innerWidth>700&&canvasPointerLockSupported())$("game-canvas").requestPointerLock?.();
}
function canvasPointerLockSupported(){return "requestPointerLock" in $("game-canvas");}
function endMatch(victory){
 if(!running)return;running=false;firing=false;sprinting=false;aiming=false;horizontalVelocity.set(0,0,0);resetStick();stopAmbient();cancelAnimationFrame(animationId);document.exitPointerLock?.();
 const rewardXP=training?Math.max(20,killsThisMatch*12):victory?140+killsThisMatch*12:40+killsThisMatch*8;
 const rewardCoins=training?Math.max(8,killsThisMatch*5):victory?100+killsThisMatch*8:25+killsThisMatch*5;
 if(!training){save.matches++;save.missions.matches=Math.min(1,save.missions.matches+1);save.kills+=killsThisMatch;if(victory)save.wins++;save.missions.kills=Math.min(5,save.missions.kills+killsThisMatch);save.coins+=rewardCoins;gainXP(rewardXP);}
 else{save.coins+=rewardCoins;gainXP(rewardXP);}
 persist();
 $("result-kicker").textContent=training?"अभ्यास पूर्ण":"रण समाप्त";
 $("result-title").textContent=victory?"विजय!":training?"अभ्यास पूर्ण":"पुनः प्रयास करो";
 $("result-copy").textContent=victory?"निर्धारित विरोधियों को परास्त कर तुमने अपना पराक्रम सिद्ध किया।":training?"अभ्यास से तुम्हारा कौशल और दृढ़ हुआ।":"इस बार रणभूमि ने तुम्हारी परीक्षा ली। फिर से सज्ज होकर लौटो।";
 $("reward-xp").textContent=`+${devanagari(rewardXP)}`;$("reward-coins").textContent=`+${devanagari(rewardCoins)}`;$("reward-kills").textContent=devanagari(killsThisMatch);
 $("match-result").classList.remove("hidden");
}
function shoot(){
 if(!running||fireCooldown>0||reloading)return;const w=getWeapon();if(ammo<=0){reloadWeapon();return;}fireCooldown=w.rate;ammo--;updateWeaponHud();playTone(w.kind==="shotgun"?105:w.kind==="marksman"?75:145,w.kind==="shotgun"?.16:.075,"sawtooth",w.kind==="marksman"?28:45);
 const origin=camera.position.clone();const base=camera.getWorldDirection(new THREE.Vector3());const pellets=w.kind==="shotgun"?7:1;let anyHit=false;
 for(let p=0;p<pellets;p++){
  const dir=base.clone().add(new THREE.Vector3((Math.random()-.5)*w.spread,(Math.random()-.5)*w.spread,(Math.random()-.5)*w.spread)).normalize();
  const ray=new THREE.Raycaster(origin,dir,0,w.range);const targets=[];for(const b of bots)if(b.alive)targets.push(b.mesh);const hits=ray.intersectObjects(targets,true);let end=origin.clone().addScaledVector(dir,w.range);
  if(hits.length){const hit=hits[0];end.copy(hit.point);const bot=bots.find(b=>b.alive&&(hit.object===b.mesh||b.mesh.children.includes(hit.object)||b.mesh.getObjectById(hit.object.id)));if(bot){bot.hp-=w.damage;if(bot.hp<=0){bot.alive=false;scene.remove(bot.mesh);killsThisMatch++;$("kill-count").textContent=devanagari(killsThisMatch);playTone(680,.045,"triangle",420);if(killsThisMatch>=(training?5:10)){endMatch(true);return;}}anyHit=true;}}
  const points=[origin.clone().add(base.clone().multiplyScalar(1.1)),end];const geom=new THREE.BufferGeometry().setFromPoints(points);const line=new THREE.Line(geom,new THREE.LineBasicMaterial({color:w.kind==="marksman"?0xfff1b6:0xffc879,transparent:true,opacity:.82}));scene.add(line);shots.push({mesh:line,life:.065});
 }
 if(anyHit){const f=$("hit-flash");f.style.opacity=".08";setTimeout(()=>f.style.opacity="0",55);}
}
function update(dt){
 if(!running)return;fireCooldown=Math.max(0,fireCooldown-dt);damageCooldown=Math.max(0,damageCooldown-dt);if(reloading){reloadTimer-=dt;if(reloadTimer<=0){const w=getWeapon(),take=Math.min(w.mag-ammo,reserveAmmo);ammo+=take;reserveAmmo-=take;reloading=false;updateWeaponHud();playTone(620,.05,"triangle",760);}}
 const forward=(keys.KeyW||keys.ArrowUp?1:0)-(keys.KeyS||keys.ArrowDown?1:0)-joystick.y;
 const strafe=(keys.KeyD||keys.ArrowRight?1:0)-(keys.KeyA||keys.ArrowLeft?1:0)+joystick.x;
 const inputLength=Math.hypot(forward,strafe);const hasInput=inputLength>.08;
 const move=new THREE.Vector3(Math.sin(playerYaw)*forward+Math.cos(playerYaw)*strafe,0,-Math.cos(playerYaw)*forward+Math.sin(playerYaw)*strafe);
 if(hasInput)move.multiplyScalar(1/Math.max(1,inputLength));
 const sprintingNow=sprinting||keys.ShiftLeft||keys.ShiftRight;const speed=sprintingNow?11.2:7.6;
 const targetVX=move.x*speed,targetVZ=move.z*speed;const response=1-Math.exp(-(hasInput?15:11)*dt);
 horizontalVelocity.x=THREE.MathUtils.lerp(horizontalVelocity.x,targetVX,response);horizontalVelocity.z=THREE.MathUtils.lerp(horizontalVelocity.z,targetVZ,response);
 if(!hasInput&&horizontalVelocity.lengthSq()<.012)horizontalVelocity.set(0,0,0);
 const moving=horizontalVelocity.lengthSq()>.12;
 if(moving){stepTimer+=dt;if(stepTimer>.42){stepTimer=0;playTone(82,.035,"triangle",54);}}
 // Resolve each axis separately so the player can slide along walls instead of getting stuck.
 const nextX=THREE.MathUtils.clamp(player.position.x+horizontalVelocity.x*dt,-88,88);
 if(!solidObstacles.some(o=>Math.hypot(nextX-o.x,player.position.z-o.z)<o.r+.72))player.position.x=nextX;else horizontalVelocity.x=0;
 const nextZ=THREE.MathUtils.clamp(player.position.z+horizontalVelocity.z*dt,-88,88);
 if(!solidObstacles.some(o=>Math.hypot(player.position.x-o.x,nextZ-o.z)<o.r+.72))player.position.z=nextZ;else horizontalVelocity.z=0;
 playerVelocityY-=18*dt;player.position.y+=playerVelocityY*dt;if(player.position.y<=0){player.position.y=0;playerVelocityY=0;onGround=true;}player.rotation.y=Math.PI-playerYaw;moveClock+=dt*(moving?(sprintingNow?13:9):2);if(player.userData.limbs){const swing=moving?Math.sin(moveClock)*.62:0;player.userData.limbs.legs[0].rotation.x=swing;player.userData.limbs.legs[1].rotation.x=-swing;player.userData.limbs.arms[0].rotation.x=-swing*.55;player.userData.limbs.arms[1].rotation.x=swing*.55;}
 if(firing)shoot();
 // Third-person camera follows the warrior with a responsive, frame-rate-independent spring.
 const camDistance=aiming?4.8:7,camHeight=aiming?4.1:5.1;const desired=new THREE.Vector3(player.position.x+Math.sin(playerYaw)*camDistance,player.position.y+camHeight,player.position.z+Math.cos(playerYaw)*camDistance);
 camera.position.lerp(desired,1-Math.exp(-12*dt));
 const target=player.position.clone().add(new THREE.Vector3(0,1.35+playerPitch*7,0)).add(new THREE.Vector3(Math.sin(playerYaw),0,-Math.cos(playerYaw)).multiplyScalar(7));
 camera.lookAt(target);const desiredFov=(activeGraphics().fov||70)*(aiming?.82:1);if(Math.abs(camera.fov-desiredFov)>.2){camera.fov=THREE.MathUtils.lerp(camera.fov,desiredFov,Math.min(1,dt*12));camera.updateProjectionMatrix();}zoneClock+=dt;if(zoneClock>.6){zoneClock=0;const x=player.position.x,z=player.position.z;let zone="दुर्ग-नगर";if(x>35&&z> -18&&z<25)zone="नील-जलाशय";else if(x< -42&&z<18)zone="राज-प्रासाद";else if(Math.abs(x)>35||Math.abs(z)>48)zone="मरु-बाजार";else if(Math.hypot(x,z)<30)zone="मध्य-दुर्ग";$("mode-label").textContent=training?"अभ्यास-भूमि":zone;}
 // Opponents pursue and strike at close range.
 for(const b of bots){
   if(!b.alive)continue;b.phase+=dt*5;if(b.mesh.userData.limbs){const swing=Math.sin(b.phase)*.42;b.mesh.userData.limbs.legs[0].rotation.x=swing;b.mesh.userData.limbs.legs[1].rotation.x=-swing;b.mesh.userData.limbs.arms[0].rotation.x=-swing*.5;b.mesh.userData.limbs.arms[1].rotation.x=swing*.5;}
   const delta=player.position.clone().sub(b.mesh.position);delta.y=0;const dist=delta.length();
   if(dist>11){delta.normalize();const steer=delta.clone();for(const o of solidObstacles){const away=new THREE.Vector3(b.mesh.position.x-o.x,0,b.mesh.position.z-o.z);const d=away.length(),limit=o.r+1.5;if(d>0&&d<limit)steer.addScaledVector(away.normalize(),(limit-d)*.9);}if(steer.lengthSq()<.001)steer.copy(delta);steer.normalize();const next=b.mesh.position.clone().addScaledVector(steer,b.speed*dt);if(!solidObstacles.some(o=>Math.hypot(next.x-o.x,next.z-o.z)<o.r+1.0))b.mesh.position.copy(next);b.mesh.rotation.y=Math.atan2(steer.x,steer.z);}
   else if(b.attack<=0&&damageCooldown<=0){b.attack=1.15+Math.random()*.55;damageCooldown=.48;const from=b.mesh.position.clone().add(new THREE.Vector3(0,1.45,0)),to=player.position.clone().add(new THREE.Vector3(0,1.1,0));const tracer=new THREE.Line(new THREE.BufferGeometry().setFromPoints([from,to]),new THREE.LineBasicMaterial({color:0xe07b54,transparent:true,opacity:.72}));scene.add(tracer);shots.push({mesh:tracer,life:.1});health=Math.max(0,health-(training?3:5));$("health-fill").style.width=`${health}%`;$("health-text").textContent=devanagari(health);$("hit-flash").style.opacity=".16";setTimeout(()=>$("hit-flash").style.opacity="0",80);playTone(95,.035,"triangle",60);}
   b.attack-=dt;
 }
 for(let i=shots.length-1;i>=0;i--){const s=shots[i];s.life-=dt;if(s.life<=0){scene.remove(s.mesh);s.mesh.geometry.dispose();s.mesh.material.dispose();shots.splice(i,1);}}
 if(health<=0){endMatch(false);return;}
}
function animate(now=performance.now()){
 if(!running)return;animationId=requestAnimationFrame(animate);
 const frameMs=lastFrameAt?now-lastFrameAt:16.7;lastFrameAt=now;
 // Fixed simulation steps keep movement and collision consistent on 30–120 Hz displays.
 frameAccumulator=Math.min(frameAccumulator+Math.min(frameMs/1000,.1),.1);
 const fixedStep=1/60;let steps=0;while(frameAccumulator>=fixedStep&&steps<6){update(fixedStep);frameAccumulator-=fixedStep;steps++;if(!running)return;}
 renderer.render(scene,camera);fpsFrames++;fpsTime=now-fpsStamp;if(fpsTime>=500){fpsValue=Math.round(fpsFrames*1000/fpsTime);const el=$("fps-counter");if(el)el.textContent=`${devanagari(fpsValue)} FPS · ${frameMs.toFixed(1)} ms · ${devanagari(renderer.info.render.calls)} कॉल`;fpsFrames=0;fpsStamp=now;}adaptiveQuality(Math.min(frameMs/1000,.1));
}
$("play-button").onclick=()=>startMatch(false);$("training-button").onclick=()=>startMatch(true);
$("reload-button").onclick=reloadWeapon;$("weapon-select").onchange=e=>chooseWeapon(Number(e.target.value));
$("game-settings").onclick=()=>openPanel("settings");$("exit-game").onclick=()=>endMatch(false);$("continue-button").onclick=()=>{$("game-screen").classList.add("hidden");$("match-result").classList.add("hidden");};
const fireButton=$("fire-button"),jumpButton=$("jump-button"),aimButton=$("aim-button"),sprintButton=$("sprint-button");
function bindHold(button,down,up){if(!button)return;button.addEventListener("pointerdown",e=>{e.preventDefault();button.setPointerCapture?.(e.pointerId);down(e);});const release=e=>{if(e) e.preventDefault?.();up(e);};button.addEventListener("pointerup",release);button.addEventListener("pointercancel",release);button.addEventListener("lostpointercapture",release);}
bindHold(fireButton,()=>{firing=true;shoot();},()=>{firing=false;});
bindHold(aimButton,()=>{aiming=true;},()=>{aiming=false;});
bindHold(sprintButton,()=>{sprinting=true;},()=>{sprinting=false;});
jumpButton.addEventListener("pointerdown",e=>{e.preventDefault();if(running&&onGround){playerVelocityY=7.2;onGround=false;}});
$("reload-button").addEventListener("pointerdown",e=>{e.preventDefault();reloadWeapon();});
addEventListener("keydown",e=>{keys[e.code]=true;if(e.code==="Space"){e.preventDefault();if(running&&onGround){playerVelocityY=7.2;onGround=false;}}if(e.code==="Escape"&&running){document.exitPointerLock?.();}});
addEventListener("keyup",e=>{keys[e.code]=false;if(e.code==="ShiftLeft"||e.code==="ShiftRight")sprinting=false;});
addEventListener("keydown",e=>{if(!running)return;if(e.code==="KeyR")reloadWeapon();if(e.code.startsWith("Digit")&&Number(e.code.slice(5))>=1&&Number(e.code.slice(5))<=4)chooseWeapon(Number(e.code.slice(5))-1);});
$("game-canvas").addEventListener("click",()=>{if(running&&innerWidth>700&&document.pointerLockElement!==$("game-canvas"))$("game-canvas").requestPointerLock?.();});
$("game-canvas").addEventListener("mousedown",e=>{if(running&&e.button===0)shoot();if(e.button===2)aiming=true;});
addEventListener("mouseup",e=>{if(e.button===2)aiming=false;});
addEventListener("mousemove",e=>{if(running&&document.pointerLockElement===$("game-canvas")){playerYaw-=e.movementX*.0022;playerPitch=THREE.MathUtils.clamp(playerPitch-e.movementY*.0015,-.48,.48);}});
$("game-canvas").addEventListener("contextmenu",e=>e.preventDefault());
const lookZone=$("look-zone");
lookZone.addEventListener("pointerdown",e=>{if(!running)return;e.preventDefault();if(lookPointer!==null)return;lookPointer=e.pointerId;lastLookX=e.clientX;lastLookY=e.clientY;lookZone.setPointerCapture(e.pointerId);});
lookZone.addEventListener("pointermove",e=>{if(lookPointer!==e.pointerId)return;e.preventDefault();const dx=e.clientX-lastLookX,dy=e.clientY-lastLookY;const sensitivity=Math.min(1,innerWidth/420);playerYaw-=dx*.0062*sensitivity;playerPitch=THREE.MathUtils.clamp(playerPitch-dy*.0042*sensitivity,-.52,.52);lastLookX=e.clientX;lastLookY=e.clientY;});
function releaseLook(e){if(e&&lookPointer===e.pointerId)lookPointer=null;}
lookZone.addEventListener("pointerup",releaseLook);lookZone.addEventListener("pointercancel",releaseLook);lookZone.addEventListener("lostpointercapture",releaseLook);
const joy=$("joystick"),knob=$("stick-knob");
joy.addEventListener("pointerdown",e=>{if(!running)return;e.preventDefault();if(joystick.pointer!==null)return;joystick.active=true;joystick.pointer=e.pointerId;joy.setPointerCapture(e.pointerId);moveStick(e);});
joy.addEventListener("pointermove",e=>{if(joystick.active&&joystick.pointer===e.pointerId){e.preventDefault();moveStick(e);}});
function moveStick(e){const r=joy.getBoundingClientRect(),cx=r.left+r.width/2,cy=r.top+r.height/2;let dx=e.clientX-cx,dy=e.clientY-cy;const max=Math.min(r.width,r.height)*.34,len=Math.hypot(dx,dy);if(len>max){dx=dx/len*max;dy=dy/len*max;}const distance=Math.hypot(dx,dy)/max;const dead=.10;const magnitude=distance<dead?0:(distance-dead)/(1-dead);const angle=Math.atan2(dy,dx);joystick.x=Math.cos(angle)*magnitude;joystick.y=Math.sin(angle)*magnitude;knob.style.transform=`translate(${dx}px,${dy}px)`;}
function resetStick(){joystick.active=false;joystick.pointer=null;joystick.x=0;joystick.y=0;if(knob)knob.style.transform="translate(0,0)";}
joy.addEventListener("pointerup",e=>{if(joystick.pointer===e.pointerId)resetStick();});joy.addEventListener("pointercancel",resetStick);joy.addEventListener("lostpointercapture",resetStick);
addEventListener("resize",()=>{if(renderer&&camera){camera.aspect=innerWidth/innerHeight;camera.updateProjectionMatrix();applyGraphics();}});
$("loading").style.opacity="0";setTimeout(()=>$("loading").remove(),550);
