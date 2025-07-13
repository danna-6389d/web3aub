"use client";
import { type Web3AuthContextConfig } from "@web3auth/modal/react";
import { WEB3AUTH_NETWORK } from "@web3auth/modal";

console.log("Environment variables check:");
console.log("PROD:", import.meta.env.PROD);
console.log(
  "VITE_WEB3AUTH_CLIENT_ID:",
  import.meta.env.VITE_WEB3AUTH_CLIENT_ID
);
console.log(
  "VITE_WEB3AUTH_CLIENT_ID_DEV:",
  import.meta.env.VITE_WEB3AUTH_CLIENT_ID_DEV
);

const isProduction = import.meta.env.PROD;
const clientId = isProduction
  ? import.meta.env.VITE_WEB3AUTH_CLIENT_ID
  : import.meta.env.VITE_WEB3AUTH_CLIENT_ID_DEV;

console.log("Selected clientId:", clientId);

if (!clientId) {
  throw new Error(
    "VITE_WEB3AUTH_CLIENT_ID is not set –– need to set in .env for web3auth to work"
  );
}

const web3AuthContextConfig: Web3AuthContextConfig = {
  web3AuthOptions: {
    clientId,
    web3AuthNetwork: isProduction
      ? WEB3AUTH_NETWORK.SAPPHIRE_MAINNET
      : WEB3AUTH_NETWORK.SAPPHIRE_DEVNET,
  },
};

export default web3AuthContextConfig;
