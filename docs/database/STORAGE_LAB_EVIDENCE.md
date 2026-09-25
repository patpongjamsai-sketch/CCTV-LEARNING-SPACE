# แนวทาง Supabase Storage: `lab-evidence`

ตอนนี้สร้างตาราง `public.evidence_files` และ Bucket ส่วนตัว `lab-evidence` แล้ว โดย migration `20260925043738_lab_evidence_storage.sql` กำหนดขนาดและ MIME type ที่อนุญาตให้ตรงกับฐานข้อมูล

การอัปโหลดใช้ Server API ที่ตรวจสอบตัวตน การเป็นสมาชิกชั้นเรียน และเจ้าของ LAB ก่อนเรียก Supabase Storage ด้วย service-role client ฝั่ง server จึงไม่เปิด public URL และไม่ให้ browser เขียน metadata ที่เชื่อถือได้โดยตรง

## ค่าที่ควรใช้เมื่อเปิด Storage ในรอบถัดไป

- Bucket: `lab-evidence`
- Access model: **Private**
- File size limit: 50 MB
- MIME types: `image/jpeg`, `image/png`, `image/webp`, `application/pdf`, `video/mp4`
- ห้ามใช้ Public URL ถาวร ใช้ authenticated download หรือ signed URL อายุสั้นจาก Server
- อัปโหลดและลบไฟล์ผ่าน Storage API เท่านั้น ไม่เขียน/ลบแถวใน `storage.objects` โดยตรง

โครงสร้าง path ที่ migration บังคับไว้คือ:

```text
{student_uuid}/{lab_submission_uuid}/{filename}
```

ตัวอย่าง:

```text
50000000-0000-0000-0000-000000000001/
  c28bd9c7-338c-42d3-8ee2-f3f7883aabda/
    evidence.pdf
```

## Policy ของ Storage

เส้นทางปัจจุบันไม่เปิด direct browser upload จึงใช้ server-only upload route เป็น trust boundary หลัก ส่วน policy บน `storage.objects` ยังควรเพิ่มในรอบ hardening หากต้องการเปิด signed upload จาก browser โดยตรง:

1. นักเรียน `INSERT` ได้เฉพาะ Bucket `lab-evidence`, โฟลเดอร์แรกต้องเท่ากับ `auth.uid()` และโฟลเดอร์ที่สองต้องเป็น Submission ของตนที่อยู่ในสถานะ `draft`, `submitted` หรือ `revision_required`
2. นักเรียน `SELECT` ได้เฉพาะหลักฐานของ Submission ตนเอง
3. ครู `SELECT` ได้เมื่อเป็นครูที่ active ใน Class ของ Submission นั้น
4. Admin `SELECT` ได้ทั้งหมด
5. `UPDATE` สำหรับ upsert ต้องใช้เงื่อนไขเดียวกับ `INSERT` และควรจำกัดไว้ที่ `draft`/`revision_required`
6. `DELETE` ให้เฉพาะเจ้าของใน `draft`/`revision_required`; หลักฐานของงานที่ตรวจแล้วต้องลบผ่าน workflow ฝั่ง Server พร้อม Audit

Supabase Storage ต้องมีทั้ง `INSERT + SELECT + UPDATE` policy หากต้องการใช้ upsert ส่วนการดาวน์โหลดจาก Private Bucket จะผ่าน RLS ทุกครั้ง

## ลำดับธุรกรรมที่ระบบใช้อยู่

1. สร้าง `lab_submissions` ก่อน เพื่อให้ได้ UUID
2. Upload ไฟล์ด้วย path ตามรูปแบบด้านบน
3. เมื่อ Storage API สำเร็จ จึงเพิ่ม metadata ใน `evidence_files`
4. หากขั้นที่ 3 ล้มเหลว ให้ Server ลบ object ที่เพิ่งอัปโหลด หรือบันทึกงาน cleanup แบบ retry
5. เมื่อครูเปิดหลักฐาน ให้ Server สร้าง signed URL อายุสั้นและบันทึก Audit เมื่อเป็นเหตุการณ์สำคัญ

ห้ามเก็บรหัสผ่านกล้อง, Service Role Key หรือ secret ใด ๆ ในชื่อไฟล์, path, metadata หรือ `student_notes`
