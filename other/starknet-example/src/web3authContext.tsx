"use client";
import { type Web3AuthContextConfig } from "@web3auth/modal/react";
import { WEB3AUTH_NETWORK } from "@web3auth/modal";

//  Dashboard Registration
const isProduction = import.meta.env.PROD;
const clientId = isProduction
  ? import.meta.env.VITE_WEB3AUTH_CLIENT_ID
  : "BEQc78qNSC_nE4sh2YSf6MPK4mep2CLELdQ3jPU85y8YrRX3pGBxHV4Yx9hcEoEL_3gg8TUdTL0wST9HV0YHp3A"; // you can get yours from https://dashboard.web3auth.io

if (!clientId) {
  throw new Error(
    "clientId is not set –– need to set in .env for web3auth to work"
  );
}

// Instantiate SDK
const web3AuthContextConfig: Web3AuthContextConfig = {
  web3AuthOptions: {
    clientId,
    web3AuthNetwork: isProduction
      ? WEB3AUTH_NETWORK.SAPPHIRE_MAINNET
      : WEB3AUTH_NETWORK.SAPPHIRE_DEVNET,
  },
};

export default web3AuthContextConfig;
