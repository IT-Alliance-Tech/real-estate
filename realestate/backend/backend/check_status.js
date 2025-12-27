const mongoose = require('mongoose');
require('dotenv').config();
const Property = require('./models/Property');
const connectDB = require('./config/db');

const checkStatus = async () => {
    try {
        await connectDB();
        const counts = await Property.aggregate([
            { $group: { _id: "$status", count: { $sum: 1 } } }
        ]);
        console.log('Property status counts:', counts);
        process.exit(0);
    } catch (error) {
        console.error(error);
        process.exit(1);
    }
};

checkStatus();
