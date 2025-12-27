require('dotenv').config();
const mongoose = require('mongoose');
const User = require('../models/User');

const updateAdmin = async () => {
    const MONGO_URI = process.env.MONGO_URI;
    if (!MONGO_URI) {
        console.error('❌ MONGO_URI is not defined in .env');
        process.exit(1);
    }

    const oldEmail = process.argv[2] || 'admin@truowners.com';
    const newEmail = process.argv[3] || 'admin@realestate.com';
    const newPassword = process.argv[4] || 'admin123';
    const newAccessKey = process.argv[5] || 'REALESTATE_ADMIN_2025';

    try {
        await mongoose.connect(MONGO_URI);
        console.log('✅ Connected to MongoDB');

        const user = await User.findOne({ email: oldEmail });
        if (!user) {
            console.error(`❌ User with email ${oldEmail} not found`);
            process.exit(1);
        }

        user.email = newEmail;
        user.password = newPassword;
        user.accessKey = newAccessKey;
        user.role = 'admin'; // Ensure it's admin
        user.verified = true;

        await user.save();
        console.log(`✅ Admin credentials updated for: ${newEmail}`);
        console.log(`Old Email:      ${oldEmail}`);
        console.log(`New Email:      ${newEmail}`);
        console.log(`New Password:   ${newPassword}`);
        console.log(`New Access Key: ${newAccessKey}`);

        process.exit(0);
    } catch (error) {
        console.error('❌ Error updating admin:', error);
        process.exit(1);
    }
};

updateAdmin();
