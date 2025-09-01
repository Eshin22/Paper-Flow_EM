import mongoose from "mongoose";

let isConnected = false;

export const connectMongoDB = async () => {
    if (isConnected) {
        // Reuse existing connection
        return;
    }
    try {
        const mongoUrl = process.env.MONGODB_URL;
        if (!mongoUrl) {
            throw new Error("MONGODB_URL environment variable is not defined");
        }
        await mongoose.connect(mongoUrl);
        isConnected = true;
        console.log("MongoDB connected successfully");
    } catch (error) {
        console.error("Error connecting to MongoDB:", error);
        throw error;
    }
};