/* BKK11-Miraibu · ช่องทางสื่อสารระหว่างจอใหญ่กับมือถือรีโมท
   สองแบบ ใช้ API เดียวกัน:
     'local' = server.py ในเครื่อง (เปิดจาก localhost / IP วงแลน — ไม่ต้องใช้รหัสห้อง)
     'cloud' = Supabase ออนไลน์ (เปิดจากเว็บที่ deploy — แยกด้วยรหัสห้อง)
   ต้องโหลด shared/config.js ก่อนไฟล์นี้ */
(function(){
  const cfg=window.MIRAIBU_CONFIG||{};
  const hasCloud=!!(cfg.supabaseUrl&&cfg.supabaseKey);
  const q=new URLSearchParams(location.search);
  const ROOMKEY='miraibu.room';
  const norm=r=>String(r||'').toUpperCase().replace(/[^A-Z0-9]/g,'').slice(0,16);
  const isLan=/^(localhost$|127\.|10\.|192\.168\.|172\.(1[6-9]|2\d|3[01])\.|.*\.local$|\[?::1\]?$)/.test(location.hostname);
  const N=window.Net={mode:null,room:'',info:null,cloud:hasCloud};

  /* ห้อง: ลิงก์ ?room=XXXX ใช้ก่อน ไม่มีก็ใช้ที่จำไว้; จอใหญ่สร้างรหัสใหม่ให้เองถ้ายังไม่มี */
  N.initRoom=function(role){
    let r=norm(q.get('room'))||norm(localStorage.getItem(ROOMKEY));
    if(!r&&role==='display'){
      const A='ABCDEFGHJKLMNPQRSTUVWXYZ23456789',b=new Uint8Array(6);crypto.getRandomValues(b);
      r=[...b].map(x=>A[x%A.length]).join('');
    }
    if(r)try{localStorage.setItem(ROOMKEY,r)}catch(_){}
    N.room=r;return r;
  };
  N.setRoom=r=>{N.room=norm(r);try{localStorage.setItem(ROOMKEY,N.room)}catch(_){}return N.room};

  /* เลือกช่องทาง: ในเครื่องลอง server.py ก่อน ไม่ได้ก็ใช้ออนไลน์ (ถ้าตั้งไว้) */
  N.detect=async function(){
    if(N.mode)return N.mode;
    // ?cloud=1 บังคับใช้ออนไลน์ (จำไว้ในเครื่อง), ?cloud=0 ยกเลิก — ไว้ทดสอบบนเครื่องที่รัน server.py อยู่ด้วย
    try{if(q.get('cloud')==='1')localStorage.setItem('miraibu.cloud','1');if(q.get('cloud')==='0')localStorage.removeItem('miraibu.cloud')}catch(_){}
    const forceCloud=hasCloud&&localStorage.getItem('miraibu.cloud')==='1';
    if(isLan&&!forceCloud){
      try{const r=await fetch('/api/info');if(r.ok){N.info=await r.json();return N.mode='local'}}catch(_){}
    }
    return N.mode=hasCloud?'cloud':'none';
  };
  N.pollMs=()=>N.mode==='cloud'?400:250;        // จอใหญ่ดึงคำสั่ง
  N.watchMs=()=>N.mode==='cloud'?500:300;       // มือถือดึงสถานะ
  N.pushMs=()=>N.mode==='cloud'?1500:1000;      // จอใหญ่ส่งสถานะซ้ำ

  const json=r=>{if(!r.ok)throw r.status;return r.json()};
  const post=(url,o,body)=>fetch(url,{method:'POST',headers:{'Content-Type':'application/json',...o},body:JSON.stringify(body)}).then(json);
  const rpc=(fn,body)=>{
    const h={apikey:cfg.supabaseKey};if(!/^sb_/.test(cfg.supabaseKey))h.Authorization='Bearer '+cfg.supabaseKey;   // publishable key ส่งแค่ apikey
    return post(cfg.supabaseUrl+'/rest/v1/rpc/'+fn,h,body);
  };

  N.getCmds=since=>N.mode==='cloud'?rpc('miraibu_get_cmds',{p_room:N.room,p_since:since}):fetch('/api/cmd?since='+since).then(json);
  N.postState=s=>N.mode==='cloud'?rpc('miraibu_post_state',{p_room:N.room,p_state:s}):post('/api/state',{},s);
  N.getState=()=>N.mode==='cloud'?rpc('miraibu_get_state',{p_room:N.room}):fetch('/api/state',{cache:'no-store'}).then(json);
  N.postCmd=(cmd,arg)=>N.mode==='cloud'?rpc('miraibu_post_cmd',{p_room:N.room,p_cmd:cmd,p_arg:arg==null?null:arg}):post('/api/cmd',{},{cmd,arg});

  /* ลิงก์รีโมท (ใส่รหัสห้องเมื่อออนไลน์ / ใส่ IP วงแลนเมื่อรันในเครื่อง) */
  N.remoteUrl=function(base){
    const u=new URL('remote.html',base);
    if(N.mode==='cloud')u.searchParams.set('room',N.room);
    else if(N.info&&N.info.ips&&N.info.ips[0])u.hostname=N.info.ips[0];
    return u.href;
  };
})();
