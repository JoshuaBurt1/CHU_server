const express = require('express');
const { MongoClient } = require('mongodb');
const dotenv = require('dotenv'); // Import dotenv package
const cors = require('cors'); // To handle CORS for cross-origin requests

dotenv.config(); // Load environment variables from .env file (only for local dev)

const app = express();
const port = process.env.PORT || 3000; // Use the Render-provided port, or default to 3000 for local dev

// Use CORS to allow cross-origin requests (use more specific origins in production)
app.use(cors());

// MongoDB connection URL from .env file or Render environment variable
const uri = process.env.CONNECTION_STRING; // CONNECTION_STRING should be set in Render dashboard

let db;

// Connect to MongoDB
MongoClient.connect(uri)
    .then(client => {
        db = client.db('CHU_database'); // Use the correct database name
        console.log('Connected to MongoDB');
    })
    .catch(error => {
        console.error('Error connecting to MongoDB:', error);
        process.exit(1); // Exit the app if MongoDB connection fails
    });

// Root route handler
app.get('/', async (req, res) => {
    try {
        // Get the database name
        const databaseName = db.databaseName;

        // List all collections in the database
        const collections = await db.listCollections().toArray();

        // Extract the collection names from the list of collections
        const collectionNames = collections.map(collection => collection.name);

        // Send the response with database name and collection names
        res.json({
            message: `Welcome to the Camel Health Union server`,
            database: databaseName,
            collections: collectionNames
        });
    } catch (error) {
        console.error('Error fetching collections:', error);
        res.status(500).send('Error fetching collections');
    }
});

// Endpoint to fetch data from the "users" collection
app.get('/users', async (req, res) => {
    try {
        const collection = db.collection('users'); // "users" collection
        const usersData = await collection.find().toArray();
        res.json(usersData);
    } catch (error) {
        console.error('Error fetching users data:', error);
        res.status(500).send('Error fetching users data');
    }
});

// Endpoint to fetch data from the "heartrates" collection
app.get('/heartrates', async (req, res) => {
    try {
        const collection = db.collection('heartrates'); // "heartrates" collection
        const heartratesData = await collection.find().toArray();
        res.json(heartratesData);
    } catch (error) {
        console.error('Error fetching heartrates data:', error);
        res.status(500).send('Error fetching heartrates data');
    }
});

// Start the server
app.listen(port, () => {
    console.log(`Server running at http://localhost:${port}`); // This will be Render's public URL
});


/*
app.listen(port, '0.0.0.0', () => {
    console.log(`Server running at http://0.0.0.0:${port}`);
});*/
