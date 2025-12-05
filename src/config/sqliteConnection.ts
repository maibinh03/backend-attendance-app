import sqlite3 from 'sqlite3';
import * as fs from 'fs';
import * as path from 'path';

export interface SQLiteResultSetHeader {
  insertId: number;
  affectedRows: number;
}

class SQLiteConnection {
  private db: sqlite3.Database | null = null;
  private dbPath: string;

  constructor(dbPath?: string) {
    this.dbPath = dbPath || path.join(__dirname, '../../database/attendance.db');

    const dbDir = path.dirname(this.dbPath);
    if (!fs.existsSync(dbDir)) {
      fs.mkdirSync(dbDir, { recursive: true });
    }
  }

  async connect(): Promise<void> {
    return new Promise((resolve, reject) => {
      this.db = new sqlite3.Database(this.dbPath, (err) => {
        if (err) {
          reject(err);
        } else {
          this.db!.run('PRAGMA foreign_keys = ON', (err) => {
            if (err) reject(err);
            else resolve();
          });
        }
      });
    });
  }

  async query<T = any>(sql: string, params?: any[]): Promise<[T[], SQLiteResultSetHeader]> {
    if (!this.db) {
      await this.connect();
    }

    return new Promise((resolve, reject) => {
      if (!this.db) {
        reject(new Error('Database not connected'));
        return;
      }

      const isModifyQuery = sql.trim().toUpperCase().startsWith('INSERT') ||
        sql.trim().toUpperCase().startsWith('UPDATE') ||
        sql.trim().toUpperCase().startsWith('DELETE');

      if (isModifyQuery) {
        this.db.run(sql, params || [], function (err) {
          if (err) {
            reject(err);
          } else {
            const result: SQLiteResultSetHeader = {
              insertId: this.lastID || 0,
              affectedRows: this.changes || 0
            };
            resolve([[] as T[], result]);
          }
        });
      } else {
        this.db.all(sql, params || [], (err, rows) => {
          if (err) {
            reject(err);
          } else {
            const result: SQLiteResultSetHeader = {
              insertId: 0,
              affectedRows: rows.length
            };
            resolve([rows as T[], result]);
          }
        });
      }
    });
  }

  async getConnection(): Promise<SQLiteConnection> {
    if (!this.db) {
      await this.connect();
    }
    return this;
  }

  async close(): Promise<void> {
    return new Promise((resolve, reject) => {
      if (this.db) {
        this.db.close((err) => {
          if (err) reject(err);
          else {
            this.db = null;
            resolve();
          }
        });
      } else {
        resolve();
      }
    });
  }

  getDbPath(): string {
    return this.dbPath;
  }
}

const sqliteConnection = new SQLiteConnection();

export default sqliteConnection;

