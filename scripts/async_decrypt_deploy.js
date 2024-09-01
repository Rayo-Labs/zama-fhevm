var hre = require("hardhat");

async function main() {
  const [deployer] = await hre.ethers.getSigners();

  console.log("Deploying contracts with the account:", deployer.address);

  const TestAsyncDecrypt = await hre.ethers.getContractFactory("TestAsyncDecrypt");
  const tad = await TestAsyncDecrypt.deploy();

  console.log("Contract deployed at:", tad.target);
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
