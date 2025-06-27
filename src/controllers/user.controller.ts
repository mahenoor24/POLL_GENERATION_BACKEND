import { Request, Response } from 'express';
import {User} from '../models/user.model';

export const getProfile = async (req: Request, res: Response) => {
  const user = await User.findById((req as any).user.id).select('-password');
  res.json(user);
};