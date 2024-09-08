const mongoose = require("mongoose");

const connectDB = async () => {
    try {
        // Connect to MongoDB without deprecated options
        const conn = await mongoose.connect(process.env.MongoDb_URL);

        // Log a success message with the host information
        console.log(`Connected to MongoDB server at ${conn.connection.host}`.cyan.underline);
    } catch (error) {
        // Log the error message and exit the process
        console.error(`MongoDB Error: ${error.message}`.red.bold);
        process.exit(1);
    }
};

module.exports = connectDB;
