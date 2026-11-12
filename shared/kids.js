/* BKK11-Miraibu · ตัวช่วยกลาง: พื้นหลังลอย, confetti, ไอคอน */
(function(){
  const COL=['#ff4d6d','#ffd23f','#29b6f6','#34c77b','#a66bff','#ff9f1c','#ff6fae'];
  const still=()=>matchMedia('(prefers-reduced-motion:reduce)').matches;
  const rnd=(a,b)=>a+Math.random()*(b-a);

  const ICON={
    home:'<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 3 2.5 11.2a1 1 0 0 0 .66 1.76H5V20a1 1 0 0 0 1 1h4v-5h4v5h4a1 1 0 0 0 1-1v-7.04h1.84a1 1 0 0 0 .66-1.76L12 3Z"/></svg>',
    stop:'<svg viewBox="0 0 24 24" aria-hidden="true"><rect x="5.5" y="5.5" width="13" height="13" rx="3"/></svg>',
    next:'<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M4.5 5.4a1 1 0 0 1 1.55-.83l9 6.6a1 1 0 0 1 0 1.66l-9 6.6a1 1 0 0 1-1.55-.83V5.4Z"/><rect x="17.2" y="4.5" width="3.2" height="15" rx="1.6"/></svg>',
    play:'<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M7 4.9a1 1 0 0 1 1.52-.85l11 7.1a1 1 0 0 1 0 1.7l-11 7.1A1 1 0 0 1 7 19.1V4.9Z"/></svg>',
    grid:'<svg viewBox="0 0 24 24" aria-hidden="true"><rect x="3.5" y="3.5" width="7.5" height="7.5" rx="2.2"/><rect x="13" y="3.5" width="7.5" height="7.5" rx="2.2"/><rect x="3.5" y="13" width="7.5" height="7.5" rx="2.2"/><rect x="13" y="13" width="7.5" height="7.5" rx="2.2"/></svg>',
    close:'<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M6.4 4.6 12 10.2l5.6-5.6 1.8 1.8-5.6 5.6 5.6 5.6-1.8 1.8-5.6-5.6-5.6 5.6-1.8-1.8 5.6-5.6-5.6-5.6 1.8-1.8Z"/></svg>',
    vol:'<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M4 9.5v5h3.6l4.7 3.9a.8.8 0 0 0 1.3-.6V6.2a.8.8 0 0 0-1.3-.6L7.6 9.5H4Zm12.4-1.7a5.2 5.2 0 0 1 0 8.4l-1-1.4a3.4 3.4 0 0 0 0-5.6l1-1.4Zm2.3-2.4a8.2 8.2 0 0 1 0 13.2l-1-1.4a6.4 6.4 0 0 0 0-10.4l1-1.4Z"/></svg>',
    mute:'<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M4 9.5v5h3.6l4.7 3.9a.8.8 0 0 0 1.3-.6V6.2a.8.8 0 0 0-1.3-.6L7.6 9.5H4Zm11.6 1.1 1.4-1.4 1.8 1.8 1.8-1.8 1.4 1.4-1.8 1.8 1.8 1.8-1.4 1.4-1.8-1.8-1.8 1.8-1.4-1.4 1.8-1.8-1.8-1.8Z"/></svg>',
    again:'<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 4a8 8 0 1 0 7.75 10h-2.1A6 6 0 1 1 12 6c1.66 0 3.14.69 4.22 1.78L13 11h8V3l-2.64 2.64A7.97 7.97 0 0 0 12 4Z"/></svg>'
  };

  window.Kids={
    ICON,
    /* สร้างชั้นรูปทรงลอย (ดาว วงกลม สามเหลี่ยม สี่เหลี่ยม) */
    shapes(n=14,cls='bg'){
      const b=document.createElement('div');b.className=cls;b.setAttribute('aria-hidden','true');
      const sh=['c','s','t','r'];
      for(let i=0;i<n;i++){
        const e=document.createElement('i');e.className=sh[i%4];
        e.style.cssText=`--x:${rnd(0,96)}%;--s:${rnd(26,72)}px;--c:${COL[i%COL.length]};--d:${rnd(24,50)}s;--dl:${-rnd(0,50)}s;--dx:${rnd(-90,90)}px;--rot:${rnd(-540,540)}deg`;
        b.append(e);
      }
      return b;
    },
    /* ใส่พื้นหลังลอยให้ทั้งหน้า */
    bg(n=14){
      if(document.querySelector('.bg'))return;
      document.body.prepend(Kids.shapes(n));
    },
    /* เติมไอคอนให้ปุ่ม: <a class="hbtn" data-ico="home"> */
    icons(root=document){root.querySelectorAll('[data-ico]').forEach(e=>{if(!e.firstElementChild)e.insertAdjacentHTML('afterbegin',ICON[e.dataset.ico]||'')})},
    /* confetti จากจุด (x,y) พิกเซล */
    confetti(x,y,n=30,power=1){
      if(still())return;
      let L=document.querySelector('.cf-layer');
      if(!L){L=document.createElement('div');L.className='cf-layer';L.setAttribute('aria-hidden','true');document.body.append(L)}
      for(let i=0;i<n;i++){
        const e=document.createElement('i'),w=rnd(7,14),h=Math.random()<.5?w:rnd(w*1.4,w*2.2);
        e.style.cssText=`width:${w}px;height:${h}px;background:${COL[(Math.random()*COL.length)|0]};border-radius:${Math.random()<.4?'50%':'3px'}`;
        L.append(e);
        const a=rnd(-Math.PI*.95,-Math.PI*.05),v=rnd(160,520)*power,dx=Math.cos(a)*v,up=Math.sin(a)*v,fall=rnd(180,420),rot=rnd(-720,720);
        const anim=e.animate([
          {transform:`translate(${x}px,${y}px) rotate(0)`,opacity:1},
          {transform:`translate(${x+dx*.55}px,${y+up*.6}px) rotate(${rot*.5}deg)`,opacity:1,offset:.4},
          {transform:`translate(${x+dx*.9}px,${y+up*.3+fall}px) rotate(${rot}deg)`,opacity:0}
        ],{duration:rnd(1000,1700),easing:'cubic-bezier(.2,.7,.4,1)',fill:'forwards'});
        anim.onfinish=()=>e.remove();
      }
    },
    /* confetti ตกจากบนจอ */
    rain(n=36){
      if(still())return;
      for(let i=0;i<n;i++)setTimeout(()=>Kids.confetti(rnd(0,innerWidth),-20,1,.25),i*55);
    },
    center(el){const r=el.getBoundingClientRect();return[r.left+r.width/2,r.top+r.height/2]}
  };
  document.addEventListener('DOMContentLoaded',()=>{Kids.bg();Kids.icons()});
})();
