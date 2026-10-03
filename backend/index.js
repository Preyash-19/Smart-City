import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { PrismaClient } from '@prisma/client';

import authRoutes from './routes/authRoutes.js';
import complaintRoutes from './routes/complaintRoutes.js'; // 👈 1. Import new routes
import notificationRoutes from './routes/notificationRoutes.js';

dotenv.config();

const app = express();
const prisma = new PrismaClient();

app.use(cors());
app.use(express.json());

app.use('/api/auth', authRoutes);
app.use('/api/complaints', complaintRoutes); // 👈 2. Tell the server to use them
app.use('/api/notifications', notificationRoutes);

app.get('/', (req, res) => {
  res.send("Smart City API is running successfully! 🚀");
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