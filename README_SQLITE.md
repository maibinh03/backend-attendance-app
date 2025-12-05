# Database Setup - SQLite

## Tổng quan

Backend sử dụng **SQLite** - một database file-based, không cần host database riêng:

- ✅ Không cần server database riêng
- ✅ Database được lưu trong file (dễ backup và di chuyển)
- ✅ Tự động khởi tạo khi chạy lần đầu
- ✅ Phù hợp cho ứng dụng nhỏ đến trung bình
- ✅ Setup đơn giản, không cần cấu hình phức tạp

## Cấu hình môi trường

Tạo file `.env` trong thư mục `backend/` với nội dung:

```bash
# Server
PORT=3000

# CORS - URL của frontend
FRONTEND_URL=http://localhost:5000

# Security
JWT_SECRET=your-jwt-secret-key-change-this-in-production
HASH_SECRET=your-hash-secret-key-change-this-in-production
```

**Lưu ý:**

- **Không cần** cấu hình database - backend sẽ tự động sử dụng SQLite!
- Đã **bỏ** các biến MySQL: `DB_HOST`, `DB_USER`, `DB_PASSWORD`, `DB_NAME`, `DB_TYPE`
- Các secret keys nên được đổi trong môi trường production

### 2. Database sẽ được tạo tự động

Khi bạn chạy server lần đầu, SQLite database sẽ được tự động tạo tại:

```
backend/database/attendance.db
```

Schema và dữ liệu mẫu sẽ được tự động khởi tạo từ file:

```
backend/database/database.sqlite.sql
```

### 3. Chạy server

```bash
npm run dev
```

Server sẽ tự động:

- Tạo database file nếu chưa có
- Khởi tạo schema (bảng users và attendance)
- Insert dữ liệu mẫu (admin/user1)

## Database Location

Database file được lưu tại:

```
backend/database/attendance.db
```

File này sẽ được tự động tạo khi bạn chạy server lần đầu.

## Backup và Restore

### Backup database

```bash
# Copy file database
cp backend/database/attendance.db backup/attendance_backup.db
```

### Restore database

```bash
# Copy file backup về
cp backup/attendance_backup.db backend/database/attendance.db
```

## Lưu ý

1. **File database**: SQLite database là một file duy nhất tại `backend/database/attendance.db`
2. **Concurrent access**: SQLite hỗ trợ concurrent reads tốt, nhưng writes sẽ bị serialize
3. **Performance**: Với ứng dụng nhỏ đến trung bình (< 100K records), SQLite hoạt động rất tốt
4. **Deployment**: Khi deploy, chỉ cần copy file `attendance.db` cùng với code

## Tại sao chọn SQLite?

SQLite là lựa chọn hoàn hảo cho ứng dụng chấm công vì:

- **Đơn giản**: Không cần setup server database
- **Nhẹ**: Chỉ là một file duy nhất
- **Đáng tin cậy**: Được sử dụng rộng rãi trong nhiều ứng dụng
- **Dễ backup**: Chỉ cần copy file
- **Phù hợp**: Với quy mô dữ liệu của ứng dụng chấm công

## Troubleshooting

### Database không được tạo

- Kiểm tra quyền ghi trong thư mục `backend/database/`
- Kiểm tra file `database.sqlite.sql` có tồn tại không

### Lỗi foreign key

- SQLite đã tự động bật `PRAGMA foreign_keys = ON` khi kết nối

### Reset database

```bash
# Xóa file database và chạy lại server
rm backend/database/attendance.db
npm run dev
```
