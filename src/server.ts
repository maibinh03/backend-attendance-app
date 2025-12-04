// server.ts
import express from 'express';
import cors from 'cors';
import userRoutes from './routes/userRoutes';
import attendanceRoutes from './routes/attendanceRoutes';
import { errorHandler } from './middleware/errorHandler';
// import { seedUsers } from './utils/seedUsers';
import pool from './config/connection';
import dotenv from 'dotenv';
dotenv.config();

const app = express();

// CORS configuration
app.use(cors({
    origin: 'http://localhost:5000',  // cho phép FE truy cập
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
        // Start server
        app.listen(PORT, () => {
            console.log(`🚀 Server is running on http://localhost:${PORT}`);
        });

        pool.getConnection().then((connection) => {
            console.log('✅ Database connection successful');
            connection.release();
        }).catch((error) => {
            console.error('❌ Failed to get database connection:', error);
            process.exit(1);
        });

    } catch (error) {
        console.error('❌ Failed to start server:', error);
        process.exit(1);
    }
};

startServer();

export default app;
