module.exports = (sequelize, Sequelize) => {
  const Claim = sequelize.define("claim", {
    id: {
      type: Sequelize.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    policyId: {
      type: Sequelize.INTEGER,
      references: {
        model: 'policies',
        key: 'id'
      }
    },
    reason: {
      type: Sequelize.STRING
    },
    delayTime: {
      type: Sequelize.INTEGER // in minutes
    },
    status: {
      type: Sequelize.ENUM('pending', 'approved', 'rejected', 'paid'),
      defaultValue: 'pending'
    },
    payoutAmount: {
      type: Sequelize.DECIMAL(10, 2)
    },
    transactionHash: {
      type: Sequelize.STRING
    },
    blockchainVerified: {
      type: Sequelize.BOOLEAN,
      defaultValue: false
    },
    verificationMethod: {
      type: Sequelize.STRING,
      defaultValue: 'manual'
    }
  });
  
  return Claim;
}; 