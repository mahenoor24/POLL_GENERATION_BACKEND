import { Request, Response } from "express";
import bcrypt from "bcryptjs";
import { signToken } from "../utils/jwt";
import crypto from "crypto";
import mongoose from "mongoose";
import { sendResetEmail } from "../utils/email";

// Assuming the User model is defined in the same file
export const userSchema = new mongoose.Schema({
  fullName: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  role: { type: String, enum: ["host", "student"], default: "student" },
  passwordReset: {
    token: { type: String },
    expires: { type: Date },
    used: { type: Boolean },
  },
});
const User = mongoose.model("User", userSchema);

export { User };
