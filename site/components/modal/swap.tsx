import React, { useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useStorage } from "../storage";
import { useEffect, useMemo, useCallback } from "react";
import { toast } from "sonner";
import NumberTicker from "@/components/magicui/number-ticker";
import CeloLogo from "../ui/celo-logo";
import AvaxLogo from "../ui/avax-logo";
import LogoProps from "../ui/logo-props";

type ChainId = "celo" | "fuji" | "optimism";

interface Chain {
  name: string;
  id: ChainId;
  chainId: number;
  logo: React.FC<LogoProps>;
}

const tokens = [
  {
    symbol: "ALT",
    icon: "A",
    address: "0xA17Fe331Cb33CdB650dF2651A1b9603632120b7B",
  },
  {
    symbol: "wBTC",
    icon: "₿",
    address: "0xd6833DAAA48C127b2d007AbEE8d6b7f2CC6DFA36",
  },
  {
    symbol: "wETH",
    icon: "Ξ",
    address: "0x1A323bD7b3f917A6AfFE320A8b3F266130c785b9",
  },
  {
    symbol: "wLINK",
    icon: "⬡",
    address: "0x0adea7235B7693C40F546E39Df559D4e31b0Cbfb",
  },
];

const chains: Chain[] = [
  {
    name: "Celo Testnet",
    id: "celo",
    chainId: 44787,
    logo: CeloLogo,
  },
  {
    name: "Fuji Testnet",
    id: "fuji",
    chainId: 43113,
    logo: AvaxLogo,
  },
  {
    name: "OP Sepolia Testnet",
    id: "optimism",
    chainId: 3242,
    logo: AvaxLogo,
  },
];

interface TokenBalance {
  symbol: string;
  balance: string;
  rawBalance: bigint;
  address: string;
}

export default function Swap() {
  const {
    initiateCrossChainSwap,
    calculateCrossChainAmount,
    currentChain,
    web3,
    fetchTokenBalances,
  } = useStorage();

  const [swapFromToken, setSwapFromToken] = useState("ALT");
  const [swapToToken, setSwapToToken] = useState("wBTC");
  const [amount, setAmount] = useState("");
  const [receivedAmount, setReceivedAmount] = useState("");
  const [isCalculating, setIsCalculating] = useState(false);
  const [tokenBalances, setTokenBalances] = useState<TokenBalance[]>([]);
  const [isLoadingBalances, setIsLoadingBalances] = useState(false);

  const [targetChain, setTargetChain] = useState(() => {
    return "fuji";
  });
  const [currentCalculation, setCurrentCalculation] =
    useState<AbortController | null>(null);

  const ChainSelectValue = React.forwardRef<HTMLDivElement, { value: ChainId }>(
    (props, ref) => {
      const chain = chains.find((c) => c.id === props.value);
      const Logo = chain?.logo;

      return (
        <div className="flex items-center gap-2" ref={ref}>
          {Logo && (
            <Logo
              fillColor="rgb(14 165 233)"
              width={16}
              height={16}
              className="opacity-80"
            />
          )}
          <span>{chain?.name}</span>
        </div>
      );
    }
  );

  const calculateReceivedAmount = useCallback(
    async (inputAmount: string, abortController: AbortController) => {
      if (!inputAmount || inputAmount === "0" || !targetChain) {
        setReceivedAmount("");
        return;
      }

      setIsCalculating(true);
      setReceivedAmount("Calculating...");

      try {
        if (web3) {
          if (abortController.signal.aborted) {
            return;
          }

          const targetChainId = chains.find(
            (chain) => chain.id === targetChain
          )?.chainId;
          if (!targetChainId) {
            throw new Error("Invalid target chain");
          }

          console.warn("Calculating received amount with params:", {
            fromToken:
              tokens.find((t) => t.symbol === swapFromToken)?.address || "",
            toToken:
              tokens.find((t) => t.symbol === swapToToken)?.address || "",
            amountIn: web3.utils.toWei(inputAmount, "ether"),
            targetChain: targetChainId,
            currentChain: currentChain,
            isCrossChain: currentChain !== targetChainId,
          });

          const result = await calculateCrossChainAmount({
            fromToken:
              tokens.find((t) => t.symbol === swapFromToken)?.address || "",
            toToken:
              tokens.find((t) => t.symbol === swapToToken)?.address || "",
            amountIn: web3.utils.toWei(inputAmount, "ether"),
            targetChain: targetChainId,
          });

          // Check if calculation was aborted
          if (abortController.signal.aborted) {
            return;
          }

          if (result) {
            const formattedOutput = web3.utils.fromWei(
              result.estimatedOutput,
              "ether"
            );
            const roundedOutput = Number(formattedOutput).toFixed(6);
            setReceivedAmount(roundedOutput.replace(/\.?0+$/, ""));
          } else {
            setReceivedAmount("");
          }
        } else {
          setReceivedAmount("");
        }
      } catch (error) {
        if (!abortController.signal.aborted) {
          console.error("Error calculating received amount:", error);
          setReceivedAmount("");
        }
      } finally {
        if (!abortController.signal.aborted) {
          setIsCalculating(false);
        }
      }
    },
    [
      swapFromToken,
      swapToToken,
      targetChain,
      calculateCrossChainAmount,
      web3,
      currentChain,
    ]
  );

  useEffect(() => {
    if (amount) {
      // Cancel any ongoing calculation
      if (currentCalculation) {
        currentCalculation.abort();
      }

      // Create new AbortController for this calculation
      const newController = new AbortController();
      setCurrentCalculation(newController);

      // Start the calculation
      calculateReceivedAmount(amount, newController);
    } else {
      setReceivedAmount("");
      setIsCalculating(false);
    }

    // Cleanup function
    return () => {
      if (currentCalculation) {
        currentCalculation.abort();
      }
    };
  }, [amount, calculateReceivedAmount]);

  useEffect(() => {
    const loadBalances = async () => {
      if (web3) {
        setIsLoadingBalances(true);
        try {
          const accounts = await web3.eth.getAccounts();
          if (accounts[0]) {
            const balances = await fetchTokenBalances(accounts[0]);
            if (balances) {
              setTokenBalances(balances);
            }
          }
        } catch (error) {
          console.error("Error loading balances:", error);
        }
        setIsLoadingBalances(false);
      }
    };

    loadBalances();
  }, [web3, currentChain, swapFromToken, fetchTokenBalances]);

  const getCurrentTokenBalance = useCallback(() => {
    const token = tokens.find((t) => t.symbol === swapFromToken);
    if (!token) return "0";

    const balance = tokenBalances.find(
      (b) => b.address.toLowerCase() === token.address.toLowerCase()
    );
    return balance ? balance.rawBalance.toString() : "0";
  }, [tokenBalances, swapFromToken]);

  // Handle max button click
  const handleMaxClick = useCallback(async () => {
    if (!web3) return;

    const rawBalance = getCurrentTokenBalance();
    if (rawBalance === "0") {
      toast.warning("No balance available");
      return;
    }

    // Convert from wei to ether for display
    const formattedBalance = web3.utils.fromWei(rawBalance, "ether");
    setAmount(formattedBalance);
  }, [web3, getCurrentTokenBalance]);

  const handleAmountChange = async (e: any) => {
    const value = e.target.value;

    if (value === "") {
      setAmount("");
      setReceivedAmount("");
      return;
    }

    const hasValidCharacters = /^[0-9.]*$/.test(value);
    if (!hasValidCharacters) {
      return;
    }

    const decimalCount = (value.match(/\./g) || []).length;
    if (decimalCount > 1) {
      return;
    }

    setAmount(value);
  };

  const handleSwap = useCallback(async () => {
    if (!web3) {
      toast.error("Please connect your wallet");
      return;
    }

    if (!amount || amount === "0") {
      toast.error("Please enter an amount");
      return;
    }

    if (!targetChain) {
      toast.error("Please select a destination chain");
      return;
    }
    const targetChainId = chains.find((chain) => chain.id === targetChain)?.chainId;
    if (targetChainId === currentChain) {
      toast.error("We currently only support cross-chain swaps.");
      return;
    }

    try {
      // Get user's address
      const accounts = await web3.eth.getAccounts();
      if (!accounts[0]) {
        toast.error("No account connected");
        return;
      }

      const targetChainId = chains.find((chain) => chain.id === targetChain)
        ?.chainId as number;

      const swapParams = {
        fromToken:
          tokens.find((t) => t.symbol === swapFromToken)?.address || "",
        toToken: tokens.find((t) => t.symbol === swapToToken)?.address || "",
        amountIn: web3.utils.toWei(amount, "ether"),
        targetChain: targetChainId,
        targetAddress: "0xA17Fe331Cb33CdB650dF2651A1b9603632120b7B",
      };

      console.log("Initiating swap with params:", swapParams);

      const success = await initiateCrossChainSwap(swapParams);

      if (success) {
        // Reset form
        setAmount("");
        setReceivedAmount("");
      }
    } catch (error) {
      console.error("Swap error:", error);
      toast.error(`Swap failed: ${(error as Error).message}`);
    }
  }, [
    web3,
    amount,
    swapFromToken,
    swapToToken,
    targetChain,
    initiateCrossChainSwap,
  ]);

  const isGrayText = amount === "";

  return (
    <div className="flex flex-col h-full min-h-[400px]">
      <div className="flex-1">
        <div className="relative rounded-lg border-amber-500/50 mt-8">
          <div className="bg-neutral-800/60 p-4 rounded-lg space-y-6">
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-md font-mono font-semibold text-amber-500">
                  You Pay
                </span>
                <div className="flex items-center gap-2">
                  <Button
                    variant="ghost"
                    size="sm"
                    className="text-xs bg-amber-500/10 text-amber-500 border border-amber-500/10 font-semibold disabled:bg-amber-500/10 disabled:text-amber-500 disabled:opacity-100 disabled:cursor-default flex items-center"
                    disabled={true}
                  >
                    <span className="font-mono inline pt-[2.75px]">Balance: {<NumberTicker value={Number((tokenBalances.find(
                      (b) =>
                        b.address.toLowerCase() ===
                        tokens
                          .find((t) => t.symbol === swapFromToken)
                          ?.address.toLowerCase()
                    )?.balance) || 0 )} decimalPlaces={3} />}
                    </span>
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="text-xs bg-amber-500/10 hover:bg-amber-500/30 text-amber-500 hover:text-amber-400 border border-amber-500/10 font-semibold"
                    onClick={handleMaxClick}
                    disabled={isLoadingBalances}
                  >
                    Max
                  </Button>
                </div>
              </div>

              <div className="flex items-center space-x-2">
                <Input
                  type="number"
                  value={amount}
                  onChange={handleAmountChange}
                  placeholder="0.0"
                  className={`text-2xl font-mono bg-transparent border-none focus-visible:ring-0 focus-visible:ring-offset-0 ${isGrayText
                    ? "text-gray-500 placeholder:text-gray-500"
                    : "text-white"
                    }`}
                  style={{
                    WebkitAppearance: "none",
                    MozAppearance: "textfield",
                  }}
                />
                <Select value={swapFromToken} onValueChange={setSwapFromToken}>
                  <SelectTrigger className="w-[120px] border-amber-500/10 font-semibold data-[state=open]:border-amber-500 focus:ring-0 focus:ring-offset-0 bg-amber-500/10 py-4">
                    <SelectValue>
                      <div className="flex items-center">
                        <span className="w-6 h-6 rounded-full bg-primary text-primary-foreground flex items-center justify-center mr-2">
                          {tokens.find((t) => t.symbol === swapFromToken)?.icon}
                        </span>
                        <span className="font-mono w-12">
                          {swapFromToken.padEnd(4)}
                        </span>
                      </div>
                    </SelectValue>
                  </SelectTrigger>
                  <SelectContent className="bg-black text-white border-amber-500/20">
                    {tokens.map((token) => (
                      <SelectItem
                        key={token.symbol}
                        value={token.symbol}
                        className="font-semibold data-[highlighted]:bg-amber-500/80 data-[highlighted]:text-white"
                      >
                        <div className="flex items-center">
                          <span className="w-6 h-6 rounded-full bg-primary text-primary-foreground flex items-center justify-center mr-2">
                            {token.icon}
                          </span>
                          <span className="font-mono w-12">
                            {token.symbol.padEnd(4)}
                          </span>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="space-y-4 pt-4">
              <div className="flex justify-between items-center">
                <span className="text-md font-mono font-semibold text-sky-500">
                  You Receive
                </span>
                <Select value={targetChain} onValueChange={setTargetChain}>
                  <SelectTrigger className="w-fit border-sky-500/10 font-semibold data-[state=open]:border-sky-500 focus:ring-0 focus:ring-offset-0 bg-sky-500/10 py-4">
                    <SelectValue>
                      {(() => {
                        const chain = chains.find((c) => c.id === targetChain);
                        const Logo = chain?.logo;
                        return (
                          <div className="flex items-center gap-2">
                            {Logo && (
                              <Logo
                                fillColor="rgb(14 165 233)"
                                width={16}
                                height={16}
                                className="opacity-80"
                              />
                            )}
                            <span className="text-xs">{chain?.name}</span>
                          </div>
                        );
                      })()}
                    </SelectValue>
                  </SelectTrigger>
                  <SelectContent className="bg-black text-white border-sky-500/20">
                    {chains
                      .filter((chain) => chain.chainId !== currentChain)
                      .map((chain) => {
                        const Logo = chain.logo;
                        return (
                          <SelectItem
                            key={chain.id}
                            value={chain.id}
                            className="font-semibold data-[highlighted]:bg-sky-500/80 data-[highlighted]:text-white"
                          >
                            <div className="flex items-center gap-2">
                              <Logo
                                fillColor="rgb(14 165 233)"
                                width={16}
                                height={16}
                                className="opacity-80"
                              />
                              <span className="text-xs">{chain.name}</span>
                            </div>
                          </SelectItem>
                        );
                      })}
                  </SelectContent>
                </Select>
              </div>
              <div className="flex items-center space-x-2">
                <Input
                  type="text"
                  value={isCalculating ? "Loading..." : receivedAmount}
                  placeholder="0.0"
                  className={`text-2xl font-mono bg-transparent border-none focus-visible:ring-0 focus-visible:ring-offset-0 ${isCalculating
                    ? "text-sky-500/50 animate-pulse"
                    : receivedAmount === ""
                      ? "text-gray-500 placeholder:text-gray-500"
                      : "text-white"
                    }`}
                  style={{
                    WebkitAppearance: "none",
                    MozAppearance: "textfield",
                  }}
                  readOnly
                />
                <Select value={swapToToken} onValueChange={setSwapToToken}>
                  <SelectTrigger className="w-[120px] border-sky-500/10 font-semibold data-[state=open]:border-sky-500 focus:ring-0 focus:ring-offset-0 bg-sky-500/10 py-4">
                    <SelectValue>
                      <div className="flex items-center">
                        <span className="w-6 h-6 rounded-full bg-primary text-primary-foreground flex items-center justify-center mr-2">
                          {tokens.find((t) => t.symbol === swapToToken)?.icon}
                        </span>
                        <span className="font-mono w-12">
                          {swapToToken.padEnd(4)}
                        </span>
                      </div>
                    </SelectValue>
                  </SelectTrigger>
                  <SelectContent className="bg-black text-white border-sky-500/20">
                    {tokens.map((token) => (
                      <SelectItem
                        key={token.symbol}
                        value={token.symbol}
                        className="font-semibold data-[highlighted]:bg-sky-500/80 data-[highlighted]:text-white"
                      >
                        <div className="flex items-center">
                          <span className="w-6 h-6 rounded-full bg-primary text-primary-foreground flex items-center justify-center mr-2">
                            {token.icon}
                          </span>
                          <span className="font-mono w-12">
                            {token.symbol.padEnd(4)}
                          </span>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>
        </div>
      </div>
      <div className="mt-auto mb-10">
        <Button
          onClick={handleSwap}
          disabled={!amount || amount === "0" || isCalculating}
          className="w-full bg-amber-500/10 
            hover:bg-amber-500/30 
            text-amber-500 
            hover:text-amber-400 
            border 
            border-amber-500/10 
            font-semibold 
            py-2.5
            relative
            overflow-hidden
            group
            disabled:opacity-50 
            disabled:cursor-not-allowed
            disabled:hover:bg-amber-500/10 
            disabled:hover:text-amber-500"
        >
          <div className="flex justify-center items-center">
            <span className="tracking-wide">
              {isCalculating ? "Loading..." : "Swap"}
            </span>
          </div>
        </Button>
      </div>
    </div>
  );
}
