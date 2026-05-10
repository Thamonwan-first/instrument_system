# Middlewares

โฟลเดอร์นี้ใช้เก็บตัวเช็คสิทธิ์และตัวช่วยก่อนเข้า controller

## ตัวอย่าง middleware ที่ควรมี
- `auth.php` - ตรวจ session / token
- `role.php` - ตรวจ role เช่น admin, staff, student, ceo
- `validation.php` - ตรวจข้อมูลเบื้องต้นก่อนส่งต่อ

## แนวทาง
- ให้ middleware เป็นชั้นป้องกันหลัก ฝั่ง frontend ใช้แค่เพื่อ UX
- ทุก endpoint สำคัญควรตรวจสิทธิ์ฝั่ง server เสมอ
