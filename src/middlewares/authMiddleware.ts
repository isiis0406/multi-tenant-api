import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { createUserModel } from '../models/user';
import mongoose from 'mongoose';

interface CustomRequest extends Request {
  dbConnection?: mongoose.Connection;
  user?: any;
  tenant?: string;
}

export const authenticateUser = async (req: CustomRequest, res: Response, next: NextFunction) => {
  if (!req.dbConnection) {
    return res.status(500).json({ message: 'No tenant database connection' });
  }

  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ message: 'Unauthorized' });
  }

  const token = authHeader.split(' ')[1];

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET!) as { userId: string, tenant: string };
    req.tenant = decoded.tenant;

    const UserModel = createUserModel(req.dbConnection);
    const user = await UserModel.findById(decoded.userId);

    if (!user) {
      return res.status(401).json({ message: 'Unauthorized' });
    }

    req.user = user;
    next();
  } catch (error) {
    return res.status(401).json({ message: 'Unauthorized' });
  }
};
