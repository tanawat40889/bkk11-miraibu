/* BKK11-Miraibu · ตัวช่วยกลาง: พื้นหลังลอย, confetti, ไอคอน */
(function(){
  const COL=['#ff4d6d','#ffd23f','#29b6f6','#34c77b','#a66bff','#ff9f1c','#ff6fae'];
  const still=()=>matchMedia('(prefers-reduced-motion:reduce)').matches;
  const rnd=(a,b)=>a+Math.random()*(b-a);

  /* ไอคอนจาก Iconify (ฝังไว้ใน shared/icons.js): ph:* = ไอคอนปุ่ม (ตามสีตัวอักษร), fluent-emoji-flat:* = ไอคอนสีสันน่ารัก */
  const D=window.IconData||{};
  const icon=(name,cls)=>{const d=D[name];return d?`<svg class="${cls||'ic'}" viewBox="0 0 ${d.w} ${d.h}" aria-hidden="true" focusable="false">${d.b}</svg>`:''};
  const fx=(n,cls)=>icon('fluent-emoji-flat:'+n,'fx'+(cls?' '+cls:''));
  const ICON={};
  Object.entries({home:'house-fill',stop:'stop-fill',next:'skip-forward-fill',play:'play-fill',again:'arrow-counter-clockwise-bold',vol:'speaker-high-fill',mute:'speaker-x-fill',
    grid:'squares-four-fill',close:'x-bold',users:'users-three-fill',timer:'timer-fill',music:'music-notes-fill',scroll:'scroll-fill',sliders:'sliders-horizontal-fill',
    phone:'device-mobile-fill',bulb:'lightbulb-fill',hourglass:'hourglass-medium-fill',qr:'qr-code-fill',pad:'game-controller-fill',trophy:'trophy-fill',check:'check-circle-fill',no:'prohibit-fill'}).forEach(([k,v])=>{ICON[k]=icon('ph:'+v,'ic')});

  window.Kids={
    ICON,icon,fx,
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
    icons(root=document){
      root.querySelectorAll('[data-ico]').forEach(e=>{if(!e.firstElementChild)e.insertAdjacentHTML('afterbegin',ICON[e.dataset.ico]||'')});
      root.querySelectorAll('[data-fx]').forEach(e=>{if(!e.querySelector('.fx'))e.insertAdjacentHTML('afterbegin',fx(e.dataset.fx)+' ')});   // ไอคอนสีสันหน้าหัวข้อ
    },
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
