
import sqliteConnection, { SQLiteResultSetHeader } from './sqliteConnection';

export type ResultSetHeader = SQLiteResultSetHeader;

const pool = sqliteConnection;

export default pool;
