-- Database setup cho hệ thống chấm công (SQLite version)
-- File này dành cho SQLite database

-- ============================================
-- 1. TẠO BẢNG USERS
-- ============================================
CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    username TEXT NOT NULL UNIQUE,
    password TEXT NOT NULL,
    email TEXT,
    fullName TEXT,
    createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
    updatedAt DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Tạo index cho username
CREATE INDEX IF NOT EXISTS idx_username ON users(username);

-- ============================================
-- 2. INSERT DỮ LIỆU MẪU
-- ============================================
-- Password đã được hash bằng HMAC-SHA256 với secret: 'default-secret-key'
-- admin / 123
-- user1 / 123456

INSERT OR IGNORE INTO users (username, password, email, fullName) VALUES
('admin', 'cc711116f21e28c750c837056afe50029622ec6d289cbfcb0507723dbcc36991', 'admin@example.com', 'Quản trị viên'),
('user1', '9841911ad5b54b4d0ca56a27a3ebb6cc26be164dccbe3cee1a64d77636261be0', 'user1@example.com', 'Người dùng 1');

-- ============================================
-- 3. KIỂM TRA DỮ LIỆU
-- ============================================
SELECT 
    id, 
    username, 
    email, 
    fullName, 
    createdAt,
    updatedAt
FROM users;

-- ============================================
-- GHI CHÚ:
-- ============================================
-- 1. SQLite không hỗ trợ AUTO_INCREMENT, dùng AUTOINCREMENT
-- 2. SQLite không hỗ trợ ON UPDATE CURRENT_TIMESTAMP
-- 3. Cần trigger để tự động cập nhật updatedAt
-- 4. Sử dụng INSERT OR IGNORE để tránh duplicate

-- ============================================
-- TRIGGER để tự động cập nhật updatedAt
-- ============================================
CREATE TRIGGER IF NOT EXISTS update_users_updatedAt 
AFTER UPDATE ON users
BEGIN
    UPDATE users SET updatedAt = CURRENT_TIMESTAMP WHERE id = NEW.id;
END;

