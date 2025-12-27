const mongoose = require('mongoose');
require('dotenv').config();
const Property = require('./models/Property');
const connectDB = require('./config/db');

const publishProperties = async () => {
    try {
        await connectDB();

        // Update all properties that are not published or sold to 'published'
        const result = await Property.updateMany(
            { status: { $nin: ['published', 'sold'] } },
            { $set: { status: 'published', updatedAt: new Date() } }
        );

        console.log(`Matched ${result.matchedCount} properties and updated ${result.modifiedCount} to 'published'.`);
        process.exit(0);
    } catch (error) {
        console.error('Error publishing properties:', error);
        process.exit(1);
    }
};

publishProperties();
