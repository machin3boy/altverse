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
  currentChain: number;
  setCurrentChain: (chainId: number) => void;
  initializeCoreContract: () => any | undefined | null;
  fetchTokenBalances: (address: string) => Promise<any[] | undefined>;
  requestTokenFromFaucet: (tokenSymbol: string) => Promise<boolean>;
  initiateCrossChainSwap: (params: CrossChainSwapParams) => Promise<boolean>;
  calculateCrossChainAmount: (params: CrossChainAmountParams) => Promise<CrossChainAmountResult | undefined>;
  swapALTForUSDC: (altAmount: string) => Promise<boolean>;
  swapUSDCForALT: (usdcAmount: string) => Promise<boolean>;
  getPoolBalances: () => Promise<{
    usdcBalance: string;
    altBalance: string;
    rawUsdcBalance: string;
    rawAltBalance: string;
  } | null>;
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
  currentChain: 44787,
  setCurrentChain: () => {},
  initializeCoreContract: async () => {},
  fetchTokenBalances: async () => [],
  requestTokenFromFaucet: async () => true || false,
  initiateCrossChainSwap: async () => true || false,
  calculateCrossChainAmount: async () => undefined,
  swapALTForUSDC: async () => true || false,
  swapUSDCForALT: async () => true || false,
  getPoolBalances: async () => null,
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


export const StorageProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [storage, setStorage] = useState<{ [key: string]: string }>({});
  const [web3, setWeb3] = useState<Web3 | null>(null);
  const [currentChain, setCurrentChain] = useState<number>(44787); 

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
        console.log("Setting current chain to " + parseInt(targetChainId, 16));
        console.log("Storing current chain as " + targetChainId);
        setCurrentChain(parseInt(targetChainId, 16));
        setStorage({"currentChain": targetChainId});
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

  useEffect(() => {
    const updateChain = async () => {
      if (web3) {
        try {
          const chainId = await web3.eth.getChainId();
          console.log("Setting current chain to " + Number(chainId));
          console.log("Storing current chain as " + chainId.toString());
          setCurrentChain(Number(chainId));
          setStorage({"currentChain": chainId.toString()});
        } catch (error) {
          console.error("Error getting chain ID:", error);
        }
      }
    };

    updateChain();

    // Listen for chain changes
    if ((window as any).ethereum) {
      (window as any).ethereum.on('chainChanged', (chainId: string) => {
        const numericChainId = parseInt(chainId, 16);
        console.log("Setting current chain to " + numericChainId);
        console.log("Storing current chain as " + numericChainId.toString());
        setCurrentChain(numericChainId);
        setStorage({"currentChain": numericChainId.toString()});
      });
    }

    return () => {
      if ((window as any).ethereum) {
        (window as any).ethereum.removeListener('chainChanged', () => {});
      }
    };
  }, [web3]);

  const initializeCoreContract = async () => {
    if (web3) {
      const coreContractAddress = "0xA17Fe331Cb33CdB650dF2651A1b9603632120b7B";
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
      const MAX_UINT256 = "115792089237316195423570985008687907853269984665640564039457584007913129639935";
  
      // Check if current chain matches target chain
      const currentChainId = await web3.eth.getChainId();
      const isSameChain = Number(currentChainId) === params.targetChain;
  
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
  
      toast.loading(`Initiating ${isSameChain ? "swap" : "cross-chain swap"}...`, {
        id: loadingToastId,
        duration: 20000
      });
  
      let tx;
      if (isSameChain) {
        // For same-chain swaps, use regular swap function
        console.warn("Same-chain swap initiated with params:", {
          fromToken: params.fromToken,
          toToken: params.toToken,
          amountIn: params.amountIn,
        });
        
        // Call your regular swap function here
        tx = await contract.methods.swap(
          params.fromToken,
          params.toToken,
          params.amountIn
        ).send({
          from: accounts[0],
          gas: '500000',
        });
      } else {
        // For cross-chain swaps, use wormhole
        const wormholeChainId = CHAIN_ID_TO_WORMHOLE_CHAIN_ID[params.targetChain];
        
        console.warn("Cross-chain swap initiated with params:", {
          fromToken: params.fromToken,
          toToken: params.toToken,
          amountIn: params.amountIn,
          wormholeChainId,
          targetAddress: params.targetAddress
        });
  
        tx = await contract.methods.initiateCrossChainSwap(
          params.fromToken,
          params.toToken,
          params.amountIn,
          wormholeChainId,
          params.targetAddress
        ).send({
          from: accounts[0],
          gas: '500000',
        });
      }
  
      toast.dismiss(loadingToastId);
  
      if (tx.status) {
        toast.success(`${isSameChain ? "Swap" : "Cross-chain swap"} initiated successfully!`);
        return true;
      }
      
      toast.error(`${isSameChain ? "Swap" : "Cross-chain swap"} failed`);
      return false;
  
    } catch (error: any) {
      toast.dismiss(loadingToastId);
      console.error("Detailed error:", error);
      toast.error(`Swap failed: ${error.message}`);
      return false;
    }
  };

  const getPoolBalances = async () => {
    if (!web3) {
      toast.error("Web3 not initialized");
      return null;
    }

    try {
      const ALTVERSE_ADDRESS = "0xA17Fe331Cb33CdB650dF2651A1b9603632120b7B";
      const contract = new web3.eth.Contract(
        coreContractABI as AbiItem[],
        ALTVERSE_ADDRESS
      );

      // Get USDC balance from contract
      const rawUsdcBalance = await contract.methods.getUSDCBalance().call() as string;
      
      // Get ALT balance from contract
      const rawAltBalance = await contract.methods.balanceOf(ALTVERSE_ADDRESS).call() as string;

      // Format USDC balance (6 decimals)
      const usdcBalance = web3.utils.fromWei(rawUsdcBalance, 'mwei');
      
      // Format ALT balance (18 decimals)
      const altBalance = web3.utils.fromWei(rawAltBalance, 'ether');

      return {
        usdcBalance,        // Formatted with decimals
        altBalance,         // Formatted with decimals
        rawUsdcBalance,     // Raw value for calculations
        rawAltBalance,      // Raw value for calculations
      };

    } catch (error: any) {
      console.error("Error fetching pool balances:", error);
      toast.error(`Failed to fetch pool balances: ${error.message}`);
      return null;
    }
  };

// Helper function for price impact calculation
const calculatePriceImpact = (
  amountIn: string,
  reserveIn: string,
  reserveOut: string,
  amountOut: string
): string => {
  try {
    // Get spot price before trade (reserveOut/reserveIn)
    const spotPrice = (BigInt(reserveOut) * BigInt(1e18)) / BigInt(reserveIn);
    
    // Get execution price (amountOut/amountIn)
    const executionPrice = (BigInt(amountOut) * BigInt(1e18)) / BigInt(amountIn);
    
    // Calculate price impact percentage: ((spotPrice - executionPrice) / spotPrice) * 100
    const impact = ((spotPrice - executionPrice) * BigInt(10000)) / spotPrice;
    
    // Convert to percentage with 2 decimal places
    return (Number(impact) / 100).toFixed(2);
  } catch (error) {
    console.error("Error calculating price impact:", error);
    return "0.00";
  }
};

const calculateCrossChainAmount = async (
  params: CrossChainAmountParams
): Promise<CrossChainAmountResult | undefined> => {
  if (!web3) {
    toast.error("Web3 not initialized");
    return undefined;
  }

  try {
    const ALT_ADDRESS = "0xA17Fe331Cb33CdB650dF2651A1b9603632120b7B";
    
    const sourceContract = new web3.eth.Contract(
      coreContractABI as AbiItem[],
      ALT_ADDRESS
    );

    const targetRPC = params.targetChain === 43113 
      ? "https://api.avax-test.network/ext/bc/C/rpc"
      : "https://alfajores-forno.celo-testnet.org";
    const targetWeb3 = new Web3(new Web3.providers.HttpProvider(targetRPC));
    
    const targetContract = new targetWeb3.eth.Contract(
      coreContractABI as AbiItem[],
      ALT_ADDRESS
    );

    let finalAmount: string;
    let priceImpact = "0.00";

    // Case 1: ALT to ALT
    if (params.fromToken === ALT_ADDRESS && params.toToken === ALT_ADDRESS) {
      finalAmount = params.amountIn;
      // No price impact for ALT to ALT as it's a 1:1 transfer
      priceImpact = "0.00";
    }
    // Case 2: ALT to Token
    else if (params.fromToken === ALT_ADDRESS && params.toToken !== ALT_ADDRESS) {
      const targetPool: Pool = await targetContract.methods.pools(params.toToken).call();
      
      if (targetPool.token === "0x0000000000000000000000000000000000000000" ||
          BigInt(targetPool.tokenReserve) === BigInt(0) ||
          BigInt(targetPool.altReserve) === BigInt(0)) {
        toast.error("Target pool not initialized or has no liquidity");
        return undefined;
      }

      // Calculate output amount
      finalAmount = await targetContract.methods.getAmountOut(
        params.amountIn,
        targetPool.altReserve.toString(),
        targetPool.tokenReserve.toString()
      ).call() as string;

      // Calculate price impact for ALT → Token swap
      priceImpact = calculatePriceImpact(
        params.amountIn,
        targetPool.altReserve.toString(),
        targetPool.tokenReserve.toString(),
        finalAmount
      );
    }
    // Case 3: Token to ALT
    else if (params.fromToken !== ALT_ADDRESS && params.toToken === ALT_ADDRESS) {
      const sourcePool: Pool = await sourceContract.methods.pools(params.fromToken).call();
      
      if (sourcePool.token === "0x0000000000000000000000000000000000000000" ||
          BigInt(sourcePool.tokenReserve) === BigInt(0) ||
          BigInt(sourcePool.altReserve) === BigInt(0)) {
        toast.error("Source pool not initialized or has no liquidity");
        return undefined;
      }

      // Calculate output amount
      finalAmount = await sourceContract.methods.getAmountOut(
        params.amountIn,
        sourcePool.tokenReserve.toString(),
        sourcePool.altReserve.toString()
      ).call() as string;

      // Calculate price impact for Token → ALT swap
      priceImpact = calculatePriceImpact(
        params.amountIn,
        sourcePool.tokenReserve.toString(),
        sourcePool.altReserve.toString(),
        finalAmount
      );
    }
    // Case 4: Token to Token
    else {
      const sourcePool: Pool = await sourceContract.methods.pools(params.fromToken).call();
      
      if (sourcePool.token === "0x0000000000000000000000000000000000000000" ||
          BigInt(sourcePool.tokenReserve) === BigInt(0) ||
          BigInt(sourcePool.altReserve) === BigInt(0)) {
        toast.error("Source pool not initialized or has no liquidity");
        return undefined;
      }

      // First swap: Token → ALT
      const altAmount = await sourceContract.methods.getAmountOut(
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

      // Second swap: ALT → Token
      finalAmount = await targetContract.methods.getAmountOut(
        altAmount,
        targetPool.altReserve.toString(),
        targetPool.tokenReserve.toString()
      ).call() as string;

      // Calculate combined price impact from both swaps
      const sourceImpact = calculatePriceImpact(
        params.amountIn,
        sourcePool.tokenReserve.toString(),
        sourcePool.altReserve.toString(),
        altAmount
      );

      const targetImpact = calculatePriceImpact(
        altAmount,
        targetPool.altReserve.toString(),
        targetPool.tokenReserve.toString(),
        finalAmount
      );

      // Combine price impacts
      priceImpact = (
        Number(sourceImpact) + Number(targetImpact)
      ).toFixed(2);
    }

    return {
      estimatedOutput: finalAmount,
      priceImpact,
    };

  } catch (error) {
    console.error("Error calculating cross-chain amount:", error);
    toast.error(`Failed to calculate cross-chain amount: ${(error as Error).message}`);
    return undefined;
  }
};

const swapUSDCForALT = async (usdcAmount: string): Promise<boolean> => {
  if (!web3) {
    toast.error("Web3 not initialized");
    return false;
  }

  const loadingToastId = `swap-usdc-${Date.now()}`;

  try {
    const accounts = await web3.eth.getAccounts();
    if (!accounts[0]) {
      toast.error("No account connected");
      return false;
    }

    const ALTVERSE_ADDRESS = "0xA17Fe331Cb33CdB650dF2651A1b9603632120b7B";
    const contract = new web3.eth.Contract(
      coreContractABI as AbiItem[],
      ALTVERSE_ADDRESS
    );

    const designatedUSDC = await contract.methods.designatedUSDC().call() as string;
    if (!designatedUSDC || designatedUSDC === "0x0000000000000000000000000000000000000000") {
      toast.error("USDC address not set in contract");
      return false;
    }

    // Create USDC contract instance
    const usdcContract = new web3.eth.Contract(
      ERC20ABI as AbiItem[],
      designatedUSDC
    );

    // Check USDC allowance with proper typing
    const currentAllowance = await usdcContract.methods
      .allowance(accounts[0], ALTVERSE_ADDRESS)
      .call() as string;

    // Convert usdcAmount to smallest unit (6 decimals for USDC)
    const usdcAmountWei = web3.utils.toWei(usdcAmount, 'mwei');

    // If allowance is insufficient, request approval
    if (BigInt(currentAllowance) < BigInt(usdcAmountWei)) {
      const approveToastId = `approve-${Date.now()}`;
      toast.loading("Approving USDC spend...", {
        id: approveToastId
      });
      
      try {
        await usdcContract.methods
          .approve(ALTVERSE_ADDRESS, usdcAmountWei)
          .send({ from: accounts[0] });
        toast.dismiss(approveToastId);
        toast.success("USDC approved successfully");
      } catch (error: any) {
        toast.dismiss(approveToastId);
        toast.error(`USDC approval failed: ${error.message}`);
        return false;
      }
    }

    // Perform the swap
    toast.loading("Swapping USDC for ALT...", {
      id: loadingToastId,
    });

    const tx = await contract.methods
      .swapUSDCForALT(usdcAmountWei)
      .send({ from: accounts[0] });

    toast.dismiss(loadingToastId);

    if (tx.status) {
      toast.success("Successfully swapped USDC for ALT!");
      return true;
    } else {
      toast.error("Swap failed");
      return false;
    }

  } catch (error: any) {
    toast.dismiss(loadingToastId);
    console.error("Error in USDC to ALT swap:", error);
    toast.error(`Swap failed: ${error.message}`);
    return false;
  }
};

const swapALTForUSDC = async (altAmount: string): Promise<boolean> => {
  if (!web3) {
    toast.error("Web3 not initialized");
    return false;
  }

  const loadingToastId = `swap-alt-${Date.now()}`;

  try {
    const accounts = await web3.eth.getAccounts();
    if (!accounts[0]) {
      toast.error("No account connected");
      return false;
    }

    const ALTVERSE_ADDRESS = "0xA17Fe331Cb33CdB650dF2651A1b9603632120b7B";
    const contract = new web3.eth.Contract(
      coreContractABI as AbiItem[],
      ALTVERSE_ADDRESS
    );

    // Check if USDC is set in contract
    const designatedUSDC = await contract.methods.designatedUSDC().call() as string;
    if (!designatedUSDC || designatedUSDC === "0x0000000000000000000000000000000000000000") {
      toast.error("USDC address not set in contract");
      return false;
    }

    // Convert altAmount to smallest unit (18 decimals for ALT)
    const altAmountWei = web3.utils.toWei(altAmount, 'ether');

    // Check ALT balance with proper typing
    const altBalance = await contract.methods.balanceOf(accounts[0]).call() as string;
    if (BigInt(altBalance) < BigInt(altAmountWei)) {
      toast.error("Insufficient ALT balance");
      return false;
    }

    // Check if contract has enough USDC
    const contractUsdcBalance = await contract.methods.getUSDCBalance().call() as string;
    const expectedUsdcAmount = BigInt(altAmountWei) / BigInt(1000000000000); // 10^12
    
    if (BigInt(contractUsdcBalance) < expectedUsdcAmount) {
      toast.error("Insufficient USDC liquidity in contract");
      return false;
    }

    // Perform the swap
    toast.loading("Swapping ALT for USDC...", {
      id: loadingToastId,
    });

    const tx = await contract.methods
      .swapALTForUSDC(altAmountWei)
      .send({ from: accounts[0] });

    toast.dismiss(loadingToastId);

    if (tx.status) {
      toast.success("Successfully swapped ALT for USDC!");
      return true;
    } else {
      toast.error("Swap failed");
      return false;
    }

  } catch (error: any) {
    toast.dismiss(loadingToastId);
    console.error("Error in ALT to USDC swap:", error);
    toast.error(`Swap failed: ${error.message}`);
    return false;
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
        currentChain,
        setCurrentChain,
        initializeCoreContract,
        fetchTokenBalances,
        requestTokenFromFaucet,
        initiateCrossChainSwap,
        calculateCrossChainAmount,
        swapALTForUSDC,
        swapUSDCForALT,
        getPoolBalances,
        stringToBigInt,
        bigIntToString,
      }}
    >
      {children}
    </StorageContext.Provider>
  );
};

export const useStorage = () => useContext(StorageContext);
