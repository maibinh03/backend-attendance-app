-- Database setup cho hệ thống chấm công (PostgreSQL version)
-- File này dành cho PostgreSQL database

-- ============================================
-- 1. TẠO BẢNG USERS
-- ============================================
CREATE TABLE IF NOT EXISTS users (
    id SERIAL PRIMARY KEY,
    username VARCHAR(255) NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL,
    email VARCHAR(255),
    "fullName" VARCHAR(255),
    role VARCHAR(50) NOT NULL DEFAULT 'user',
    "createdAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Tạo index cho username và role
CREATE INDEX IF NOT EXISTS idx_username ON users(username);
CREATE INDEX IF NOT EXISTS idx_role ON users(role);

-- ============================================
-- 2. TẠO BẢNG ATTENDANCE (CHẤM CÔNG)
-- ============================================
CREATE TABLE IF NOT EXISTS attendance (
    id SERIAL PRIMARY KEY,
    "userId" INTEGER NOT NULL,
    "checkInTime" TIMESTAMP NOT NULL,
    "checkOutTime" TIMESTAMP NULL,
    "workDate" DATE NOT NULL,
    "totalHours" DECIMAL(10, 2) NULL,
    status VARCHAR(50) NOT NULL DEFAULT 'checked_in',
    notes TEXT NULL,
    "createdAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY ("userId") REFERENCES users(id) ON DELETE CASCADE,
    UNIQUE("userId", "workDate")
);

-- Tạo index cho attendance
CREATE INDEX IF NOT EXISTS idx_userId ON attendance("userId");
CREATE INDEX IF NOT EXISTS idx_workDate ON attendance("workDate");
CREATE INDEX IF NOT EXISTS idx_userId_workDate ON attendance("userId", "workDate");

-- ============================================
-- 3. INSERT DỮ LIỆU MẪU
-- ============================================
-- Password đã được hash bằng HMAC-SHA256 với secret: 'default-secret-key'
-- admin / 123
-- user1 / 123456

INSERT INTO users (username, password, email, "fullName", role) VALUES
('admin', 'cc711116f21e28c750c837056afe50029622ec6d289cbfcb0507723dbcc36991', 'admin@example.com', 'Quản trị viên', 'admin'),
('user1', '9841911ad5b54b4d0ca56a27a3ebb6cc26be164dccbe3cee1a64d77636261be0', 'user1@example.com', 'Người dùng 1', 'user')
ON CONFLICT (username) DO NOTHING;

-- ============================================
-- 4. FUNCTION và TRIGGER để tự động cập nhật updatedAt
-- ============================================
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW."updatedAt" = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Trigger cho bảng users
DROP TRIGGER IF EXISTS update_users_updatedAt ON users;
CREATE TRIGGER update_users_updatedAt
    BEFORE UPDATE ON users
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Trigger cho bảng attendance
DROP TRIGGER IF EXISTS update_attendance_updatedAt ON attendance;
CREATE TRIGGER update_attendance_updatedAt
    BEFORE UPDATE ON attendance
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- ============================================
-- GHI CHÚ:
-- ============================================
-- 1. PostgreSQL sử dụng SERIAL cho auto increment
-- 2. PostgreSQL hỗ trợ ON UPDATE CURRENT_TIMESTAMP qua trigger
-- 3. PostgreSQL hỗ trợ DECIMAL cho số thập phân
-- 4. Sử dụng ON CONFLICT DO NOTHING để tránh duplicate
-- 5. PostgreSQL tự động hỗ trợ FOREIGN KEY
-- 6. Tên cột có chữ hoa cần được đặt trong dấu ngoặc kép

