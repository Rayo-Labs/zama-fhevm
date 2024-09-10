var hre = require("hardhat");

async function main() {
  const [deployer] = await hre.ethers.getSigners();

  console.log("Deploying contracts with the account:", deployer.address);

  const ZamaBridge = await hre.ethers.getContractFactory("ZamaBridge");
  const zamaBridge = await ZamaBridge.deploy("0xdD8e66345d3Edd854682f718F960845Fa7A3da71");

  console.log("Contract deployed at:", zamaBridge.target);
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
