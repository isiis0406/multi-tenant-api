import mongoose from 'mongoose';

const initAdminDbConnection = () => {
  const connection = mongoose.createConnection(process.env.ADMIN_DB_URI!);

  connection.on('connected', () => {
    console.log('Connected to admin DB');
  });

  connection.on('error', (err) => {
    console.error(`Error connecting to admin DB: ${err.message}`);
  });

  return connection;
};

const initTenantDbConnection = (tenantDbUri: string) => {
  const connection = mongoose.createConnection(tenantDbUri);

  connection.on('connected', () => {
    console.log(`Connected to tenant DB: ${tenantDbUri}`);
  });

  connection.on('error', (err) => {
    console.error(`Error connecting to tenant DB: ${err.message}`);
  });

  return connection;
};

export { initAdminDbConnection, initTenantDbConnection };
