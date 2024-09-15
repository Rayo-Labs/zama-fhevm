import { exec } from "child_process";

const walletsPublicKey = {
  1: "0x9C3Ad2B5f00EC8e8564244EBa59692Dd5e57695b",
  2: "0xCe2C4e2296F736962901a5aD0138138817ABcA8f",
  3: "0xA139Bcfb689926ebCF2AABDbd32FBaFC250e70d9",
};

function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function command(cmd: string) {
  exec(cmd, (error, stdout, stderr) => {
    if (error) {
      console.error(`Error: ${error.message}`);
      return;
    }

    if (stderr) {
      console.error(`Stderr: ${stderr}`);
      return;
    }

    console.log(`Result: ${stdout}`);
  });

  await sleep(4000);
}

async function main() {
  const commands = [
    `TS_NODE_TRANSPILE_ONLY=true ts-node ./test/zama/TokenContractScript.ts 1 wrap 40`,
    `TS_NODE_TRANSPILE_ONLY=true ts-node ./test/zama/TokenContractScript.ts 1 transferEncrypted ${walletsPublicKey[3]} 20`,
    `TS_NODE_TRANSPILE_ONLY=true ts-node ./test/zama/TokenContractScript.ts 1 balanceOf ${walletsPublicKey[3]}`,
    `TS_NODE_TRANSPILE_ONLY=true ts-node ./test/zama/BridgeContractScript.ts 1 nextIntentId`,
    `TS_NODE_TRANSPILE_ONLY=true ts-node ./test/zama/BridgeContractScript.ts 3 onRecvIntent ${walletsPublicKey[3]} 10`,
    `TS_NODE_TRANSPILE_ONLY=true ts-node ./test/zama/TokenContractScript.ts 1 balanceOf ${walletsPublicKey[3]}`,
    `TS_NODE_TRANSPILE_ONLY=true ts-node ./test/zama/BridgeContractScript.ts 1 nextIntentId`,
  ];

  for (const cmd of commands) {
    await command(cmd);
  }
}

main()
  .then(() => process.exit(0))
  .catch((error: Error) => {
    console.error(error);
    process.exit(1);
  });
