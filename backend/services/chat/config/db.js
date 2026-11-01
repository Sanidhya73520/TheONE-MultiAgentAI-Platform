import mongoose from "mongoose";

const connectDb = async () => {
    try {
        const uri = process.env.CHAT_MONGODB_URI || process.env.MONGODB_URI;
        if (!uri) {
            console.error("Chat DB Error: Neither CHAT_MONGODB_URI nor MONGODB_URI is provided");
            return;
        }
        await mongoose.connect(uri);
        console.log("MongoDB connected successfully for Chat Service"); 
    } catch (error) {
        console.error("MongoDB connection failed for Chat Service:", error);
    }
};

export default connectDb;
