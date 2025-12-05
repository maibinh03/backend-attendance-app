# Database Files

Thư mục này chứa các file liên quan đến database của hệ thống chấm công.

**Backend chỉ sử dụng SQLite** - không cần host database riêng, database được lưu trong file.

## Cấu trúc thư mục

```
database/
├── README.md                    # File này - hướng dẫn về database
├── database.sqlite.sql          # File setup đầy đủ cho SQLite (schema + seed data)
└── attendance.db                # SQLite database file (tự động tạo khi chạy server)
```

## File chính

### `database.sqlite.sql`

File setup đầy đủ cho **SQLite**, bao gồm:

- Tạo bảng `users` và `attendance`
- Insert dữ liệu mẫu (admin/user1)
- Tạo triggers để tự động cập nhật `updatedAt`

**Cách sử dụng:**

- File này được **tự động chạy** khi server khởi động
- Hoặc chạy thủ công:

```bash
sqlite3 database/attendance.db < database/database.sqlite.sql
```

## Database Schema

### Bảng `users`

- `id` - Primary key
- `username` - Tên đăng nhập (unique)
- `password` - Mật khẩu đã hash (HMAC-SHA256)
- `email` - Email người dùng
- `fullName` - Tên đầy đủ
- `role` - Phân quyền: `admin`, `manager`, `user`
- `createdAt` - Thời gian tạo
- `updatedAt` - Thời gian cập nhật

### Bảng `attendance`

- `id` - Primary key
- `userId` - Foreign key đến users.id
- `checkInTime` - Thời gian chấm công vào
- `checkOutTime` - Thời gian chấm công ra
- `workDate` - Ngày làm việc
- `totalHours` - Tổng số giờ làm việc
- `status` - Trạng thái: `checked_in`, `checked_out`, `absent`
- `notes` - Ghi chú
- `createdAt` - Thời gian tạo
- `updatedAt` - Thời gian cập nhật

**Ràng buộc:**

- Unique constraint: `(userId, workDate)` - Mỗi user chỉ có 1 bản ghi chấm công mỗi ngày
- Foreign key: `userId` references `users(id)` ON DELETE CASCADE

## Dữ liệu mẫu

### Users mặc định

- **admin** / password: `123` / role: `admin`
- **user1** / password: `123456` / role: `user`

**Lưu ý:** Passwords đã được hash bằng HMAC-SHA256 với secret key mặc định.

## Backup và Restore

### SQLite

```bash
# Backup (chỉ cần copy file)
cp database/attendance.db backup/attendance_backup.db

# Restore
cp backup/attendance_backup.db database/attendance.db
```

## Ghi chú

- File `attendance.db` sẽ được **tự động tạo** khi chạy server lần đầu
- File này đã được thêm vào `.gitignore` để không commit dữ liệu test
- Database là file-based, rất dễ backup và di chuyển
