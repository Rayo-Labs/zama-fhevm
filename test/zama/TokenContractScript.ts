/* eslint-disable  @typescript-eslint/no-explicit-any */
import { createInstance as createFhevmInstance } from "fhevmjs";
import hre from "hardhat";

import { abi } from "../../artifacts/contracts/zama/ZamaWEERC20.sol/ZamaWEERC20.json";

const { ethers } = hre;

const contractAddress = "0xE7243EB8076327dDc7899665a4b7C76596401962";
// Token : 0xE7243EB8076327dDc7899665a4b7C76596401962
// Bridge : 0x6BDf86BBc966824A5911b0416295CBDa6361A5a3
// Address 1 : 0x9C3Ad2B5f00EC8e8564244EBa59692Dd5e57695b
// Address 2 : 0xCe2C4e2296F736962901a5aD0138138817ABcA8f
// Address 3 : 0xA139Bcfb689926ebCF2AABDbd32FBaFC250e70d9

const wallets: { [key: string]: string } = {
  1: process.env.KEY as string,
  2: process.env.KEY2 as string,
  3: process.env.KEY3 as string,
};

async function ContractCall(key: number, cfunc: string, cargs: any[] = [], cvalue: string = "0") {
  const args = cargs;
  const wallet = new ethers.Wallet(wallets[key], new ethers.JsonRpcProvider("https://devnet.zama.ai"));
  const instance = await createFhevmInstance({
    networkUrl: "https://devnet.zama.ai",
    gatewayUrl: "https://gateway.devnet.zama.ai",
  });

  if (cfunc === "balanceOf") {
    if (args[0] === undefined) {
      args[0] = wallet.address;
    }
  } else if (cfunc === "unwrap") {
    const input = instance.createEncryptedInput(contractAddress, wallet.address);
    input.add64(args[0]);
    const encryptedInput = input.encrypt();
    args[0] = encryptedInput.handles[0];
    args[1] = encryptedInput.inputProof;
  } else if (cfunc === "approveEncrypted") {
    const input = instance.createEncryptedInput(contractAddress, wallet.address);
    input.add64(args[1]);
    const encryptedInput = input.encrypt();
    args[1] = encryptedInput.handles[0];
    args[2] = encryptedInput.inputProof;
  } else if (cfunc === "transferEncrypted") {
    const input = instance.createEncryptedInput(contractAddress, wallet.address);
    input.add64(args[1]);
    const encryptedInput = input.encrypt();
    args[1] = encryptedInput.handles[0];
    args[2] = encryptedInput.inputProof;
  } else if (cfunc === "transferFromEncrypted") {
    const input = instance.createEncryptedInput(contractAddress, wallet.address);
    input.add64(args[2]);
    const encryptedInput = input.encrypt();
    args[2] = encryptedInput.handles[0];
    args[3] = encryptedInput.inputProof;
  }

  const contract = new ethers.Contract(contractAddress, abi, wallet);
  const result = await contract[cfunc](...args, {
    value: BigInt(Number(cvalue) * 10 ** 18),
    gasLimit: 6000000,
  });
  console.log("result: ", result);
}

async function main() {
  const wallet = process.argv[2];
  const param1 = process.argv[3];
  const param2 = process.argv[4];
  const param3 = process.argv[5];
  const param4 = process.argv[6];
  switch (param1) {
    case "totalSupply":
      await ContractCall(Number(wallet), param1);
      break;
    case "balanceOf":
      await ContractCall(Number(wallet), param1, [param2]);
      break;
    case "getEncryptedBalance":
      await ContractCall(Number(wallet), param1, [param2]);
      break;
    case "getAllowance":
      await ContractCall(Number(wallet), "getAllowance", [param2, param3]);
      break;
    case "wrap": {
      await ContractCall(Number(wallet), param1, [BigInt(Number(param2) * 10 ** 18)]);
      break;
    }
    case "unwrap": {
      await ContractCall(Number(wallet), param1, [BigInt(Number(param2) * 10 ** 6)]);
      break;
    }
    case "approveEncrypted": {
      await ContractCall(Number(wallet), param1, [param2, BigInt(Number(param3) * 10 ** 6)]);
      break;
    }
    case "allowBalance": {
      await ContractCall(Number(wallet), param1, [param2]);
      break;
    }
    case "allowAllowance": {
      await ContractCall(Number(wallet), param1, [param2, param3]);
      break;
    }
    case "transferEncrypted": {
      await ContractCall(Number(wallet), param1, [param2, BigInt(Number(param3) * 10 ** 6)]);
      break;
    }
    case "transferFromEncrypted": {
      await ContractCall(Number(wallet), param1, [param2, param3, BigInt(Number(param4) * 10 ** 6)]);
      break;
    }
    default:
      console.log("Invalid parameter");
      console.log("Your param: ", param1);
  }
}

main()
  .then(() => process.exit(0))
  .catch((error: Error) => {
    console.error(error);
    process.exit(1);
  });
