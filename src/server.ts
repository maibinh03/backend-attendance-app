// server.ts
import express from 'express';
import cors from 'cors';
import userRoutes from './routes/userRoutes';
import attendanceRoutes from './routes/attendanceRoutes';
import { errorHandler } from './middleware/errorHandler';
import pool from './config/connection';
import { initializeSQLiteDatabase } from './utils/initSQLite';
import dotenv from 'dotenv';
dotenv.config();

const app = express();

// CORS configuration
app.use(cors({
    origin: process.env.FRONTEND_URL,
    credentials: true
}));

app.use(express.json());

// Routes
app.use('/api/users', userRoutes);
app.use('/api/attendance', attendanceRoutes);

// Error handler
app.use(errorHandler);

// Initialize database and start server
const PORT = process.env.PORT as string;

const startServer = async (): Promise<void> => {
    try {
        // Khởi tạo SQLite database
        console.log('📦 Initializing SQLite database...');
        await initializeSQLiteDatabase();

        // Test database connection
        await pool.getConnection();
        console.log('✅ Database connection successful');

        // Start server
        app.listen(PORT, () => {
            console.log(`🚀 Server is running on http://localhost:${PORT}`);
            console.log(`💾 Database: SQLite (file-based, no server needed)`);
        });

    } catch (error) {
        console.error('❌ Failed to start server:', error);
        process.exit(1);
    }
};

startServer();

export default app;
