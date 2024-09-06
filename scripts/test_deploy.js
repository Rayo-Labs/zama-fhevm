var hre = require("hardhat");

async function main() {
  const [deployer] = await hre.ethers.getSigners();

  console.log("Deploying contracts with the account:", deployer.address);

  const FhenixWEERC20 = await hre.ethers.getContractFactory("FhenixWEERC20");
  const fhenixWEERC20 = await FhenixWEERC20.deploy("Fhenix Encrypted ERC20", "FEERC20");

  console.log("Contract deployed at:", fhenixWEERC20.target);
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
