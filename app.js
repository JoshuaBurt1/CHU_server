//Procedural programming is used when this codebase initially executes a series of actions in a specific order.
//First, it loads the Node.js modules: express, mongogb, dotenv, cors, and body-parser. These modules are necessary to run the proceeding code.
//Next, dotenv.config() loads the MongoDB connection string.
//An express application instance is created.
//A port number is provided for localhost development.
//...
// Finally the home page url extension "/" get request runs, displaying all database information

//REMOVE
//Database Connection and Routes Execution: The procedural aspect of the code is most evident in the way it handles the sequence of operations, 
//particularly the handling of incoming HTTP requests, database queries, and responses. 
//Each endpoint (like app.get('/'), app.post('/users')) follows a procedural style by performing operations in sequence: validate input, interact with the database, 
// and send a response.

const express = require('express');
const { MongoClient } = require('mongodb');
const dotenv = require('dotenv'); // Import dotenv package
const cors = require('cors'); // To handle CORS for cross-origin requests
const bodyParser = require('body-parser'); // Middleware to parse JSON bodies

dotenv.config(); 
const app = express();
const port = process.env.PORT || 3000;
app.use(cors()); // Use CORS to allow cross-origin requests (use more specific origins in production)

app.use(bodyParser.json()); // Parse incoming requests with JSON payloads
app.use(express.json());

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
            message: `Welcome to the Camel Health Union server \n\n`,
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

// Endpoint to post a new user to the "users" collection
app.post('/users', async (req, res) => {
    try {
        console.log('Received user data:', req.body);  // Log incoming data

        const user = req.body; // The data from the client
        const collection = db.collection('users'); // Access the "users" collection

        // Validate the user data
        if (!user.username || !user.password || !user.clientId || !user.fitbitAccessToken || 
            !user.age || !user.gender || !user.height || !user.weight || !user.memberSince || !user.averageDailySteps) {
            return res.status(400).json({ message: 'Missing required fields' });
        }

        // Check if a user already exists with the same username and password
        const existingUser = await collection.findOne({ username: user.username, password: user.password });

        if (existingUser) {
            // User found, update the user record with the new data
            const updateResult = await collection.updateOne(
                { username: user.username, password: user.password }, // Filter by username and password
                {
                    $set: {
                        age: user.age,
                        gender: user.gender,
                        height: user.height,
                        weight: user.weight,
                        memberSince: user.memberSince,
                        averageDailySteps: user.averageDailySteps,
                        fitbitAccessToken: user.fitbitAccessToken,
                        clientId: user.clientId
                    }
                }
            );

            console.log('Update result:', updateResult);  // Log the result of the update

            // Respond with the updated user information
            res.status(200).json({
                message: 'User updated successfully',
                userId: existingUser._id // Return the existing user ID
            });
        } else {
            // No existing user found, insert a new user
            const insertResult = await collection.insertOne(user);
            console.log('Insertion result:', insertResult);  // Log the result of the insertion

            // Respond with the created user and success message
            res.status(201).json({
                message: 'User created successfully',
                userId: insertResult.insertedId // Return the inserted ID
            });
        }

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

        res.status(201).json({
            message: 'Heart rate recorded successfully',
            userId: result.insertedId // Return the insertedId instead of result.ops[0]
        });

    } catch (error) {
        console.error('Error posting heart rate:', error);
        res.status(500).json({ message: 'Internal Server Error', error: error.message, stack: error.stack });
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
