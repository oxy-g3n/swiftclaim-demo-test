const { ethers } = require("hardhat");

async function main() {
  console.log("Deploying FlightInsurance contract...");

  // Get the Contract Factory
  const FlightInsurance = await ethers.getContractFactory("FlightInsurance");
  
  // Deploy the contract
  const flightInsurance = await FlightInsurance.deploy();
  
  // Wait for deployment to complete
  await flightInsurance.deployed();
  
  console.log(`FlightInsurance contract deployed to: ${flightInsurance.address}`);
  console.log(`Update the CONTRACT_ADDRESS in backend/.env with this address!`);
}

// Execute deployment
main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error("Error during deployment:", error);
    process.exit(1);
  }); 