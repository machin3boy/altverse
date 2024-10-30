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
  getPool: (tokenAddress: string) => Promise<Pool | null>;
  getUserLiquidityPositions: () => Promise<LiquidityPosition[]>;
  addLiquidity: (params: AddLiquidityParams) => Promise<boolean>;
  removeLiquidity: (params: RemoveLiquidityParams) => Promise<boolean>;
  calculateOptimalLiquidity: (params: CalculateOptimalLiquidityParams) => Promise<OptimalLiquidityResult>;
  stringToBigInt: (str: string) => bigint;
  bigIntToString: (bigInt: bigint) => string;
  tokens: TokenConfig[];
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
  getPool: async () => null,
  getUserLiquidityPositions: async () => [],
  addLiquidity: async () => true || false,
  removeLiquidity: async () => true || false,
  calculateOptimalLiquidity: async () => ({ altAmount: "0", priceImpact: "0.00" }),
  stringToBigInt: () => BigInt(0),
  bigIntToString: () => "",
  tokens: []
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
  icon: string;
}

export interface LiquidityPosition {
  token: string;
  tokenSymbol: string;
  tokenAmount: string;
  altAmount: string;
  sharePercentage: string;
  shares: string;
  rawShares: bigint;
  formattedTokenAmount: string;
  formattedAltAmount: string;
}

interface AddLiquidityParams {
  tokenAddress: string;
  tokenAmount: string;  // In wei
  altAmount: string;    // In wei
}

interface RemoveLiquidityParams {
  tokenAddress: string;
  shares: string;       // Amount of LP shares to remove
}

interface CalculateOptimalLiquidityParams {
  tokenAddress: string;
  tokenAmount: string;  // In wei
}

interface OptimalLiquidityResult {
  altAmount: string;    // Optimal ALT amount in wei
  priceImpact: string; // Percentage as string with 2 decimal places
}

const tokens: TokenConfig[] = [
  {
    address: "0xA17Fe331Cb33CdB650dF2651A1b9603632120b7B",
    symbol: "ALT",
    abi: coreContractABI as AbiItem[],
    icon: "A"
  },
  {
    address: "0xd6833DAAA48C127b2d007AbEE8d6b7f2CC6DFA36",
    symbol: "wBTC",
    abi: FaucetERC20ABI as AbiItem[],
    icon: "₿"
  },
  {
    address: "0x1A323bD7b3f917A6AfFE320A8b3F266130c785b9",
    symbol: "wETH",
    abi: FaucetERC20ABI as AbiItem[],
    icon: "Ξ"
  },
  {
    address: "0x0adea7235B7693C40F546E39Df559D4e31b0Cbfb",
    symbol: "wLINK",
    abi: FaucetERC20ABI as AbiItem[],
    icon: "⬡"
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

interface ContractPool {
  token: string;         // IERC20 token address
  tokenReserve: string;  // uint256
  altReserve: string;    // uint256
  totalShares: string;   // uint256
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

  // Helper function to format token amounts with dynamic decimals
const formatTokenAmount = async (web3: Web3, amount: bigint, tokenAddress: string): Promise<string> => {
  try {
    const tokenContract = new web3.eth.Contract(
      ERC20ABI as AbiItem[],
      tokenAddress
    );
    const decimals = await tokenContract.methods.decimals().call();
    
    if (amount === BigInt(0)) return "0";
    
    const divisor = BigInt(10 ** Number(decimals));
    const integerPart = amount / divisor;
    const fractionalPart = amount % divisor;
    
    if (fractionalPart === BigInt(0)) {
      return integerPart.toString();
    }
    
    let fractionalStr = fractionalPart.toString().padStart(Number(decimals), '0');
    // Remove trailing zeros
    while (fractionalStr.endsWith('0')) {
      fractionalStr = fractionalStr.slice(0, -1);
    }
    
    return `${integerPart}.${fractionalStr}`;
  } catch (error) {
    console.error("Error formatting token amount:", error);
    return amount.toString();
  }
};

const getPool = async (tokenAddress: string): Promise<Pool | null> => {
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

    // Explicitly type the pool return value
    const pool = await contract.methods.pools(tokenAddress).call() as ContractPool;
    
    // Check if pool exists (token address is not zero)
    if (pool.token === "0x0000000000000000000000000000000000000000") {
      return null;
    }

    return {
      token: pool.token,
      tokenReserve: BigInt(pool.tokenReserve),
      altReserve: BigInt(pool.altReserve),
      totalShares: BigInt(pool.totalShares)
    };
  } catch (error) {
    console.error("Error fetching pool:", error);
    toast.error(`Failed to fetch pool: ${(error as Error).message}`);
    return null;
  }
};

const getUserLiquidityPositions = async (): Promise<LiquidityPosition[]> => {
  if (!web3) {
    toast.error("Web3 not initialized");
    return [];
  }

  try {
    const accounts = await web3.eth.getAccounts();
    if (!accounts[0]) {
      toast.error("No account connected");
      return [];
    }

    const ALTVERSE_ADDRESS = "0xA17Fe331Cb33CdB650dF2651A1b9603632120b7B";
    const contract = new web3.eth.Contract(
      coreContractABI as AbiItem[],
      ALTVERSE_ADDRESS
    );

    const positions: LiquidityPosition[] = [];

    // Check positions for all supported tokens except ALT
    for (const token of tokens) {
      if (token.symbol === "ALT") continue;

      // Explicitly type the shares return value as string
      const shares = await contract.methods
        .userShares(token.address, accounts[0])
        .call() as string;

      if (BigInt(shares) > BigInt(0)) {
        const pool = await getPool(token.address);
        if (!pool) continue;

        // Calculate token and ALT amounts based on share percentage
        const shareRatio = (BigInt(shares) * BigInt(10000)) / pool.totalShares;
        const tokenAmount = (pool.tokenReserve * BigInt(shares)) / pool.totalShares;
        const altAmount = (pool.altReserve * BigInt(shares)) / pool.totalShares;

        positions.push({
          token: token.address,
          tokenSymbol: token.symbol,
          tokenAmount: tokenAmount.toString(),
          altAmount: altAmount.toString(),
          sharePercentage: ((Number(shareRatio) / 100)).toFixed(2),
          shares: shares.toString(),
          rawShares: BigInt(shares),
          formattedTokenAmount: await formatTokenAmount(web3, tokenAmount, token.address),
          formattedAltAmount: await formatTokenAmount(web3, altAmount, ALTVERSE_ADDRESS)
        });
      }
    }

    return positions;

  } catch (error) {
    console.error("Error fetching liquidity positions:", error);
    toast.error(`Failed to fetch positions: ${(error as Error).message}`);
    return [];
  }
};

const addLiquidity = async (params: AddLiquidityParams): Promise<boolean> => {
  if (!web3) {
    toast.error("Web3 not initialized");
    return false;
  }

  const loadingToastId = `add-liquidity-${Date.now()}`;

  try {
    const accounts = await web3.eth.getAccounts();
    if (!accounts[0]) {
      toast.error("No account connected");
      return false;
    }

    const ALTVERSE_ADDRESS = "0xA17Fe331Cb33CdB650dF2651A1b9603632120b7B";
    
    // Check token approvals
    const tokenApproved = await checkAndApproveToken(
      params.tokenAddress,
      ALTVERSE_ADDRESS,
      params.tokenAmount
    );

    if (!tokenApproved) return false;

    // Check ALT approval
    const altApproved = await checkAndApproveToken(
      ALTVERSE_ADDRESS,
      ALTVERSE_ADDRESS,
      params.altAmount
    );

    if (!altApproved) return false;

    const contract = new web3.eth.Contract(
      coreContractABI as AbiItem[],
      ALTVERSE_ADDRESS
    );

    toast.loading("Adding liquidity...", {
      id: loadingToastId,
      duration: 20000
    });

    const tx = await contract.methods
      .addLiquidity(params.tokenAddress, params.tokenAmount, params.altAmount)
      .send({
        from: accounts[0],
        gas: '300000'
      });

    toast.dismiss(loadingToastId);

    if (tx.status) {
      toast.success("Successfully added liquidity!");
      return true;
    } else {
      toast.error("Failed to add liquidity");
      return false;
    }

  } catch (error) {
    toast.dismiss(loadingToastId);
    console.error("Error adding liquidity:", error);
    toast.error(`Failed to add liquidity: ${(error as Error).message}`);
    return false;
  }
};

const removeLiquidity = async (params: RemoveLiquidityParams): Promise<boolean> => {
  if (!web3) {
    toast.error("Web3 not initialized");
    return false;
  }

  const loadingToastId = `remove-liquidity-${Date.now()}`;

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

    // Verify user has sufficient shares
    const userShares = await contract.methods
      .userShares(params.tokenAddress, accounts[0])
      .call() as string;

    if (BigInt(userShares) < BigInt(params.shares)) {
      toast.error("Insufficient liquidity shares");
      return false;
    }

    toast.loading("Removing liquidity...", {
      id: loadingToastId,
      duration: 20000
    });

    const tx = await contract.methods
      .removeLiquidity(params.tokenAddress, params.shares)
      .send({
        from: accounts[0],
        gas: '300000'
      });

    toast.dismiss(loadingToastId);

    if (tx.status) {
      toast.success("Successfully removed liquidity!");
      return true;
    } else {
      toast.error("Failed to remove liquidity");
      return false;
    }

  } catch (error) {
    toast.dismiss(loadingToastId);
    console.error("Error removing liquidity:", error);
    toast.error(`Failed to remove liquidity: ${(error as Error).message}`);
    return false;
  }
};

const calculateOptimalLiquidity = async (
  params: CalculateOptimalLiquidityParams
): Promise<OptimalLiquidityResult> => {
  if (!web3) {
    throw new Error("Web3 not initialized");
  }

  try {
    const pool = await getPool(params.tokenAddress);
    
    if (!pool || pool.tokenReserve === BigInt(0)) {
      // For new pools or empty pools, maintain 1:1 ratio
      return {
        altAmount: params.tokenAmount,
        priceImpact: "0.00"
      };
    }

    // Calculate optimal ALT amount based on current pool ratio
    const altAmount = (BigInt(params.tokenAmount) * pool.altReserve) / pool.tokenReserve;

    // Calculate price impact
    const oldPrice = pool.altReserve * BigInt(1e18) / pool.tokenReserve;
    const newTokenReserve = pool.tokenReserve + BigInt(params.tokenAmount);
    const newAltReserve = pool.altReserve + altAmount;
    const newPrice = newAltReserve * BigInt(1e18) / newTokenReserve;

    const priceImpact = ((newPrice - oldPrice) * BigInt(10000) / oldPrice);
    
    return {
      altAmount: altAmount.toString(),
      priceImpact: (Number(priceImpact) / 100).toFixed(2)
    };

  } catch (error) {
    console.error("Error calculating optimal liquidity:", error);
    throw error;
  }
};

  const formatTokenBalance = (balance: string, decimals: string): string => {
    const balanceNum = BigInt(balance);
    const divisor = BigInt(10 ** Number(decimals));
    const wholePart = balanceNum / divisor;
    const fracPart = balanceNum % divisor;
    
    let formatted = wholePart.toString();
    if (fracPart > 0) {
      // Add fractional part and pad with leading zeros if needed
      const fracString = fracPart.toString().padStart(Number(decimals), '0');
      formatted = `${formatted}.${fracString}`;
    }
    
    // Remove trailing zeros after decimal
    return formatted.replace(/\.?0+$/, '');
  };

  const fetchTokenBalances = async (address: string): Promise<TokenBalance[] | undefined> => {
    if (!web3) {
      toast.error("Web3 not initialized");
      return;
    }
  
    try {
      // Get chain ID first to determine USDC address
      const chainId = await web3.eth.getChainId();
      
      // Base tokens list
      const baseTokens = [
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
  
      // Add USDC based on chain
      const usdcAddress = Number(chainId) === 43113 
        ? "0x5425890298aed601595a70ab815c96711a31bc65"  // Fuji
        : "0x2F25deB3848C207fc8E0c34035B3Ba7fC157602B"; // Celo
  
      const tokens = [
        ...baseTokens,
        {
          address: usdcAddress,
          symbol: "USDC"
        }
      ];
  
      // Get native token balance
      const nativeBalance = await web3.eth.getBalance(address);
      const nativeBigInt = BigInt(nativeBalance);
      const formattedNativeBalance = formatTokenBalance(nativeBalance.toString(), '18');
  
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
          console.log(`Fetching balance for ${token.symbol} at ${token.address}`);
          
          const contract = new web3.eth.Contract(
            ERC20ABI as AbiItem[],
            token.address
          );
          
          const balance = await contract.methods.balanceOf(address).call() as string;
          const decimals = await contract.methods.decimals().call() as string;
  
          console.log(`Raw balance for ${token.symbol}: ${balance}, decimals: ${decimals}`);
  
          const balanceBigInt = BigInt(balance);
          const formattedBalance = formatTokenBalance(balance, decimals);
  
          console.log(`Formatted balance for ${token.symbol}: ${formattedBalance}`);
  
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
  
      console.log("All balances:", validBalances);
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

const checkAndApproveToken = async (
  tokenAddress: string,
  spenderAddress: string,
  amount: string
): Promise<boolean> => {
  if (!web3) return false;

  try {
    const accounts = await web3.eth.getAccounts();
    if (!accounts[0]) {
      toast.error("No account connected");
      return false;
    }

    const tokenContract = new web3.eth.Contract(
      ERC20ABI as AbiItem[],
      tokenAddress
    );

    // Check current allowance
    const currentAllowance = await tokenContract.methods
      .allowance(accounts[0], spenderAddress)
      .call() as string;

    if (BigInt(currentAllowance) < BigInt(amount)) {
      const approveToastId = `approve-${Date.now()}`;
      toast.loading("Approving token spend...", {
        id: approveToastId
      });

      try {
        await tokenContract.methods
          .approve(spenderAddress, amount)
          .send({ from: accounts[0] });
        
        toast.dismiss(approveToastId);
        toast.success("Token approved successfully");
        return true;
      } catch (error: any) {
        toast.dismiss(approveToastId);
        toast.error(`Token approval failed: ${error.message}`);
        return false;
      }
    }

    return true; // Already approved
  } catch (error: any) {
    console.error("Approval error:", error);
    toast.error(`Approval check failed: ${error.message}`);
    return false;
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

    // Convert amount to smallest unit (6 decimals for USDC)
    const usdcAmountWei = web3.utils.toWei(usdcAmount, 'mwei');

    // Check and approve USDC if needed
    const approved = await checkAndApproveToken(
      designatedUSDC,
      ALTVERSE_ADDRESS,
      usdcAmountWei
    );

    if (!approved) {
      return false;
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

    const designatedUSDC = await contract.methods.designatedUSDC().call() as string;
    if (!designatedUSDC || designatedUSDC === "0x0000000000000000000000000000000000000000") {
      toast.error("USDC address not set in contract");
      return false;
    }

    // Convert ALT amount to smallest unit (18 decimals)
    const altAmountWei = web3.utils.toWei(altAmount, 'ether');

    // Check and approve ALT if needed
    const approved = await checkAndApproveToken(
      ALTVERSE_ADDRESS,
      ALTVERSE_ADDRESS,
      altAmountWei
    );

    if (!approved) {
      return false;
    }

    // Check ALT balance
    const altBalance = await contract.methods.balanceOf(accounts[0]).call() as string;
    if (BigInt(altBalance) < BigInt(altAmountWei)) {
      toast.error("Insufficient ALT balance");
      return false;
    }

    // Check USDC liquidity
    const contractUsdcBalance = await contract.methods.getUSDCBalance().call() as string;
    const expectedUsdcAmount = BigInt(altAmountWei) / BigInt(1000000000000); // Convert from 18 to 6 decimals
    
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
        getPool,
        addLiquidity,
        removeLiquidity,
        getUserLiquidityPositions,
        calculateOptimalLiquidity,
        stringToBigInt,
        bigIntToString,
        tokens
      }}
    >
      {children}
    </StorageContext.Provider>
  );
};

export const useStorage = () => useContext(StorageContext);
