-- Migration: Thêm cột role vào bảng users
-- Chạy script này để thêm phân quyền vào hệ thống

USE attendance_db;

-- Thêm cột role vào bảng users
ALTER TABLE users 
ADD COLUMN role VARCHAR(20) NOT NULL DEFAULT 'user' 
AFTER fullName;

-- Tạo index cho cột role để tối ưu truy vấn
CREATE INDEX idx_role ON users(role);

-- Cập nhật role cho các user hiện có
-- Mặc định: user đầu tiên (admin) sẽ có role 'admin', các user khác là 'user'
UPDATE users 
SET role = 'admin' 
WHERE username = 'admin';

UPDATE users 
SET role = 'user' 
WHERE role = 'user' OR role IS NULL;

-- Kiểm tra kết quả
SELECT id, username, email, fullName, role, createdAt 
FROM users;

