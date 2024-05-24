import { Model } from 'mongoose';
import { IUser } from '../models/user';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';

export class UserService {
  private userModel: Model<IUser>;

  constructor(userModel: Model<IUser>) {
    this.userModel = userModel;
  }

  public async createUser(name: string, email: string, password: string) {
    const existingUser = await this.userModel.findOne({ email });
    if (existingUser) {
      throw new Error('User already exists');
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const user = new this.userModel({ name, email, password: hashedPassword });

    await user.save();
    return user;
  }

  public async authenticateUser(email: string, password: string, tenant: string) {
    const user = await this.userModel.findOne({ email });

    if (!user || !(await bcrypt.compare(password, user.password))) {
      throw new Error('Invalid credentials');
    }

    const token = jwt.sign({ userId: user._id, tenant }, process.env.JWT_SECRET!, { expiresIn: '1h' });

    return { user, token };
  }

  public getUserWithoutPassword(user: IUser) {
    const { password, ...userWithoutPassword } = user.toObject();
    return userWithoutPassword;
  }
}
