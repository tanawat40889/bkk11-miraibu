/* BKK11-Miraibu · เพลงพื้นหลัง (BGM) จาก YouTube — เล่นต่อเนื่องในกิจกรรมที่ไม่มีเสียงของตัวเอง
     BGM.init({allow:()=>true})   allow() = ตอนนี้ให้เพลงพื้นหลังดังได้ไหม (เกมที่มีเสียงเอง คืน false ระหว่างเล่น)
     BGM.sync()                   เรียกเมื่อสถานะเกมเปลี่ยน เพื่อให้เพลงพื้นหลังหยุด/เล่นทันที
   ต้องโหลด shared/vol.js ก่อนไฟล์นี้
   - ระดับเสียงตาม Vol (ควบคุมจากรีโมท)  - จำตำแหน่งเพลงไว้ เมื่อสลับเกม (โหลดหน้าใหม่) เพลงเล่นต่อจากเดิม
   - YTReady(fn): ตัวโหลด YouTube API กลาง (ให้เกมที่ใช้ YouTube เองเรียกใช้ จะได้ไม่ชนกัน) */
(function(){
  const VID='XrC8tBMaF8w',KEY='miraibu.bgm';
  const q=[];let loading=false;
  window.YTReady=function(cb){
    if(window.YT&&YT.Player){cb();return}
    q.push(cb);
    if(loading)return;loading=true;
    const prev=window.onYouTubeIframeAPIReady;
    window.onYouTubeIframeAPIReady=()=>{try{prev&&prev()}catch(_){}q.splice(0).forEach(f=>{try{f()}catch(_){}})};
    const s=document.createElement('script');s.src='https://www.youtube.com/iframe_api';s.async=true;document.head.append(s);
  };

  let yt=null,ready=false,allow=()=>true,ramp=0,lastApplied=-1,rampEnd=0;
  const vol=()=>window.Vol?Vol.pct():70;
  const playing=()=>{if(!ready)return false;const s=yt.getPlayerState();return s===1||s===3};
  const should=()=>{try{return !!allow()&&vol()>0}catch(_){return false}};

  function rampTo(to,ms){
    clearInterval(ramp);rampEnd=Date.now()+ms;
    const from=lastApplied<0?0:lastApplied,t0=Date.now();
    ramp=setInterval(()=>{const p=Math.min((Date.now()-t0)/ms,1),v=Math.round(from+(to-from)*p);yt.setVolume(v);lastApplied=v;if(p>=1)clearInterval(ramp)},50);
  }
  function apply(){
    if(!ready)return;
    if(should()){
      if(!playing()){yt.setVolume(0);lastApplied=0;yt.playVideo();rampTo(vol(),900)}   // เล่นใหม่ → ค่อยๆ ดังขึ้น
      else if(Date.now()>rampEnd&&lastApplied!==vol()){yt.setVolume(vol());lastApplied=vol()}
    }else if(yt.getPlayerState()!==2){clearInterval(ramp);yt.pauseVideo();lastApplied=-1}
  }
  function savePos(){
    if(!playing())return;
    try{localStorage.setItem(KEY,JSON.stringify({t:yt.getCurrentTime(),ts:Date.now()}))}catch(_){}
  }
  function startAt(){
    try{const o=JSON.parse(localStorage.getItem(KEY)||'null');if(o&&Date.now()-o.ts<45000)return Math.max(0,Math.floor(o.t+(Date.now()-o.ts)/1000))}catch(_){}
    return 0;
  }

  window.BGM={
    init(cfg){
      allow=(cfg&&cfg.allow)||allow;
      const box=document.createElement('div');box.style.cssText='position:fixed;left:-9999px;top:0;width:200px;height:200px';
      const host=document.createElement('div');box.append(host);document.body.append(box);
      YTReady(()=>{
        yt=new YT.Player(host,{width:200,height:200,videoId:VID,playerVars:{playsinline:1,controls:0,rel:0,start:startAt()},
          events:{onReady:()=>{ready=true;yt.setVolume(0);apply()},
                  onStateChange:e=>{if(e.data===0&&should()){yt.seekTo(0);yt.playVideo()}},
                  onError:()=>{ready=false}}});
      });
      setInterval(apply,700);setInterval(savePos,1500);
      if(window.Vol)Vol.on(apply);
      const kick=()=>apply();
      addEventListener('pointerdown',kick);addEventListener('keydown',kick);   // ถูกบล็อกอัตโนมัติ → พอมีการแตะ/กดครั้งแรกก็เริ่มเล่น
    },
    sync(){apply()},
    status(){return ready?{state:yt.getPlayerState(),vol:yt.getVolume(),t:Math.round(yt.getCurrentTime())}:null},
    kick(){apply()},
  };
})();
