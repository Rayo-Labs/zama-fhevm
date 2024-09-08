const balanceData = JSON.stringify({
  jsonrpc: "2.0",
  method: "eth_getBalance",
  params: ["0x1E14278310Ad0305cED5BDea7BC9F0Df7bF5c3a2", "latest"],
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
  params: ["0x800beb2e740c96ee9251f7cf15d04b67483dc04dfc75b6328b9706a828d25c4e"],
  id: 1,
});

const receiptData = JSON.stringify({
  jsonrpc: "2.0",
  method: "eth_getTransactionReceipt",
  params: ["0x800beb2e740c96ee9251f7cf15d04b67483dc04dfc75b6328b9706a828d25c4e"],
  id: 1,
});

const eventLogData = JSON.stringify({
  jsonrpc: "2.0",
  method: "eth_getLogs",
  params: [
    {
      blockhash: "0xdb8acb247064066ec59bc635578a2e0fb472b8d29a3fc5f2aea80d0f0f6c8301",
    },
  ],
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
    case "eventLog":
      requestData = eventLogData;
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
