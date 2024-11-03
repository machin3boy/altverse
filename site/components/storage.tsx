"use client";

import React, { createContext, useContext, useState, useEffect } from "react";
import Web3 from "web3";
import coreContractABI from "@/public/ABIs/Altverse.json";
import { AbiItem } from "web3-utils";
import ERC20ABI from "@/public/ABIs/ERC20.json";
import FaucetERC20ABI from "@/public/ABIs/FaucetERC20.json";
import { toast } from "sonner";
import ZeroLogo from "@/components/ui/alt-logo";
import BitcoinLogo from "@/components/ui/bitcoin-logo";
import EthLogo from "@/components/ui/eth-logo";
import ChainlinkLogo from "@/components/ui/chainlink-logo";
import LogoProps from "@/components/ui/logo-props";

interface StorageContextProps {
  storage: { [key: string]: string };
  setStorage: (key: string, value: string) => void;
  getStorage: (key: string) => string | null | undefined;
  web3: Web3 | null;
  connectToWeb3: () => Promise<boolean>;
  switchChain: (targetChain: string) => Promise<boolean>;
  currentChain: number;
  setCurrentChain: (chainId: number) => void;
  initializeCoreContract: () => any | undefined | null;
  fetchTokenBalances: (address: string) => Promise<any[] | undefined>;
  requestTokenFromFaucet: (tokenSymbol: string) => Promise<boolean>;
  initiateCrossChainSwap: (params: CrossChainSwapParams) => Promise<boolean>;
  calculateCrossChainAmount: (
    params: CrossChainAmountParams,
  ) => Promise<CrossChainAmountResult | undefined>;
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
  calculateOptimalLiquidity: (
    params: CalculateOptimalLiquidityParams,
  ) => Promise<OptimalLiquidityResult>;
  fetchUserEscrows: () => Promise<Escrow[]>;
  claimTimedOutEscrow: (escrowId: string) => Promise<boolean>;
  getUserEscrowCount: () => Promise<number>;
  getUserEscrowIds: (count: number) => Promise<string[]>;
  getEscrowDetails: (escrowId: string) => Promise<Escrow>;
  stringToBigInt: (str: string) => bigint;
  bigIntToString: (bigInt: bigint) => string;
  tokens: TokenConfig[];
  chains: Chain[];
  ALTVERSE_ADDRESS: string;
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
  calculateOptimalLiquidity: async () => ({
    altAmount: "0",
    priceImpact: "0.00",
  }),
  fetchUserEscrows: async () => [],
  claimTimedOutEscrow: async () => true || false,
  getUserEscrowCount: async () => 0,
  getUserEscrowIds: async () => [],
  getEscrowDetails: async () => ({
    id: "",
    user: "",
    altAmount: "0",
    timeout: 0,
    active: false,
  }),
  stringToBigInt: () => BigInt(0),
  bigIntToString: () => "",
  tokens: [],
  chains: [],
  ALTVERSE_ADDRESS: "0xA17Fe331Cb33CdB650dF2651A1b9603632120b7B",
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
  iconElement: React.FC<LogoProps>;
  hoverColor: string;
  logoSrc: string;
}

interface Escrow {
  id: string; // Add this field
  user: string;
  altAmount: string;
  timeout: number;
  active: boolean;
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
  tokenAmount: string; // In wei
  altAmount: string; // In wei
}

interface RemoveLiquidityParams {
  tokenAddress: string;
  shares: string; // Amount of LP shares to remove
}

interface CalculateOptimalLiquidityParams {
  tokenAddress: string;
  tokenAmount: string; // In wei
}

interface OptimalLiquidityResult {
  altAmount: string; // Optimal ALT amount in wei
  priceImpact: string; // Percentage as string with 2 decimal places
}

export interface Chain {
  name: string;
  alt_name: string;
  full_name: string;
  name_id: string;
  symbol: string;
  id: string;
  rpc: string;
  blockExplorer: string;
  decimalId: number;
  wormholeId: number;
  logoFill: string;
  textColor: string;
  bgStyle: string;
  logoSrc: string;
  usdcAddress: string;
}

const ALTVERSE_ADDRESS = "0xA17Fe331Cb33CdB650dF2651A1b9603632120b7B";

const chains: Chain[] = [
  {
    name: "Celo Testnet",
    alt_name: "Celo Alfajores",
    full_name: "Celo Alfajores Testnet",
    name_id: "celo",
    symbol: "CELO",
    id: "0xaef3",
    rpc: "https://alfajores-forno.celo-testnet.org",
    blockExplorer: "https://alfajores.celoscan.io",
    decimalId: 44787,
    wormholeId: 14,
    logoFill: "#FCFF53",
    textColor: "#ffffff",
    bgStyle: "bg-[#888a2d]/50 hover:bg-[#888a2d]/70",
    logoSrc: "/images/tokens/branded/CELO.svg",
    usdcAddress: "0x2F25deB3848C207fc8E0c34035B3Ba7fC157602B",
  },
  {
    name: "Fuji Testnet",
    alt_name: "Avalanche Fuji",
    full_name: "Avalanche Fuji Testnet",
    name_id: "fuji",
    symbol: "AVAX",
    rpc: "https://api.avax-test.network/ext/bc/C/rpc",
    blockExplorer: "https://testnet.snowtrace.io/",
    id: "0xa869",
    decimalId: 43113,
    wormholeId: 6,
    logoFill: "#E84042",
    textColor: "#ffffff",
    bgStyle: "bg-[#7d2324]/50 hover:bg-[#7d2324]/70",
    logoSrc: "/images/tokens/branded/AVAX.svg",
    usdcAddress: "0x5425890298aed601595a70ab815c96711a31bc65",
  },
  {
    name: "Sepolia Testnet",
    alt_name: "Optimism Sepolia",
    full_name: "OP Sepolia Testnet",
    name_id: "optimism",
    id: "0xaa37dc",
    rpc: "https://sepolia.optimism.io",
    blockExplorer: "https://sepolia-optimism.etherscan.io/",
    symbol: "ETH",
    decimalId: 11155420,
    wormholeId: 10005,
    logoFill: "#383FEE",
    textColor: "#ffffff",
    bgStyle: "bg-[#15186b]/50 hover:bg-[#15186b]/70",
    logoSrc: "/images/tokens/branded/OP2.svg",
    usdcAddress: "0x5fd84259d66Cd46123540766Be93DFE6D43130D7",
  },
];

const tokens: TokenConfig[] = [
  {
    address: ALTVERSE_ADDRESS,
    symbol: "ALT",
    abi: coreContractABI as AbiItem[],
    icon: "A",
    iconElement: ZeroLogo,
    hoverColor: "hover:text-amber-500 hover:border-amber-500",
    logoSrc: "/images/tokens/branded/ALT.svg",
  },
  {
    address: "0xd6833DAAA48C127b2d007AbEE8d6b7f2CC6DFA36",
    symbol: "wBTC",
    abi: FaucetERC20ABI as AbiItem[],
    icon: "₿",
    iconElement: BitcoinLogo,
    hoverColor: "hover:text-[#F7931A] hover:border-[#F7931A]",
    logoSrc: "/images/tokens/branded/BTC.svg",
  },
  {
    address: "0x1A323bD7b3f917A6AfFE320A8b3F266130c785b9",
    symbol: "wETH",
    abi: FaucetERC20ABI as AbiItem[],
    icon: "Ξ",
    iconElement: EthLogo,
    hoverColor: "hover:text-blue-500 hover:border-blue-500",
    logoSrc: "/images/tokens/branded/ETH.svg",
  },
  {
    address: "0x0adea7235B7693C40F546E39Df559D4e31b0Cbfb",
    symbol: "wLINK",
    abi: FaucetERC20ABI as AbiItem[],
    icon: "⬡",
    iconElement: ChainlinkLogo,
    hoverColor: "hover:text-indigo-300 hover:border-indigo-300",
    logoSrc: "/images/tokens/branded/LINK.svg",
  },
];

interface CrossChainSwapParams {
  fromToken: string; // Token address
  toToken: string; // Token address
  amountIn: string; // Amount in smallest unit (wei)
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
  token: string; // IERC20 token address
  tokenReserve: string; // uint256
  altReserve: string; // uint256
  totalShares: string; // uint256
}

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
        // Check if the desired network is already added
        const chainId = await (window as any).ethereum.request({
          method: "eth_chainId",
        });
        const foundChainId = chains.find((chain) => chain.id === chainId)?.id;
        if (foundChainId) {
          try {
            // Attempt to switch to the desired network
            await (window as any).ethereum.request({
              method: "wallet_switchEthereumChain",
              params: [{ chainId: foundChainId }],
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

  const switchChain = async (targetChainId: string) => {
    if ((window as any).ethereum) {
      try {
        // Get the current chain ID
        const currentChainId = await (window as any).ethereum.request({
          method: "eth_chainId",
        });

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
              const foundChain = chains.find(
                (chain) => chain.id === targetChainId,
              );
              const chainParams = {
                chainId: foundChain?.id,
                chainName: foundChain?.full_name,
                rpcUrls: [foundChain?.rpc],
                nativeCurrency: {
                  name: foundChain?.symbol,
                  symbol: foundChain?.symbol,
                  decimals: 18,
                },
                blockExplorerUrls: [foundChain?.blockExplorer],
              };
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

        const newChainName = chains.find((c) => c.id === targetChainId)?.name;
        toast.info("Swapped chain successfully to " + newChainName);
        setCurrentChain(parseInt(targetChainId, 16));
        setStorage({ currentChain: targetChainId });
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
          setCurrentChain(Number(chainId));
          setStorage({ currentChain: chainId.toString() });
        } catch (error) {
          console.error("Error getting chain ID:", error);
        }
      }
    };

    updateChain();

    // Listen for chain changes
    if ((window as any).ethereum) {
      (window as any).ethereum.on("chainChanged", (chainId: string) => {
        const numericChainId = parseInt(chainId, 16);
        setCurrentChain(numericChainId);
        setStorage({ currentChain: numericChainId.toString() });
      });
    }

    return () => {
      if ((window as any).ethereum) {
        (window as any).ethereum.removeListener("chainChanged", () => {});
      }
    };
  }, [web3]);

  const initializeCoreContract = async () => {
    if (web3) {
      const coreContractAddress = ALTVERSE_ADDRESS;
      const contract = new web3.eth.Contract(
        coreContractABI as AbiItem[],
        coreContractAddress,
      );
      return contract;
    }
  };

  const initializeERC20Contract = async (contractAddress: string) => {
    if (web3) {
      const contract = new web3.eth.Contract(
        ERC20ABI as AbiItem[],
        contractAddress,
      );
      return contract;
    }
  };

  // Helper function to format token amounts with dynamic decimals
  const formatTokenAmount = async (
    web3: Web3,
    amount: bigint,
    tokenAddress: string,
  ): Promise<string> => {
    try {
      const tokenContract = new web3.eth.Contract(
        ERC20ABI as AbiItem[],
        tokenAddress,
      );
      const decimals = await tokenContract.methods.decimals().call();

      if (amount === BigInt(0)) return "0";

      const divisor = BigInt(10 ** Number(decimals));
      const integerPart = amount / divisor;
      const fractionalPart = amount % divisor;

      if (fractionalPart === BigInt(0)) {
        return integerPart.toString();
      }

      let fractionalStr = fractionalPart
        .toString()
        .padStart(Number(decimals), "0");
      // Remove trailing zeros
      while (fractionalStr.endsWith("0")) {
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
      const contract = new web3.eth.Contract(
        coreContractABI as AbiItem[],
        ALTVERSE_ADDRESS,
      );

      // Explicitly type the pool return value
      const pool = (await contract.methods
        .pools(tokenAddress)
        .call()) as ContractPool;

      // Check if pool exists (token address is not zero)
      if (pool.token === "0x0000000000000000000000000000000000000000") {
        return null;
      }

      return {
        token: pool.token,
        tokenReserve: BigInt(pool.tokenReserve),
        altReserve: BigInt(pool.altReserve),
        totalShares: BigInt(pool.totalShares),
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

      const contract = new web3.eth.Contract(
        coreContractABI as AbiItem[],
        ALTVERSE_ADDRESS,
      );

      const positions: LiquidityPosition[] = [];

      // Check positions for all supported tokens except ALT
      for (const token of tokens) {
        if (token.symbol === "ALT") continue;

        // Explicitly type the shares return value as string
        const shares = (await contract.methods
          .userShares(token.address, accounts[0])
          .call()) as string;

        if (BigInt(shares) > BigInt(0)) {
          const pool = await getPool(token.address);
          if (!pool) continue;

          // Calculate token and ALT amounts based on share percentage
          const shareRatio =
            (BigInt(shares) * BigInt(10000)) / pool.totalShares;
          const tokenAmount =
            (pool.tokenReserve * BigInt(shares)) / pool.totalShares;
          const altAmount =
            (pool.altReserve * BigInt(shares)) / pool.totalShares;

          positions.push({
            token: token.address,
            tokenSymbol: token.symbol,
            tokenAmount: tokenAmount.toString(),
            altAmount: altAmount.toString(),
            sharePercentage: (Number(shareRatio) / 100).toFixed(2),
            shares: shares.toString(),
            rawShares: BigInt(shares),
            formattedTokenAmount: await formatTokenAmount(
              web3,
              tokenAmount,
              token.address,
            ),
            formattedAltAmount: await formatTokenAmount(
              web3,
              altAmount,
              ALTVERSE_ADDRESS,
            ),
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

      // Check token approvals
      const tokenApproved = await checkAndApproveToken(
        params.tokenAddress,
        ALTVERSE_ADDRESS,
        params.tokenAmount,
      );

      if (!tokenApproved) return false;

      // Check ALT approval
      const altApproved = await checkAndApproveToken(
        ALTVERSE_ADDRESS,
        ALTVERSE_ADDRESS,
        params.altAmount,
      );

      if (!altApproved) return false;

      const contract = new web3.eth.Contract(
        coreContractABI as AbiItem[],
        ALTVERSE_ADDRESS,
      );

      toast.loading("Adding liquidity...", {
        id: loadingToastId,
        duration: 20000,
      });

      const tx = await contract.methods
        .addLiquidity(params.tokenAddress, params.tokenAmount, params.altAmount)
        .send({
          from: accounts[0],
          gas: "300000",
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

  const removeLiquidity = async (
    params: RemoveLiquidityParams,
  ): Promise<boolean> => {
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

      const contract = new web3.eth.Contract(
        coreContractABI as AbiItem[],
        ALTVERSE_ADDRESS,
      );

      // Verify user has sufficient shares
      const userShares = (await contract.methods
        .userShares(params.tokenAddress, accounts[0])
        .call()) as string;

      if (BigInt(userShares) < BigInt(params.shares)) {
        toast.error("Insufficient liquidity shares");
        return false;
      }

      toast.loading("Removing liquidity...", {
        id: loadingToastId,
        duration: 20000,
      });

      const tx = await contract.methods
        .removeLiquidity(params.tokenAddress, params.shares)
        .send({
          from: accounts[0],
          gas: "300000",
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
    params: CalculateOptimalLiquidityParams,
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
          priceImpact: "0.00",
        };
      }

      // Calculate optimal ALT amount based on current pool ratio
      const altAmount =
        (BigInt(params.tokenAmount) * pool.altReserve) / pool.tokenReserve;

      // Calculate price impact
      const oldPrice = (pool.altReserve * BigInt(1e18)) / pool.tokenReserve;
      const newTokenReserve = pool.tokenReserve + BigInt(params.tokenAmount);
      const newAltReserve = pool.altReserve + altAmount;
      const newPrice = (newAltReserve * BigInt(1e18)) / newTokenReserve;

      const priceImpact = ((newPrice - oldPrice) * BigInt(10000)) / oldPrice;

      return {
        altAmount: altAmount.toString(),
        priceImpact: (Number(priceImpact) / 100).toFixed(2),
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

    // If there's no fractional part, just return the whole number
    if (fracPart === BigInt(0)) {
      return wholePart.toString();
    }

    // Handle fractional part
    let fracString = fracPart.toString().padStart(Number(decimals), "0");

    // Remove trailing zeros only from fractional part
    fracString = fracString.replace(/0+$/, "");

    // Combine whole and fractional parts only if there's a fractional part left
    return fracString.length > 0
      ? `${wholePart}.${fracString}`
      : wholePart.toString();
  };

  // Helper function to convert raw balance to human readable form
  const convertRawBalance = (rawBalance: bigint, decimals: number): string => {
    const divisor = BigInt(10 ** decimals);
    const wholePart = rawBalance / divisor;
    const fracPart = rawBalance % divisor;

    if (fracPart === BigInt(0)) {
      return wholePart.toString();
    }

    let fracString = fracPart.toString().padStart(decimals, "0");
    fracString = fracString.replace(/0+$/, "");

    return fracString.length > 0
      ? `${wholePart}.${fracString}`
      : wholePart.toString();
  };

  // Function to format raw balance with specified number of decimal places
  const formatBalanceWithDecimals = (
    rawBalance: bigint,
    decimals: number,
    displayDecimals: number,
  ): string => {
    const fullBalance = convertRawBalance(rawBalance, decimals);
    const [wholePart, fracPart = ""] = fullBalance.split(".");

    if (displayDecimals === 0) {
      return wholePart;
    }

    const paddedFrac = fracPart
      .padEnd(displayDecimals, "0")
      .slice(0, displayDecimals);
    return `${wholePart}${paddedFrac.length > 0 ? "." + paddedFrac : ""}`;
  };

  const fetchTokenBalances = async (
    address: string,
  ): Promise<TokenBalance[] | undefined> => {
    if (!web3) {
      toast.error("Web3 not initialized");
      return;
    }

    try {
      const chainId = await web3.eth.getChainId();

      const baseTokens = tokens.map((t) => ({
        address: t.address,
        symbol: t.symbol,
      }));

      const usdcAddress =
        chains.find((c) => c.decimalId === Number(chainId))?.usdcAddress ||
        "0x0";

      const fullTokens = [
        ...baseTokens,
        {
          address: usdcAddress,
          symbol: "USDC",
        },
      ];

      // Native token balance
      const nativeBalance = await web3.eth.getBalance(address);
      const nativeBigInt = BigInt(nativeBalance);
      const formattedNativeBalance = formatTokenBalance(
        nativeBalance.toString(),
        "18",
      );

      const balances: TokenBalance[] = [
        {
          symbol:
            chains.find((c) => c.decimalId === Number(chainId))?.symbol ||
            "CELO",
          balance: formattedNativeBalance,
          rawBalance: nativeBigInt,
          address: "0x0000000000000000000000000000000000000000",
        },
      ];

      const tokenPromises = fullTokens.map(async (token) => {
        try {
          const contract = new web3.eth.Contract(
            ERC20ABI as AbiItem[],
            token.address,
          );

          const balance = (await contract.methods
            .balanceOf(address)
            .call()) as string;
          const decimals = (await contract.methods.decimals().call()) as string;
          const balanceBigInt = BigInt(balance);

          // Test different formatting approaches
          const directWeiConversion = web3.utils.fromWei(balance, "ether");
          const manualFormatting = formatTokenBalance(balance, decimals);
          const withDecimals = formatBalanceWithDecimals(
            balanceBigInt,
            Number(decimals),
            2,
          );

          // Use the new formatBalanceWithDecimals function with 2 decimal places
          return {
            symbol: token.symbol,
            balance: formatBalanceWithDecimals(
              balanceBigInt,
              Number(decimals),
              2,
            ),
            rawBalance: balanceBigInt,
            address: token.address,
          };
        } catch (error) {
          console.error(
            `Error fetching balance for token ${token.symbol}:`,
            error,
          );
          toast.error(`Failed to fetch ${token.symbol} balance`);
          return null;
        }
      });

      const tokenBalances = await Promise.all(tokenPromises);
      const validBalances = balances.concat(
        tokenBalances.filter(
          (balance): balance is TokenBalance => balance !== null,
        ),
      );

      return validBalances;
    } catch (error) {
      console.error("Error fetching token balances:", error);
      toast.error("Failed to fetch token balances");
      return undefined;
    }
  };

  const requestTokenFromFaucet = async (
    tokenSymbol: string,
  ): Promise<boolean> => {
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
      const token = tokens.find((t) => t.symbol === tokenSymbol);
      if (!token) {
        toast.error("Invalid token symbol");
        return false;
      }

      // Create contract instance
      const contract = new web3.eth.Contract(token.abi, token.address);

      // Call faucet function
      toast.loading(`Requesting ${tokenSymbol} from faucet...`, {
        id: loadingToastId,
        duration: 20000, // Max duration of 20 seconds
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
      toast.error(
        `Failed to request ${tokenSymbol}: ${(error as Error).message}`,
      );
      return false;
    }
  };

  const initiateCrossChainSwap = async (
    params: CrossChainSwapParams,
  ): Promise<boolean> => {
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

      const MAX_UINT256 =
        "115792089237316195423570985008687907853269984665640564039457584007913129639935";

      // Check if current chain matches target chain
      const currentChainId = await web3.eth.getChainId();
      const isSameChain = Number(currentChainId) === params.targetChain;

      // Create contract instances
      const sourceTokenContract = new web3.eth.Contract(
        ERC20ABI as AbiItem[],
        params.fromToken,
      );

      // Check existing allowance
      const currentAllowance = (await sourceTokenContract.methods
        .allowance(accounts[0], ALTVERSE_ADDRESS)
        .call()) as string;

      // If allowance is insufficient, request approval
      if (BigInt(currentAllowance) < BigInt(params.amountIn)) {
        try {
          const approveTx = await sourceTokenContract.methods
            .approve(ALTVERSE_ADDRESS, MAX_UINT256)
            .send({ from: accounts[0] });

          if (!approveTx.status) {
            toast.error("Approval failed");
            return false;
          }
        } catch (error: any) {
          console.error("Approval error:", error);
          toast.error(`Approval failed: ${error.message}`);
          return false;
        }
      } 

      // Now proceed with the swap
      const contract = new web3.eth.Contract(
        coreContractABI as AbiItem[],
        ALTVERSE_ADDRESS,
      );

      toast.loading(
        `Initiating ${isSameChain ? "swap" : "cross-chain swap"}...`,
        {
          id: loadingToastId,
          duration: 20000,
        },
      );

      let tx;
      if (isSameChain) {
        // For same-chain swaps, use regular swap function
        // Call your regular swap function here
        tx = await contract.methods
          .swap(params.fromToken, params.toToken, params.amountIn)
          .send({
            from: accounts[0],
            gas: "500000",
          });
      } else {
        // For cross-chain swaps, use wormhole
        const wormholeChainId = chains.find(
          (c) => c.decimalId === params.targetChain,
        )?.wormholeId;

        tx = await contract.methods
          .initiateCrossChainSwap(
            params.fromToken,
            params.toToken,
            params.amountIn,
            wormholeChainId,
            params.targetAddress,
          )
          .send({
            from: accounts[0],
            gas: "500000",
          });
      }

      toast.dismiss(loadingToastId);

      if (tx.status) {
        toast.success(
          `${isSameChain ? "Swap" : "Cross-chain swap"} initiated successfully!`,
        );
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
      const contract = new web3.eth.Contract(
        coreContractABI as AbiItem[],
        ALTVERSE_ADDRESS,
      );

      // Get USDC balance from contract
      const rawUsdcBalance = (await contract.methods
        .getUSDCBalance()
        .call()) as string;

      // Get ALT balance from contract
      const rawAltBalance = (await contract.methods
        .balanceOf(ALTVERSE_ADDRESS)
        .call()) as string;

      // Format USDC balance (6 decimals)
      const usdcBalance = web3.utils.fromWei(rawUsdcBalance, "mwei");

      // Format ALT balance (18 decimals)
      const altBalance = web3.utils.fromWei(rawAltBalance, "ether");

      return {
        usdcBalance, // Formatted with decimals
        altBalance, // Formatted with decimals
        rawUsdcBalance, // Raw value for calculations
        rawAltBalance, // Raw value for calculations
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
    amountOut: string,
  ): string => {
    try {
      // Get spot price before trade (reserveOut/reserveIn)
      const spotPrice = (BigInt(reserveOut) * BigInt(1e18)) / BigInt(reserveIn);

      // Get execution price (amountOut/amountIn)
      const executionPrice =
        (BigInt(amountOut) * BigInt(1e18)) / BigInt(amountIn);

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
    params: CrossChainAmountParams,
  ): Promise<CrossChainAmountResult | undefined> => {
    if (!web3) {
      toast.error("Web3 not initialized");
      return undefined;
    }

    // Early return for zero or effectively zero amounts
    const amountStr = params.amountIn.toString();

    // Check if the amount is zero or effectively zero (all decimal places are 0)
    const isEffectivelyZero = /^0*\.?0*$/.test(amountStr) || amountStr === "";

    if (isEffectivelyZero) {
      return {
        estimatedOutput: "0",
        priceImpact: "0.00",
      };
    }

    try {
      const sourceContract = new web3.eth.Contract(
        coreContractABI as AbiItem[],
        ALTVERSE_ADDRESS,
      );

      const targetRPC =
        chains.find((c) => c.decimalId === params.targetChain)?.rpc ||
        "unknown";
      const targetWeb3 = new Web3(new Web3.providers.HttpProvider(targetRPC));

      const targetContract = new targetWeb3.eth.Contract(
        coreContractABI as AbiItem[],
        ALTVERSE_ADDRESS,
      );

      let finalAmount: string;
      let priceImpact = "0.00";

      // Case 1: ALT to ALT
      if (
        params.fromToken === ALTVERSE_ADDRESS &&
        params.toToken === ALTVERSE_ADDRESS
      ) {
        finalAmount = params.amountIn;
        // No price impact for ALT to ALT as it's a 1:1 transfer
        priceImpact = "0.00";
      }
      // Case 2: ALT to Token
      else if (
        params.fromToken === ALTVERSE_ADDRESS &&
        params.toToken !== ALTVERSE_ADDRESS
      ) {
        const targetPool: Pool = await targetContract.methods
          .pools(params.toToken)
          .call();

        if (
          targetPool.token === "0x0000000000000000000000000000000000000000" ||
          BigInt(targetPool.tokenReserve) === BigInt(0) ||
          BigInt(targetPool.altReserve) === BigInt(0)
        ) {
          toast.error("Target pool not initialized or has no liquidity");
          return undefined;
        }

        // Calculate output amount
        finalAmount = (await targetContract.methods
          .getAmountOut(
            params.amountIn,
            targetPool.altReserve.toString(),
            targetPool.tokenReserve.toString(),
          )
          .call()) as string;

        // Calculate price impact for ALT → Token swap
        priceImpact = calculatePriceImpact(
          params.amountIn,
          targetPool.altReserve.toString(),
          targetPool.tokenReserve.toString(),
          finalAmount,
        );
      }
      // Case 3: Token to ALT
      else if (
        params.fromToken !== ALTVERSE_ADDRESS &&
        params.toToken === ALTVERSE_ADDRESS
      ) {
        const sourcePool: Pool = await sourceContract.methods
          .pools(params.fromToken)
          .call();

        if (
          sourcePool.token === "0x0000000000000000000000000000000000000000" ||
          BigInt(sourcePool.tokenReserve) === BigInt(0) ||
          BigInt(sourcePool.altReserve) === BigInt(0)
        ) {
          toast.error("Source pool not initialized or has no liquidity");
          return undefined;
        }

        // Calculate output amount
        finalAmount = (await sourceContract.methods
          .getAmountOut(
            params.amountIn,
            sourcePool.tokenReserve.toString(),
            sourcePool.altReserve.toString(),
          )
          .call()) as string;

        // Calculate price impact for Token → ALT swap
        priceImpact = calculatePriceImpact(
          params.amountIn,
          sourcePool.tokenReserve.toString(),
          sourcePool.altReserve.toString(),
          finalAmount,
        );
      }
      // Case 4: Token to Token
      else {
        const sourcePool: Pool = await sourceContract.methods
          .pools(params.fromToken)
          .call();

        if (
          sourcePool.token === "0x0000000000000000000000000000000000000000" ||
          BigInt(sourcePool.tokenReserve) === BigInt(0) ||
          BigInt(sourcePool.altReserve) === BigInt(0)
        ) {
          toast.error("Source pool not initialized or has no liquidity");
          return undefined;
        }

        // First swap: Token → ALT
        const altAmount = (await sourceContract.methods
          .getAmountOut(
            params.amountIn,
            sourcePool.tokenReserve.toString(),
            sourcePool.altReserve.toString(),
          )
          .call()) as string;

        const targetPool: Pool = await targetContract.methods
          .pools(params.toToken)
          .call();

        if (
          targetPool.token === "0x0000000000000000000000000000000000000000" ||
          BigInt(targetPool.tokenReserve) === BigInt(0) ||
          BigInt(targetPool.altReserve) === BigInt(0)
        ) {
          toast.error("Target pool not initialized or has no liquidity");
          return undefined;
        }

        // Second swap: ALT → Token
        finalAmount = (await targetContract.methods
          .getAmountOut(
            altAmount,
            targetPool.altReserve.toString(),
            targetPool.tokenReserve.toString(),
          )
          .call()) as string;

        // Calculate combined price impact from both swaps
        const sourceImpact = calculatePriceImpact(
          params.amountIn,
          sourcePool.tokenReserve.toString(),
          sourcePool.altReserve.toString(),
          altAmount,
        );

        const targetImpact = calculatePriceImpact(
          altAmount,
          targetPool.altReserve.toString(),
          targetPool.tokenReserve.toString(),
          finalAmount,
        );

        // Combine price impacts
        priceImpact = (Number(sourceImpact) + Number(targetImpact)).toFixed(2);
      }

      return {
        estimatedOutput: finalAmount,
        priceImpact,
      };
    } catch (error) {
      console.error("Error calculating cross-chain amount:", error);
      toast.error(
        `Failed to calculate cross-chain amount: ${(error as Error).message}`,
      );
      return undefined;
    }
  };

  const checkAndApproveToken = async (
    tokenAddress: string,
    spenderAddress: string,
    amount: string,
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
        tokenAddress,
      );

      // Check current allowance
      const currentAllowance = (await tokenContract.methods
        .allowance(accounts[0], spenderAddress)
        .call()) as string;

      if (BigInt(currentAllowance) < BigInt(amount)) {
        const approveToastId = `approve-${Date.now()}`;
        toast.loading("Approving token spend...", {
          id: approveToastId,
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

      const contract = new web3.eth.Contract(
        coreContractABI as AbiItem[],
        ALTVERSE_ADDRESS,
      );

      const designatedUSDC = (await contract.methods
        .designatedUSDC()
        .call()) as string;
      if (
        !designatedUSDC ||
        designatedUSDC === "0x0000000000000000000000000000000000000000"
      ) {
        toast.error("USDC address not set in contract");
        return false;
      }

      // Convert amount to smallest unit (6 decimals for USDC)
      const usdcAmountWei = web3.utils.toWei(usdcAmount, "mwei");

      // Check and approve USDC if needed
      const approved = await checkAndApproveToken(
        designatedUSDC,
        ALTVERSE_ADDRESS,
        usdcAmountWei,
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

      const contract = new web3.eth.Contract(
        coreContractABI as AbiItem[],
        ALTVERSE_ADDRESS,
      );

      const designatedUSDC = (await contract.methods
        .designatedUSDC()
        .call()) as string;
      if (
        !designatedUSDC ||
        designatedUSDC === "0x0000000000000000000000000000000000000000"
      ) {
        toast.error("USDC address not set in contract");
        return false;
      }

      // Convert ALT amount to smallest unit (18 decimals)
      const altAmountWei = web3.utils.toWei(altAmount, "ether");

      // Check and approve ALT if needed
      const approved = await checkAndApproveToken(
        ALTVERSE_ADDRESS,
        ALTVERSE_ADDRESS,
        altAmountWei,
      );

      if (!approved) {
        return false;
      }

      // Check ALT balance
      const altBalance = (await contract.methods
        .balanceOf(accounts[0])
        .call()) as string;
      if (BigInt(altBalance) < BigInt(altAmountWei)) {
        toast.error("Insufficient ALT balance");
        return false;
      }

      // Check USDC liquidity
      const contractUsdcBalance = (await contract.methods
        .getUSDCBalance()
        .call()) as string;
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

  const fetchUserEscrows = async (): Promise<Escrow[]> => {
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

      const contract = new web3.eth.Contract(
        coreContractABI as AbiItem[],
        ALTVERSE_ADDRESS,
      );

      // Get user's escrow count
      const escrowCount = (await contract.methods
        .userEscrowCount(accounts[0])
        .call()) as string;

      if (Number(escrowCount) === 0) {
        return [];
      }

      // Fetch all escrow IDs for the user
      const escrowIds: string[] = [];
      for (let i = 0; i < Number(escrowCount); i++) {
        try {
          const id = (await contract.methods
            .userEscrows(accounts[0], i)
            .call()) as string;
          if (
            id &&
            id !==
              "0x0000000000000000000000000000000000000000000000000000000000000000"
          ) {
            escrowIds.push(id);
          }
        } catch (error) {
          console.error(`Error fetching escrow ID at index ${i}:`, error);
        }
      }

      // Get details for each escrow with proper typing
      const escrows = await Promise.all(
        escrowIds.map(async (id: string) => {
          try {
            const escrow = (await contract.methods
              .escrows(id)
              .call()) as Escrow;

            const escrowDetails: Escrow = {
              id: id, // Store the original bytes32 hash
              user: escrow.user,
              altAmount: escrow.altAmount,
              timeout: Number(escrow.timeout) * 1000,
              active: escrow.active,
            };
            return escrowDetails;
          } catch (error) {
            console.error(`Error fetching escrow details for ID ${id}:`, error);
            return null;
          }
        }),
      );

      // Filter out null values and invalid addresses, then sort
      return escrows
        .filter(
          (escrow): escrow is Escrow =>
            escrow !== null &&
            escrow.user.toLowerCase() !==
              "0x0000000000000000000000000000000000000000".toLowerCase(),
        )
        .sort((a, b) => {
          if (a.active && !b.active) return -1;
          if (!a.active && b.active) return 1;
          return a.timeout - b.timeout;
        });
    } catch (error) {
      console.error("Error fetching user escrows:", error);
      toast.error(`Failed to fetch escrows: ${(error as Error).message}`);
      return [];
    }
  };

  const claimTimedOutEscrow = async (escrowId: string): Promise<boolean> => {
    if (!web3) {
      toast.error("Web3 not initialized");
      return false;
    }

    const loadingToastId = `claim-escrow-${Date.now()}`;

    try {
      const accounts = await web3.eth.getAccounts();
      if (!accounts[0]) {
        toast.error("No account connected");
        return false;
      }

      const contract = new web3.eth.Contract(
        coreContractABI as AbiItem[],
        ALTVERSE_ADDRESS,
      );

      toast.loading("Claiming escrow...", {
        id: loadingToastId,
      });

      // Ensure escrowId is properly formatted as bytes32
      let formattedEscrowId = escrowId;
      if (!escrowId.startsWith("0x")) {
        formattedEscrowId = "0x" + escrowId;
      }
      // Pad the ID to 32 bytes if necessary
      while (formattedEscrowId.length < 66) {
        // 0x + 64 hex characters
        formattedEscrowId = formattedEscrowId + "0";
      }

      const tx = await contract.methods
        .claimTimedOutEscrow(formattedEscrowId)
        .send({
          from: accounts[0],
          gas: "300000",
        });

      toast.dismiss(loadingToastId);

      if (tx.status) {
        toast.success("Successfully claimed escrow!");
        return true;
      } else {
        toast.error("Failed to claim escrow");
        return false;
      }
    } catch (error) {
      toast.dismiss(loadingToastId);
      console.error("Error claiming escrow:", error);
      toast.error(`Failed to claim escrow: ${(error as Error).message}`);
      return false;
    }
  };

  const getUserEscrowCount = async (): Promise<number> => {
    if (!web3) {
      toast.error("Web3 not initialized");
      return 0;
    }

    try {
      const accounts = await web3.eth.getAccounts();
      if (!accounts[0]) return 0;

      const contract = new web3.eth.Contract(
        coreContractABI as AbiItem[],
        ALTVERSE_ADDRESS,
      );

      const count = (await contract.methods
        .userEscrowCount(accounts[0])
        .call()) as string;
      return Number(count);
    } catch (error) {
      console.error("Error getting escrow count:", error);
      return 0;
    }
  };

  const getUserEscrowIds = async (count: number): Promise<string[]> => {
    if (!web3) {
      toast.error("Web3 not initialized");
      return [];
    }

    try {
      const accounts = await web3.eth.getAccounts();
      if (!accounts[0]) return [];

      const contract = new web3.eth.Contract(
        coreContractABI as AbiItem[],
        ALTVERSE_ADDRESS,
      );

      const escrowIds = [];
      for (let i = 0; i < count; i++) {
        const id = (await contract.methods
          .userEscrows(accounts[0], i)
          .call()) as string;
        escrowIds.push(id);
      }

      return escrowIds;
    } catch (error) {
      console.error("Error getting escrow IDs:", error);
      return [];
    }
  };

  const getEscrowDetails = async (escrowId: string): Promise<Escrow> => {
    if (!web3) {
      throw new Error("Web3 not initialized");
    }

    try {
      const contract = new web3.eth.Contract(
        coreContractABI as AbiItem[],
        ALTVERSE_ADDRESS,
      );

      const escrow = (await contract.methods
        .escrows(escrowId)
        .call()) as Escrow;

      return {
        id: escrowId,
        user: escrow.user,
        altAmount: escrow.altAmount,
        timeout: Number(escrow.timeout) * 1000, // Convert to milliseconds
        active: escrow.active,
      };
    } catch (error) {
      console.error("Error getting escrow details:", error);
      throw error;
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
        fetchUserEscrows,
        claimTimedOutEscrow,
        getUserEscrowCount,
        getUserEscrowIds,
        getEscrowDetails,
        stringToBigInt,
        bigIntToString,
        tokens,
        chains,
        ALTVERSE_ADDRESS,
      }}
    >
      {children}
    </StorageContext.Provider>
  );
};

export const useStorage = () => useContext(StorageContext);
