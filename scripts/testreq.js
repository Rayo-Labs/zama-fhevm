var ethers = require("ethers");

var provider = new ethers.JsonRpcProvider("https://devnet.zama.ai");

async function main() {
  let startBlock = 413835; //413835
  let endBlock = 413870;

  for (let i = startBlock; i <= endBlock; i++) {
    let block = await provider.getBlock(i);
    console.log(`Block Number: ${i}, Transactions:`);

    if (block !== null && block.transactions !== null && block.transactions.length !== 0) {
      block.transactions.forEach((tx) => {
        console.log(tx);
      });
    }
  }
}

main();
