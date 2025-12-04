# Database Files

Thư mục này chứa các file SQL để setup database cho hệ thống chấm công.

## 📁 Các file

### 1. `database.sql` (Khuyến nghị)

- File đầy đủ bao gồm cả schema và seed data
- Chạy file này để setup toàn bộ database
- **Cách sử dụng:**

  ```bash
  mysql -u root -p < database/database.sql
  ```

### 2. `schema.sql`

- Chỉ chứa schema (tạo database và bảng)
- Không có dữ liệu mẫu
- **Cách sử dụng:**

  ```bash
  mysql -u root -p < database/schema.sql
  ```

### 3. `seed.sql`

- Chỉ chứa dữ liệu mẫu (INSERT statements)
- Cần chạy sau khi đã có schema
- **Cách sử dụng:**

  ```bash
  mysql -u root -p < database/seed.sql
  ```

### 4. `database.sqlite.sql`

- File SQL cho SQLite database
- Bao gồm schema, seed data và trigger
- **Cách sử dụng:**

  ```bash
  sqlite3 attendance.db < database/database.sqlite.sql
  ```

## 🔐 Thông tin đăng nhập mẫu

Sau khi chạy seed data, bạn có thể đăng nhập với:

1. **Admin:**
   - Username: `admin`
   - Password: `123`

2. **User 1:**
   - Username: `user1`
   - Password: `123456`

## ⚠️ Lưu ý

1. **Password Hashing:**
   - Password được hash bằng HMAC-SHA256
   - Secret key mặc định: `default-secret-key`
   - Để thay đổi, cập nhật `HASH_SECRET` trong file `.env`

2. **Tạo password hash mới:**

   ```javascript
   const crypto = require('crypto');
   const SECRET = process.env.HASH_SECRET || 'default-secret-key';
   const hash = crypto.createHmac('sha256', SECRET).update('password').digest('hex');
   console.log(hash);
   ```

3. **Xóa dữ liệu cũ:**
   - Nếu muốn reset database, uncomment dòng `TRUNCATE TABLE users;` trong `seed.sql`

## 🔄 Migration

Nếu bạn đang sử dụng Sequelize hoặc ORM khác, có thể cần tạo migration files riêng. File SQL này phù hợp cho việc setup thủ công hoặc import trực tiếp.

## 📊 Cấu trúc bảng

```sql
users
├── id (INT, PRIMARY KEY, AUTO_INCREMENT)
├── username (VARCHAR(50), UNIQUE, NOT NULL)
├── password (VARCHAR(255), NOT NULL) -- Hashed password
├── email (VARCHAR(100), NULLABLE)
├── fullName (VARCHAR(100), NULLABLE)
├── createdAt (TIMESTAMP, DEFAULT CURRENT_TIMESTAMP)
└── updatedAt (TIMESTAMP, DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP)
```

## 🚀 Quick Start

### MySQL/MariaDB

```bash
# 1. Tạo database và import dữ liệu (khuyến nghị)
mysql -u root -p < database/database.sql

# 2. Hoặc tách riêng
mysql -u root -p < database/schema.sql
mysql -u root -p < database/seed.sql
```

### SQLite

```bash
# Tạo database SQLite
sqlite3 attendance.db < database/database.sqlite.sql

# Hoặc sử dụng trong code
sqlite3 attendance.db
.read database/database.sqlite.sql
```
