var hre = require("hardhat");

async function main() {
  const [deployer] = await hre.ethers.getSigners();

  console.log("Deploying contracts with the account:", deployer.address);

  const ZamaBridge = await hre.ethers.getContractFactory("ZamaBridge");
  const zamaBridge = await ZamaBridge.deploy("0xE7243EB8076327dDc7899665a4b7C76596401962");

  console.log("Contract deployed at:", zamaBridge.target);
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
