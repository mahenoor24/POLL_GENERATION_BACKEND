import { Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import { signToken } from '../utils/jwt';
import crypto from "crypto";
import mongoose from 'mongoose';
import { sendResetEmail } from "../utils/email";

// Assuming the User model is defined in the same file
const userSchema = new mongoose.Schema({
  fullName: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  role: { type: String, enum: ['host', 'student'], default: 'student' },
  username: { type: String, default: '' }, // Add a default value for the username field
  passwordReset: {
    token: { type: String },
    expires: { type: Date },
    used: { type: Boolean }
  }
});
const User = mongoose.model('User', userSchema);

export const register = async (req: Request, res: Response) => {
  console.log("Register payload:", req.body);
  const { fullName, email, password, role } = req.body;
  const existing = await User.findOne({ email });
  if (existing) return res.status(400).json({ message: 'Email already exists' });

  const hashed = await bcrypt.hash(password, 10);
  const user = await User.create({ fullName, email, password: hashed, role });
  const token = signToken({ id: user._id, role: user.role });
  res.status(201).json({ token, user: { id: user._id, fullName, email, role } });
  
};

export const login = async (req: Request, res: Response) => {
  const { email, password } = req.body;
  const user = await User.findOne({ email });
  if (!user) return res.status(400).json({ message: 'Invalid credentials' });

  const match = await bcrypt.compare(password, user.password);
  if (!match) return res.status(400).json({ message: 'Invalid credentials' });

  const token = signToken({ id: user._id, role: user.role });
  res.json({ token, user: { id: user._id, fullName: user.fullName, email, role: user.role } });
};

export const forgotPassword = async (req: Request, res: Response) => {
  const { email } = req.body;
  const user = await User.findOne({ email });
  if (!user) return res.status(200).json({ message: "If an account with that email exists, you'll receive a password reset link shortly." });

  const token = crypto.randomBytes(32).toString("hex");
    user.passwordReset = {
    token,
    expires: new Date(Date.now() + 60 * 60 * 1000), // 1 hour
    used: false
    };
    user.passwordReset.token = token;
    user.passwordReset.expires = new Date(Date.now() + 60 * 60 * 1000); // 1 hour
    await user.save();

  const resetLink = `${process.env.FRONTEND_URL}/reset-password/${token}`;
  await sendResetEmail(email, resetLink);

  res.status(200).json({ message: "If an account with that email exists, you'll receive a password reset link shortly." });
};
export { User };