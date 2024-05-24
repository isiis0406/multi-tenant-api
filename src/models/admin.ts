import { Schema, model, Document, Connection } from 'mongoose';

interface ITenant extends Document {
  name: string;
  email: string;
  password: string;
  dbUri: string;
}

const tenantSchema = new Schema<ITenant>({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  dbUri: { type: String, required: true }
});

export const createTenantModel = (conn: Connection) => conn.model<ITenant>('Tenant', tenantSchema);
