import mongoose from 'mongoose';

const MONGODB_URI = process.env.NEXT_PUBLIC_MONGODB_URI as string;

if (!MONGODB_URI) throw new Error("Please add your Mongo URI to .env.local");

export async function connectDB() {
    if (mongoose.connections[0].readyState) return;

    await mongoose.connect(MONGODB_URI);
}
