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
    role TEXT NOT NULL DEFAULT 'user',
    createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
    updatedAt DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Tạo index cho username và role
CREATE INDEX IF NOT EXISTS idx_username ON users(username);
CREATE INDEX IF NOT EXISTS idx_role ON users(role);

-- ============================================
-- 2. TẠO BẢNG ATTENDANCE (CHẤM CÔNG)
-- ============================================
CREATE TABLE IF NOT EXISTS attendance (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    userId INTEGER NOT NULL,
    checkInTime DATETIME NOT NULL,
    checkOutTime DATETIME NULL,
    workDate DATE NOT NULL,
    totalHours REAL NULL,
    status TEXT NOT NULL DEFAULT 'checked_in',
    notes TEXT NULL,
    createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
    updatedAt DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (userId) REFERENCES users(id) ON DELETE CASCADE,
    UNIQUE(userId, workDate)
);

-- Tạo index cho attendance
CREATE INDEX IF NOT EXISTS idx_userId ON attendance(userId);
CREATE INDEX IF NOT EXISTS idx_workDate ON attendance(workDate);
CREATE INDEX IF NOT EXISTS idx_userId_workDate ON attendance(userId, workDate);

-- ============================================
-- 3. INSERT DỮ LIỆU MẪU
-- ============================================
-- Password đã được hash bằng HMAC-SHA256 với secret: 'default-secret-key'
-- admin / 123
-- user1 / 123456

INSERT OR IGNORE INTO users (username, password, email, fullName, role) VALUES
('admin', 'cc711116f21e28c750c837056afe50029622ec6d289cbfcb0507723dbcc36991', 'admin@example.com', 'Quản trị viên', 'admin'),
('user1', '9841911ad5b54b4d0ca56a27a3ebb6cc26be164dccbe3cee1a64d77636261be0', 'user1@example.com', 'Người dùng 1', 'user');

-- ============================================
-- 4. TRIGGER để tự động cập nhật updatedAt
-- ============================================
CREATE TRIGGER IF NOT EXISTS update_users_updatedAt 
AFTER UPDATE ON users
BEGIN
    UPDATE users SET updatedAt = CURRENT_TIMESTAMP WHERE id = NEW.id;
END;

CREATE TRIGGER IF NOT EXISTS update_attendance_updatedAt 
AFTER UPDATE ON attendance
BEGIN
    UPDATE attendance SET updatedAt = CURRENT_TIMESTAMP WHERE id = NEW.id;
END;

-- ============================================
-- GHI CHÚ:
-- ============================================
-- 1. SQLite không hỗ trợ AUTO_INCREMENT, dùng AUTOINCREMENT
-- 2. SQLite không hỗ trợ ON UPDATE CURRENT_TIMESTAMP, dùng trigger
-- 3. SQLite không hỗ trợ DECIMAL, dùng REAL cho số thập phân
-- 4. Sử dụng INSERT OR IGNORE để tránh duplicate
-- 5. SQLite hỗ trợ FOREIGN KEY nhưng cần bật PRAGMA foreign_keys = ON

