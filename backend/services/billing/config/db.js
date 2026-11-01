import mongoose from "mongoose";

const connectDb = async () => {
    try {
        const uri = process.env.BILLING_MONGODB_URI || process.env.MONGODB_URI;
        if (!uri) {
            console.error("Billing DB Error: Neither BILLING_MONGODB_URI nor MONGODB_URI is provided");
            return;
        }
        await mongoose.connect(uri);
        console.log("MongoDB connected successfully for Billing Service"); 
    } catch (error) {
        console.error("MongoDB connection failed for Billing Service:", error);
    }
};

export default connectDb;
