import { Request, Response } from 'express';
import Poll from '../models/poll.model';

export const createPoll = async (req: Request, res: Response) => {
  const { title, category, difficulty, questions } = req.body;
  const poll = await Poll.create({
    title,
    category,
    difficulty,
    questions,
    createdBy: (req as any).user.id
  });
  res.status(201).json(poll);
};

export const getPolls = async (req: Request, res: Response) => {
  const polls = await Poll.find();
  res.json(polls);
};

export const joinPoll = async (req: Request, res: Response) => {
  const { pollId } = req.params;
  const poll = await Poll.findById(pollId);
  if (!poll) return res.status(404).json({ message: 'Poll not found' });
  res.json(poll);
};