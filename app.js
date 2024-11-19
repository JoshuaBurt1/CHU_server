const express = require('express');
const { MongoClient } = require('mongodb');
const dotenv = require('dotenv'); // Import dotenv package
const cors = require('cors'); // To handle CORS for cross-origin requests
const bodyParser = require('body-parser'); // Middleware to parse JSON bodies

dotenv.config(); // Load environment variables from .env file (only for local dev)

const app = express();
const port = process.env.PORT || 3000; // Use the Render-provided port, or default to 3000 for local dev

// Use CORS to allow cross-origin requests (use more specific origins in production)
app.use(cors());

// Parse incoming requests with JSON payloads
app.use(bodyParser.json());

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
        const databaseName = db.databaseName;
        const collections = await db.listCollections().toArray();

        // Prepare an object to store the data of all collections
        const collectionsData = {};
        for (const collection of collections) {
            const collectionName = collection.name;
            const collectionData = await db.collection(collectionName).find().toArray(); // Fetch all documents
            collectionsData[collectionName] = collectionData; // Add the data to the object
        }

        // Send the response with database name and collection contents
        res.json({
            message: `Welcome to the Camel Health Union server`,
            database: databaseName,
            collections: collectionsData
        });
    } catch (error) {
        console.error('Error fetching collections data:', error);
        res.status(500).send('Error fetching collections data');
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

// Test POST to create a user and heart rate
/*
app.post('/test-post', async (req, res) => {
    try {
        // Example user and heart rate data to be inserted
        const user = {
            username: "testuser-ERROR",
            email: "testuser@example.com",
            password: "password123"
        };

        const heartRate = {
            userId: "testuser",
            rate: 72,
            timestamp: new Date().toISOString()
        };

        // Insert the user into the database
        const userResult = await db.collection('users').insertOne(user);

        // Insert the heart rate into the database
        const heartRateResult = await db.collection('heartrates').insertOne(heartRate);

        // Respond with success
        res.status(201).json({
            message: 'User and heart rate successfully posted',
            userId: userResult.insertedId,  // Correctly use insertedId
            heartRateId: heartRateResult.insertedId  // Correctly use insertedId
        });
    } catch (error) {
        console.error('Error during test post:', error); // Log the error
        res.status(500).json({ message: 'Error during test post', error: error.message });
    }
});*/

// Endpoint to post a new user to the "users" collection
app.post('/users', async (req, res) => {
    try {
        const user = req.body; // The data from the client
        const collection = db.collection('users'); // Access the "users" collection

        // Validate the user data
        if (!user.username || !user.email || !user.password) {
            return res.status(400).json({ message: 'Missing required fields (username, email, password)' });
        }

        // Insert the new user into the database
        const result = await collection.insertOne(user);

        // Respond with the created user and success message
        res.status(201).json({
            message: 'User created successfully',
            userId: result.insertedId // Return the insertedId instead of result.ops[0]
        });
    } catch (error) {
        console.error('Error posting user:', error); // Log the full error
        res.status(500).json({ message: 'Internal Server Error', error: error.message, stack: error.stack });
    }
});

// Endpoint to post a new heart rate to the "heartrates" collection
app.post('/heartrates', async (req, res) => {
    try {
        const newHeartRate = req.body; // The heart rate data should be in the request body
        const collection = db.collection('heartrates');

        // Validate the heart rate data (make sure all required fields are provided)
        if (!newHeartRate.userId || !newHeartRate.rate || !newHeartRate.timestamp) {
            return res.status(400).json({ message: 'Missing required fields (userId, rate, timestamp)' });
        }

        // Insert the new heart rate into the database
        const result = await collection.insertOne(newHeartRate);

        res.status(201).send(`Heart rate recorded with ID: ${result.insertedId}`);
    } catch (error) {
        console.error('Error posting heart rate:', error);
        res.status(500).send('Error posting heart rate');
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
