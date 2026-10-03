import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

(async () => {
  try {
    const email = 'admin@city.gov';
    const existing = await prisma.user.findUnique({ where: { email } });
    if (existing) {
      console.log('Admin already exists:', existing.email);
      process.exit(0);
    }

    const passwordPlain = process.env.ADMIN_PW || 'password123';
    const hashed = bcrypt.hashSync(passwordPlain, 10);

    const user = await prisma.user.create({
      data: {
        email,
        password: hashed,
        role: 'ADMIN',
        name: 'Master Controller'
      }
    });

    console.log('Admin user created:', user.email);
    process.exit(0);
  } catch (err) {
    console.error('Failed to create admin:', err);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
})();
