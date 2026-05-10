# Controllers

โฟลเดอร์นี้ใช้เก็บ business logic ที่แยกออกจากไฟล์ใน `api/` เพื่อให้ API บางลงและทดสอบง่ายขึ้น

## หน้าที่หลัก
- รับ input จาก request
- เรียก model เพื่ออ่าน/เขียนฐานข้อมูล
- แปลงผลลัพธ์เป็น response format กลาง

## โครงที่แนะนำ
- `AuthController.php`
- `UserController.php`
- `EquipmentController.php`
- `BookingController.php`
- `NotificationController.php`
- `AdminController.php`
