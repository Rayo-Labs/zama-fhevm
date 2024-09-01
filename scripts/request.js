const balanceData = JSON.stringify({
  jsonrpc: "2.0",
  method: "eth_getBalance",
  params: ["0x9C3Ad2B5f00EC8e8564244EBa59692Dd5e57695b", "latest"],
  id: 1,
});

const blockNumber = JSON.stringify({
  jsonrpc: "2.0",
  method: "eth_blockNumber",
  params: [],
  id: 1,
});

const blockData = JSON.stringify({
  jsonrpc: "2.0",
  method: "eth_getBlockByNumber",
  params: ["0x49141", false],
  id: 1,
});

const transactionData = JSON.stringify({
  jsonrpc: "2.0",
  method: "eth_getTransactionByHash",
  params: ["0x0611df936204132c9c6cd3251332449cb997f6b9af6bc5a958845866e083429a"],
  id: 1,
});

const receiptData = JSON.stringify({
  jsonrpc: "2.0",
  method: "eth_getTransactionReceipt",
  params: ["0xad922729c9ff0a463cde9896bddfa03ead29c71a4538e988ff4e00d808782c77"],
  id: 1,
});

async function request(req) {
  return await globalThis
    .fetch("https://devnet.zama.ai", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: req,
    })
    .then((res) => res.json());
}

async function main() {
  const param = process.argv[2];
  let requestData;
  switch (param) {
    case "balance":
      requestData = balanceData;
      break;
    case "blockNumber":
      requestData = blockNumber;
      break;
    case "block":
      requestData = blockData;
      break;
    case "transaction":
      requestData = transactionData;
      break;
    case "receipt":
      requestData = receiptData;
      break;
    default:
      throw new Error("Invalid parameter");
  }
  const responses = await request(requestData);
  console.log(responses);
}
main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
