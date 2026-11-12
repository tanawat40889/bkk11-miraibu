/* รายการเกมทั้งหมด — ใช้ร่วมกันโดยหน้าเลือกเกมและรีโมทมือถือ
   เพิ่มเกมใหม่: เติมรายการนี้ที่เดียว (u = path จากรากโปรเจค, c = สีการ์ดที่เข้มพอให้ตัวหนังสือขาวอ่านชัด) */
window.GAMES=[
  {id:'color-musical',n:'เก้าอี้ดนตรี เหยียบสี',d:'เพลงหยุด แล้วไปเหยียบสีที่ถูกต้อง',u:'games/color-musical/',c:'#d62f55',
   art:`<svg viewBox="0 0 120 100" aria-hidden="true">
     <rect x="8" y="14" width="46" height="46" rx="10" fill="#ff4d6d" transform="rotate(-10 31 37)"/>
     <rect x="62" y="8" width="46" height="46" rx="10" fill="#ffd23f" transform="rotate(8 85 31)"/>
     <rect x="14" y="52" width="46" height="42" rx="10" fill="#29b6f6" transform="rotate(6 37 73)"/>
     <rect x="64" y="50" width="46" height="42" rx="10" fill="#34c77b" transform="rotate(-8 87 71)"/>
     <g fill="#fff" stroke="#241552" stroke-width="3.5" stroke-linejoin="round"><ellipse cx="50" cy="72" rx="13" ry="9.5" transform="rotate(-18 50 72)"/><rect x="59.5" y="22" width="6" height="50" rx="3"/><path d="M65 22c10 3 18 8 17 22-5-6-10-8-17-9Z"/></g></svg>`},
  {id:'gongyo-teams',n:'ท่องคัมภีร์ แข่งทีม',d:'เติมคำ / ต่อบรรทัด บนจอใหญ่',u:'games/gongyo-teams/',c:'#6a3de0',
   art:`<svg viewBox="0 0 120 100" aria-hidden="true">
     <rect x="22" y="14" width="76" height="72" rx="6" fill="#fff4d6"/>
     <rect x="12" y="6" width="96" height="16" rx="8" fill="#f2b84b"/><rect x="12" y="78" width="96" height="16" rx="8" fill="#f2b84b"/>
     <g fill="#6a3de0"><rect x="32" y="32" width="56" height="6" rx="3"/><rect x="32" y="44" width="42" height="6" rx="3"/><rect x="32" y="56" width="52" height="6" rx="3"/></g>
     <rect x="78" y="44" width="10" height="6" rx="3" fill="#ffd23f" stroke="#6a3de0" stroke-width="2"/></svg>`},
  {id:'animal-random',n:'สุ่มสัตว์',d:'กดเพื่อสุ่มสัตว์',u:'animal-random/',c:'#12805a',
   art:`<img src="animal-random/img/1f981.svg" alt="">`},
];
