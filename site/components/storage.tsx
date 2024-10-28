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
  initiateCrossChainSwap: (params: CrossChainSwapParams) => Promise<boolean>;
  calculateCrossChainAmount: (params: CrossChainAmountParams) => Promise<CrossChainAmountResult | undefined>;
  stringToBigInt: (str: string) => bigint;
  bigIntToString: (bigInt: bigint) => string;
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
  initiateCrossChainSwap: async () => true || false,
  calculateCrossChainAmount: async () => undefined,
  stringToBigInt: () => BigInt(0),
  bigIntToString: () => "",
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

interface CrossChainSwapParams {
  fromToken: string;  // Token address
  toToken: string;    // Token address
  amountIn: string;   // Amount in smallest unit (wei)
  targetChain: number; // Chain ID (16 bit)
  targetAddress: string; // Target wallet address
}

interface CrossChainAmountParams {
  fromToken: string;
  toToken: string;
  amountIn: string;
  targetChain: number;
}

interface CrossChainAmountResult {
  estimatedOutput: string;
  priceImpact: string;
  fees: string;
}
interface Pool {
  token: string;
  tokenReserve: bigint;
  altReserve: bigint;
  totalShares: bigint;
}

const CHAIN_ID_TO_WORMHOLE_CHAIN_ID: Record<number, number> = {
  44787: 14,  // Celo Alfajores
  43113: 6    // Avalanche Fuji
};

const FALLBACK_FEES: Record<number, string> = {
  43113: "100000000000000000",    // 0.1 AVAX
  44787: "500000000000000000"     // 0.5 CELO
};

const ALT_ADDRESS = "0xA17Fe331Cb33CdB650dF2651A1b9603632120b7B";

interface AddLiquidityParams {
  tokenAddress: string;
  tokenAmount: string;
  altAmount: string;
}


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
      toast.dismiss(loadingToastId);
      console.error(`Error requesting ${tokenSymbol} from faucet:`, error);
      toast.error(`Failed to request ${tokenSymbol}: ${(error as Error).message}`);
      return false;
    }
  };

  const initiateCrossChainSwap = async (params: CrossChainSwapParams): Promise<boolean> => {
    if (!web3) {
      toast.error("Web3 not initialized");
      return false;
    }
  
    const loadingToastId = `swap-${Date.now()}`;
  
    try {
      const accounts = await web3.eth.getAccounts();
      if (!accounts[0]) {
        toast.error("No account connected");
        return false;
      }
  
      const ALTVERSE_ADDRESS = "0xA17Fe331Cb33CdB650dF2651A1b9603632120b7B";
      const MAX_UINT256 = "115792089237316195423570985008687907853269984665640564039457584007913129639935"; // uint256.max
  
      // Create contract instances
      const sourceTokenContract = new web3.eth.Contract(
        ERC20ABI as AbiItem[],
        params.fromToken
      );
  
      // Check existing allowance
      const currentAllowance = await sourceTokenContract.methods
        .allowance(accounts[0], ALTVERSE_ADDRESS)
        .call() as string;
  
      console.log("Current allowance:", currentAllowance);
  
      // If allowance is insufficient, request approval
      if (BigInt(currentAllowance) < BigInt(params.amountIn)) {
        console.log("Requesting approval for token spend...");
        try {
          const approveTx = await sourceTokenContract.methods
            .approve(ALTVERSE_ADDRESS, MAX_UINT256)
            .send({ from: accounts[0] });
  
          if (!approveTx.status) {
            toast.error("Approval failed");
            return false;
          }
          console.log("Approval successful");
        } catch (error: any) {
          console.error("Approval error:", error);
          toast.error(`Approval failed: ${error.message}`);
          return false;
        }
      } else {
        console.log("Sufficient allowance exists");
      }
  
      // Now proceed with the swap
      const contract = new web3.eth.Contract(
        coreContractABI as AbiItem[],
        ALTVERSE_ADDRESS
      );
  
      const wormholeChainId = CHAIN_ID_TO_WORMHOLE_CHAIN_ID[params.targetChain];
      const crossChainFee = await contract.methods
        .quoteCrossChainCost(wormholeChainId)
        .call() as string;
  
      console.log("Cross-chain fee:", web3.utils.fromWei(crossChainFee, 'ether'));
  
      toast.loading(`Initiating cross-chain swap...`, {
        id: loadingToastId,
        duration: 20000
      });
      console.warn("Cross-chain swap initiated with params:");
      console.warn({
        fromToken: params.fromToken,
        toToken: params.toToken,
        amountIn: params.amountIn,
        wormholeChainId,
        targetAddress: params.targetAddress
      })
      const tx = await contract.methods.initiateCrossChainSwap(
        params.fromToken,
        params.toToken,
        params.amountIn,
        wormholeChainId.toString,
        params.targetAddress
      ).send({
        from: accounts[0],
        value: crossChainFee,
        gas: '500000',
      });
  
      toast.dismiss(loadingToastId);
  
      if (tx.status) {
        toast.success("Cross-chain swap initiated successfully!");
        return true;
      }
      
      toast.error("Cross-chain swap failed");
      return false;
  
    } catch (error: any) {
      toast.dismiss(loadingToastId);
      console.error("Detailed error:", error);
      toast.error(`Cross-chain swap failed: ${error.message}`);
      return false;
    }
    
    return false;
  };

  const calculateCrossChainAmount = async (
    params: CrossChainAmountParams
  ): Promise<CrossChainAmountResult | undefined> => {
    if (!web3) {
      toast.error("Web3 not initialized");
      return undefined;
    }

    try {
      const sourceContract = new web3.eth.Contract(
        coreContractABI as AbiItem[],
        "0xA17Fe331Cb33CdB650dF2651A1b9603632120b7B"
      );

      const targetRPC = params.targetChain === 43113 
        ? "https://api.avax-test.network/ext/bc/C/rpc"
        : "https://alfajores-forno.celo-testnet.org";
      const targetWeb3 = new Web3(new Web3.providers.HttpProvider(targetRPC));
      
      const targetContract = new targetWeb3.eth.Contract(
        coreContractABI as AbiItem[],
        "0xA17Fe331Cb33CdB650dF2651A1b9603632120b7B"
      );

      let sourceAltAmount: string;
      let finalAmount: string;
      let priceImpact = "0.00";

      // Handle ALT as source token
      if (params.fromToken === "0xA17Fe331Cb33CdB650dF2651A1b9603632120b7B") {
        sourceAltAmount = params.amountIn;
        
        // If destination is also ALT, no swap needed
        if (params.toToken === "0xA17Fe331Cb33CdB650dF2651A1b9603632120b7B") {
          finalAmount = params.amountIn;
        } else {
          const targetPool: Pool = await targetContract.methods.pools(params.toToken).call();
          
          if (targetPool.token === "0x0000000000000000000000000000000000000000" ||
              BigInt(targetPool.tokenReserve) === BigInt(0) ||
              BigInt(targetPool.altReserve) === BigInt(0)) {
            toast.error("Target pool not initialized or has no liquidity");
            return undefined;
          }

          finalAmount = await targetContract.methods.getAmountOut(
            sourceAltAmount,
            targetPool.altReserve.toString(),
            targetPool.tokenReserve.toString()
          ).call() as string;

          const targetPrice = (BigInt(targetPool.tokenReserve) * BigInt(1e18)) / 
            BigInt(targetPool.altReserve);
          priceImpact = targetPrice.toString();
        }
      }
      // Handle ALT as destination token
      else if (params.toToken === "0xA17Fe331Cb33CdB650dF2651A1b9603632120b7B") {
        const sourcePool: Pool = await sourceContract.methods.pools(params.fromToken).call();
        
        if (sourcePool.token === "0x0000000000000000000000000000000000000000" ||
            BigInt(sourcePool.tokenReserve) === BigInt(0) ||
            BigInt(sourcePool.altReserve) === BigInt(0)) {
          toast.error("Source pool not initialized or has no liquidity");
          return undefined;
        }

        sourceAltAmount = await sourceContract.methods.getAmountOut(
          params.amountIn,
          sourcePool.tokenReserve.toString(),
          sourcePool.altReserve.toString()
        ).call() as string;

        finalAmount = sourceAltAmount;

        const sourcePrice = (BigInt(sourcePool.altReserve) * BigInt(1e18)) / 
          BigInt(sourcePool.tokenReserve);
        priceImpact = sourcePrice.toString();
      }
      // Handle token -> token swap
      else {
        const sourcePool: Pool = await sourceContract.methods.pools(params.fromToken).call();
        
        if (sourcePool.token === "0x0000000000000000000000000000000000000000" ||
            BigInt(sourcePool.tokenReserve) === BigInt(0) ||
            BigInt(sourcePool.altReserve) === BigInt(0)) {
          toast.error("Source pool not initialized or has no liquidity");
          return undefined;
        }

        sourceAltAmount = await sourceContract.methods.getAmountOut(
          params.amountIn,
          sourcePool.tokenReserve.toString(),
          sourcePool.altReserve.toString()
        ).call() as string;

        const targetPool: Pool = await targetContract.methods.pools(params.toToken).call();
        
        if (targetPool.token === "0x0000000000000000000000000000000000000000" ||
            BigInt(targetPool.tokenReserve) === BigInt(0) ||
            BigInt(targetPool.altReserve) === BigInt(0)) {
          toast.error("Target pool not initialized or has no liquidity");
          return undefined;
        }

        finalAmount = await targetContract.methods.getAmountOut(
          sourceAltAmount,
          targetPool.altReserve.toString(),
          targetPool.tokenReserve.toString()
        ).call() as string;

        const sourcePrice = (BigInt(sourcePool.altReserve) * BigInt(1e18)) / 
          BigInt(sourcePool.tokenReserve);
        const targetPrice = (BigInt(targetPool.tokenReserve) * BigInt(1e18)) / 
          BigInt(targetPool.altReserve);
        priceImpact = Math.abs(
          (Number(targetPrice - sourcePrice) / Number(sourcePrice)) * 100
        ).toFixed(2);
      }

      // Get cross-chain fee with Wormhole chain ID conversion
      let crossChainFee: string;
      try {
        const wormholeChainId = CHAIN_ID_TO_WORMHOLE_CHAIN_ID[params.targetChain];
        if (!wormholeChainId) {
          throw new Error(`Unsupported chain ID: ${params.targetChain}`);
        }

        crossChainFee = await sourceContract.methods
          .quoteCrossChainCost(wormholeChainId)
          .call() as string;

      } catch (error) {
        console.warn("Error getting cross-chain fee, using fallback:", error);
        crossChainFee = FALLBACK_FEES[params.targetChain] || web3.utils.toWei("0.2", "ether");
      }

      return {
        estimatedOutput: finalAmount,
        priceImpact,
        fees: crossChainFee
      };

    } catch (error) {
      console.error("Error calculating cross-chain amount:", error);
      toast.error(`Failed to calculate cross-chain amount: ${(error as Error).message}`);
      return undefined;
    }
  };
  
  // Helper function to add liquidity to a pool (you'll need this first)
  const addInitialLiquidity = async (
    tokenAddress: string, 
    tokenAmount: string, 
    altAmount: string
  ): Promise<boolean> => {
    if (!web3) {
      toast.error("Web3 not initialized");
      return false;
    }
  
    try {
      const accounts = await web3.eth.getAccounts();
      if (!accounts[0]) {
        toast.error("No account connected");
        return false;
      }
  
      const contract = new web3.eth.Contract(
        coreContractABI as AbiItem[],
        "0xA17Fe331Cb33CdB650dF2651A1b9603632120b7B"
      );
  
      // First approve ALT token spending
      const tokenContract = new web3.eth.Contract(
        ERC20ABI as AbiItem[],
        tokenAddress
      );
  
      await tokenContract.methods
        .approve("0xA17Fe331Cb33CdB650dF2651A1b9603632120b7B", tokenAmount)
        .send({ from: accounts[0] });
  
      // Add liquidity
      const tx = await contract.methods
        .addLiquidity(tokenAddress, tokenAmount, altAmount)
        .send({ from: accounts[0] });
  
      if (tx.status) {
        toast.success("Liquidity added successfully!");
        return true;
      } else {
        toast.error("Failed to add liquidity");
        return false;
      }
  
    } catch (error) {
      console.error("Error adding liquidity:", error);
      toast.error(`Failed to add liquidity: ${(error as Error).message}`);
      return false;
    }
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
        initiateCrossChainSwap,
        calculateCrossChainAmount,
        stringToBigInt,
        bigIntToString,
      }}
    >
      {children}
    </StorageContext.Provider>
  );
};

export const useStorage = () => useContext(StorageContext);
