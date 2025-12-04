// service/attendanceService.ts
import attendanceStore from '../model/Attendance';
import {
    Attendance,
    AttendanceCreationAttributes,
    AttendanceUpdateAttributes,
    AttendanceStatus
} from '../model/Attendance';

class AttendanceService {
    // Check in
    async checkIn(userId: number, notes?: string): Promise<Attendance> {
        const now = new Date();
        const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());

        // Kiểm tra xem đã chấm công vào hôm nay chưa
        const existing = await attendanceStore.findTodayByUserId(userId);
        if (existing) {
            throw new Error('Bạn đã chấm công vào hôm nay rồi');
        }

        const data: AttendanceCreationAttributes = {
            userId,
            checkInTime: now,
            workDate: today,
            status: AttendanceStatus.CHECKED_IN,
            notes: notes || null
        };

        return await attendanceStore.create(data);
    }

    // Check out
    async checkOut(userId: number, notes?: string): Promise<Attendance> {
        const now = new Date();
        const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());

        // Tìm bản ghi chấm công hôm nay
        const attendance = await attendanceStore.findTodayByUserId(userId);
        if (!attendance) {
            throw new Error('Bạn chưa chấm công vào hôm nay');
        }

        if (attendance.checkOutTime) {
            throw new Error('Bạn đã chấm công ra hôm nay rồi');
        }

        // Tính số giờ làm việc
        const checkInTime = new Date(attendance.checkInTime);
        const checkOutTime = now;
        const diffMs = checkOutTime.getTime() - checkInTime.getTime();
        const totalHours = diffMs / (1000 * 60 * 60); // Chuyển từ milliseconds sang giờ

        const updateData: AttendanceUpdateAttributes = {
            checkOutTime: now,
            totalHours: Math.round(totalHours * 100) / 100, // Làm tròn 2 chữ số thập phân
            status: AttendanceStatus.CHECKED_OUT,
            notes: notes || attendance.notes || null
        };

        const updated = await attendanceStore.update(attendance.id, updateData);
        if (!updated) {
            throw new Error('Không thể cập nhật chấm công');
        }

        return updated;
    }

    // Get user's attendance history
    async getUserAttendance(userId: number, limit?: number, offset?: number): Promise<Attendance[]> {
        return await attendanceStore.findByUserId(userId);
    }

    // Get today's attendance
    async getTodayAttendance(userId: number): Promise<Attendance | null> {
        return await attendanceStore.findTodayByUserId(userId);
    }

    // Get attendance by date range
    async getAttendanceByDateRange(
        startDate: Date,
        endDate: Date,
        userId?: number
    ): Promise<Attendance[]> {
        return await attendanceStore.findByDateRange(startDate, endDate, userId);
    }

    // Get statistics
    async getStatistics(
        startDate: Date,
        endDate: Date,
        userId?: number
    ): Promise<{
        totalRecords: number;
        totalHours: number;
        averageHours: number;
        checkedInCount: number;
        checkedOutCount: number;
        absentCount: number;
    }> {
        return await attendanceStore.getStatistics(startDate, endDate, userId);
    }

    // Get all attendance (for admin)
    async getAllAttendance(limit?: number, offset?: number): Promise<Attendance[]> {
        return await attendanceStore.findAll(limit, offset);
    }
}

export default new AttendanceService();

