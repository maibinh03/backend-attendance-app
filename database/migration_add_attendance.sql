-- Migration: Tạo bảng attendance để lưu dữ liệu chấm công
-- Chạy script này để thêm bảng chấm công vào hệ thống

USE attendance_db;

-- Bảng attendance (chấm công)
CREATE TABLE IF NOT EXISTS attendance (
    id INT AUTO_INCREMENT PRIMARY KEY,
    userId INT NOT NULL COMMENT 'ID người dùng',
    checkInTime DATETIME NOT NULL COMMENT 'Thời gian chấm công vào',
    checkOutTime DATETIME NULL COMMENT 'Thời gian chấm công ra',
    workDate DATE NOT NULL COMMENT 'Ngày làm việc',
    totalHours DECIMAL(5,2) NULL COMMENT 'Tổng số giờ làm việc (tính bằng giờ)',
    status VARCHAR(20) NOT NULL DEFAULT 'checked_in' COMMENT 'Trạng thái: checked_in, checked_out, absent',
    notes TEXT NULL COMMENT 'Ghi chú',
    createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP COMMENT 'Thời gian tạo bản ghi',
    updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT 'Thời gian cập nhật',
    FOREIGN KEY (userId) REFERENCES users(id) ON DELETE CASCADE,
    INDEX idx_userId (userId),
    INDEX idx_workDate (workDate),
    INDEX idx_userId_workDate (userId, workDate),
    UNIQUE KEY unique_user_date (userId, workDate)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='Bảng chấm công';

