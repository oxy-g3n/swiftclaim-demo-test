# SwiftClaim - Instant Insurance Claims Processing Demo

A demo application showcasing how automatic insurance claims can be processed using blockchain and AI. This project demonstrates a flight insurance system where claims are processed instantly when flights are delayed.

## Project Structure

- **contracts/**: Smart contracts for insurance policies
- **backend/**: Node.js + Express API with PostgreSQL
- **frontend/**: Next.js React application

## Setup Instructions

### Prerequisites

- Node.js (v14+)
- PostgreSQL database
- Hardhat for Ethereum development

### Step 1: Set up the database

```bash
# Create a PostgreSQL database named 'swiftclaim'
createdb swiftclaim

# Or use pgAdmin to create the database
```

### Step 2: Deploy Smart Contracts

```bash
# Navigate to contracts directory
cd contracts

# Install dependencies
npm install

# Start a local blockchain node
npx hardhat node

# In a new terminal, deploy the contract
npx hardhat run scripts/deploy.js --network localhost
```

Note the contract address from the deployment.

### Step 3: Configure Backend

```bash
# Navigate to backend directory
cd backend

# Install dependencies
npm install

# Create .env file (update with your specific values)
# Update the CONTRACT_ADDRESS with the address from Step 2
cp .env.example .env
```

Update the `.env` file with your database credentials and the contract address.

### Step 4: Start the Backend

```bash
# Start the development server
npm run dev
```

### Step 5: Configure Frontend

```bash
# Navigate to frontend directory
cd frontend

# Install dependencies
npm install
```

### Step 6: Start the Frontend

```bash
# Start the development server
npm run dev
```

Visit `http://localhost:3000` to access the application.

## Demo Flow

1. Visit the Customer Dashboard
2. Purchase a flight insurance policy
3. Check the flight status (randomly simulated as delayed/on-time)
4. Submit a claim if the flight is delayed
5. Watch as the claim is processed automatically

## Technology Stack

- **Frontend**: Next.js, React Query, TailwindCSS
- **Backend**: Node.js, Express, PostgreSQL, Sequelize
- **Blockchain**: Ethereum (Hardhat), Solidity, ethers.js

## Simplified for Demo Purposes

This demo simplifies several aspects that would be more robust in a production system:

1. Uses a simulated blockchain connection rather than a real network
2. Simulates flight status data instead of real API integrations
3. Uses random wallet addresses instead of actual user authentication
4. Processes claims automatically without external verification 