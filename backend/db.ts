import mongoose from "mongoose";

const MONGO_URI =
  process.env.MONGO_URI ||
  "mongodb://127.0.0.1:27017/passport-jwt-express-auth";

const connectDB = async (): Promise<void> => {
  await mongoose.connect(MONGO_URI);
  console.log("MongoDB connected");
};

export default connectDB;
