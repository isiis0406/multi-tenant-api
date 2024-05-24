import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { initTenantDbConnection, initAdminDbConnection } from '../config/db';
import { createTenantModel } from '../models/admin';
import mongoose from 'mongoose';

interface CustomRequest extends Request {
  dbConnection?: mongoose.Connection;
  tenant?: string;
}

// Créez un objet pour stocker les connexions à la base de données par tenant
const dbConnectionsCache: { [key: string]: mongoose.Connection } = {};

export const resolveTenant = async (req: CustomRequest, res: Response, next: NextFunction) => {
  let tenantId;

  // Vérifiez si le token JWT est présent
  const authHeader = req.headers.authorization;
  if (authHeader && authHeader.startsWith('Bearer ')) {
    const token = authHeader.split(' ')[1];
    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET!) as { userId: string, tenant: string };
      tenantId = decoded.tenant;
      req.tenant = tenantId;
    } catch (error) {
      return res.status(401).json({ message: 'Unauthorized' });
    }
  } else {
    // Si pas de token, essayez de récupérer tenantId à partir des en-têtes ou des paramètres de requête
    tenantId = req.headers['x-tenant-id'] as string || req.body.tenantId || req.query.tenantId;
  }

  if (!tenantId) {
    return res.status(400).json({ message: 'Tenant ID is required' });
  }

  // Vérifiez si la connexion à la base de données pour ce tenant est déjà en cache
  if (!dbConnectionsCache[tenantId]) {
    // Si ce n'est pas le cas, créez une nouvelle connexion et stockez-la dans le cache
    const adminDbConnection = initAdminDbConnection();
    const Tenant = createTenantModel(adminDbConnection);
    const tenant = await Tenant.findOne({ name: tenantId });

    if (!tenant) {
      return res.status(404).json({ message: 'Tenant not found' });
    }

    dbConnectionsCache[tenantId] = initTenantDbConnection(tenant.dbUri);
  }

  // Utilisez la connexion à la base de données à partir du cache
  req.dbConnection = dbConnectionsCache[tenantId];
  req.tenant = tenantId;
  next();
};