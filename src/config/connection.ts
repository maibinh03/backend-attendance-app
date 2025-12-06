
import { Pool, QueryResultRow } from 'pg';
import dotenv from 'dotenv';
dotenv.config();

export interface PostgresResultSetHeader {
  insertId?: number;
  affectedRows: number;
  rowCount: number;
}

class PostgresConnection {
  private pool: Pool;

  constructor() {
    // Hỗ trợ Neon connection string hoặc các biến môi trường riêng lẻ
    const connectionString = process.env.DATABASE_URL;

    let poolConfig: any;

    if (connectionString) {
      // Sử dụng connection string (Neon, Supabase, etc.)
      // Lưu ý: Nếu connection string có sslmode trong URL, pg sẽ tự động xử lý SSL
      // Không cần set SSL config riêng để tránh conflict
      poolConfig = {
        connectionString: connectionString,
        max: 20,
        idleTimeoutMillis: 30000,
        connectionTimeoutMillis: 2000,
        // Chỉ set SSL nếu connection string không có sslmode và DB_SSL được set
        // Nếu connection string đã có sslmode=require, pg sẽ tự động xử lý
      };
    } else {
      // Sử dụng các biến môi trường riêng lẻ (cho local development)
      poolConfig = {
        host: process.env.DB_HOST,
        port: parseInt(process.env.DB_PORT as string),
        database: process.env.DB_NAME,
        user: process.env.DB_USER,
        password: process.env.DB_PASSWORD,
        max: 20,
        idleTimeoutMillis: 30000,
        connectionTimeoutMillis: 2000,
        // SSL cho production (Neon)
        ssl: process.env.DB_SSL === 'true' ? {
          rejectUnauthorized: false
        } : false,
      };
    }

    this.pool = new Pool(poolConfig);

    // Log connection errors
    this.pool.on('error', (err) => {
      console.error('Unexpected error on idle client', err);
      process.exit(-1);
    });
  }

  async connect(): Promise<void> {
    try {
      const client = await this.pool.connect();
      console.log('✅ Connected to PostgreSQL database');
      client.release();
    } catch (error) {
      console.error('❌ Failed to connect to PostgreSQL:', error);
      throw error;
    }
  }

  // Convert SQLite-style ? placeholders to PostgreSQL $1, $2, ... placeholders
  private convertPlaceholders(sql: string, params?: any[]): string {
    if (!params || params.length === 0) {
      return sql;
    }

    let paramIndex = 1;
    return sql.replace(/\?/g, () => `$${paramIndex++}`);
  }

  async query<T extends QueryResultRow = any>(sql: string, params?: any[]): Promise<[T[], PostgresResultSetHeader]> {
    try {
      // Convert ? placeholders to PostgreSQL $1, $2, ... format
      const convertedSql = this.convertPlaceholders(sql, params);

      const result = await this.pool.query<T>(convertedSql, params);

      const header: PostgresResultSetHeader = {
        insertId: undefined,
        affectedRows: result.rowCount || 0,
        rowCount: result.rowCount || 0
      };

      // For INSERT queries with RETURNING clause, get the ID from the result
      const sqlUpper = sql.trim().toUpperCase();
      if (sqlUpper.startsWith('INSERT')) {
        if (sqlUpper.includes('RETURNING')) {
          // If RETURNING is used, the id should be in result.rows[0]
          if (result.rows.length > 0) {
            const firstRow = result.rows[0] as any;
            // Check for 'id' property (case insensitive for safety)
            if (firstRow.hasOwnProperty('id')) {
              header.insertId = typeof firstRow.id === 'number' ? firstRow.id : parseInt(firstRow.id);
            } else if (firstRow.ID) {
              header.insertId = typeof firstRow.ID === 'number' ? firstRow.ID : parseInt(firstRow.ID);
            }
          }
        } else {
          // If no RETURNING, use lastval() to get the last inserted ID
          try {
            const idResult = await this.pool.query('SELECT lastval() as id');
            if (idResult.rows.length > 0 && idResult.rows[0]) {
              const idValue = (idResult.rows[0] as any).id;
              header.insertId = typeof idValue === 'number' ? idValue : parseInt(idValue);
            }
          } catch {
            // Ignore if lastval fails (e.g., no sequence was used)
          }
        }
      }

      return [result.rows as T[], header];
    } catch (error) {
      console.error('Database query error:', error);
      console.error('SQL:', sql);
      console.error('Params:', params);
      throw error;
    }
  }

  async getConnection(): Promise<PostgresConnection> {
    return this;
  }

  async close(): Promise<void> {
    await this.pool.end();
  }

  getPool(): Pool {
    return this.pool;
  }
}

const pool = new PostgresConnection();

export type ResultSetHeader = PostgresResultSetHeader;
export default pool;
