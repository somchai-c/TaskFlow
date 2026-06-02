import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';

import authRoutes from './routes/authRoutes';
import projectRoutes from './routes/projectRoutes';
import taskRoutes from './routes/taskRoutes';
import userRoutes from './routes/userRoutes';
import { prisma } from './prismaClient';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;

// Middlewares
app.use(cors());
app.use(express.json());

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/projects', projectRoutes);
app.use('/api/tasks', taskRoutes);
app.use('/api/users', userRoutes);

// Base / Health Check
app.get('/api/health', (req, res) => {
  res.status(200).json({ status: 'healthy', timestamp: new Date().toISOString() });
});

// Global error handler
app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
  console.error('Unhandled server error:', err);
  res.status(500).json({ error: 'Internal server error.' });
});

// Start listening
const server = app.listen(PORT, () => {
  console.log(`=========================================`);
  console.log(`🚀 TaskFlow Backend Server is running!`);
  console.log(`📡 URL: http://localhost:${PORT}`);
  console.log(`🛡️ JWT Security & Prisma Layer Active`);
  console.log(`=========================================`);
});

// Graceful shutdowns
process.on('SIGTERM', async () => {
  console.log('SIGTERM signal received. Shutting down gracefully...');
  server.close(async () => {
    await prisma.$disconnect();
    console.log('Backend server and Prisma database disconnected.');
    process.exit(0);
  });
});
