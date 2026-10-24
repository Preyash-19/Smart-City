import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { PrismaClient } from '@prisma/client';

import authRoutes from './routes/authRoutes.js';
import complaintRoutes from './routes/complaintRoutes.js';
import notificationRoutes from './routes/notificationRoutes.js';
import departmentUserRoutes from './routes/departmentUserRoutes.js';

import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Ensure uploads folder exists
const uploadsDir = path.join(__dirname, 'uploads');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

dotenv.config();

const app = express();
const prisma = new PrismaClient();

app.use(cors());
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb', extended: true }));
app.use('/uploads', express.static(uploadsDir));

app.use('/api/auth', authRoutes);
app.use('/api/complaints', complaintRoutes);
app.use('/api/notifications', notificationRoutes);
app.use('/api/admin/users', departmentUserRoutes);

app.get('/', (req, res) => {
  res.send("Smart City API is running successfully! 🚀");
});

app.get('/api/health', (req, res) => {
  res.status(200).json({ 
    status: 'ok', 
    timestamp: new Date().toISOString(),
    service: 'Smart City API'
  });
});

app.get('/test-db', async (req, res) => {
  try {
    const userCount = await prisma.user.count();
    res.json({ 
      message: "Database connection is PERFECT! ✅", 
      usersInDatabase: userCount 
    });
  } catch (error) {
    console.error("Database error:", error);
    res.status(500).json({ error: "Failed to connect to the database ❌" });
  }
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`=========================================`);
  console.log(`🚀 Server is running on port ${PORT}`);
  console.log(`=========================================`);
});