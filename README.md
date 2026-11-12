# BKK11-Miraibu

เกมส์และกิจกรรมมิไรบุ — รวมภาคกรุงเทพ 11 · มิไรบุภาคบางขุนเทียน

| เกม | ที่อยู่ |
|---|---|
| หน้าเลือกเกม | `/` |
| เก้าอี้ดนตรี เหยียบสี | `games/color-musical/` |
| ท่องคัมภีร์ แข่งทีม | `games/gongyo-teams/` |
| สุ่มสัตว์ | `animal-random/` (รีโพแยก ดึงมารวมตอน deploy) |

จอใหญ่เปิดหน้าเกม ส่วนมือถือเปิด `remote.html` เพื่อสลับเกม ตั้งค่า คุมเกม และปรับเสียง

## รันในเครื่อง

```bash
python3 server.py
```

เปิด `http://localhost:8765/` บนจอใหญ่ แล้วสแกน QR บนจอด้วยมือถือ (wifi เดียวกัน)

## Deploy ออนไลน์ (GitHub Pages + Supabase)

1. **ตัวกลางรีโมท:** สร้างโปรเจค Supabase ใหม่ แล้วรัน [deploy/supabase.sql](deploy/supabase.sql) (SQL editor)
   แล้วใส่ Project URL กับ publishable key ใน [shared/config.js](shared/config.js)
2. **GitHub:** สร้าง repo ว่าง `tanawat40889/bkk11-miraibu` (public) แล้ว push
   จากนั้น Settings → Pages → Source เลือก **GitHub Actions**
3. ทุกครั้งที่ push ไป `main` เว็บจะ deploy ใหม่เอง (กด Actions → Run workflow เองได้ เช่นหลังแก้เกมสุ่มสัตว์)

เมื่อเปิดจากเว็บออนไลน์ จอใหญ่จะสร้าง **รหัสห้อง** ให้ (แสดงใต้ QR) มือถือสแกน QR หรือพิมพ์รหัสก็เชื่อมได้ ไม่ต้องอยู่ wifi เดียวกัน
