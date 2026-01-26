/**
 * Script to create initial admin user in MongoDB
 * Run once: node scripts/create-admin.js
 */

const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb+srv://[REDACTED_DB_USER]:[REDACTED_DB_PASS]@cluster0.7kewabv.mongodb.net/polymarket?retryWrites=true&w=majority&appName=Cluster0';

const AdminUserSchema = new mongoose.Schema({
    email: String,
    password: String,
    role: String,
    createdAt: Date,
});

async function createAdmin() {
    try {
        await mongoose.connect(MONGODB_URI);
        console.log('✅ Connected to MongoDB Atlas');

        const AdminUser = mongoose.model('AdminUser', AdminUserSchema);

        // Hash password
        const hashedPassword = await bcrypt.hash('Admin_Poly_2026!', 12);

        // Delete existing admin users (for clean slate)
        await AdminUser.deleteMany({});
        console.log('🗑️  Cleared existing admin users');

        // Create new admin
        await AdminUser.create({
            email: 'admin@polymarketwallet.com',
            password: hashedPassword,
            role: 'superadmin',
            createdAt: new Date(),
        });

        console.log('✅ Admin user created successfully!');
        console.log('');
        console.log('📧 Email: admin@polymarketwallet.com');
        console.log('🔑 Password: Admin_Poly_2026!');
        console.log('');
        console.log('⚠️  IMPORTANT: Change this password after first login!');

        process.exit(0);
    } catch (error) {
        console.error('❌ Error:', error);
        process.exit(1);
    }
}

createAdmin();
