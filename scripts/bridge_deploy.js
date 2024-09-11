var hre = require("hardhat");

async function main() {
  const [deployer] = await hre.ethers.getSigners();

  console.log("Deploying contracts with the account:", deployer.address);

  const ZamaBridge = await hre.ethers.getContractFactory("ZamaBridge");
  const zamaBridge = await ZamaBridge.deploy("0x57606B84255c6c7B5889554D840d5e22b7AB2f93");

  console.log("Contract deployed at:", zamaBridge.target);
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
