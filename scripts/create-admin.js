/**
 * Script to create initial admin user in MongoDB
 * Run once: node scripts/create-admin.js
 */

const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const MONGODB_URI = process.env.MONGODB_URI;
if (!MONGODB_URI) {
    throw new Error('Please define the MONGODB_URI environment variable inside .env.local');
}

const AdminUserSchema = new mongoose.Schema({
    email: String,
    password: String,
    role: String,
    createdAt: Date,
});

async function createAdmin() {
    try {
        await mongoose.connect(MONGODB_URI);
        console.log(' Connected to MongoDB Atlas');

        const AdminUser = mongoose.model('AdminUser', AdminUserSchema);

        // Hash password
        const hashedPassword = await bcrypt.hash('Admin_Poly_2026!', 12);

        // Delete existing admin users (for clean slate)
        await AdminUser.deleteMany({});
        console.log('️  Cleared existing admin users');

        // Create new admin
        await AdminUser.create({
            email: 'admin@polymarketwallet.com',
            password: hashedPassword,
            role: 'superadmin',
            createdAt: new Date(),
        });

        console.log(' Admin user created successfully!');
        console.log('️  IMPORTANT: Ensure you set a strong INITIAL_ADMIN_PASSWORD in your environment variables.');

        process.exit(0);
    } catch (error) {
        console.error(' Error:', error);
        process.exit(1);
    }
}

createAdmin();
