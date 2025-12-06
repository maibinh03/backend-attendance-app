# Hướng dẫn Migrate Database lên Neon.tech

## Bước 1: Tạo tài khoản và Database trên Neon

1. Truy cập [https://neon.tech](https://neon.tech) và đăng ký/đăng nhập
2. Tạo một project mới
3. Chọn region gần bạn nhất (ví dụ: Singapore, Tokyo)
4. Sau khi tạo project, Neon sẽ tự động tạo database cho bạn

## Bước 2: Lấy Connection String

1. Trong Neon Dashboard, vào tab **Connection Details**
2. Bạn sẽ thấy 2 loại connection string:
   - **Connection pooling** (khuyến nghị): Dùng cho production, hỗ trợ connection pooling
   - **Direct connection**: Dùng cho migration hoặc admin tools

3. Copy connection string có dạng:
   ```
   postgresql://username:password@ep-xxx-xxx.region.aws.neon.tech/database?sslmode=require
   ```

## Bước 3: Cấu hình Environment Variables

1. Tạo file `.env` trong thư mục `backend/` (nếu chưa có)
2. Thêm connection string vào file `.env`:

```env
DATABASE_URL=postgresql://username:password@ep-xxx-xxx.region.aws.neon.tech/database?sslmode=require
PORT=3000
FRONTEND_URL=http://localhost:3001
JWT_SECRET=your-secret-key-here
```

**Lưu ý quan trọng:**
- Connection string từ Neon đã bao gồm SSL, không cần cấu hình thêm
- Nếu bạn muốn dùng connection pooling (khuyến nghị), sử dụng connection string có `pooler` trong URL
- Giữ connection string bí mật, không commit vào Git

## Bước 4: Chạy Migration Schema

Sau khi cấu hình `.env`, chạy server để tự động tạo schema:

```bash
cd backend
npm run dev
```

Server sẽ tự động:
- Kết nối với Neon database
- Chạy file `database/database.postgres.sql` để tạo tables
- Insert dữ liệu mẫu (admin/user1)

## Bước 5: Verify Connection

Kiểm tra log khi server khởi động, bạn sẽ thấy:
```
✅ Connected to PostgreSQL database
✅ PostgreSQL database initialized successfully
✅ Database connection successful
```

## Bước 6: (Tùy chọn) Migrate dữ liệu từ Local Database

Nếu bạn đã có dữ liệu ở local và muốn migrate lên Neon:

### Cách 1: Sử dụng pg_dump và psql

```bash
# Export từ local database
pg_dump -h localhost -U postgres -d attendance_db > backup.sql

# Import vào Neon (sử dụng connection string)
psql "postgresql://username:password@ep-xxx-xxx.region.aws.neon.tech/database?sslmode=require" < backup.sql
```

### Cách 2: Sử dụng Neon SQL Editor

1. Vào Neon Dashboard → SQL Editor
2. Copy nội dung từ `database/database.postgres.sql`
3. Paste và chạy trong SQL Editor

## Troubleshooting

### Lỗi SSL Connection
- Đảm bảo connection string có `?sslmode=require`
- Code đã được cập nhật để tự động xử lý SSL

### Lỗi Connection Timeout
- Kiểm tra firewall/network
- Thử dùng connection pooling string thay vì direct connection
- Kiểm tra region của Neon có gần bạn không

### Lỗi Authentication
- Kiểm tra lại username/password trong connection string
- Đảm bảo không có ký tự đặc biệt cần encode trong password

## Best Practices

1. **Connection Pooling**: Luôn dùng connection pooling string cho production
2. **Environment Variables**: Không commit `.env` vào Git, dùng `.env.example` làm template
3. **Backup**: Neon tự động backup, nhưng bạn nên export định kỳ
4. **Monitoring**: Sử dụng Neon Dashboard để monitor database usage

## Tài liệu tham khảo

- [Neon Documentation](https://neon.tech/docs)
- [Neon Connection Strings](https://neon.tech/docs/connect/connect-from-any-app)
- [PostgreSQL Connection Pooling](https://neon.tech/docs/connect/connection-pooling)

