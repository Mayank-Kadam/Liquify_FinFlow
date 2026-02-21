import { ethers } from "ethers";
import { useAppStore } from "@/store/appStore";

// Setup function to listen for on-chain DemandRequested events
// and forward them to local simulateDemand (no formula changes).
export function setupDemandListener() {
  const RPC = (import.meta.env.VITE_RPC_URL as string) || "http://127.0.0.1:8545";
  const CONTRACT_ADDRESS = (import.meta.env.VITE_CONTRACT_ADDRESS as string) || undefined;

  if (!CONTRACT_ADDRESS) {
    console.warn("[Demand Listener] No CONTRACT_ADDRESS configured");
    return;
  }

  console.log("[Demand Listener] Starting listener", { RPC, CONTRACT_ADDRESS });

  const provider = new ethers.JsonRpcProvider(RPC);
  const abi = ["event DemandRequested(bytes32 indexed offeringId,uint256 amount,address indexed caller)"];
  const contract = new ethers.Contract(CONTRACT_ADDRESS, abi, provider);

  const handler = (offeringId: string, amount: ethers.BigNumberish) => {
    try {
      const amountNum = Number(amount.toString());
      console.log("[Demand Listener] Event received", { offeringId, amount: amountNum });

      // offerings use string ids like `offering-<ts>`; match by hashing
      const state = (useAppStore.getState as any)();
      const offerings = state.offerings as Array<{ id: string }>;

      console.log("[Demand Listener] Available offerings:", offerings.map((o) => ({id: o.id, onchain: (o as any).onchainId})));

      for (const o of offerings) {
        const hash = (o as any).onchainId ?? ethers.id(o.id);
        if (hash === offeringId) {
          console.log("[Demand Listener] Matched offering", o.id, "calling simulateDemand");
          useAppStore.getState().simulateDemand(o.id, amountNum);
          break;
        }
      }
    } catch (err) {
      console.error("[Demand Listener] Error:", err);
    }
  };

  console.log("[Demand Listener] Attaching event listener");
  contract.on("DemandRequested", handler);
}
