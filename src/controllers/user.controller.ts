import { Request, Response } from 'express';
import {User} from '../models/user.model';
import { extractIdFromToken } from '../utils/jwt';

export const getProfile = async (req: Request, res: Response) => {
  const userId = extractIdFromToken(req.headers.authorization?.split(' ')[1] || '');
  if (!userId) {
    return res.status(401).json({ message: 'Unauthorized' });
  }
  const user= await User.findById(userId);
  if (!user) {
    return res.status(404).json({ message: 'User not found' });
  } 
  res.json(user);
};