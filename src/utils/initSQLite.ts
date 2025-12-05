// utils/initSQLite.ts
import sqliteConnection from '../config/sqliteConnection';
import * as fs from 'fs';
import * as path from 'path';

export async function initializeSQLiteDatabase(): Promise<void> {
  try {
    const dbPath = sqliteConnection.getDbPath();
    
    // Đọc file schema SQLite
    const schemaPath = path.join(__dirname, '../../database/database.sqlite.sql');
    
    if (!fs.existsSync(schemaPath)) {
      console.warn(`⚠️  Schema file not found at ${schemaPath}`);
      return;
    }

    const schemaSQL = fs.readFileSync(schemaPath, 'utf-8');
    
    // Kết nối database
    await sqliteConnection.connect();
    
    // Chia schema thành các câu lệnh riêng biệt (loại bỏ comment và câu lệnh SELECT)
    const statements = schemaSQL
      .split(';')
      .map(s => s.trim())
      .filter(s => s.length > 0 && !s.startsWith('--') && !s.toUpperCase().startsWith('SELECT'));
    
    // Thực thi từng câu lệnh
    for (const statement of statements) {
      if (statement.trim()) {
        try {
          await sqliteConnection.query(statement);
        } catch (error: any) {
          // Bỏ qua lỗi nếu bảng/index/trigger đã tồn tại
          if (!error.message.includes('already exists') && !error.message.includes('duplicate')) {
            console.warn(`Warning executing statement: ${statement.substring(0, 50)}...`, error.message);
          }
        }
      }
    }
    
    console.log('✅ SQLite database initialized successfully');
  } catch (error) {
    console.error('❌ Failed to initialize SQLite database:', error);
    throw error;
  }
}

