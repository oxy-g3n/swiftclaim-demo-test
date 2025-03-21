const { Sequelize } = require('sequelize');
require('dotenv').config();

const sequelize = new Sequelize(
  process.env.DB_NAME,
  process.env.DB_USER,
  process.env.DB_PASSWORD,
  {
    host: process.env.DB_HOST,
    port: process.env.DB_PORT,
    dialect: 'postgres',
    logging: false
  }
);

const db = {};
db.sequelize = sequelize;
db.Sequelize = Sequelize;

// Import models
db.policies = require('./policy.model')(sequelize, Sequelize);
db.claims = require('./claim.model')(sequelize, Sequelize);

// Define relationships
db.policies.hasMany(db.claims, { as: 'claims', foreignKey: 'policyId' });
db.claims.belongsTo(db.policies, { foreignKey: 'policyId' });

module.exports = db; 