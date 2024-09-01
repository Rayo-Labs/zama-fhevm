var hre = require("hardhat");

async function main() {
  const [deployer] = await hre.ethers.getSigners();

  console.log("Deploying contracts with the account:", deployer.address);

  const WrappedEncryptedERC20 = await hre.ethers.getContractFactory("WrappedEncryptedERC20");
  const weerc20 = await WrappedEncryptedERC20.deploy("Wrapped Encrypted ERC20", "WEERC20");

  console.log("Contract deployed at:", weerc20.target);
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
