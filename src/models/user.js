import mongoose from "mongoose";

const userSchema = new mongoose.Schema({
  email: {
    type: String,
    required: true,
    unique: true, 
  },
  password: {
    type: String,
    required: true,
    minlength: 6,
  },
  student_type: {
    type: String,
    enum: ['student','alumni'],
    required: true,
  },
  course: {
    type: String,
    required: true,
  },
  year: {
    type: Number,
    required: true,
  },
  username: {
    type: String,
  },
});

const User = mongoose.model("User", userSchema);

export default User;
