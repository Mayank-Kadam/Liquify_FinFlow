import { createRoot } from "react-dom/client";
import App from "./App.tsx";
import "./index.css";
import { setupDemandListener } from "./hooks/useDemandListener";

// start listener at module load (before React renders)
try {
	setupDemandListener();
} catch (e) {
	console.error("Failed to setup demand listener:", e);
}

createRoot(document.getElementById("root")!).render(<App />);
