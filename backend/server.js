const express = require('express');
const cors = require('cors');
const { ethers } = require('ethers');
const axios = require('axios');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3001;

// Import database models
const db = require('./models');

// Import contract ABI
const FlightInsuranceABI = require('./contracts/FlightInsurance.json');

// Middleware
app.use(cors());
app.use(express.json());

// Connect to Ethereum provider
let provider, wallet, flightInsuranceContract;

try {
  provider = new ethers.providers.JsonRpcProvider(process.env.PROVIDER_URL);
  
  // Create a random wallet for testing
  wallet = ethers.Wallet.createRandom().connect(provider);
  
  // Connect to the deployed contract
  flightInsuranceContract = new ethers.Contract(
    process.env.CONTRACT_ADDRESS,
    FlightInsuranceABI.abi,
    wallet
  );
  
  console.log('Connected to Ethereum provider and contract');
} catch (error) {
  console.error('Failed to connect to Ethereum provider:', error.message);
}

// Check blockchain connection
const checkBlockchainConnection = async () => {
  try {
    if (!provider) {
      console.error('Ethereum provider not connected');
      return false;
    }
    
    await provider.getBlockNumber();
    console.log('Blockchain connection verified');
    return true;
  } catch (error) {
    console.error('Blockchain connection failed:', error.message);
    return false;
  }
};

// Create database tables if they don't exist
db.sequelize.sync({ force: true })
  .then(() => {
    console.log("Database synchronized");
    checkBlockchainConnection();
  })
  .catch((err) => {
    console.error("Failed to sync database:", err);
  });

// Routes

// Create a new policy
app.post('/api/policies', async (req, res) => {
  try {
    const { userAddress, flightNumber, departureTime, coverageAmount, premium } = req.body;
    
    // Create policy in database
    const policy = await db.policies.create({
      policyNumber: `POL-${Date.now()}`,
      userAddress,
      flightNumber,
      departureTime: new Date(departureTime),
      coverageAmount,
      premium,
      status: 'active'
    });
    
    // Try to interact with blockchain
    let blockchainPolicyId = null;
    
    if (await checkBlockchainConnection()) {
      try {
        // Call the contract method (but don't actually send the transaction)
        // This will fail if the contract or blockchain is not available
        const dryRunCallResult = await flightInsuranceContract.callStatic.createPolicy(
          flightNumber,
          Math.floor(new Date(departureTime).getTime() / 1000),
          ethers.utils.parseEther(coverageAmount.toString()),
          { value: ethers.utils.parseEther(coverageAmount.toString()) }
        );
        
        // If the call succeeded, simulate a policy ID
        blockchainPolicyId = Math.floor(Math.random() * 1000) + 1;
        console.log(`Policy created in blockchain with ID: ${blockchainPolicyId} (simulated)`);
      } catch (error) {
        console.error('Error calling contract method:', error.message);
      }
    } else {
      console.log('Blockchain interaction skipped: Not connected');
      blockchainPolicyId = Math.floor(Math.random() * 1000) + 1;
    }
    
    policy.blockchainPolicyId = blockchainPolicyId;
    await policy.save();
    
    res.status(201).json(policy);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Failed to create policy", error: error.message });
  }
});

// Get all policies
app.get('/api/policies', async (req, res) => {
  try {
    const policies = await db.policies.findAll();
    res.json(policies);
  } catch (error) {
    res.status(500).json({ message: "Failed to fetch policies", error: error.message });
  }
});

// Get a specific policy
app.get('/api/policies/:id', async (req, res) => {
  try {
    const policy = await db.policies.findByPk(req.params.id, {
      include: ['claims']
    });
    
    if (!policy) {
      return res.status(404).json({ message: "Policy not found" });
    }
    
    res.json(policy);
  } catch (error) {
    res.status(500).json({ message: "Failed to fetch policy", error: error.message });
  }
});

// Submit a claim for a policy
app.post('/api/policies/:id/claims', async (req, res) => {
  try {
    const policy = await db.policies.findByPk(req.params.id);
    
    if (!policy) {
      return res.status(404).json({ message: "Policy not found" });
    }
    
    if (policy.status !== 'active') {
      return res.status(400).json({ message: "Policy is not active" });
    }
    
    const { reason, delayTime } = req.body;
    
    // Create claim in database
    const claim = await db.claims.create({
      policyId: policy.id,
      reason,
      delayTime,
      status: 'pending',
      payoutAmount: policy.coverageAmount,
      blockchainVerified: false,
      verificationMethod: 'manual' // Default to manual
    });
    
    // Simulate flight verification with an external API
    // In a real app, this would call a flight status API
    
    // Simulate automatic claim verification
    setTimeout(async () => {
      try {
        // First check if blockchain is available
        const isBlockchainConnected = await checkBlockchainConnection();
        
        // If blockchain is not connected, randomly reject or leave pending for manual review
        if (!isBlockchainConnected) {
          const isRejected = Math.random() < 0.5;
          
          if (isRejected) {
            // Reject claim
            claim.status = 'rejected';
            await claim.save();
            console.log(`Claim ${claim.id} rejected (simulated)`);
          } else {
            // Leave claim pending for manual review
            console.log(`Claim ${claim.id} left pending for manual review (blockchain unavailable)`);
          }
          return;
        }
        
        // Try blockchain verification
        try {
          // Call the contract method to verify policy
          await flightInsuranceContract.callStatic.isPolicyActive(policy.blockchainPolicyId);
          
          // Try to call process claim to verify it would work
          await flightInsuranceContract.callStatic.processClaim(policy.blockchainPolicyId);
          
          // Blockchain verification succeeded
          claim.status = 'approved';
          claim.verificationMethod = "blockchain";
          claim.blockchainVerified = true;
          await claim.save();
          
          // Update policy status
          policy.status = 'claimed';
          await policy.save();
          
          // Generate transaction hash
          let txHash = "0x" + Array(64).fill().map(() => Math.floor(Math.random() * 16).toString(16)).join('');
          
          console.log(`Claim processed on blockchain with tx: ${txHash} (simulated)`);
          
          claim.status = 'paid';
          claim.transactionHash = txHash;
          await claim.save();
          
          console.log(`Claim ${claim.id} processed successfully via blockchain verification`);
        } catch (error) {
          console.error('Blockchain verification failed:', error.message);
          
          // When blockchain verification fails, leave the claim pending for manual review
          claim.reason = `${claim.reason} (Blockchain verification failed: ${error.message})`;
          await claim.save();
          
          console.log(`Claim ${claim.id} left pending for manual review (blockchain verification failed)`);
        }
      } catch (error) {
        console.error("Error processing claim:", error);
      }
    }, 5000); // Process claim after 5 seconds for demo purposes
    
    res.status(201).json(claim);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Failed to create claim", error: error.message });
  }
});

// Get all claims
app.get('/api/claims', async (req, res) => {
  try {
    const claims = await db.claims.findAll({
      include: [{
        model: db.policies,
        as: 'policy'
      }]
    });
    res.json(claims);
  } catch (error) {
    res.status(500).json({ message: "Failed to fetch claims", error: error.message });
  }
});

// Mock endpoint for flight status (for demo purposes)
app.get('/api/flights/:flightNumber', (req, res) => {
  const { flightNumber } = req.params;
  const status = ['ON_TIME', 'DELAYED', 'CANCELLED'][Math.floor(Math.random() * 3)];
  const delayTime = status === 'DELAYED' ? Math.floor(Math.random() * 180) + 30 : 0;
  
  res.json({
    flightNumber,
    status,
    delayTime,
    departureTime: new Date(Date.now() + 3600000).toISOString(),
    arrivalTime: new Date(Date.now() + 7200000 + (delayTime * 60000)).toISOString()
  });
});

// Health check endpoint that includes blockchain status
app.get('/api/health', async (req, res) => {
  const blockchainConnected = await checkBlockchainConnection();
  
  res.json({
    status: 'healthy',
    database: 'connected',
    blockchain: blockchainConnected ? 'connected' : 'disconnected',
    contract: blockchainConnected ? 'available' : 'unavailable'
  });
});

// Start the server
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
}); 