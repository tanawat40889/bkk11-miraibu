/* BKK11-Miraibu · ระดับเสียงกลาง (master volume) ใช้ร่วมกันทุกเสียง: เพลงพื้นหลัง, เพลงเกม, เอฟเฟกต์
   จำค่าไว้ในเครื่อง (สลับเกมแล้วค่าเดิมยังอยู่)
     Vol.get()      → 0..1 (0 ถ้าปิดเสียงอยู่)   Vol.pct() → 0..100
     Vol.set(0..100)   Vol.toggleMute()   Vol.on(fn)  (fn ถูกเรียกเมื่อค่าเปลี่ยน) */
(function(){
  const KEY='miraibu.vol';
  let st={v:70,m:false};
  try{const o=JSON.parse(localStorage.getItem(KEY)||'{}');if(typeof o.v==='number')st.v=o.v;st.m=!!o.m}catch(_){}
  const subs=[];
  const clamp=v=>Math.min(100,Math.max(0,Math.round(+v||0)));
  const save=()=>{try{localStorage.setItem(KEY,JSON.stringify(st))}catch(_){}};

  /* ป้ายบอกระดับเสียงบนจอใหญ่ (โผล่ชั่วคราวเมื่อมีการปรับ) */
  let toast=null,tt=0;
  function showToast(){
    if(!document.body)return;
    if(!toast){
      const css=document.createElement('style');
      css.textContent=`.vol-toast{position:fixed;left:50%;bottom:max(20px,4dvh);transform:translate(-50%,20px);z-index:300;display:flex;align-items:center;gap:.7em;padding:.5em 1.1em;border-radius:999px;
        background:rgba(20,10,50,.88);color:#fff;font:600 clamp(16px,2.4dvh + .8vw,30px)/1 Mitr,ui-rounded,system-ui,sans-serif;box-shadow:0 14px 28px -12px rgba(0,0,0,.7);opacity:0;pointer-events:none;transition:opacity .25s,transform .35s cubic-bezier(.16,1,.3,1)}
        .vol-toast.on{opacity:1;transform:translate(-50%,0)}
        .vol-toast svg{width:1.4em;height:1.4em;fill:#ffd23f}
        .vol-toast .bar{width:clamp(90px,14vw,220px);height:.55em;border-radius:99px;background:rgba(255,255,255,.22);overflow:hidden}
        .vol-toast .bar i{display:block;height:100%;width:var(--p,0%);background:#ffd23f;border-radius:99px;transition:width .15s}`;
      document.head.append(css);
      toast=document.createElement('div');toast.className='vol-toast';toast.setAttribute('role','status');document.body.append(toast);
    }
    const p=V.pct();
    toast.innerHTML=(p?'<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M4 9.5v5h3.6l4.7 3.9a.8.8 0 0 0 1.3-.6V6.2a.8.8 0 0 0-1.3-.6L7.6 9.5H4Zm12.4-1.7a5.2 5.2 0 0 1 0 8.4l-1-1.4a3.4 3.4 0 0 0 0-5.6l1-1.4Z"/></svg>'
      :'<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M4 9.5v5h3.6l4.7 3.9a.8.8 0 0 0 1.3-.6V6.2a.8.8 0 0 0-1.3-.6L7.6 9.5H4Zm11.6 1.1 1.4-1.4 1.8 1.8 1.8-1.8 1.4 1.4-1.8 1.8 1.8 1.8-1.4 1.4-1.8-1.8-1.8 1.8-1.4-1.4 1.8-1.8-1.8-1.8Z"/></svg>')
      +'<div class="bar"><i style="--p:'+p+'%"></i></div><span>'+(p?p+'%':'ปิดเสียง')+'</span>';
    toast.classList.add('on');clearTimeout(tt);tt=setTimeout(()=>toast.classList.remove('on'),1800);
  }

  function changed(quiet){save();subs.forEach(f=>{try{f(V.state())}catch(_){}});if(!quiet)showToast()}
  const V=window.Vol={
    get(){return st.m?0:st.v/100},
    pct(){return st.m?0:st.v},
    state(){return{v:st.v,m:st.m}},
    set(v){st.v=clamp(v);if(st.v>0)st.m=false;changed()},
    toggleMute(){st.m=!st.m;if(!st.m&&st.v===0)st.v=40;changed()},
    on(fn){subs.push(fn)},
  };
  addEventListener('storage',e=>{if(e.key===KEY){try{const o=JSON.parse(e.newValue||'{}');if(typeof o.v==='number')st.v=o.v;st.m=!!o.m;changed(true)}catch(_){}}});
})();
