const hre = require("hardhat");

async function main() {
  const Demand = await hre.ethers.getContractFactory("DemandSimulator");
  const demand = await Demand.deploy();
  // ethers v6: waitForDeployment ensures the contract is available
  await demand.waitForDeployment();
  console.log("DemandSimulator deployed to:", demand.target || demand.address || demand.address);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
