// utils/initSQLite.ts
import sqliteConnection from '../config/sqliteConnection';
import * as fs from 'fs';
import * as path from 'path';

export async function initializeSQLiteDatabase(): Promise<void> {
  try {
    const dbPath = sqliteConnection.getDbPath();
    console.log(`📁 Database path: ${dbPath}`);
    
    // Tìm file schema từ nhiều vị trí có thể
    // 1. Từ dist folder: ../../database/database.sqlite.sql
    // 2. Từ src folder: ../database/database.sqlite.sql
    // 3. Từ project root: ./database/database.sqlite.sql
    const possiblePaths = [
      path.join(__dirname, '../../database/database.sqlite.sql'),
      path.join(__dirname, '../database/database.sqlite.sql'),
      path.join(process.cwd(), 'database/database.sqlite.sql'),
      path.join(process.cwd(), 'src/database/database.sqlite.sql')
    ];
    
    let schemaPath: string | null = null;
    for (const possiblePath of possiblePaths) {
      if (fs.existsSync(possiblePath)) {
        schemaPath = possiblePath;
        break;
      }
    }
    
    if (!schemaPath) {
      console.error(`❌ Schema file not found. Checked paths:`, possiblePaths);
      throw new Error('Schema file not found');
    }
    
    console.log(`📄 Using schema file: ${schemaPath}`);
    const schemaSQL = fs.readFileSync(schemaPath, 'utf-8');
    
    // Kết nối database
    console.log('🔌 Connecting to database...');
    await sqliteConnection.connect();
    
    // Chia schema thành các câu lệnh riêng biệt (loại bỏ comment và câu lệnh SELECT)
    const statements = schemaSQL
      .split(';')
      .map(s => s.trim())
      .filter(s => {
        const trimmed = s.trim();
        return trimmed.length > 0 && 
               !trimmed.startsWith('--') && 
               !trimmed.toUpperCase().startsWith('SELECT');
      });
    
    console.log(`📝 Found ${statements.length} SQL statements to execute`);
    
    // Thực thi từng câu lệnh
    for (let i = 0; i < statements.length; i++) {
      const statement = statements[i];
      if (statement.trim()) {
        try {
          await sqliteConnection.query(statement);
          console.log(`✅ Executed statement ${i + 1}/${statements.length}`);
        } catch (error: any) {
          // Bỏ qua lỗi nếu bảng/index/trigger đã tồn tại
          const errorMsg = error.message || String(error);
          if (errorMsg.includes('already exists') || 
              errorMsg.includes('duplicate') ||
              errorMsg.includes('UNIQUE constraint')) {
            console.log(`⏭️  Skipped statement ${i + 1} (already exists)`);
          } else {
            console.error(`❌ Error executing statement ${i + 1}:`, errorMsg);
            console.error(`Statement: ${statement.substring(0, 100)}...`);
            // Không throw để tiếp tục với các statement khác
          }
        }
      }
    }
    
    // Verify tables were created
    try {
      const [tables] = await sqliteConnection.query<{ name: string }>(
        "SELECT name FROM sqlite_master WHERE type='table' AND name NOT LIKE 'sqlite_%'"
      );
      console.log('📊 Created tables:', tables.map((t: any) => t.name).join(', '));
    } catch (error) {
      console.warn('⚠️  Could not verify tables:', error);
    }
    
    console.log('✅ SQLite database initialized successfully');
  } catch (error) {
    console.error('❌ Failed to initialize SQLite database:', error);
    throw error;
  }
}

