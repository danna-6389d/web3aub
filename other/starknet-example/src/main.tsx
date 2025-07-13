import { createRoot } from "react-dom/client";
import App from "./App.tsx";

// Setup Web3Auth Provider
import { Web3AuthProvider } from "@web3auth/modal/react";
import web3AuthContextConfig from "./web3authContext.tsx";

createRoot(document.getElementById("root")!).render(
  <Web3AuthProvider config={web3AuthContextConfig}>
    <App />
  </Web3AuthProvider>
);
