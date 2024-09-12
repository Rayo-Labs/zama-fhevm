var hre = require("hardhat");

async function main() {
  const [deployer] = await hre.ethers.getSigners();

  console.log("Deploying contracts with the account:", deployer.address);

  const FhenixWEERC20 = await hre.ethers.getContractFactory("ZamaTest");
  const fhenixWEERC20 = await FhenixWEERC20.deploy();

  console.log("Contract deployed at:", fhenixWEERC20.target);
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
