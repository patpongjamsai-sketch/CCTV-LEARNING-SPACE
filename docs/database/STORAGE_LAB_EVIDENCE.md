# แนวทาง Supabase Storage: `lab-evidence`

รอบนี้สร้างตาราง `public.evidence_files` และสิทธิ์ฐานข้อมูลที่รองรับหลักฐาน LAB แล้ว แต่ยังไม่สร้าง Bucket หรือแก้ `storage.objects` เพื่อไม่ขยายขอบเขตเกิน Database + Security ที่อนุมัติ

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

## Policy ที่ต้องติดตั้งเมื่อสร้าง Bucket

ให้สร้าง helper ใน schema `private` เพื่อแปลง UUID จาก path อย่างปลอดภัย แล้วกำหนด Policy บน `storage.objects` ดังนี้:

1. นักเรียน `INSERT` ได้เฉพาะ Bucket `lab-evidence`, โฟลเดอร์แรกต้องเท่ากับ `auth.uid()` และโฟลเดอร์ที่สองต้องเป็น Submission ของตนที่อยู่ในสถานะ `draft`, `submitted` หรือ `revision_required`
2. นักเรียน `SELECT` ได้เฉพาะหลักฐานของ Submission ตนเอง
3. ครู `SELECT` ได้เมื่อเป็นครูที่ active ใน Class ของ Submission นั้น
4. Admin `SELECT` ได้ทั้งหมด
5. `UPDATE` สำหรับ upsert ต้องใช้เงื่อนไขเดียวกับ `INSERT` และควรจำกัดไว้ที่ `draft`/`revision_required`
6. `DELETE` ให้เฉพาะเจ้าของใน `draft`/`revision_required`; หลักฐานของงานที่ตรวจแล้วต้องลบผ่าน workflow ฝั่ง Server พร้อม Audit

Supabase Storage ต้องมีทั้ง `INSERT + SELECT + UPDATE` policy หากต้องการใช้ upsert ส่วนการดาวน์โหลดจาก Private Bucket จะผ่าน RLS ทุกครั้ง

## ลำดับธุรกรรมที่แนะนำ

1. สร้าง `lab_submissions` ก่อน เพื่อให้ได้ UUID
2. Upload ไฟล์ด้วย path ตามรูปแบบด้านบน
3. เมื่อ Storage API สำเร็จ จึงเพิ่ม metadata ใน `evidence_files`
4. หากขั้นที่ 3 ล้มเหลว ให้ Server ลบ object ที่เพิ่งอัปโหลด หรือบันทึกงาน cleanup แบบ retry
5. เมื่อครูเปิดหลักฐาน ให้ Server สร้าง signed URL อายุสั้นและบันทึก Audit เมื่อเป็นเหตุการณ์สำคัญ

ห้ามเก็บรหัสผ่านกล้อง, Service Role Key หรือ secret ใด ๆ ในชื่อไฟล์, path, metadata หรือ `student_notes`

