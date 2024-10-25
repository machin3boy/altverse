"use client";

import React, { createContext, useContext, useState, useEffect } from "react";
import Web3, { Contract, TransactionBlockTimeoutError } from "web3";
import coreContractABI from "../public/ABIs/Altverse.json";
import { AbiItem } from "web3-utils";
import ERC20ABI from "../public/ABIs/ERC20.json";
import FaucetERC20ABI from "../public/ABIs/FaucetERC20.json";
import { toast } from "sonner";

interface StorageContextProps {
  storage: { [key: string]: string };
  setStorage: (key: string, value: string) => void;
  getStorage: (key: string) => string | null | undefined;
  web3: Web3 | null;
  connectToWeb3: () => Promise<boolean>;
  initializeCoreContract: () => any | undefined | null;
//   fetchTokenBalances: (address: string) => Promise<any[] | undefined>;
  stringToBigInt: (str: string) => bigint;
  bigIntToString: (bigInt: bigint) => string;
  splitTo24: (str: string) => string[];
}

const StorageContext = createContext<StorageContextProps>({
  storage: {},
  setStorage: () => {},
  getStorage: () => undefined,
  web3: null,
  connectToWeb3: async () => true || false,
  initializeCoreContract: async () => {},
//   fetchTokenBalances: async () => [],
  stringToBigInt: () => BigInt(0),
  bigIntToString: () => "",
  splitTo24: () => ["", ""],
});

export const StorageProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [storage, setStorage] = useState<{ [key: string]: string }>({});
  const [web3, setWeb3] = useState<Web3 | null>(null);

  const setStorageValue = (key: string, value: string) => {
    setStorage((prevStorage) => ({ ...prevStorage, [key]: value }));
    localStorage.setItem(key, value);
  };

  const getStorageValue = (key: string) => {
    return storage[key] || localStorage.getItem(key);
  };

  const connectToWeb3 = async () => {
    if ((window as any).ethereum) {
      try {
        // Request account access
        await (window as any).ethereum.request({
          method: "eth_requestAccounts",
        });
        // Create Web3 instance
        const web3Instance = new Web3((window as any).ethereum);
        setWeb3(web3Instance);
        console.log("Connected to Web3");
        // Check if the desired network is already added
        const chainId = await (window as any).ethereum.request({
          method: "eth_chainId",
        });
        if (chainId !== "0xaef3" && chainId !== "0xa869") {
          try {
            // Attempt to switch to the desired network
            await (window as any).ethereum.request({
              method: "wallet_switchEthereumChain",
              params: [{ chainId: "0xaef3" }],
            });
          } catch (switchError) {
            // If the network doesn't exist, add it
            if ((switchError as any).code === 4902) {
              try {
                await (window as any).ethereum.request({
                  method: "wallet_addEthereumChain",
                  params: [
                    {
                      chainId: "0xaef3",
                      chainName: "Celo Alfajores Testnet",
                      rpcUrls: ["https://alfajores-forno.celo-testnet.org"],
                      nativeCurrency: {
                        name: "CELO",
                        symbol: "CELO",
                        decimals: 18,
                      },
                      blockExplorerUrls: ["https://alfajores.celoscan.io"],
                    },
                  ],
                });
              } catch (addError) {
                console.error("Failed to add network:", addError);
                return false;
              }
            } else {
              console.error("Failed to switch network:", switchError);
              return false;
            }
          }
        }
        return true;
      } catch (error) {
        console.error("Failed to connect to Web3:", error);
        return false;
      }
    } else {
      console.error("MetaMask not detected");
      return false;
    }
  };

  const initializeCoreContract = async () => {
    if (web3) {
      const coreContractAddress = "0xb6eA1AC42c3efff1b81b20EA797CA2a9148606fB";
      const contract = new web3.eth.Contract(
        coreContractABI as AbiItem[],
        coreContractAddress
      );
      return contract;
    }
  };

  const initializeERC20Contract = async (contractAddress: string) => {
    if (web3) {
      const contract = new web3.eth.Contract(
        ERC20ABI as AbiItem[],
        contractAddress
      );
      return contract;
    }
  };

//   const fetchTokenBalances = async (address: string) => {
//     if (!web3) {
//       return;
//     }

//     const API_KEY = "N8D9KVEZ9IE2GNURJ8ZGM9H6GWZ5SY8WX4";
//     const BASE_URL = "https://api-testnet.bttcscan.com/api";

//     try {
//       const accounts = await (web3 as any).eth.getAccounts();

//       const erc20Response = await fetch(
//         `${BASE_URL}?module=account&action=tokentx&address=${accounts[0]}&page=1&offset=100&sort=asc&apikey=${API_KEY}`
//       );
//       const erc20Data = await erc20Response.json();

//       const erc721Response = await fetch(
//         `${BASE_URL}?module=account&action=tokennfttx&address=${accounts[0]}&page=1&offset=100&sort=asc&apikey=${API_KEY}`
//       );
//       const erc721Data = await erc721Response.json();

//       console.log(erc20Data);
//       console.log(erc721Data);

//       const erc20Addresses: string[] = [];
//       for (const tx of erc20Data.result) {
//         if (!erc20Addresses.includes(tx.contractAddress)) {
//           erc20Addresses.push(tx.contractAddress);
//         }
//       }

//       const erc721Addresses: string[] = [];
//       const erc721TokenIds: string[] = [];
//       for (const tx of erc721Data.result) {
//         if (!erc721Addresses.includes(tx.contractAddress)) {
//           erc721Addresses.push(tx.contractAddress);
//           erc721TokenIds.push(tx.tokenID);
//         }
//       }

//       console.log(erc20Addresses);
//       console.log(erc721Addresses);
//       console.log(erc721TokenIds);

//       const tokenDataRetrieverContract = new web3.eth.Contract(
//         TokenDataRetrieverABI,
//         "0x4A8829650B47fA716fdd774956e1418c05284e27"
//       );

//       console.log("data retriever loaded");

//       const erc20TokenData = await tokenDataRetrieverContract.methods
//         .getERC20TokenData(erc20Addresses, accounts[0])
//         .call();

//       console.log("erc20 token data fetched");

//       const erc721TokenData = await tokenDataRetrieverContract.methods
//         .getERC721TokenData(erc721Addresses, erc721TokenIds, accounts[0])
//         .call();

//       console.log("erc721 token data fetched");

//       const updatedAssets: any[] = [];
//       const mirroredERC20Addresses: string[] = [];
//       const mirroredERC721Addresses: string[] = [];

//       console.log(updatedAssets);
//       console.log(mirroredERC20Addresses);
//       console.log(mirroredERC721Addresses);

//       for (const tokenData of erc20TokenData as any) {
//         if (tokenData.name.toLowerCase().startsWith("mirrored ")) {
//           mirroredERC20Addresses.push(tokenData.tokenAddress);
//         } else {
//           updatedAssets.push({
//             token: tokenData.name,
//             tokenAddress: tokenData.tokenAddress,
//             tokenId: "0",
//             ticker: tokenData.symbol,
//             bal: (
//               parseFloat(tokenData.balance.toString()) /
//               Math.pow(10, parseInt(tokenData.decimals.toString()))
//             ).toFixed(3),
//             vaulted: tokenData.vaulted,
//             locked: tokenData.locked,
//             authOptions: [],
//             vaultAuthOptions: tokenData.vaultAuthOptions,
//             lockAuthOptions: tokenData.lockAuthOptions,
//             isERC20: true,
//           });
//         }
//       }

//       for (const tokenData of erc721TokenData as any) {
//         if (tokenData.name.toLowerCase().startsWith("mirrored ")) {
//           mirroredERC721Addresses.push(tokenData.tokenAddress);
//         } else {
//           updatedAssets.push({
//             token: tokenData.name,
//             tokenAddress: tokenData.tokenAddress,
//             tokenId: tokenData.tokenId.toString(),
//             ticker: tokenData.symbol,
//             bal: tokenData.balance.toString(),
//             vaulted: tokenData.vaulted,
//             locked: tokenData.locked,
//             authOptions: [],
//             vaultAuthOptions: tokenData.vaultAuthOptions,
//             lockAuthOptions: tokenData.lockAuthOptions,
//             isERC20: false,
//           });
//         }
//       }

//       if (
//         mirroredERC20Addresses.length > 0 ||
//         mirroredERC721Addresses.length > 0
//       ) {
//         const mirroredERC20TokenData = await tokenDataRetrieverContract.methods
//           .getMirroredERC20TokenData(mirroredERC20Addresses, accounts[0])
//           .call();

//         const mirroredERC721TokenData = await tokenDataRetrieverContract.methods
//           .getMirroredERC721TokenData(mirroredERC721Addresses, accounts[0])
//           .call();

//         for (const tokenData of mirroredERC20TokenData as any) {
//           updatedAssets.push({
//             token: tokenData.name,
//             tokenAddress: tokenData.tokenAddress,
//             tokenId: "0",
//             ticker: tokenData.symbol,
//             bal: (
//               parseFloat(tokenData.balance.toString()) /
//               Math.pow(10, parseInt(tokenData.decimals.toString()))
//             ).toFixed(3),
//             vaulted: tokenData.vaulted,
//             locked: tokenData.locked,
//             authOptions: [],
//             vaultAuthOptions: tokenData.vaultAuthOptions,
//             lockAuthOptions: tokenData.lockAuthOptions,
//             isERC20: true,
//           });
//         }

//         for (const tokenData of mirroredERC721TokenData as any) {
//           updatedAssets.push({
//             token: tokenData.name,
//             tokenAddress: tokenData.tokenAddress,
//             tokenId: tokenData.tokenId.toString(),
//             ticker: tokenData.symbol,
//             bal: tokenData.balance.toString(),
//             vaulted: tokenData.vaulted,
//             locked: tokenData.locked,
//             authOptions: [],
//             vaultAuthOptions: tokenData.vaultAuthOptions,
//             lockAuthOptions: tokenData.lockAuthOptions,
//             isERC20: false,
//           });
//         }
//       }

//       updatedAssets.sort((a, b) => (a.token as any).localeCompare(b.token));
//       const filteredAssets = updatedAssets.filter(
//         (asset) => asset.bal !== "0.000" && asset.bal !== "0"
//       );

//       console.log(filteredAssets);
//       return filteredAssets;
//     } catch (error) {
//       console.error("Error fetching token balances:", error);
//       return [];
//     }
//   };

  const hashSHA256 = async (message: string) => {
    const encoder = new TextEncoder();
    const data = encoder.encode(message);
    const hash = await window.crypto.subtle.digest("SHA-256", data);
    return Array.from(new Uint8Array(hash))
      .map((b) => b.toString(16).padStart(2, "0"))
      .join("");
  };

  const stringToBigInt = (str = "") => {
    if (str.length > 25) {
      throw new Error("String length must be 25 characters or less.");
    }
    let numStr = "";
    for (let i = 0; i < str.length; i++) {
      let ascii = str.charCodeAt(i);
      numStr += ascii.toString().padStart(3, "0");
    }
    return BigInt(numStr);
  };

  const bigIntToString = (bigInt = BigInt(0)) => {
    let str = bigInt.toString();
    while (str.length % 3 !== 0) {
      str = "0" + str;
    }
    let result = "";
    for (let i = 0; i < str.length; i += 3) {
      let ascii = parseInt(str.substr(i, 3), 10);
      result += String.fromCharCode(ascii);
    }
    return result;
  };

  const splitTo24 = (str = "") => {
    const firstElement = str.substring(0, 24);
    const secondElement = str.length > 24 ? str.substring(24, 48) : "";
    return [firstElement, secondElement];
  };

  return (
    <StorageContext.Provider
      value={{
        storage,
        setStorage: setStorageValue,
        getStorage: getStorageValue,
        web3,
        connectToWeb3,
        initializeCoreContract,
        // fetchTokenBalances,
        stringToBigInt,
        bigIntToString,
        splitTo24,
      }}
    >
      {children}
    </StorageContext.Provider>
  );
};

export const useStorage = () => useContext(StorageContext);
