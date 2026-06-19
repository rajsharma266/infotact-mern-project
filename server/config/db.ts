import mongoose from "mongoose";

const dbConnect = async (): Promise<void> => {
  try {
    await mongoose.connect(process.env.MONGO_URL as string);
    console.log("DB connected successfully");
  } catch (error) {
    console.log("error in db");
    console.log(error);
  }
};

export default dbConnect;