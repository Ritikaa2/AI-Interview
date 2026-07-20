import mongoose from "mongoose";

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
    },
    email: {
      type: String,
      unique: true,
      required: true,
    },
    password: {
      type: String,
      default: null,
    },
    authProvider: {
      type: String,
      enum: ["google", "local"],
      default: "google",
    },
    resetPasswordToken: {
      type: String,
      default: null,
    },
    resetPasswordExpires: {
      type: Date,
      default: null,
    },
    credits: {
      type: Number,
      default: 100,
    },
  },
  { timestamps: true },
);

const User = mongoose.model("User", userSchema);

export default User;
