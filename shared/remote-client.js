/* BKK11-Miraibu · ตัวเชื่อมรีโมทมือถือ (ทุกเกมใช้ร่วมกัน)
   ช่องทางสื่อสารเลือกอัตโนมัติ (ดู shared/net.js): server.py ในเครื่อง หรือ Supabase ออนไลน์ (แยกด้วยรหัสห้อง)
   ถ้าไม่มีทั้งสองแบบ เกมยังเล่นได้ตามปกติ แค่ไม่มีรีโมท

   ใช้ในหน้าเกม (โหลด config.js, net.js ก่อนไฟล์นี้):
     Remote.init({
       id:'ชื่อเกม',                       // ตรงกับ id ใน shared/games.js
       lobby:()=>'ข้อความเล็ก'|false,     // (ไม่บังคับ) ตอนไหนให้จอใหญ่โชว์หน้ากลางเมื่อมีมือถือเชื่อมอยู่ ('' = โชว์ไม่มีข้อความ, false = ไม่โชว์)
       getUi:()=>({title,info,msg,cards,teams,buttons,foot,minus,timer,settings}),   // หน้าตารีโมท
       onCmd:c=>{...},                    // คำสั่งจากรีโมท {cmd,arg}
       needsSound:true,                   // มีเสียง → ขึ้นป้ายให้แตะจอ 1 ครั้งถ้าเบราว์เซอร์ยังไม่ให้เล่นเสียง
       qrEl, txtEl,                       // (ไม่บังคับ) ที่แสดง QR
     });
     Remote.push();                       // เรียกเมื่อสถานะเปลี่ยน เพื่อส่งให้รีโมททันที
   คำสั่ง goto (สลับเกม), vol, mute จัดการให้เองในนี้ */
(function(){
  const base=new URL('../',document.currentScript.src);   // รากโปรเจค
  const R=window.Remote={base,ok:false,phone:false};
  let last=0,busy=false,cfg={};
  const el=(t,c,x)=>{const e=document.createElement(t);if(c)e.className=c;if(x!=null)e.textContent=x;return e};

  R.url=()=>Net.remoteUrl(base);
  R.push=()=>{if(!R.ok)return;
    let ui={};try{ui=cfg.getUi?cfg.getUi():{}}catch(_){}
    Net.postState({game:cfg.id,vol:window.Vol?Vol.state():undefined,...ui}).catch(()=>{})};
  R.send=(cmd,arg)=>Net.postCmd(cmd,arg).catch(()=>{});

  async function poll(){
    if(busy)return;busy=true;
    try{
      const r=await Net.getCmds(last);last=r.last;
      R.phone=r.remote!=null&&r.remote<5;                       // มีมือถือรีโมทเชื่อมอยู่ไหม
      if(window.Lobby&&cfg.lobby)Lobby.auto(R.phone&&cfg.lobby()!==false&&cfg.lobby()!=null,cfg.lobby()||'');
      for(const c of r.cmds){
        if(c.cmd==='goto'){location.href=new URL(c.arg||'',base).href;return}   // สลับเกมทันที
        if(c.cmd==='vol'){window.Vol&&Vol.set(c.arg);continue}                   // ปรับเสียงกลาง
        if(c.cmd==='mute'){window.Vol&&Vol.toggleMute();continue}
        cfg.onCmd&&cfg.onCmd(c);
      }
    }catch(_){}
    busy=false;
  }

  R.fillQr=(qrEl,txtEl)=>{
    const url=R.url();
    try{const q=qrcode(0,'M');q.addData(url);q.make();qrEl.innerHTML=q.createSvgTag({cellSize:4,margin:0,scalable:true});qrEl.hidden=false}catch(_){}
    const t=[el('b','','สแกนเพื่อคุมเกมด้วยมือถือ'),el('div','u',url)];
    if(Net.mode==='cloud')t.push(el('div','','รหัสห้อง '+Net.room+' · ใช้อินเทอร์เน็ตได้เลย ไม่ต้องอยู่ wifi เดียวกัน'));
    else t.push(el('div','','ต้องอยู่ wifi เดียวกัน'));
    txtEl.replaceChildren(...t);
  };

  /* หลังสลับเกมด้วยรีโมท หน้าใหม่ยังไม่เคยถูกแตะ → เบราว์เซอร์ไม่ยอมให้เสียงดัง ต้องแตะจอ 1 ครั้ง */
  function gate(){
    if(!cfg.needsSound||!navigator.userActivation||navigator.userActivation.hasBeenActive)return;
    const st=document.createElement('style');
    st.textContent=`.snd-gate{position:fixed;inset:0;z-index:200;display:grid;place-items:center;background:rgba(20,10,50,.82);color:#fff;font-family:Mitr,ui-rounded,system-ui,sans-serif;font-weight:600;
      font-size:clamp(24px,5vw,56px);text-align:center;cursor:pointer;animation:sgin .3s ease-out}
      .snd-gate div{display:flex;flex-direction:column;align-items:center;gap:.4em;padding:0 5vw;text-wrap:balance}
      .snd-gate svg{width:2.2em;height:2.2em;fill:#ffd23f;animation:sgb .8s ease-in-out infinite alternate}
      @keyframes sgin{from{opacity:0}}@keyframes sgb{to{transform:scale(1.18) rotate(-6deg)}}`;
    const g=el('div','snd-gate');g.setAttribute('role','button');
    g.innerHTML='<div><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M4 9.5v5h3.6l4.7 3.9a.8.8 0 0 0 1.3-.6V6.2a.8.8 0 0 0-1.3-.6L7.6 9.5H4Zm12.4-1.7a5.2 5.2 0 0 1 0 8.4l-1-1.4a3.4 3.4 0 0 0 0-5.6l1-1.4Zm2.3-2.4a8.2 8.2 0 0 1 0 13.2l-1-1.4a6.4 6.4 0 0 0 0-10.4l1-1.4Z"/></svg><span>แตะจอ 1 ครั้งเพื่อเปิดเสียง</span></div>';
    const off=e=>{if(e)e.stopPropagation();g.remove();st.remove();removeEventListener('keydown',off);window.BGM&&BGM.kick();cfg.onUnlock&&cfg.onUnlock()};
    g.onclick=off;addEventListener('keydown',off);
    document.head.append(st);document.body.append(g);
  }

  R.init=async function(c){
    cfg=c;
    try{
      await Net.detect();
      if(Net.mode==='none')throw 0;
      if(Net.mode==='cloud')Net.initRoom('display');
      const r=await Net.getCmds(999999999999);last=r.last;   // ข้ามคำสั่งเก่า
      R.ok=true;
      if(c.qrEl&&c.txtEl)R.fillQr(c.qrEl,c.txtEl);
      setInterval(poll,Net.pollMs());setInterval(R.push,Net.pushMs());R.push();
      if(window.Vol)Vol.on(()=>R.push());
      gate();
    }catch(_){
      R.ok=false;
      if(c.txtEl)c.txtEl.textContent='อยากคุมด้วยมือถือ: รัน python3 server.py ที่โฟลเดอร์โปรเจค (หรือเปิดจากเว็บที่ deploy) แล้วเปิดหน้านี้ใหม่';
    }
  };
})();
