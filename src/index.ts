import express from 'express';
import dotenv from 'dotenv';
import mongoose from 'mongoose';
import bookRoutes from './routes/bookRoutes';
import tenantRoutes from './routes/tenantRoutes';
import userRoutes from './routes/userRoutes';
import { initAdminDbConnection } from './config/db';
import { authenticateUser } from './middlewares/authMiddleware';

dotenv.config();

const app = express();
app.use(express.json());

// Initialiser la connexion à la base de données admin
const adminDbConnection = initAdminDbConnection();
adminDbConnection.once('open', () => {
  console.log('Admin DB connected');

  // Démarrer le serveur uniquement après que la connexion admin est établie
  app.use('/api/tenants', tenantRoutes);
  app.use('/api/users', userRoutes);
  app.use('/api/books', bookRoutes);

  const PORT = process.env.PORT || 5000;
  app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
  });
});

adminDbConnection.on('error', (err) => {
  console.error(`Failed to connect to admin DB: ${err.message}`);
});
