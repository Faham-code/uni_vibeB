import userModel from '../models/user.js';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

// import Stream from "getstream";

// const client = Stream.connect(
//   process.env.STREAM_API_KEY,
//   process.env.STREAM_API_SECRET,
//   process.env.STREAM_APP_ID
// );


// Register User
export const registerUser = async (req, res) => {
  try {
    let { email, password, student_type, course, year, username, fullName } = req.body;
    if (!email || !password || !student_type || !course || !year || !fullName)
      return res.status(400).json({ message: "All required fields must be filled" });

    email = email.trim().toLowerCase();
    username = username?.trim();

    const existingUser = await userModel.findOne({ email });
    if (existingUser)
      return res.status(400).json({ message: "User already exists" });

    const hashedPassword = await bcrypt.hash(password, 10);

    let finalUsername = username || `${email.split("@")[0]}_${student_type}_${year}`;
    if (student_type.toLowerCase() === "alumni" && !finalUsername.toLowerCase().includes("alumni"))
      finalUsername += "_alumni";

    // Ensure username is unique
    const existingUsername = await userModel.findOne({ username: finalUsername });
    if (existingUsername)
      finalUsername += "_" + Math.floor(Math.random() * 1000);

    const newUser = new userModel({
      email,
      password: hashedPassword,
      student_type,
      course,
      fullName,
      year,
      username: finalUsername,
    });
    await newUser.save();

    const token = jwt.sign({ id: newUser._id }, process.env.JWT_SECRET, { expiresIn: "30d" });

    res.status(201).json({
      message: "User registered successfully",
      token,
      user: {
        id: newUser._id,
        email: newUser.email,
        username: newUser.username,
        student_type: newUser.student_type,
        course: newUser.course,
        year: newUser.year,
        fullName: newUser.fullName
      }
    });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};
// Login User
export const loginUser = async (req, res) => {
  try {
    const { username, password } = req.body;
    if (!username || !password) {
      return res.status(400).json({ message: "All fields must be filled" });
    }
    const user = await userModel.findOne({ username });
    if (!user) {
      return res.status(400).json({ message: "User not found" });
    }
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: "Invalid credentials" });
    }
    
    // const userFeed = client.createUserToken(user._id);
    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: "30d" });
    // await client.user(user._id).getOrCreate({ name: user.username });
    res.status(200).json({ message: "Login successful", token });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// Get User
export const getUser = async (req, res) => {
  try { 
    const { id } = req.params;
    const user = await userModel.findById(id);  
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    res.status(200).json({ user });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};    

// update User
export const updateUser = async (req, res) => {
  try {
    const { id } = req.params;
    const updates = req.body; 
    if (updates.password) {
      updates.password = await bcrypt.hash(updates.password, 10);
    } 

    const updatedUser = await userModel.findByIdAndUpdate(id, updates, { new: true });
    if (!updatedUser) {
      return res.status(404).json({ message: "User not found" });
    }
    res.status(200).json({ message: "User updated successfully", user: updatedUser });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};
// Delete User
export const deleteUser = async (req, res) => {
  try {
    const { id } = req.params;
    const deletedUser = await userModel.findByIdAndDelete(id);
    if (!deletedUser) {
      return res.status(404).json({ message: "User not found" });
    }
    res.status(200).json({ message: "User deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};  

export const searchUsers = async (req, res) => {
  try {
    const { query } = req.query;  

    if (!query || query.trim() === "") {
      return res.status(400).json({ message: "Query parameter is required" });
    } 

    const users = await userModel
      .find({
        $or: [
          { username: { $regex: query, $options: "i" } }, // search by username
          { fullName: { $regex: query, $options: "i" } }, // search by full name
        ],
      })
      .select("username fullName student_type course year");

    if (users.length === 0) {
      return res.status(404).json({ message: "No users found matching your search" });
    }

    res.status(200).json({
      message: "Users fetched successfully",
      count: users.length,
      users,
    });

  } catch (error) {
    // 7️⃣ Handle any unexpected errors
    res.status(500).json({
      message: "Server error",
      error: error.message,
    });
  }
};
