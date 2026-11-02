import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import dotenv from 'dotenv';
dotenv.config();

async function run() {
  await mongoose.connect(process.env.MONGODB_URI);
  const hash = await bcrypt.hash('Admin@123456', 12);

  const res = await mongoose.connection.collection('users').updateOne(
    { phone: '8690708302' },
    {
      $set: {
        email: 'admin@bhuwneshwari.com',
        name: 'Bhuwneshwari Admin',
        passwordHash: hash,
        role: 'admin',
        isActive: true,
        updatedAt: new Date()
      }
    }
  );

  console.log('Admin updated result:', res);
  process.exit(0);
}

run().catch(console.error);
