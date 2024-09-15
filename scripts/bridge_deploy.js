var hre = require("hardhat");

async function main() {
  const [deployer] = await hre.ethers.getSigners();

  console.log("Deploying contracts with the account:", deployer.address);

  const ZamaBridge = await hre.ethers.getContractFactory("ZamaBridge");
  const zamaBridge = await ZamaBridge.deploy("0x6671ABC4ce4bE0416AeF2c41fFc95f5EeA837772");

  console.log("Contract deployed at:", zamaBridge.target);
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
