import { FhenixClient, fhenixjs } from "fhenixjs";
import { createInstance as createFhevmInstance } from "fhevmjs";
import hre, { ethers } from "hardhat";

import { abi } from "./abi2";

const contractAddress = "0xa96CA038843ff5D024514Ecd50973458717354b6"; //0xE2F20947dFf10EBb26D24D23F7a20DC07212fc6d

const chains = {
  ethereum: "https://ethereum-sepolia-rpc.publicnode.com",
  fhenix: "https://api.helium.fhenix.zone",
  zama: "https://devnet.zama.ai",
};

async function callContract(
  contractAddress: string,
  contractABI: any,
  functionName: string,
  args: any[] = [],
  value: string = "0",
) {
  const valueInWei = BigInt(Number(value) * 10 ** 18);
  const privateKey: string = process.env.PRIVATE_KEY_DEPLOYER as string;
  //const privateKey2: string = process.env.PRIVATE_KEY_RAYOLABS as string;
  const wallet = new ethers.Wallet(privateKey, new ethers.JsonRpcProvider(chains["fhenix"]));
  const weerc20 = new ethers.Contract(contractAddress, contractABI, wallet);
  const result = await weerc20[functionName](...args, { value: valueInWei });
  //const receipt = await result.wait();
  console.log("Result: ", result);
  //console.log("Receipt: ", receipt);
}

async function main() {
  //await callContract(contractAddress, abi, "decimals");
  //await callContract(contractAddress, abi, "balanceOf", ["0x9C3Ad2B5f00EC8e8564244EBa59692Dd5e57695b"]);
  //await callContract(contractAddress, abi, "deposit", [], "0.001");
  //await callContract(contractAddress, abi, "balanceOf", ["0x9C3Ad2B5f00EC8e8564244EBa59692Dd5e57695b"]);
  //await callContract(contractAddress, abi, "totalSupply");
  ////////////////////////////////////////////////////
  const provider = new ethers.JsonRpcProvider(chains["fhenix"]);
  // const balance = await provider.getBalance("0x9C3Ad2B5f00EC8e8564244EBa59692Dd5e57695b");
  // console.log("Balance: ", balance.toString());
  // const instance = await createFhevmInstance({
  //   networkUrl: "https://devnet.zama.ai",
  //   gatewayUrl: "https://gateway.devnet.zama.ai",
  // });
  // const inputAmount = instance.createEncryptedInput(contractAddress, "0x9C3Ad2B5f00EC8e8564244EBa59692Dd5e57695b");
  // inputAmount.add64(BigInt(0.002 * 10 ** 6));
  // const encryptedWithdrawAmount = inputAmount.encrypt();
  // console.log("InputAmount: ", inputAmount);
  // console.log("Encrypted Withdraw Amount: ", encryptedWithdrawAmount);
  // console.log("Encrypted Withdraw Amount: ", encryptedWithdrawAmount.handles[0]);
  // console.log("Encrypted Withdraw Amount: ", encryptedWithdrawAmount.inputProof);
  // console.log("Decrypted Withdraw Amount: ", encryptedWithdrawAmount.decrypt());
  // const inputTo = instance.createEncryptedInput(contractAddress, "0x9C3Ad2B5f00EC8e8564244EBa59692Dd5e57695b");
  // inputTo.addAddress("0x9C3Ad2B5f00EC8e8564244EBa59692Dd5e57695b");
  // const encryptedTo = inputTo.encrypt();
  // await callContract(
  //   contractAddress,
  //   abi,
  //   "withdrawal",
  //   [
  //     encryptedWithdrawAmount.handles[0],
  //     encryptedWithdrawAmount.inputProof,
  //     encryptedTo.handles[0],
  //     encryptedTo.inputProof,
  //   ],
  //   "0",
  // );
  ////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
  // const amount = 10;
  // await callContract(contractAddress, abi, "wrap", [BigInt(amount)], "0");
  const fhjs = hre.fhenixjs;
  await callContract(contractAddress, abi, "_encBalances", [resultAddress]);
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
