# Hướng dẫn push backend lên GitHub

## Đã hoàn thành:
✅ Đã tạo `.gitignore` với các file nhạy cảm:
- `node_modules/`
- `.env` và các file môi trường
- `dist/` (build artifacts)
- `*.tsbuildinfo`

✅ Đã khởi tạo git repository
✅ Đã commit tất cả các file (31 files, 3923 dòng code)
✅ Đã cấu hình remote: `https://github.com/maibinh03/backend-attendance-app.git`

## Bước tiếp theo:

### 1. Tạo repository trên GitHub:
- Truy cập: https://github.com/new
- Repository name: `backend-attendance-app`
- Chọn Public hoặc Private
- **KHÔNG** tích "Initialize with README"
- Click "Create repository"

### 2. Push code lên GitHub:
```bash
cd backend
git push -u origin master
```

Hoặc nếu bạn đã tạo repo với tên khác, cập nhật remote:
```bash
git remote set-url origin https://github.com/maibinh03/TEN_REPO_CUA_BAN.git
git push -u origin master
```

## Các file đã được bảo vệ (không commit):
- ✅ `node_modules/` - Dependencies
- ✅ `.env` - Environment variables (DB credentials, secrets)
- ✅ `dist/` - Build output
- ✅ `*.tsbuildinfo` - TypeScript build info

## Lưu ý:
- File `.env` cần được tạo local với các biến môi trường:
  ```
  DB_HOST=localhost
  DB_USER=your_user
  DB_PASSWORD=your_password
  DB_NAME=your_database
  PORT=3000
  HASH_SECRET=your_secret_key
  JWT_SECRET=your_jwt_secret
  ```
- Không commit file `.env` lên GitHub
- Có thể tạo file `.env.example` để làm mẫu (không chứa giá trị thật)

