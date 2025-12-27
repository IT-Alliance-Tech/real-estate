const mongoose = require('mongoose');
require('dotenv').config();
const Property = require('./models/Property');
const connectDB = require('./config/db');

const dummyImages = [
    'https://images.unsplash.com/photo-1570129477492-45c003edd2be?ixlib=rb-4.0.3&auto=format&fit=crop&w=1470&q=80',
    'https://images.unsplash.com/photo-1568605114967-8130f3a36994?ixlib=rb-4.0.3&auto=format&fit=crop&w=1470&q=80',
    'https://images.unsplash.com/photo-1572120339558-26c09bc27eb4?ixlib=rb-4.0.3&auto=format&fit=crop&w=1470&q=80',
    'https://images.unsplash.com/photo-1582268611958-ebfd161ef9cf?ixlib=rb-4.0.3&auto=format&fit=crop&w=1470&q=80',
    'https://images.unsplash.com/photo-1598228723793-52759bba239c?ixlib=rb-4.0.3&auto=format&fit=crop&w=1470&q=80',
    'https://images.unsplash.com/photo-1564013799919-ab600027ffc6?ixlib=rb-4.0.3&auto=format&fit=crop&w=1470&q=80',
    'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?ixlib=rb-4.0.3&auto=format&fit=crop&w=1470&q=80',
    'https://images.unsplash.com/photo-1448630360428-65456885c650?ixlib=rb-4.0.3&auto=format&fit=crop&w=1470&q=80'
];

const updateProperties = async () => {
    try {
        await connectDB();

        console.log('Fetching all properties...');
        const properties = await Property.find({});
        console.log(`Found ${properties.length} properties to update.`);

        for (const property of properties) {
            // Update location to Bangalore
            property.location.city = 'Bangalore';
            property.location.state = 'Karnataka';

            // Assign 2-3 random images from the dummy list
            const shuffled = [...dummyImages].sort(() => 0.5 - Math.random());
            property.images = shuffled.slice(0, Math.floor(Math.random() * 2) + 2);

            await property.save();
        }

        console.log(`Successfully updated ${properties.length} properties to Bangalore with dummy images.`);
        process.exit(0);
    } catch (error) {
        console.error('Error updating properties:', error);
        process.exit(1);
    }
};

updateProperties();
