import { ethers } from "hardhat";

import { abi } from "./abi";

async function callContract(contractAddress: string, contractABI: any) {
  const provider = new ethers.JsonRpcProvider("https://devnet.zama.ai");
  const weerc20 = new ethers.Contract(contractAddress, contractABI, provider);
  const result = await weerc20.decimals();
  console.log(result);
}

async function main() {
  const contractAddress = "0x1E14278310Ad0305cED5BDea7BC9F0Df7bF5c3a2";

  await callContract(contractAddress, abi);
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
