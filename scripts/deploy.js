const hre = require("hardhat");

async function main() {
  const [deployer] = await hre.ethers.getSigners();
  console.log("Deploying with:", deployer.address);

  // 1. Deploy PredictionMarket (resolver = deployer for now, swap later)
  const Market = await hre.ethers.deployContract("PredictionMarket", [deployer.address]);
  await Market.waitForDeployment();
  const marketAddr = await Market.getAddress();
  console.log("PredictionMarket:", marketAddr);

  console.log("\n=== COPY THESE INTO src/utils/contracts.js ===");
  console.log(`MARKET_ADDRESS="${marketAddr}"`);
}

main().catch(console.error);
