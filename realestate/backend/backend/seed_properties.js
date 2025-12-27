const mongoose = require('mongoose');
require('dotenv').config();
const Property = require('./models/Property');
const connectDB = require('./config/db');

const titles = [
    'Luxury Penthouse with City View',
    'Modern Apartment in Downtown',
    'Spacious Family Home near Park',
    'Charming Suburban House',
    'Cozy Studio in City Center',
    'Stunning Villa with Pool',
    'Sleek Office Space for Rent',
    'Commercial Shop in Busy Market',
    'Quiet Residential Plot',
    'Contemporary Condo with Balcony'
];

const cities = ['Bangalore', 'Mumbai', 'Delhi', 'Chennai', 'Hyderabad', 'Pune'];
const states = ['Karnataka', 'Maharashtra', 'Delhi', 'Tamil Nadu', 'Telangana'];
const propertyTypes = ['apartment', 'house', 'villa', 'condo', 'office', 'shop', 'warehouse', 'plot'];
const listingTypes = ['rent', 'sell', 'lease', 'commercial'];
const amenitiesList = ['Parking', 'Security', 'Wi-Fi', 'Gym', 'Swimming Pool', 'Garden', 'Elevator', 'Air Conditioning'];

const generateDummyProperties = async (count = 50) => {
    try {
        await connectDB();
        console.log(`Starting to generate ${count} dummy properties...`);

        const properties = [];

        for (let i = 0; i < count; i++) {
            const city = cities[Math.floor(Math.random() * cities.length)];
            const state = states[Math.floor(Math.random() * states.length)];
            const listingType = listingTypes[Math.floor(Math.random() * listingTypes.length)];
            const propertyType = propertyTypes[Math.floor(Math.random() * propertyTypes.length)];

            // Generate some amenities
            const amenities = [];
            const amenityCount = Math.floor(Math.random() * 5) + 1;
            for (let j = 0; j < amenityCount; j++) {
                const amenity = amenitiesList[Math.floor(Math.random() * amenitiesList.length)];
                if (!amenities.includes(amenity)) {
                    amenities.push(amenity);
                }
            }

            const property = {
                title: `${titles[Math.floor(Math.random() * titles.length)]} ${i + 1}`,
                description: 'This is a beautiful property located in a prime area with all modern amenities.',
                location: {
                    address: `${Math.floor(Math.random() * 1000)} ${city} Road`,
                    city: city,
                    state: state,
                    pincode: `${Math.floor(Math.random() * 900000) + 100000}`,
                    country: 'India',
                    coordinates: {
                        lat: 12.9716 + (Math.random() - 0.5) * 0.1,
                        lng: 77.5946 + (Math.random() - 0.5) * 0.1
                    }
                },
                ownerDetails: {
                    name: `Dummy Owner ${i + 1}`,
                    email: `owner${i + 1}@example.com`,
                    phone: `9${Math.floor(Math.random() * 900000000) + 100000000}`,
                    idProofType: 'Aadhar',
                    idProofNumber: `AD${Math.floor(Math.random() * 1000000000)}`
                },
                rent: listingType === 'sell' ? 0 : Math.floor(Math.random() * 50000) + 5000,
                price: listingType === 'sell' ? Math.floor(Math.random() * 10000000) + 1000000 : 0,
                deposit: listingType === 'sell' ? 0 : Math.floor(Math.random() * 200000) + 20000,
                listingType: listingType,
                category: ['office', 'shop', 'warehouse'].includes(propertyType) ? 'commercial' : 'residential',
                propertyType: propertyType,
                bedrooms: Math.floor(Math.random() * 4) + 1,
                bathrooms: Math.floor(Math.random() * 3) + 1,
                area: Math.floor(Math.random() * 2000) + 500,
                amenities: amenities,
                images: [
                    'https://images.unsplash.com/photo-1564013799919-ab600027ffc6?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=60',
                    'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=60'
                ],
                status: 'published',
                createdAt: new Date(),
                updatedAt: new Date()
            };

            properties.push(property);
        }

        await Property.insertMany(properties);
        console.log(`Successfully added ${count} dummy properties.`);
        process.exit(0);
    } catch (error) {
        console.error('Error generating dummy properties:', error);
        process.exit(1);
    }
};

generateDummyProperties(50);
