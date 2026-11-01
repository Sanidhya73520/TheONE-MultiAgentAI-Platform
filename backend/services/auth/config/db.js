import mongoose from "mongoose";

const connectDb = async () => {
    try {
        const uri = process.env.AUTH_MONGODB_URI || process.env.MONGODB_URI;
        if (!uri) {
            console.error("Auth DB Error: Neither AUTH_MONGODB_URI nor MONGODB_URI is provided");
            return;
        }
        await mongoose.connect(uri);
        console.log("MongoDB connected successfully for Auth Service"); 
    } catch (error) {
        console.error("MongoDB connection failed for Auth Service:", error);
    }
};

export default connectDb;
