// model/Attendance.ts
import pool from '../config/connection';

export enum AttendanceStatus {
    CHECKED_IN = 'checked_in',
    CHECKED_OUT = 'checked_out',
    ABSENT = 'absent'
}

export interface Attendance {
    id: number;
    userId: number;
    checkInTime: Date;
    checkOutTime: Date | null;
    workDate: Date;
    totalHours: number | null;
    status: AttendanceStatus;
    notes: string | null;
    createdAt: Date;
    updatedAt: Date;
}

export interface AttendanceCreationAttributes {
    userId: number;
    checkInTime: Date;
    checkOutTime?: Date | null;
    workDate: Date;
    totalHours?: number | null;
    status?: AttendanceStatus;
    notes?: string | null;
}

export interface AttendanceUpdateAttributes {
    checkOutTime?: Date | null;
    totalHours?: number | null;
    status?: AttendanceStatus;
    notes?: string | null;
}

class AttendanceStore {
    // CREATE attendance record
    async create(data: AttendanceCreationAttributes): Promise<Attendance> {
        const status = data.status || AttendanceStatus.CHECKED_IN;
        const [rows, result] = await pool.query(
            `INSERT INTO attendance ("userId", "checkInTime", "checkOutTime", "workDate", "totalHours", status, notes) 
       VALUES (?, ?, ?, ?, ?, ?, ?) RETURNING *`,
            [
                data.userId,
                data.checkInTime,
                data.checkOutTime || null,
                data.workDate,
                data.totalHours || null,
                status,
                data.notes || null
            ]
        );

        // If RETURNING * returns the full row, use it directly
        if (rows && rows.length > 0) {
            return (rows as Attendance[])[0];
        }

        // Fallback: get by insertId
        const newId = result.insertId;
        if (!newId) {
            throw new Error('Failed to get inserted attendance ID');
        }

        const [selectedRows] = await pool.query('SELECT * FROM attendance WHERE id = ?', [newId]);
        return (selectedRows as Attendance[])[0];
    }

    // FIND BY ID
    async findById(id: number): Promise<Attendance | null> {
        const [rows] = await pool.query('SELECT * FROM attendance WHERE id = ?', [id]);
        return (rows as Attendance[])[0] || null;
    }

    // FIND BY USER ID
    async findByUserId(userId: number): Promise<Attendance[]> {
        const [rows] = await pool.query(
            'SELECT * FROM attendance WHERE "userId" = ? ORDER BY "workDate" DESC, "checkInTime" DESC',
            [userId]
        );
        return rows as Attendance[];
    }

    // FIND BY USER ID AND DATE
    async findByUserIdAndDate(userId: number, workDate: Date): Promise<Attendance | null> {
        const dateStr = workDate.toISOString().split('T')[0]; // YYYY-MM-DD
        const [rows] = await pool.query(
            'SELECT * FROM attendance WHERE "userId" = ? AND "workDate" = ?',
            [userId, dateStr]
        );
        return (rows as Attendance[])[0] || null;
    }

    // FIND TODAY'S ATTENDANCE FOR USER
    async findTodayByUserId(userId: number): Promise<Attendance | null> {
        const today = new Date().toISOString().split('T')[0]; // YYYY-MM-DD
        const [rows] = await pool.query(
            'SELECT * FROM attendance WHERE "userId" = ? AND "workDate" = ?',
            [userId, today]
        );
        return (rows as Attendance[])[0] || null;
    }

    // FIND ALL (with pagination)
    async findAll(limit?: number, offset?: number): Promise<Attendance[]> {
        let query = 'SELECT * FROM attendance ORDER BY "workDate" DESC, "checkInTime" DESC';
        const params: any[] = [];

        if (limit !== undefined) {
            query += ' LIMIT ?';
            params.push(limit);
            if (offset !== undefined) {
                query += ' OFFSET ?';
                params.push(offset);
            }
        }

        const [rows] = await pool.query(query, params);
        return rows as Attendance[];
    }

    // FIND BY DATE RANGE
    async findByDateRange(startDate: Date, endDate: Date, userId?: number): Promise<Attendance[]> {
        const startDateStr = startDate.toISOString().split('T')[0];
        const endDateStr = endDate.toISOString().split('T')[0];

        let query = 'SELECT * FROM attendance WHERE "workDate" >= ? AND "workDate" <= ?';
        const params: any[] = [startDateStr, endDateStr];

        if (userId !== undefined) {
            query += ' AND "userId" = ?';
            params.push(userId);
        }

        query += ' ORDER BY "workDate" DESC, "checkInTime" DESC';

        const [rows] = await pool.query(query, params);
        return rows as Attendance[];
    }

    // UPDATE
    async update(id: number, data: AttendanceUpdateAttributes): Promise<Attendance | null> {
        const fields: string[] = [];
        const values: any[] = [];

        if (data.checkOutTime !== undefined) {
            fields.push("\"checkOutTime\" = ?");
            values.push(data.checkOutTime);
        }
        if (data.totalHours !== undefined) {
            fields.push("\"totalHours\" = ?");
            values.push(data.totalHours);
        }
        if (data.status !== undefined) {
            fields.push("status = ?");
            values.push(data.status);
        }
        if (data.notes !== undefined) {
            fields.push("notes = ?");
            values.push(data.notes);
        }

        if (fields.length === 0) return null;

        values.push(id);

        const sql = `UPDATE attendance SET ${fields.join(', ')} WHERE id = ?`;
        const [, result] = await pool.query(sql, values);

        if (result.affectedRows === 0) return null;

        const [rows] = await pool.query('SELECT * FROM attendance WHERE id = ?', [id]);
        return (rows as Attendance[])[0] || null;
    }

    // DELETE
    async delete(id: number): Promise<boolean> {
        const [, result] = await pool.query(
            'DELETE FROM attendance WHERE id = ?',
            [id]
        );
        return result.affectedRows > 0;
    }

    // GET STATISTICS
    async getStatistics(startDate: Date, endDate: Date, userId?: number): Promise<{
        totalRecords: number;
        totalHours: number;
        averageHours: number;
        checkedInCount: number;
        checkedOutCount: number;
        absentCount: number;
    }> {
        const startDateStr = startDate.toISOString().split('T')[0];
        const endDateStr = endDate.toISOString().split('T')[0];

        let query = `
      SELECT 
        COUNT(*) as "totalRecords",
        COALESCE(SUM("totalHours"), 0) as "totalHours",
        COALESCE(AVG("totalHours"), 0) as "averageHours",
        SUM(CASE WHEN status = 'checked_in' THEN 1 ELSE 0 END) as "checkedInCount",
        SUM(CASE WHEN status = 'checked_out' THEN 1 ELSE 0 END) as "checkedOutCount",
        SUM(CASE WHEN status = 'absent' THEN 1 ELSE 0 END) as "absentCount"
      FROM attendance 
      WHERE "workDate" >= ? AND "workDate" <= ?
    `;
        const params: any[] = [startDateStr, endDateStr];

        if (userId !== undefined) {
            query += ' AND "userId" = ?';
            params.push(userId);
        }

        const [rows] = await pool.query(query, params);
        const result = (rows as any[])[0];

        return {
            totalRecords: Number(result.totalRecords) || 0,
            totalHours: Number(result.totalHours) || 0,
            averageHours: Number(result.averageHours) || 0,
            checkedInCount: Number(result.checkedInCount) || 0,
            checkedOutCount: Number(result.checkedOutCount) || 0,
            absentCount: Number(result.absentCount) || 0
        };
    }
}

const attendanceStore = new AttendanceStore();
export default attendanceStore;

