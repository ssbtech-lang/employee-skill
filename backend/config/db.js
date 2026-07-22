const mongoose = require("mongoose");

const connectDB = async () => {
  try {
   // console.log("MONGO_URI is:", process.env.MONGO_URI); // 👈 Debug line

    await mongoose.connect(process.env.MONGO_URI);
    console.log("MongoDB connected successfully");
  } catch (error) {
    console.error(error);
    process.exit(1);
  }
};

module.exports = connectDB;
