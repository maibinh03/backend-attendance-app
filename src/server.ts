// server.ts
import express from 'express';
import cors from 'cors';
import userRoutes from './routes/userRoutes';
import attendanceRoutes from './routes/attendanceRoutes';
import { errorHandler } from './middleware/errorHandler';
import pool from './config/connection';
import { initializePostgresDatabase } from './utils/initPostgres';
import { AddressInfo } from 'net';
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
const PORT = Number(process.env.PORT) || 3000;
const HOST = process.env.HOST; // optional, server can bind to all interfaces when undefined

const startServer = async (): Promise<void> => {
    try {
        // Khởi tạo PostgreSQL database
        console.log('📦 Initializing PostgreSQL database...');
        await initializePostgresDatabase();

        // Test database connection bằng cách query đơn giản
        try {
            await pool.query('SELECT 1');
            console.log('✅ Database connection successful');
        } catch (error) {
            console.error('❌ Database connection test failed:', error);
            throw error;
        }

        // Start server
        const server = HOST
            ? app.listen(PORT, HOST, logServerAddress)
            : app.listen(PORT, logServerAddress);

        function logServerAddress(): void {
            const address = server.address();
            let displayHost = HOST || 'localhost';
            let displayPort = PORT;

            if (typeof address === 'string') {
                displayHost = address;
            } else if (address && typeof address === 'object') {
                const { address: addrHost, port } = address as AddressInfo;
                displayHost = addrHost;
                displayPort = port;
            }

            if (displayHost === '::' || displayHost === '0.0.0.0') {
                displayHost = 'localhost';
            }

            console.log(`🚀 Server is running on http://${displayHost}:${displayPort}`);
            console.log(`💾 Database: PostgreSQL`);
            console.log(`🔗 Database: ${process.env.DB_HOST || 'localhost'}:${process.env.DB_PORT || '5432'}/${process.env.DB_NAME || 'attendance_db'}`);
        }

    } catch (error) {
        console.error('❌ Failed to start server:', error);
        process.exit(1);
    }
};

startServer();

export default app;
