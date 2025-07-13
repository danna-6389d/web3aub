import type { IProvider } from "@web3auth/modal";
import { Account, CallData, Contract, ec, hash, RpcProvider } from "starknet";
import { keccak256 } from "js-sha3";
import { CONTRACT_ADDRESS } from "./address";
import { CONTRACT_ABI } from "./abi";

export const OZ_ACCOUNT_CLASS_HASH =
  "0x540d7f5ec7ecf317e68d48564934cb99259781b1ee3cedbbc37ec5337f8e688";

/*
  Starknet uses a specific elliptic curve (Stark curve), which has a much smaller valid private key range than secp256k1 (used by EVM chains). The private key you receive from Web3Auth might be a random 32-byte value, which can sometimes be out of Starknet’s valid range.
  check out: https://web3auth.io/community/t/integrate-web3auth-on-starknet/11404/2?u=stephaniegb.dev for more context
  */

export async function getAccounts(provider: IProvider): Promise<any> {
  const validPrivateKey = await getPrivateKey({ provider });
  const starkKeyPub = getStarkKey({ privateKey: validPrivateKey });
  const OZaccountConstructorCallData = CallData.compile({
    publicKey: starkKeyPub,
  });

  const OZcontractAddress = hash.calculateContractAddressFromHash(
    starkKeyPub,
    OZ_ACCOUNT_CLASS_HASH,
    OZaccountConstructorCallData,
    0
  );

  return OZcontractAddress;
}

export async function getBalance({
  web3authProvider,
  starknetProvider,
}: {
  web3authProvider: IProvider;
  starknetProvider: RpcProvider;
}): Promise<any> {
  if (!web3authProvider || !starknetProvider) {
    return;
  }

  try {
    const contract = new Contract(
      CONTRACT_ABI,
      CONTRACT_ADDRESS,
      starknetProvider
    );
    const address = await getAccounts(web3authProvider);
    const balance = await contract.balance_of(address);

    // Convert from wei to STRK (18 decimals)
    const balanceValue = balance.balance || balance;
    const formattedBalance = (
      Number(balanceValue.toString()) / Math.pow(10, 18)
    ).toFixed(6);

    return formattedBalance;
  } catch (error) {
    console.log("Error fetching balance:", error);
  }
}

export function getStarkKey({ privateKey }: { privateKey: string }) {
  try {
    return ec.starkCurve.getStarkKey(privateKey);
  } catch (error) {
    console.error("Error generating StarkNet public key:", error);
    throw error;
  }
}

export async function getPrivateKey({ provider }: { provider: IProvider }) {
  try {
    const rawPrivKey = (await provider.request({
      method: "private_key",
    })) as string;

    if (!rawPrivKey) {
      throw new Error("Private key is undefined or null");
    }

    // Hash the private key
    const hashedPrivKey = keccak256(rawPrivKey);

    // Modulo with Stark curve order to ensure it's in range
    const starkCurveOrder =
      "3618502788666131213697322783095070105526743751716087489154079457884512865583";

    const validPrivKey = BigInt("0x" + hashedPrivKey) % BigInt(starkCurveOrder);

    return `0x${validPrivKey.toString(16)}`;
  } catch (error) {
    console.error("Error getting/grinding private key:", error);
    throw new Error("Failed to retrieve or grind private key");
  }
}

export async function deployAccount({
  web3authProvider,
  starknetProvider,
}: {
  web3authProvider: IProvider;
  starknetProvider: RpcProvider;
}) {
  if (!web3authProvider || !starknetProvider) {
    return;
  }
  try {
    // ✅ 1. Get valid Starknet-compatible private key
    const validPrivateKey = await getPrivateKey({
      provider: web3authProvider,
    });
    console.log("✅ Grinded private key:", validPrivateKey);

    // ✅ 2. Derive the matching public key
    const starkKeyPub = getStarkKey({ privateKey: validPrivateKey });
    console.log("✅ StarkNet public key:", starkKeyPub);

    // ✅ 3. Calculate the deterministic address
    const OZaccountConstructorCallData = CallData.compile({
      publicKey: starkKeyPub,
    });

    const OZcontractAddress = hash.calculateContractAddressFromHash(
      starkKeyPub,
      OZ_ACCOUNT_CLASS_HASH,
      OZaccountConstructorCallData,
      0
    );

    console.log("✅ Calculated address:", OZcontractAddress);

    // ✅ 4. Create account instance with correct key
    const OZaccount = new Account(
      starknetProvider,
      OZcontractAddress,
      validPrivateKey
    );

    console.log("✅ Account instance created");

    // ✅ 5. Deploy the account with correct calldata and salt
    const { transaction_hash, contract_address } =
      await OZaccount.deployAccount({
        classHash: OZ_ACCOUNT_CLASS_HASH,
        constructorCalldata: OZaccountConstructorCallData,
        contractAddress: OZcontractAddress,
        addressSalt: starkKeyPub,
      });

    await starknetProvider.waitForTransaction(transaction_hash);
    console.log("🎉 Final deployed address:", contract_address);

    return {
      transaction_hash,
      contract_address,
    };
  } catch (error) {
    console.error("❌ Account deployment failed:", error);
    throw error;
  }
}
