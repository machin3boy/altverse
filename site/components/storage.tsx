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
  switchChain: () => Promise<boolean>;
  initializeCoreContract: () => any | undefined | null;
  fetchTokenBalances: (address: string) => Promise<any[] | undefined>;
  requestTokenFromFaucet: (tokenSymbol: string) => Promise<boolean>;
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
  switchChain: async () => true || false,
  initializeCoreContract: async () => {},
  fetchTokenBalances: async () => [],
  requestTokenFromFaucet: async () => true || false,
  stringToBigInt: () => BigInt(0),
  bigIntToString: () => "",
  splitTo24: () => ["", ""],
});

interface TokenBalance {
  symbol: string;
  balance: string;
  rawBalance: bigint;
  address: string;
}

interface TokenConfig {
  address: string;
  symbol: string;
  abi: AbiItem[];
}

const tokens: TokenConfig[] = [
  {
    address: "0xA17Fe331Cb33CdB650dF2651A1b9603632120b7B",
    symbol: "ALT",
    abi: coreContractABI as AbiItem[]
  },
  {
    address: "0xd6833DAAA48C127b2d007AbEE8d6b7f2CC6DFA36",
    symbol: "wBTC",
    abi: FaucetERC20ABI as AbiItem[]
  },
  {
    address: "0x1A323bD7b3f917A6AfFE320A8b3F266130c785b9",
    symbol: "wETH",
    abi: FaucetERC20ABI as AbiItem[]
  },
  {
    address: "0x0adea7235B7693C40F546E39Df559D4e31b0Cbfb",
    symbol: "wLINK",
    abi: FaucetERC20ABI as AbiItem[]
  }
];

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

  const switchChain = async () => {
    if ((window as any).ethereum) {
      try {
        // Get the current chain ID
        const currentChainId = await (window as any).ethereum.request({
          method: "eth_chainId",
        });

        let targetChainId;
        if (currentChainId === "0xaef3") {
          targetChainId = "0xa869"; // Swap to Avalanche Fuji
        } else if (currentChainId === "0xa869") {
          targetChainId = "0xaef3"; // Swap to Arbitrum Sepolia
        } else {
          console.error("Current chain is not supported for swapping");
          return false;
        }

        try {
          // Attempt to switch to the target network
          await (window as any).ethereum.request({
            method: "wallet_switchEthereumChain",
            params: [{ chainId: targetChainId }],
          });
        } catch (switchError) {
          // If the target network doesn't exist, add it
          if ((switchError as any).code === 4902) {
            try {
              let chainParams;
              if (targetChainId === "0xaef3") {
                chainParams = {
                  chainId: "0xaef3",
                  chainName: "Celo Alfajores Testnet",
                  rpcUrls: ["https://alfajores-forno.celo-testnet.org"],
                  nativeCurrency: {
                    name: "CELO",
                    symbol: "CELO",
                    decimals: 18,
                  },
                  blockExplorerUrls: ["https://alfajores.celoscan.io"],
                };
              } else if (targetChainId === "0xa869") {
                chainParams = {
                  chainId: "0xa869",
                  chainName: "Avalanche Fuji",
                  rpcUrls: ["https://api.avax-test.network/ext/bc/C/rpc"],
                  nativeCurrency: {
                    name: "AVAX",
                    symbol: "AVAX",
                    decimals: 18,
                  },
                  blockExplorerUrls: ["https://testnet.snowtrace.io/"],
                };
              }
              await (window as any).ethereum.request({
                method: "wallet_addEthereumChain",
                params: [chainParams],
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
        let newChain =
          targetChainId === "0xa869" ? "Avalanche Fuji" : "Celo Alfajores";
        toast.info("Swapped chain successfully to " + newChain);
        return true;
      } catch (error) {
        console.error("Failed to swap chain:", error);
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

  const fetchTokenBalances = async (address: string): Promise<TokenBalance[] | undefined> => {
    debugger;
    if (!web3) {
      toast.error("Web3 not initialized");
      return;
    }
  
    try {
      const tokens = [
        { 
          address: "0xA17Fe331Cb33CdB650dF2651A1b9603632120b7B",
          symbol: "ALT"
        },
        { 
          address: "0xd6833DAAA48C127b2d007AbEE8d6b7f2CC6DFA36",
          symbol: "wBTC"
        },
        { 
          address: "0x1A323bD7b3f917A6AfFE320A8b3F266130c785b9",
          symbol: "wETH"
        },
        { 
          address: "0x0adea7235B7693C40F546E39Df559D4e31b0Cbfb",
          symbol: "wLINK"
        }
      ];
  
      // Get native token balance with BigInt conversion
      const nativeBalance = await web3.eth.getBalance(address);
      const chainId = await web3.eth.getChainId();
      
      // Convert native balance to BigInt for consistent handling
      const nativeBigInt = BigInt(nativeBalance);
      
      // Format native balance with proper decimal handling
      const formattedNativeBalance = parseFloat(web3.utils.fromWei(nativeBalance, 'ether'))
        .toFixed(18)  // Use 18 decimals for consistency
        .replace(/\.?0+$/, ''); // Remove trailing zeros
  
      // Initialize balances array with native token
      const balances: TokenBalance[] = [{
        symbol: Number(chainId) === 43113 ? "AVAX" : "CELO",
        balance: formattedNativeBalance,
        rawBalance: nativeBigInt,
        address: "0x0000000000000000000000000000000000000000"
      }];
  
      // Fetch ERC20 token balances in parallel
      const tokenPromises = tokens.map(async (token) => {
        try {
          const contract = new web3.eth.Contract(
            ERC20ABI as AbiItem[],
            token.address
          );
          
          // Get balance and decimals with proper typing
          const balance = await contract.methods.balanceOf(address).call() as string;
          const decimals = await contract.methods.decimals().call() as string;
  
          // Convert balance to BigInt
          const balanceBigInt = BigInt(balance);
  
          // Determine the correct unit based on decimals
          let unit: 'ether' | 'mwei' | 'gwei';
          switch(decimals) {
            case '6':
              unit = 'mwei';
              break;
            case '8':
              unit = 'gwei';
              break;
            default:
              unit = 'ether';
          }
  
          // Format the balance with proper decimal handling
          const formattedBalance = parseFloat(web3.utils.fromWei(balance, unit))
            .toFixed(Number(decimals))  // Use token's decimals
            .replace(/\.?0+$/, ''); // Remove trailing zeros
  
          return {
            symbol: token.symbol,
            balance: formattedBalance,
            rawBalance: balanceBigInt,
            address: token.address
          };
        } catch (error) {
          console.error(`Error fetching balance for token ${token.symbol}:`, error);
          toast.error(`Failed to fetch ${token.symbol} balance`);
          return null;
        }
      });
  
      const tokenBalances = await Promise.all(tokenPromises);
      
      const validBalances = balances.concat(
        tokenBalances.filter((balance): balance is TokenBalance => balance !== null)
      );
  
      return validBalances;
  
    } catch (error) {
      console.error("Error fetching token balances:", error);
      toast.error("Failed to fetch token balances");
      return undefined;
    }
  };

  const requestTokenFromFaucet = async (tokenSymbol: string): Promise<boolean> => {
    debugger;
    if (!web3) {
      toast.error("Web3 not initialized");
      return false;
    }

    const loadingToastId = `faucet-${tokenSymbol}-${Date.now()}`;
  
    try {
      // Get user's address
      const accounts = await web3.eth.getAccounts();
      if (!accounts[0]) {
        toast.error("No account connected");
        return false;
      }
  
      // Find the token configuration
      const token = tokens.find(t => t.symbol === tokenSymbol);
      if (!token) {
        toast.error("Invalid token symbol");
        return false;
      }
  
      // Create contract instance
      const contract = new web3.eth.Contract(token.abi, token.address);
  
      // Call faucet function
      toast.loading(`Requesting ${tokenSymbol} from faucet...`, {
        id: loadingToastId,
        duration: 20000 // Max duration of 20 seconds
      });
      
      const tx = await contract.methods.faucet().send({
        from: accounts[0],
      });

      toast.dismiss(loadingToastId);
  
      if (tx.status) {
        toast.success(`Successfully received ${tokenSymbol} from faucet!`);
        return true;
      } else {
        toast.error(`Failed to receive ${tokenSymbol} from faucet`);
        return false;
      }
  
    } catch (error) {
      console.error(`Error requesting ${tokenSymbol} from faucet:`, error);
      toast.error(`Failed to request ${tokenSymbol}: ${(error as Error).message}`);
      return false;
    }
  };

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
        switchChain,
        initializeCoreContract,
        fetchTokenBalances,
        requestTokenFromFaucet,
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
