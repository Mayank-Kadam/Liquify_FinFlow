const { ethers } = require("ethers");

// Simple bot that periodically calls requestDemand on the deployed contract
// Configure CONTRACT_ADDRESS and RPC_URL via environment or defaults.
const CONTRACT_ADDRESS = process.env.CONTRACT_ADDRESS || "";
const RPC_URL = process.env.RPC_URL || "http://127.0.0.1:8545";

async function main() {
  if (!CONTRACT_ADDRESS) {
    console.error("Please set CONTRACT_ADDRESS env var to the deployed DemandSimulator address.");
    process.exit(1);
  }

  const provider = new ethers.JsonRpcProvider(RPC_URL);
  // use first local account exposed by the node
  const accounts = await provider.listAccounts();
  if (!accounts || accounts.length === 0) {
    console.error("No accounts available from provider");
    process.exit(1);
  }
  const first = accounts[0];
  const addr = typeof first === "string" ? first : first.address || first;
  const signer = provider.getSigner(addr);

  const abi = ["function requestDemand(bytes32 offeringId,uint256 amount)"];
  const iface = new ethers.Interface(abi);

  console.log("Bot started — sending demand requests to", CONTRACT_ADDRESS);

  // Poll the local offerings server to discover real offerings to target.
  const OFFERS_SERVER = process.env.OFFERS_SERVER || "http://127.0.0.1:3001/offerings";

  async function pollAndSend() {
    try {
      const res = await fetch(OFFERS_SERVER);
      if (!res.ok) return;
      const list = await res.json();
      if (!Array.isArray(list) || list.length === 0) return;

      // pick latest offering
      const latest = list[list.length - 1];
      const onchainId = latest.onchainId || ethers.id(latest.id);
      const offeringId = onchainId;

      const amount = Math.floor(Math.random() * 10) + 1; // random small demand

      // Encode calldata and use eth_sendTransaction — local Hardhat node auto-signs unlocked accounts
      const data = iface.encodeFunctionData("requestDemand", [offeringId, amount]);
      const from = addr;
      const params = [{ from, to: CONTRACT_ADDRESS, data }];
      const txHash = await provider.send("eth_sendTransaction", params);
      console.log("Sent demand", amount, "for offering", latest.id, "tx:", txHash);
    } catch (err) {
      // If the offerings server isn't available yet, just skip — bot keeps running
      // and will try again on the next interval.
      console.error("Bot error:", err.message || err);
    }
  }

  // run immediately and then every 5s
  await pollAndSend();
  setInterval(pollAndSend, 5000);
}

main();
