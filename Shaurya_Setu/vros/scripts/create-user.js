require('dotenv').config({ path: '.env.local' });
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

// --- Define the User schema here (JS version of models/User.ts) ---
const UserSchema = new mongoose.Schema(
  {
    email: {
      type: String,
      required: true,
      unique: true,
    },
    password: {
      type: String,
      required: true,
    },
    role: {
      type: String,
      enum: ['veteran', 'employer', 'counsellor', 'admin'],
      required: true,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    createdAt: {
      type: Date,
      default: Date.now,
    },
  }
);

const User = mongoose.models.User || mongoose.model('User', UserSchema);
// ------------------------------------------------------------------

async function createUser() {
  try {
    console.log('Connecting to MongoDB...');
    console.log('MongoDB URI:', process.env.MONGODB_URI ? 'Found' : 'NOT FOUND');
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Connected to MongoDB');

    const email = 'sumityadav1@example.com';
    const password = '12321';

    const hashedPassword = bcrypt.hashSync(password, 10);

    const user = await User.create({
      email,
      password: hashedPassword,
      role: 'veteran',
      isActive: true,
    });

    console.log('\n✅ User created successfully!');
    console.log('Email:', user.email);
    console.log('Role:', user.role);
    console.log('Password:', password);
    console.log('\nYou can now log in with these credentials.');

    await mongoose.disconnect();
    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error.message);
    console.error('Full error:', error);
    if (error.code === 11000) {
      console.log('User already exists! Try a different email.');
    }
    process.exit(1);
  }
}

createUser();