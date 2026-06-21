import mongoose from "mongoose";

const dbConnect = async (): Promise<void> => {
  const mongoUrl = process.env.MONGO_URL;

  if (!mongoUrl) {
    throw new Error("MONGO_URL is not set. Update server/.env before starting the API.");
  }

  try {
    await mongoose.connect(mongoUrl, {
      serverSelectionTimeoutMS: 5000,
    });
    console.log("DB connected successfully");
  } catch (error) {
    console.error("Failed to connect to MongoDB");
    throw error;
  }
};

export default dbConnect;
