import { createRoot } from "react-dom/client";
import { Web3AuthProvider } from "@web3auth/modal/react";

import "./index.css";
import App from "./App.tsx";
import web3AuthContextConfig from "./web3authContext.tsx";

console.log("About to render app");

createRoot(document.getElementById("root")!).render(
  <Web3AuthProvider config={web3AuthContextConfig}>
    <App />
  </Web3AuthProvider>
);

console.log("Render call completed");
