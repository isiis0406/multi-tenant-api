import { Request, Response } from 'express';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { createUserModel } from '../models/user';
import { UserService } from '../services/userService';
import mongoose from 'mongoose';

interface CustomRequest extends Request {
  dbConnection?: mongoose.Connection;
  tenant?: string;
}

export const createUser = async (req: CustomRequest, res: Response) => {
  const { name, email, password } = req.body;

  if (!req.dbConnection) {
    return res.status(500).json({ message: 'No tenant database connection' });
  }

  const UserModel = createUserModel(req.dbConnection);
  const userService = new UserService(UserModel);

  try {
    const user = await userService.createUser(name, email, password);
    const userWithoutPassword = userService.getUserWithoutPassword(user);
    res.status(201).json({ user: userWithoutPassword });
  } catch (error: any) {
    res.status(400).json({ message: error.message });
  }
};

export const loginUser = async (req: CustomRequest, res: Response) => {
  const { email, password } = req.body;
    
  if (!req.dbConnection || !req.tenant) {
    return res.status(500).json({ message: 'No tenant database connection' });
  }

  const UserModel = createUserModel(req.dbConnection);
  const userService = new UserService(UserModel);

  try {
    const { user, token } = await userService.authenticateUser(email, password, req.tenant);
    const userWithoutPassword = userService.getUserWithoutPassword(user);
    res.status(200).json({ user: userWithoutPassword, token });
  } catch (error: any) {
    res.status(401).json({ message: error.message });
  }
};
