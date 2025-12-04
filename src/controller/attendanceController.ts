// controller/attendanceController.ts
import { Response } from 'express';
import attendanceService from '../service/attendanceService';
import { AuthRequest } from '../middleware/auth';
import { UserRole } from '../types/roles';

// Chấm công vào
export const checkIn = async (req: AuthRequest, res: Response) => {
  try {
    if (!req.user) {
      return res.status(401).json({ message: 'Chưa xác thực' });
    }

    const { notes } = req.body;
    const attendance = await attendanceService.checkIn(req.user.id, notes);

    return res.json({
      success: true,
      message: 'Chấm công vào thành công',
      data: attendance
    });
  } catch (error: any) {
    return res.status(400).json({
      success: false,
      message: error.message || 'Không thể chấm công vào'
    });
  }
};

// Chấm công ra
export const checkOut = async (req: AuthRequest, res: Response) => {
  try {
    if (!req.user) {
      return res.status(401).json({ message: 'Chưa xác thực' });
    }

    const { notes } = req.body;
    const attendance = await attendanceService.checkOut(req.user.id, notes);

    return res.json({
      success: true,
      message: 'Chấm công ra thành công',
      data: attendance
    });
  } catch (error: any) {
    return res.status(400).json({
      success: false,
      message: error.message || 'Không thể chấm công ra'
    });
  }
};

// Lấy chấm công hôm nay
export const getTodayAttendance = async (req: AuthRequest, res: Response) => {
  try {
    if (!req.user) {
      return res.status(401).json({ message: 'Chưa xác thực' });
    }

    const attendance = await attendanceService.getTodayAttendance(req.user.id);

    return res.json({
      success: true,
      data: attendance
    });
  } catch (error: any) {
    return res.status(500).json({
      success: false,
      message: error.message || 'Không thể lấy dữ liệu chấm công'
    });
  }
};

// Lấy lịch sử chấm công của user
export const getUserAttendanceHistory = async (req: AuthRequest, res: Response) => {
  try {
    if (!req.user) {
      return res.status(401).json({ message: 'Chưa xác thực' });
    }

    const userId = req.user.id;
    const limit = req.query.limit ? Number(req.query.limit) : undefined;
    const offset = req.query.offset ? Number(req.query.offset) : undefined;

    const attendance = await attendanceService.getUserAttendance(userId, limit, offset);

    return res.json({
      success: true,
      data: attendance
    });
  } catch (error: any) {
    return res.status(500).json({
      success: false,
      message: error.message || 'Không thể lấy lịch sử chấm công'
    });
  }
};

// Lấy thống kê chấm công (cho admin)
export const getStatistics = async (req: AuthRequest, res: Response) => {
  try {
    if (!req.user) {
      return res.status(401).json({ message: 'Chưa xác thực' });
    }

    // Chỉ admin mới xem được thống kê
    if (req.user.role !== UserRole.ADMIN) {
      return res.status(403).json({ message: 'Bạn không có quyền xem thống kê' });
    }

    const startDate = req.query.startDate 
      ? new Date(req.query.startDate as string) 
      : new Date(new Date().setDate(new Date().getDate() - 30)); // Mặc định 30 ngày gần đây
    
    const endDate = req.query.endDate 
      ? new Date(req.query.endDate as string) 
      : new Date();

    const userId = req.query.userId ? Number(req.query.userId) : undefined;

    const statistics = await attendanceService.getStatistics(startDate, endDate, userId);

    return res.json({
      success: true,
      data: statistics
    });
  } catch (error: any) {
    return res.status(500).json({
      success: false,
      message: error.message || 'Không thể lấy thống kê'
    });
  }
};

// Lấy tất cả chấm công (cho admin)
export const getAllAttendance = async (req: AuthRequest, res: Response) => {
  try {
    if (!req.user) {
      return res.status(401).json({ message: 'Chưa xác thực' });
    }

    // Chỉ admin mới xem được tất cả chấm công
    if (req.user.role !== UserRole.ADMIN) {
      return res.status(403).json({ message: 'Bạn không có quyền xem tất cả chấm công' });
    }

    const startDate = req.query.startDate 
      ? new Date(req.query.startDate as string) 
      : undefined;
    
    const endDate = req.query.endDate 
      ? new Date(req.query.endDate as string) 
      : undefined;

    const userId = req.query.userId ? Number(req.query.userId) : undefined;
    const limit = req.query.limit ? Number(req.query.limit) : 100;
    const offset = req.query.offset ? Number(req.query.offset) : 0;

    let attendance;
    if (startDate && endDate) {
      attendance = await attendanceService.getAttendanceByDateRange(startDate, endDate, userId);
    } else {
      attendance = await attendanceService.getAllAttendance(limit, offset);
    }

    return res.json({
      success: true,
      data: attendance
    });
  } catch (error: any) {
    return res.status(500).json({
      success: false,
      message: error.message || 'Không thể lấy dữ liệu chấm công'
    });
  }
};

