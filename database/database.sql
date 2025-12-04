-- Database setup cho hệ thống chấm công
-- File này bao gồm cả schema và seed data

-- ============================================
-- 1. TẠO DATABASE
-- ============================================
CREATE DATABASE IF NOT EXISTS attendance_db CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

USE attendance_db;

-- ============================================
-- 2. TẠO BẢNG USERS
-- ============================================
CREATE TABLE IF NOT EXISTS users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    username VARCHAR(50) NOT NULL UNIQUE COMMENT 'Tên đăng nhập',
    password VARCHAR(255) NOT NULL COMMENT 'Mật khẩu đã hash',
    email VARCHAR(100) COMMENT 'Email người dùng',
    fullName VARCHAR(100) COMMENT 'Tên đầy đủ',
    role VARCHAR(20) NOT NULL DEFAULT 'user' COMMENT 'Phân quyền: admin, manager, user',
    createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP COMMENT 'Thời gian tạo',
    updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT 'Thời gian cập nhật',
    INDEX idx_username (username),
    INDEX idx_role (role)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='Bảng người dùng';

-- ============================================
-- 3. INSERT DỮ LIỆU MẪU
-- ============================================
-- Password đã được hash bằng HMAC-SHA256 với secret: 'default-secret-key'
-- admin / 123
-- user1 / 123456

INSERT INTO users (username, password, email, fullName, role) VALUES
('admin', 'cc711116f21e28c750c837056afe50029622ec6d289cbfcb0507723dbcc36991', 'admin@example.com', 'Quản trị viên', 'admin'),
('user1', '9841911ad5b54b4d0ca56a27a3ebb6cc26be164dccbe3cee1a64d77636261be0', 'user1@example.com', 'Người dùng 1', 'user')
ON DUPLICATE KEY UPDATE username=username;

-- ============================================
-- 4. KIỂM TRA DỮ LIỆU
-- ============================================
SELECT 
    id, 
    username, 
    email, 
    fullName, 
    role,
    createdAt,
    updatedAt
FROM users;

-- ============================================
-- GHI CHÚ:
-- ============================================
-- 1. Password được hash bằng HMAC-SHA256
-- 2. Secret key mặc định: 'default-secret-key'
-- 3. Để thay đổi secret, cập nhật HASH_SECRET trong .env
-- 4. Để tạo password hash mới, sử dụng:
--    crypto.createHmac('sha256', SECRET).update(password).digest('hex')

