// utils/initPostgres.ts
import pool from '../config/connection';
import * as fs from 'fs';
import * as path from 'path';

export async function initializePostgresDatabase(): Promise<void> {
  try {
    console.log('🔌 Connecting to PostgreSQL database...');
    await pool.connect();

    // Kiểm tra xem database đã được khởi tạo chưa
    const [existingTables] = await pool.query<{ tablename: string }>(
      "SELECT tablename FROM pg_tables WHERE schemaname = 'public' AND tablename IN ('users', 'attendance')"
    );

    const hasUsersTable = existingTables.some((t: any) => t.tablename === 'users');
    const hasAttendanceTable = existingTables.some((t: any) => t.tablename === 'attendance');

    if (hasUsersTable && hasAttendanceTable) {
      console.log('✅ Database already initialized. Skipping schema creation.');
      return;
    }

    console.log('📦 Database not initialized. Creating schema...');

    // Tìm file schema từ nhiều vị trí có thể
    const possiblePaths = [
      path.join(__dirname, '../../database/database.postgres.sql'),
      path.join(__dirname, '../database/database.postgres.sql'),
      path.join(process.cwd(), 'database/database.postgres.sql'),
      path.join(process.cwd(), 'src/database/database.postgres.sql'),
      path.join(process.cwd(), 'backend/database/database.postgres.sql')
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

    // Loại bỏ comment để tránh lỗi không cần thiết khi chạy cả file
    const cleanedSQL = schemaSQL
      .split('\n')
      .map(line => {
        // Loại bỏ comment dòng đơn
        const commentIndex = line.indexOf('--');
        if (commentIndex >= 0) {
          return line.substring(0, commentIndex);
        }
        return line;
      })
      .join('\n')
      .replace(/\/\*[\s\S]*?\*\//g, ''); // Loại bỏ comment block

    console.log('📝 Executing schema SQL as a single batch');
    try {
      await pool.query(cleanedSQL);
      console.log('✅ Executed schema successfully');
    } catch (error: any) {
      console.error('❌ Error executing schema SQL:', error?.message || error);
      throw error;
    }

    // Verify tables were created
    try {
      const [tables] = await pool.query<{ tablename: string }>(
        "SELECT tablename FROM pg_tables WHERE schemaname = 'public'"
      );
      console.log('📊 Created tables:', tables.map((t: any) => t.tablename).join(', '));
    } catch (error) {
      console.warn('⚠️  Could not verify tables:', error);
    }

    console.log('✅ PostgreSQL database initialized successfully');
  } catch (error) {
    console.error('❌ Failed to initialize PostgreSQL database:', error);
    throw error;
  }
}

