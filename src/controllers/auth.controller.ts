import { Request, Response } from 'express';
import {User} from '../models/user.model';
import bcrypt from 'bcryptjs';
import { signToken } from '../utils/jwt';
import crypto from "crypto";
import nodemailer from 'nodemailer';
import { sendResetEmail } from "../utils/email";
import { sendEmail } from '../utils/email';


export const register = async (req: Request, res: Response) => {
  console.log("Register payload:", req.body);
  const { fullName, email, password, role } = req.body;
  const existing = await User.findOne({ email });
  if (existing) return res.status(400).json({ message: 'Email already exists' });

  const hashed = await bcrypt.hash(password, 10);
  const user = new User({
  fullName: req.body.fullName,
  email: req.body.email,
  password: hashed,
  role: 'student',
  username: req.body.email.split('@')[0], // Generate a unique username based on the email
});

  await user.save();
  const subject = 'Welcome to Automatic Poll Generation System';
  const html = `<p>Dear ${user.fullName},</p><p>Welcome to Automatic Poll Generation System. We are excited to have you on board!</p>`;
  await sendEmail(user.email, subject, html);

  res.status(201).json({ message: 'User created successfully' });
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
  await user.save();

  const resetLink = `${process.env.FRONTEND_URL}/reset-password/${token}`;
  await sendResetEmail(email, resetLink);

  res.status(200).json({ message: "If an account with that email exists, you'll receive a password reset link shortly." });
};

export const resetPassword = async (req: Request, res: Response) => {
  const { token, password } = req.body;
  const user = await User.findOne({ "passwordReset.token": token });
  if (!user) return res.status(400).json({ message: "Invalid or expired token" });
if (user.passwordReset && user.passwordReset.used) {
  return res.status(400).json({ message: "Password reset link has already been used" });
}
user.password = await bcrypt.hash(password, 10);
if (user.passwordReset) {
  user.passwordReset.used = true;
  user.passwordReset.token = undefined;
  user.passwordReset.expires = undefined;
}
await user.save();

  res.json({ message: "Password reset successful" });
};