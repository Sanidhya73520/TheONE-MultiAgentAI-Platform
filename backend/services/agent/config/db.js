import mongoose from "mongoose";

const connectDb = async () => {
    try {
        const uri = process.env.AGENT_MONGODB_URI || process.env.MONGODB_URI;
        if (!uri) {
            console.error("Agent DB Error: Neither AGENT_MONGODB_URI nor MONGODB_URI is provided");
            return;
        }
        await mongoose.connect(uri);
        console.log("MongoDB connected successfully for Agent Service"); 
    } catch (error) {
        console.error("MongoDB connection failed for Agent Service:", error);
    }
};

export default connectDb;
