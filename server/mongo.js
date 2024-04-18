// mongooseConfig.js
const mongoose = require("mongoose");
require("dotenv").config({ path: "../.env" });

// Connect to MongoDB using Mongoose
mongoose.connect(process.env.MONGO_URL, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

// Check if the connection is successful
const db = mongoose.connection;
db.on("error", console.error.bind(console, "MongoDB connection error:"));
db.once("open", () => {
  console.log("Connected to MongoDB!");
});

// Define Mongoose model
const userSchema = new mongoose.Schema({
  username: String,
  email: String,
  date: { type: Date, default: Date.now },
  // Add more fields as needed
});

const User = mongoose.model("User", userSchema);

// CRUD Operations
async function createUser(username, email) {
  try {
    const user = new User({ username, email });
    await user.save();
    console.log("User created successfully:", user);
    if (user) {
      const newDatas = await User.find();
      return newDatas;
    } else {
      return user;
    }
  } catch (error) {
    console.error("Error creating user:", error);
    throw error;
  }
}

async function getUsers() {
  try {
    const users = await User.find();
    console.log("Users:", users);
    return users;
  } catch (error) {
    console.error("Error fetching users:", error);
    throw error;
  }
}

async function getUserByID(id) {
  try {
    const users = await User.findById(id);
    console.log("User by id:", users);
    return users;
  } catch (error) {
    console.error("Error fetching users:", error);
    throw error;
  }
}

async function getUsersEmail() {
  try {
    const users = await User.find();
    const emailList = users.map((user) => user.email);
    console.log("Emails:", emailList);
    return emailList;
  } catch (error) {
    console.error("Error fetching users:", error);
    throw error;
  }
}

async function updateUser(userId, newData) {
  try {
    const user = await User.findByIdAndUpdate(userId, newData, { new: true });
    console.log("User updated successfully:", user);
    if (user) {
      const newDatas = await User.find();
      return newDatas;
    } else {
      return user;
    }
  } catch (error) {
    console.error("Error updating user:", error);
    throw error;
  }
}

async function deleteUser(userId) {
  try {
    const user = await User.findByIdAndDelete(userId);
    console.log("User deleted successfully:", user);
    if (user) {
      const newDatas = await User.find();
      return newDatas;
    } else {
      return user;
    }
  } catch (error) {
    console.error("Error deleting user:", error);
    throw error;
  }
}

module.exports = {
  createUser,
  getUsers,
  updateUser,
  deleteUser,
  getUserByID,
  getUsersEmail,
};
