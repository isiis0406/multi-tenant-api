import { Request, Response } from 'express';
import mongoose from 'mongoose';
import bcrypt from 'bcrypt';
import { createTenantModel } from '../models/admin';
import { initAdminDbConnection } from '../config/db';
import { UserService } from '../services/userService';
import { createUserModel } from '../models/user';

const generateDbUri = (tenantName: string) => {
  const MONGO_BASE_URI = process.env.MONGO_BASE_URI || 'mongodb://localhost:27017/';
  return `${MONGO_BASE_URI}/${tenantName}Db`;
};

export const registerTenant = async (req: Request, res: Response) => {
  const { name, email, password } = req.body;

  // Vérifier si les champs obligatoires sont présents
  if (!name || !email || !password) {
    return res.status(400).json({ message: 'All fields are required' });
  }

  try {
    // Utiliser la connexion admin pour créer le modèle Tenant
    const adminDbConnection = initAdminDbConnection(); // obtenir la connexion à la base de données admin
    const Tenant = createTenantModel(adminDbConnection);

    // Vérifier si le locataire existe déjà
    const existingTenant = await Tenant.findOne({ name });
    if (existingTenant) {
      return res.status(400).json({ message: 'Name already used' });
    }

     // Vérifier si le locataire existe déjà par email
     const existingTenantByEmail = await Tenant.findOne({ email });
     if (existingTenantByEmail) {
       return res.status(400).json({ message: 'Email already used' });
     }
 

    // Générer le dbUri
    const dbUri = generateDbUri(name);

    // Hacher le mot de passe
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Créer un nouveau locataire
    const tenant = new Tenant({ name, email,password: hashedPassword, dbUri});
    await tenant.save();

    // Initialiser la nouvelle base de données du locataire
    const tenantConnection = mongoose.createConnection(dbUri);

    tenantConnection.on('connected', async () => {
      console.log(`Connected to tenant DB: ${dbUri}`);

      const UserModel = createUserModel(tenantConnection);

      // Enregister un nouvel user admin dans la base de données du locataire
      const AdminUser = new UserModel({ name, email, password: hashedPassword });
      await AdminUser.save();

      // Authentifier l'utilisateur admin
      const userService = new UserService(UserModel);
      const { user, token } = await userService.authenticateUser(email, password, tenant.name);

      res.status(201).json({user, token, message: 'Tenant registered successfully' });
    });

    tenantConnection.on('error', (err) => {
      console.error(`Error connecting to tenant DB: ${err.message}`);
    });
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};
