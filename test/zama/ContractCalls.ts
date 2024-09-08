/* eslint-disable  @typescript-eslint/no-explicit-any */
import { createInstance as createFhevmInstance } from "fhevmjs";
import hre from "hardhat";

import { abi } from "./abi";

const { ethers } = hre;

const contractAddress = "0xe8a12B124580e653633Cf49c780903101458C183"; // 0x8d55cD2853081F80f9f8c6FEE4e949590240c005 // 0x02af3256c398131bDe388310b305c8Cf6E7f8844

async function ContractCall(ca: string, cabi: any, cfunc: string, cargs: any[] = [], cvalue: string = "0") {
  const args = cargs;
  const privateKey = process.env.PRIVATE_KEY_DEPLOYER as string;
  const wallet = new ethers.Wallet(privateKey, new ethers.JsonRpcProvider("https://devnet.zama.ai"));
  const instance = await createFhevmInstance({
    networkUrl: "https://devnet.zama.ai",
    gatewayUrl: "https://gateway.devnet.zama.ai",
  });
  //const client = new FhenixClient({ provider: hre.ethers.provider });

  if (cfunc === "unwrap") {
    // const encryptedUint64 = await client.encrypt_uint64(args[0]);
    const input = instance.createEncryptedInput(ca, wallet.address);
    input.add64(args[0]);
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
  }
  const contract = new ethers.Contract(ca, cabi, wallet);
  const result = await contract[cfunc](...args, {
    value: BigInt(Number(cvalue) * 10 ** 18),
  });
  console.log("result: ", result);
}

async function main() {
  const param = process.argv[2];
  const param2 = process.argv[3];
  const param3 = process.argv[4];
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
    case "getBalanceEncrypted":
      await ContractCall(contractAddress, abi, "getBalanceEncrypted");
      break;
    default:
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
