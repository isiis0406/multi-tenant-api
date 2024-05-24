import { Schema, model, Document, Connection } from 'mongoose';

export interface IUser extends Document {
  email: string;
  password: string;
  name: string;
}

const userSchema = new Schema<IUser>({
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  name: { type: String, required: true }
});

export const createUserModel = (conn: Connection) => conn.model<IUser>('User', userSchema);
