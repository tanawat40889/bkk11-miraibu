/* BKK11-Miraibu · หน้ากลาง (ล็อบบี้) สำหรับจอใหญ่
   ขึ้นเองเมื่อมีมือถือรีโมทเชื่อมอยู่ และเกมอยู่ในช่วงตั้งค่า/เลือกเกม — ระหว่างนั้นตั้งค่าที่มือถือ จอใหญ่โชว์หน้านี้
   ดับเองเมื่อเริ่มเล่น หรือเมื่อมือถือหลุด
   ดับ/เปิดเองด้วยมือ: ดับเบิลคลิกที่จอ หรือกด L  */
(function(){
  const TITLE_N='11',TITLE2='มิไรบุภาคบางขุนเทียน';
  let el=null,capEl=null,burst=0,eligible=false,manualOff=false,on=false;
  const mk=(t,c,x)=>{const e=document.createElement(t);if(c)e.className=c;if(x!=null)e.textContent=x;return e};

  function build(){
    el=mk('section','lobby');el.id='lobby';
    el.append(mk('div','lb-rays'));
    [0,2.5,5].forEach(d=>{const r=mk('div','lb-ring');r.style.setProperty('--d',d+'s');el.append(r)});
    if(window.Kids)el.append(Kids.shapes(22,'lb-shapes'));
    const COL=['#ffd23f','#ff6fae','#29b6f6','#34c77b','#fff','#ff9f1c'];
    [[8,14],[86,10],[16,70],[90,62],[50,6],[72,82],[28,32],[66,26]].forEach(([x,y],i)=>{
      const s=mk('i','lb-st');s.style.cssText=`--x:${x}%;--y:${y}%;--s:${30+(i%3)*14}px;--c:${COL[i%COL.length]};--d:${(i*.45).toFixed(2)}s`;el.append(s);
    });
    if(window.Kids&&Kids.fx){   // สติกเกอร์ไอคอนสีสันลอยรอบหน้ากลาง (Iconify)
      [['sparkles',7,22],['party-popper',90,16],['crown',5,62],['balloon',92,60],['trophy',13,84],['rainbow',82,84],['glowing-star',30,9],['confetti-ball',68,8]].forEach(([n,x,y],i)=>{
        const f=mk('div','lb-fx');f.style.cssText=`--x:${x}%;--y:${y}%;--d:${(i*.45).toFixed(2)}s`;f.innerHTML=Kids.fx(n);el.append(f);
      });
    }
    el.append(mk('div'));                                   // แถวหัว (ว่าง) ให้ความสูงเท่ากับหน้าอื่น
    const main=mk('main','lb-main');
    const h=mk('h1','lb-1');h.append(mk('span','w','รวม'),mk('span','w','ภาคกรุงเทพ'),document.createTextNode(' '),mk('span','n',TITLE_N));
    main.append(h,mk('p','lb-2',TITLE2));
    const foot=mk('footer','lb-foot');capEl=mk('div','lb-cap');foot.append(capEl);
    el.append(main,foot);
    el.addEventListener('dblclick',()=>{if(eligible){manualOff=!manualOff;sync()}});
    document.body.append(el);
  }

  function sync(){
    const want=eligible&&!manualOff;
    if(want===on)return;
    on=want;if(!el)build();
    el.classList.toggle('on',on);
    clearInterval(burst);
    if(on&&window.Kids)burst=setInterval(()=>Kids.confetti(Math.random()<.5?innerWidth*.12:innerWidth*.88,innerHeight*.9,22,1.1),5500);
  }

  window.Lobby={
    /* เรียกซ้ำได้เรื่อยๆ: ok = มีสิทธิ์โชว์ไหม, caption = ข้อความเล็กด้านล่าง (ชื่อเกมที่กำลังเตรียม) */
    auto(ok,caption){
      if(!el&&ok)build();
      if(!ok)manualOff=false;
      eligible=!!ok;
      if(capEl&&capEl.textContent!==(caption||''))capEl.textContent=caption||'';
      sync();
    }
  };
  addEventListener('keydown',e=>{
    if((e.key==='l'||e.key==='L')&&eligible&&!(e.target&&/INPUT|TEXTAREA/.test(e.target.tagName))){manualOff=!manualOff;sync()}
  });
})();
