//import { createInstance } from "fhevmjs";
import { ethers } from "hardhat";

import { abi } from "./abi";

const contractAddress = "0x1E14278310Ad0305cED5BDea7BC9F0Df7bF5c3a2";

async function callContract(
  contractAddress: string,
  contractABI: any,
  functionName: string,
  args: any[] = [],
  value: string = "0",
) {
  const valueInWei = BigInt(Number(value) * 10 ** 18);
  const privateKey: string = process.env.PRIVATE_KEY_DEPLOYER as string;
  const wallet = new ethers.Wallet(privateKey, new ethers.JsonRpcProvider("https://devnet.zama.ai"));
  const weerc20 = new ethers.Contract(contractAddress, contractABI, wallet);
  const result = await weerc20[functionName](...args, { value: valueInWei });
  //const receipt = await result.wait();
  console.log("Result: ", result);
  //console.log("Receipt: ", receipt);
}

async function main() {
  //await callContract(contractAddress, abi, "decimals");
  //await callContract(contractAddress, abi, "balanceOf", ["0x1E14278310Ad0305cED5BDea7BC9F0Df7bF5c3a2"]);
  //await callContract(contractAddress, abi, "deposit", [], "0.01");
  await callContract(contractAddress, abi, "balanceOf", ["0x9C3Ad2B5f00EC8e8564244EBa59692Dd5e57695b"]);
  ////////////////////////////////////////////////////
  // const instance = await createInstance({
  //   networkUrl: "https://devnet.zama.ai",
  //   gatewayUrl: "https://gateway.devnet.zama.ai",
  // });
  // const inputAmount = instance.createEncryptedInput(contractAddress, "0x9C3Ad2B5f00EC8e8564244EBa59692Dd5e57695b");
  // inputAmount.add64(BigInt(0.005 * 10 ** 6));
  // const encryptedWithdrawAmount = inputAmount.encrypt();
  // const inputTo = instance.createEncryptedInput(contractAddress, "0x9C3Ad2B5f00EC8e8564244EBa59692Dd5e57695b");
  // inputTo.addAddress("0x9C3Ad2B5f00EC8e8564244EBa59692Dd5e57695b");
  // const encryptedTo = inputTo.encrypt();
  // await callContract(contractAddress, abi, "withdraw", [encryptedWithdrawAmount, encryptedTo], "0");
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
