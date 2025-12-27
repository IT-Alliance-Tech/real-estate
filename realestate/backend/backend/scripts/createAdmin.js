require('dotenv').config();
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const User = require('../models/User');
const Admin = require('../models/Admin');
const { ROLES } = require('../utils/constants');

const createAdmin = async () => {
    const MONGO_URI = process.env.MONGO_URI;
    if (!MONGO_URI) {
        console.error('❌ MONGO_URI is not defined in .env');
        process.exit(1);
    }

    const adminEmail = process.argv[2] || 'admin@realestate.com';
    const adminPassword = process.argv[3] || 'admin123';
    const adminAccessKey = process.argv[4] || 'REALESTATE_ADMIN_2025';

    try {
        await mongoose.connect(MONGO_URI);
        console.log('✅ Connected to MongoDB');

        const existingUser = await User.findOne({ email: adminEmail });
        if (existingUser) {
            console.log(`⚠️ User with email ${adminEmail} already exists`);
            process.exit(0);
        }

        const user = new User({
            firstName: 'System',
            lastName: 'Admin',
            name: 'System Admin',
            email: adminEmail,
            password: adminPassword,
            accessKey: adminAccessKey,
            role: ROLES.ADMIN,
            verified: true
        });

        await user.save();
        console.log(`✅ User created with email: ${adminEmail}`);

        const admin = new Admin({
            user: user._id,
            permissions: ['manage_users', 'manage_properties', 'super_admin']
        });

        await admin.save();
        console.log('✅ Admin profile created');

        console.log('------------------------------------');
        console.log('Admin Credentials:');
        console.log(`Email:      ${adminEmail}`);
        console.log(`Password:   ${adminPassword}`);
        console.log(`Access Key: ${adminAccessKey}`);
        console.log('------------------------------------');

        process.exit(0);
    } catch (error) {
        console.error('❌ Error creating admin:', error);
        process.exit(1);
    }
};

createAdmin();
