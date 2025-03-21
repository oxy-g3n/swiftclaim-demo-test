module.exports = (sequelize, Sequelize) => {
  const Policy = sequelize.define("policy", {
    id: {
      type: Sequelize.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    policyNumber: {
      type: Sequelize.STRING,
      unique: true
    },
    userAddress: {
      type: Sequelize.STRING
    },
    flightNumber: {
      type: Sequelize.STRING
    },
    departureTime: {
      type: Sequelize.DATE
    },
    coverageAmount: {
      type: Sequelize.DECIMAL(10, 2)
    },
    premium: {
      type: Sequelize.DECIMAL(10, 2)
    },
    status: {
      type: Sequelize.ENUM('active', 'claimed', 'expired'),
      defaultValue: 'active'
    },
    blockchainPolicyId: {
      type: Sequelize.INTEGER
    }
  });
  
  return Policy;
}; 