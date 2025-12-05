// model/User.ts
import pool, { ResultSetHeader } from '../config/connection';
import { UserRole } from '../types/roles';

export interface User {
  id: number;
  username: string;
  password: string;
  email?: string;
  fullName?: string;
  role: UserRole;
  createdAt: Date;
  updatedAt: Date;
}

export interface UserCreationAttributes {
  username: string;
  password: string;
  email?: string;
  fullName?: string;
  role?: UserRole;
}

class UserStore {

  // CREATE user
  async create(data: UserCreationAttributes): Promise<User> {
    const role = data.role || UserRole.USER; // Default role is USER
    const [result] = await pool.query<ResultSetHeader>(
      `INSERT INTO users (username, password, email, fullName, role) VALUES (?, ?, ?, ?, ?)`,
      [data.username, data.password, data.email, data.fullName, role]
    );

    const newId = result.insertId;

    const [rows] = await pool.query('SELECT * FROM users WHERE id = ?', [newId]);
    return (rows as User[])[0];
  }

  // FIND BY USERNAME
  async findByUsername(username: string): Promise<User | null> {
    const [rows] = await pool.query('SELECT * FROM users WHERE username = ?', [username]);
    return (rows as User[])[0] || null;
  }

  // FIND BY ID
  async findById(id: number): Promise<User | null> {
    const [rows] = await pool.query('SELECT * FROM users WHERE id = ?', [id]);
    return (rows as User[])[0] || null;
  }

  // FIND ALL
  async findAll(): Promise<User[]> {
    const [rows] = await pool.query('SELECT * FROM users');
    return (rows as User[]);
  }

  // UPDATE
  async update(id: number, data: UserCreationAttributes): Promise<User | null> {
    const fields: string[] = [];
    const values: any[] = [];

    if (data.username !== undefined) { fields.push("username = ?"); values.push(data.username); }
    if (data.password !== undefined) { fields.push("password = ?"); values.push(data.password); }
    if (data.email !== undefined) { fields.push("email = ?"); values.push(data.email); }
    if (data.fullName !== undefined) { fields.push("fullName = ?"); values.push(data.fullName); }
    if (data.role !== undefined) { fields.push("role = ?"); values.push(data.role); }
    if (fields.length === 0) return null;

    values.push(id);

    const sql = `UPDATE users SET ${fields.join(', ')} WHERE id = ?`;
    const [result] = await pool.query<ResultSetHeader>(sql, values);

    if (result.affectedRows === 0) return null;

    const [rows] = await pool.query('SELECT * FROM users WHERE id = ?', [id]);
    return (rows as User[])[0] || null;
  }

  // DELETE
  async delete(id: number): Promise<boolean> {
    const [result] = await pool.query<ResultSetHeader>(
      'DELETE FROM users WHERE id = ?',
      [id]
    );
    return result.affectedRows > 0;
  }

  // FIND BY EMAIL
  async findByEmail(email: string): Promise<User | null> {
    const [rows] = await pool.query(
      'SELECT * FROM users WHERE email = ?',
      [email]
    );
    return (rows as User[])[0] || null;
  }
}

const userStore = new UserStore();
export default userStore;
