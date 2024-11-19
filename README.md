# Camel Health Union (CHU) Server

- This server code, CHU_server is paired with CHU_android (Kotlin Android application)
- This server uses GET and POST to do CRUD operations in a MongoDB database

- Initial setup:
1. Get a MongoDB connection string for the database that will be accessed
2. Download Node.js
3. In terminal: npm init -y
4. In terminal: npm install express mongodb dotenv cors
5. Add a .env file to the root folder containing the MongoDB connection string obtained in Step 1: CONNECTION_STRING=mongodb+srv://{user}:{password}@CHU_database.gbih2ue.mongodb.net/CHU_database   //change the user and password to your connection string details
6. In package.json, add the following start script to for the hosting service to run:
"scripts": {
    "start": "node app.js"
  },
7. Deploy this on a hosting service (Render).
8. In Render for Start Command, enter: npm start
