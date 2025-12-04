-- Seed data cho bảng users
-- Password đã được hash bằng HMAC-SHA256 với secret: 'default-secret-key'

USE attendance_db;

-- Xóa dữ liệu cũ (nếu cần)
-- TRUNCATE TABLE users;

-- Insert users mẫu
INSERT INTO users (username, password, email, fullName) VALUES
('admin', 'cc711116f21e28c750c837056afe50029622ec6d289cbfcb0507723dbcc36991', 'admin@example.com', 'Quản trị viên'),
('user1', '9841911ad5b54b4d0ca56a27a3ebb6cc26be164dccbe3cee1a64d77636261be0', 'user1@example.com', 'Người dùng 1');

-- Kiểm tra dữ liệu
SELECT id, username, email, fullName, createdAt FROM users;

