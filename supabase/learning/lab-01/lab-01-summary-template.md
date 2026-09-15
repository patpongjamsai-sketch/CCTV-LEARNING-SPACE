# หลักฐานสรุป LAB 1

ผู้ทดลอง: ........................................................  
วันที่: ............................................................  
Supabase Project: .................................................  
Environment: Development

## Predict

1. Course Code ซ้ำจะเกิดอะไรขึ้น:
2. Unit อ้าง Course ที่ไม่มีจะเกิดอะไรขึ้น:
3. Sequence เป็น 0 จะเกิดอะไรขึ้น:
4. Authenticated User จะเห็น Draft Unit หรือไม่:

## Experiment

| ขั้นตอน | ไฟล์ที่รัน | เวลา | ผล |
|---|---|---|---|
| สร้าง Schema | `01_create_schema.sql` | | |
| เพิ่ม Seed | `02_seed_course.sql` | | |
| ตรวจสอบ | `03_verify_lab.sql` | | |

## Observe

| รายการ | ค่าที่พบ |
|---|---|
| จำนวน Course | |
| จำนวน Unit ทั้งหมด | |
| Unit ที่ authenticated มองเห็น | |
| RLS เปิดครบ 3 ตาราง | |
| จำนวน Policy | |

## Negative Test Evidence

| Test | Constraint | Error/Notice | ผ่าน |
|---|---|---|---|
| Course Code ซ้ำ | UNIQUE | | |
| Sequence เป็น 0 | CHECK | | |
| Course ID ไม่มี | FOREIGN KEY | | |

## Analyze

### Primary Key

..................................................................

### Foreign Key

..................................................................

### Constraint

..................................................................

### Index

..................................................................

### GRANT และ RLS

..................................................................

## Conclusion

..................................................................

## Screenshot Checklist

- [ ] `01-schema-created.png`
- [ ] `02-course-and-8-units.png`
- [ ] `03-constraints.png`
- [ ] `04-indexes.png`
- [ ] `05-rls-and-policies.png`
- [ ] `06-negative-tests.png`

## ความปลอดภัย

- [ ] ภาพไม่มี Password
- [ ] ภาพไม่มี Secret Key หรือ Token
- [ ] ไม่บันทึกข้อมูลนักเรียนจริงใน Development Project

