import { Request, Response } from "express";
import { User } from "../models/user.model";
import { extractIdFromToken } from "../utils/jwt";

class ValidationError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "ValidationError";
  }
}

export const getProfile = async (req: Request, res: Response) => {
  try {
    const jwtUser = extractIdFromToken(
      req.headers.authorization?.split(" ")[1] || ""
    );
    if (!jwtUser) {
      throw new ValidationError("Unauthorized");
    }
    const user = await User.findById(jwtUser.id);
    if (!user) {
      throw new ValidationError("User not found");
    }
    res.json(user);
  } catch (error) {
    if (error instanceof ValidationError) {
      res.status(400).json({ message: error.message });
    } else {
      console.error(error);
      res.status(500).json({ message: "Internal Server Error" });
    }
  }
};