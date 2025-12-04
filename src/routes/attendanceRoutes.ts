import express from 'express';
import { authMiddleware } from '../middleware/auth';
import { requireAdmin } from '../middleware/authorize';
import {
  checkIn,
  checkOut,
  getTodayAttendance,
  getUserAttendanceHistory,
  getStatistics,
  getAllAttendance
} from '../controller/attendanceController';

const router = express.Router();

// Tất cả routes đều cần xác thực
router.use(authMiddleware);

// User routes
router.post('/checkin', checkIn);                    // POST /api/attendance/checkin
router.post('/checkout', checkOut);                  // POST /api/attendance/checkout
router.get('/today', getTodayAttendance);            // GET /api/attendance/today
router.get('/history', getUserAttendanceHistory);    // GET /api/attendance/history

// Admin routes
router.get('/statistics', requireAdmin, getStatistics);  // GET /api/attendance/statistics
router.get('/all', requireAdmin, getAllAttendance);     // GET /api/attendance/all

export default router;

