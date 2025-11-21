// config/db.js
import mongoose from "mongoose";
import "dotenv/config";

const connectDB = async () => {
  const uri = process.env.MONGODB_URI;
  if (!uri) {
    console.error('MONGO_URI environment variable is not set. Please set it in your .env file.');
    process.exit(1);
  }

  try {
    await mongoose.connect(uri, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
      // useCreateIndex and useFindAndModify are no longer supported in Mongoose v6+
    });
    console.log('MongoDB Connected');
  } catch (err) {
    console.error('MongoDB Connection Error:', err.message || err);
    process.exit(1);
  }
};

export default connectDB;