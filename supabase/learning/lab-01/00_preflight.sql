-- LAB 1: ตรวจสอบก่อนสร้าง Schema (อ่านข้อมูลอย่างเดียว ไม่แก้ไขฐานข้อมูล)
-- ถ้าผลลัพธ์เป็น 0 แถว: เริ่มรัน 01_create_schema.sql ได้
-- ถ้ามีชื่อใดชื่อหนึ่ง: ห้ามรัน 01_create_schema.sql ซ้ำจนกว่าจะตรวจตารางเดิม

select
  table_schema,
  table_name
from information_schema.tables
where table_schema = 'public'
  and table_name in ('profiles', 'courses', 'units')
order by table_name;

-- ตรวจคอลัมน์ของตารางที่มีอยู่ เพื่อเปรียบเทียบกับแบบฝึก LAB 1
select
  table_name,
  ordinal_position,
  column_name,
  data_type,
  is_nullable,
  column_default
from information_schema.columns
where table_schema = 'public'
  and table_name in ('profiles', 'courses', 'units')
order by table_name, ordinal_position;
