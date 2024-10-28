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

const chains = [
  { name: "Celo Testnet", id: "celo", chainId: 43113 },
  { name: "Fuji Testnet", id: "fuji", chainId: 44787 },
];

export default function Swap() {
  const { initiateCrossChainSwap, calculateCrossChainAmount } = useStorage();

  const { web3, setStorage, getStorage } = useStorage();
  const [swapFromToken, setSwapFromToken] = useState("ALT");
  const [swapToToken, setSwapToToken] = useState("wBTC");
  const [amount, setAmount] = useState("");
  const [receivedAmount, setReceivedAmount] = useState("");
  const [isCalculating, setIsCalculating] = useState(false);
  const [currentChain, setCurrentChain] = useState(
    parseInt(getStorage("currentChain") || "44787")
  );
  const [targetChain, setTargetChain] = useState(() => {
    return "";
  });
  const [currentCalculation, setCurrentCalculation] = useState<AbortController | null>(null);


  const destinationChain = useMemo(() => {
    return currentChain === 44787
      ? { name: "Fuji Testnet", id: "fuji", chainId: 43113 }
      : { name: "Celo Testnet", id: "celo", chainId: 44787 };
  }, [currentChain]);

  useEffect(() => {
    const initializeChain = async () => {
      if (web3) {
        try {
          const chainId = await web3.eth.getChainId();
          setCurrentChain(Number(chainId));
        } catch (error) {
          console.error("Error getting chain ID:", error);
        }
      }
    };

    initializeChain();
  }, [web3]);

  useEffect(() => {
    debugger;
    const currentChainFromStorage = getStorage("currentChain");
    console.log("currentChainFromStorage", currentChainFromStorage);
  }, [getStorage, web3]);

  useEffect(() => {
    const setInitialTargetChain = async () => {
      if (web3) {
        try {
          const chainId = await web3.eth.getChainId();
          if (Number(chainId) === 44787) {
            setTargetChain("fuji");
          } else if (Number(chainId) === 43113) {
            setTargetChain("celo");
          }
        } catch (error) {
          console.error("Error getting chain ID:", error);
          setTargetChain("fuji");
        }
      }
    };

    setInitialTargetChain();
  }, [web3]);

  const calculateReceivedAmount = useCallback(async (inputAmount: string, abortController: AbortController) => {
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

        const targetChainId = parseInt(targetChain);
        
        console.warn("Calculating received amount with params:", {
          fromToken: tokens.find((t) => t.symbol === swapFromToken)?.address || "",
          toToken: tokens.find((t) => t.symbol === swapToToken)?.address || "",
          amountIn: web3.utils.toWei(inputAmount, "ether"),
          targetChain: targetChainId,
          currentChain: currentChain,
          isCrossChain: currentChain !== targetChainId
        });

        const result = await calculateCrossChainAmount({
          fromToken: tokens.find((t) => t.symbol === swapFromToken)?.address || "",
          toToken: tokens.find((t) => t.symbol === swapToToken)?.address || "",
          amountIn: web3.utils.toWei(inputAmount, "ether"),
          targetChain: targetChainId,
        });
  
        // Check if calculation was aborted
        if (abortController.signal.aborted) {
          return;
        }
  
        if (result) {
          const formattedOutput = web3.utils.fromWei(result.estimatedOutput, "ether");
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
  }, [swapFromToken, swapToToken, targetChain, calculateCrossChainAmount, web3, currentChain]);


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
    debugger;
    if (!web3) {
      toast.error("Please connect your wallet");
      return;
    }

    if (!amount || amount === "0") {
      toast.error("Please enter an amount");
      return;
    }

    if (!destinationChain) {
      toast.error("Please select a destination chain");
      return;
    }

    try {
      // Get user's address
      const accounts = await web3.eth.getAccounts();
      if (!accounts[0]) {
        toast.error("No account connected");
        return;
      }

      const swapParams = {
        fromToken:
          tokens.find((t) => t.symbol === swapFromToken)?.address || "",
        toToken: tokens.find((t) => t.symbol === swapToToken)?.address || "",
        amountIn: web3.utils.toWei(amount, "ether"),
        targetChain: destinationChain.chainId,
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
    destinationChain,
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
                <Button
                  variant="ghost"
                  size="sm"
                  className="text-xs bg-amber-500/10 hover:bg-amber-500/20 text-amber-500"
                >
                  max
                </Button>
              </div>
              <div className="flex items-center space-x-2">
                <Input
                  type="number"
                  value={amount}
                  onChange={handleAmountChange}
                  placeholder="0.0"
                  className={`text-2xl font-mono bg-transparent border-none focus-visible:ring-0 focus-visible:ring-offset-0 ${
                    isGrayText
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
              <span className="text-md font-mono font-semibold text-sky-500">
                You Receive
              </span>
              <div className="flex items-center space-x-2">
                <Input
                  type="text"
                  value={isCalculating ? "Calculating..." : receivedAmount}
                  placeholder="0.0"
                  className={`text-2xl font-mono bg-transparent border-none focus-visible:ring-0 focus-visible:ring-offset-0 ${
                    isCalculating
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
                  <SelectTrigger className="w-[120px] border-sky-500/10 font-semibold data-[state=open]:border-amber-500 focus:ring-0 focus:ring-offset-0 bg-sky-500/10 py-4">
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
      <div className="mt-auto space-y-4 mb-10">
      <Select 
        value={targetChain} 
        onValueChange={setTargetChain}
      >
        <SelectTrigger className="w-full font-semibold data-[state=open]:border-amber-500 bg-neutral-800/70 border-amber-500/20 focus:ring-0 focus:ring-offset-0 text-white">
          <SelectValue placeholder="Select chain" />
        </SelectTrigger>
        <SelectContent className="bg-black text-white border-amber-500/20">
          {chains.map((chain) => {
            const isSameChain = currentChain === chain.chainId;
            return (
              <SelectItem
                key={chain.id}
                value={chain.id}
                className="font-semibold data-[highlighted]:bg-amber-500/80 data-[highlighted]:text-white"
              >
                <div className="flex items-center justify-between w-full">
                  <span>{chain.name}</span>
                  {isSameChain && (
                    <span className="text-xs text-amber-500">(Current)</span>
                  )}
                </div>
              </SelectItem>
            );
          })}
        </SelectContent>
      </Select>
        <Button
          onClick={handleSwap}
          disabled={!amount || amount === "0" || isCalculating}
          className="w-full bg-gradient-to-r from-amber-900 to-amber-800 
      hover:from-amber-800 hover:to-amber-700
      active:from-amber-950 active:to-amber-900
      border-amber-500/20 hover:border-amber-500/40
      text-white hover:text-amber-100
      shadow-lg hover:shadow-amber-900/20
      transition-all duration-200
      font-semibold
      py-2.5
      relative
      overflow-hidden
      group
      active:ring-amber-500/20
      disabled:opacity-50 disabled:cursor-not-allowed
      before:absolute before:inset-0 before:bg-gradient-to-r before:from-amber-500/0 before:via-amber-500/30 before:to-amber-500/0 
      before:translate-x-[-200%] hover:before:translate-x-[200%] before:transition-transform before:duration-1000
      before:blur-md"
        >
          <div className="absolute inset-0 bg-gradient-to-r from-amber-500/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-200" />
          <div className="relative w-full px-8">
            <div className="flex justify-center items-center">
              <span className="tracking-wide">
                {isCalculating ? "Calculating..." : "Swap"}
              </span>
              <span className="absolute right-0 opacity-0 group-hover:opacity-100 transform translate-x-2 group-hover:translate-x-0 transition-all duration-200">
                ⇆
              </span>
            </div>
          </div>
        </Button>
      </div>
    </div>
  );
}
