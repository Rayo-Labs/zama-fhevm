/* eslint-disable  @typescript-eslint/no-explicit-any */
import { createInstance as createFhevmInstance } from "fhevmjs";
import hre from "hardhat";

import { abi } from "./abi";
import { abi2 } from "./abi2";
import { testabi } from './abitest'

const { ethers } = hre;

const contractAddress = "0x74431f4162EB7F8137491DA5ad0449626de58E94"; // 0x8d55cD2853081F80f9f8c6FEE4e949590240c005 // 0x02af3256c398131bDe388310b305c8Cf6E7f8844
// Token : 0x57606B84255c6c7B5889554D840d5e22b7AB2f93
// Bridge : 0x0C76E82a6E8EFB346f9772BEdE410521Ab9dC6D5
// Address 1 : 0x9C3Ad2B5f00EC8e8564244EBa59692Dd5e57695b
// Address 2 : 0xCe2C4e2296F736962901a5aD0138138817ABcA8f
// Address 3 : 0xA139Bcfb689926ebCF2AABDbd32FBaFC250e70d9

async function ContractCall(ca: string, cabi: any, cfunc: string, cargs: any[] = [], cvalue: string = "0") {
  const args = cargs;
  const privateKey = process.env.PRIVATE_KEY_DEPLOYER as string;
  const wallet = new ethers.Wallet(privateKey, new ethers.JsonRpcProvider("https://devnet.zama.ai"));
  console.log('running script with wallet address: ', wallet.address);
  const instance = await createFhevmInstance({
    networkUrl: "https://devnet.zama.ai",
    gatewayUrl: "https://gateway.devnet.zama.ai",
  });
  //const client = new FhenixClient({ provider: hre.ethers.provider });

  if (cfunc === "unwrap" || cfunc === "createTest") {
    // const encryptedUint64 = await client.encrypt_uint64(args[0]);
    const input = instance.createEncryptedInput(ca, wallet.address);
    input.add64(Number(args[0]));
    const encryptedInput = input.encrypt();
    args[0] = encryptedInput.handles[0];
    args[1] = encryptedInput.inputProof;
  } else if (cfunc === "transferEncrypted") {
    //args[1] = await fhenixjs.encrypt_uint64(cargs[1]);
    const input = instance.createEncryptedInput(ca, wallet.address);
    input.add64(args[1]);
    const encryptedInput = input.encrypt();
    args[1] = encryptedInput.handles[0];
    args[2] = encryptedInput.inputProof;
  } else if (cfunc === "getBalanceEncrypted") {
    // const permit = await getPermit(contractAddress, hre.ethers.provider);
    // const permission = client.extractPermitPermission(permit!);
    // console.log(permission);
    // args[0] = permission;
  } else if (cfunc === "approve") {
    const input = instance.createEncryptedInput(ca, wallet.address);
    input.add64(args[1]);
    const encryptedInput = input.encrypt();
    args[1] = encryptedInput.handles[0];
    args[2] = encryptedInput.inputProof;
  } else if (cfunc === "transferFromEncrypted") {
    const input = instance.createEncryptedInput(ca, wallet.address);
    input.add64(args[2]);
    const encryptedInput = input.encrypt();
    args[2] = encryptedInput.handles[0];
    args[3] = encryptedInput.inputProof;
  } else if (cfunc === "onRecvIntent") {
    const input = instance.createEncryptedInput(ca, wallet.address);

    input.addAddress(args[0]);
    input.addAddress(args[1]);
    input.addAddress(args[2]);
    input.add64(args[3]);

    const encryptedInput = input.encrypt();

    args[0] = encryptedInput.handles[0];
    args[1] = encryptedInput.inputProof;
  } else if (cfunc === "bridgeWEERC20") {
    const input = instance.createEncryptedInput(ca, wallet.address);
    input.addAddress(args[0]);
    input.add64(args[1]);
    const encryptedInput = input.encrypt();
    // const input2 = instance.createEncryptedInput(ca, wallet.address);
    // input2.addAddress(args[0]);
    // const encryptedInput2 = input2.encrypt();
    args[0] = encryptedInput.handles[0];
    args[1] = encryptedInput.handles[1];
    args[2] = encryptedInput.inputProof;
    args[3] = "0x8d55cD2853081F80f9f8c6FEE4e949590240c005";
  }

  const contract = new ethers.Contract(ca, cabi, wallet);
  const result = await contract[cfunc](...args, {
    value: BigInt(Number(cvalue) * 10 ** 18),
    gasLimit: 6000000,
  });
  console.log("result: ", result);
}

async function main() {
  const param = process.argv[2];
  const param2 = process.argv[3];
  const param3 = process.argv[4];
  const param4 = process.argv[5];
  const param5 = process.argv[6];
  switch (param) {
    case "getDecimals":
      await ContractCall(contractAddress, abi, "decimals");
      break;
    case "getTotalSupply":
      await ContractCall(contractAddress, abi, "totalSupply");
      break;
    case "getBalance":
      await ContractCall(contractAddress, abi, "balanceOf", [param2]);
      break;
    case "getEncryptedBalance":
      await ContractCall(contractAddress, abi, "getEncryptedBalance", [param2]);
      break;
    case "wrap": {
      const wrapAmount = BigInt(Number(param2) * 10 ** 18);
      await ContractCall(contractAddress, abi, "wrap", [wrapAmount]);
      break;
    }
    case "unwrap": {
      const unwrapAmount = BigInt(Number(param2) * 10 ** 6);
      await ContractCall(contractAddress, abi, "unwrap", [unwrapAmount]);
      break;
    }
    case "transferEncrypted": {
      const [to, value] = [param2, param3];
      await ContractCall(contractAddress, abi, "transferEncrypted", [to, BigInt(Number(value) * 10 ** 6)]);
      break;
    }
    case "onRecvIntent": {
      const [from, to, tokenaddress, value] = [param2, param3, param4, param5];
      await ContractCall(contractAddress, abi, "transferFromEncrypted", [from, to, BigInt(Number(value) * 10 ** 6)]);
      break;
    }
    case "approve": {
      const [spender, value] = [param2, param3];
      await ContractCall(contractAddress, abi, "approve", [spender, BigInt(Number(value) * 10 ** 6)]);
      break;
    }
    case "getAllowance":
      await ContractCall(contractAddress, abi, "getAllowance", [param2, param3]);
      break;
    case "getBalanceEncrypted":
      await ContractCall(contractAddress, abi, "getBalanceEncrypted");
      break;
    case "bridge": {
      const [to, value] = [param2, param3];
      await ContractCall(contractAddress, abi2, "bridgeWEERC20", [to, BigInt(Number(value) * 10 ** 6)]);
      break;
    }
    case "nextIntentId":
      await ContractCall(contractAddress, abi2, "nextIntentId");
      break;
    default:
      await ContractCall(contractAddress, testabi, param);
      console.log("Invalid parameter");
      console.log("Your param: ", param);
  }
}

main()
  .then(() => process.exit(0))
  .catch((error: Error) => {
    console.error(error);
    process.exit(1);
  });
