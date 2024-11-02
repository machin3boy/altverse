import React, { useState, useEffect, useCallback } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import NumberTicker from "@/components/magicui/number-ticker";
import coreContractABI from "../../public/ABIs/Altverse.json";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useStorage } from "../storage";
import { toast } from "sonner";
import { AbiItem } from "web3-utils";

export default function USDC() {
  const { web3, currentChain, getPoolBalances, swapALTForUSDC, swapUSDCForALT, fetchTokenBalances } = useStorage();
  const [altcoinFromToken, setAltcoinFromToken] = useState("ALT");
  const [amount, setAmount] = useState("");
  const [receivedAmount, setReceivedAmount] = useState("0");
  const [altPool, setAltPool] = useState(0);
  const [usdcPool, setUsdcPool] = useState(0);
  const [isSwapping, setIsSwapping] = useState(false);
  const [isCalculating, setIsCalculating] = useState(false);
  const [tokenBalances, setTokenBalances] = useState<{
    alt: string;
    altRaw: string;
    usdc: string;
    usdcRaw: string;
  }>({
    alt: "0",
    altRaw: "0",
    usdc: "0",
    usdcRaw: "0"
  });
  const [isLoadingBalances, setIsLoadingBalances] = useState(false);

  const handleAmountChange = (e: any) => {
    const value = e.target.value;

    if (value === "") {
      setAmount("");
      setReceivedAmount("0");
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
    calculateReceivedAmount(value);
  };

  const calculateReceivedAmount = (inputAmount: string) => {
    if (!inputAmount || inputAmount === "0") {
      setReceivedAmount("0");
      return;
    }

    setIsCalculating(true);
    try {
      // For now, using 1:1 conversion rate
      // You can implement your actual calculation logic here
      const calculated = inputAmount;
      setReceivedAmount(calculated);
    } catch (error) {
      console.error("Error calculating received amount:", error);
      setReceivedAmount("0");
    } finally {
      setIsCalculating(false);
    }
  };

  const getUSDCAddress = useCallback((chainId: number) => {
    switch (chainId) {
      case 43113:
        return "0x5425890298aed601595a70ab815c96711a31bc65";
      case 44787:
        return "0x2F25deB3848C207fc8E0c34035B3Ba7fC157602B";
      default:
        console.error("Unknown chain ID for USDC address");
        return null;
    }
  }, []);

  useEffect(() => {
    const loadBalances = async () => {
      if (!web3) return;

      setIsLoadingBalances(true);
      try {
        const accounts = await web3.eth.getAccounts();
        if (accounts[0]) {
          const balances = await fetchTokenBalances(accounts[0]);
          if (balances) {
            const altBalance = balances.find(b =>
              b.address.toLowerCase() === "0xA17Fe331Cb33CdB650dF2651A1b9603632120b7B".toLowerCase()
            );

            const usdcAddress = getUSDCAddress(currentChain);
            if (!usdcAddress) {
              throw new Error("Could not determine USDC address for current chain");
            }

            const usdcBalance = balances.find(b =>
              b.address.toLowerCase() === usdcAddress.toLowerCase()
            );

            setTokenBalances({
              alt: altBalance?.balance || "0",
              altRaw: altBalance?.rawBalance.toString() || "0",
              usdc: usdcBalance?.balance || "0",
              usdcRaw: usdcBalance?.rawBalance.toString() || "0"
            });
          }
        }
      } catch (error) {
        console.error("Error loading balances:", error);
        toast.error("Failed to load balances");
      }
      setIsLoadingBalances(false);
    };

    loadBalances();
  }, [web3, currentChain, fetchTokenBalances, getUSDCAddress]);

  const handleMaxClick = useCallback(() => {
    if (!web3) return;

    const userBalance = altcoinFromToken === "ALT" ? Number(tokenBalances.alt) : Number(tokenBalances.usdc);
    const poolLimit = altcoinFromToken === "ALT" ? usdcPool : altPool;

    // Find the minimum of user balance and pool balances
    const maxAmount = Math.min(userBalance, poolLimit);

    if (maxAmount <= 0) {
      toast.warning("No balance available");
      return;
    }

    setAmount(maxAmount.toString());
    calculateReceivedAmount(maxAmount.toString());
  }, [web3, altcoinFromToken, tokenBalances, altPool, usdcPool]);

  useEffect(() => {
    let mounted = true;

    const fetchBalances = async () => {
      try {
        const balances = await getPoolBalances();
        if (mounted && balances) {
          setAltPool(Number(balances.altBalance));
          setUsdcPool(Number(balances.usdcBalance));
        }
      } catch (error) {
        console.error('Failed to fetch pool balances:', error);
      }
    };

    fetchBalances();
    return () => { mounted = false; };
  }, [currentChain, getPoolBalances]);

  const handleSwap = async () => {
    if (!amount || Number(amount) <= 0) {
      toast.error("Please enter a valid amount");
      return;
    }

    setIsSwapping(true);
    try {
      let success;
      if (altcoinFromToken === "ALT") {
        success = await swapALTForUSDC(amount);
      } else {
        success = await swapUSDCForALT(amount);
      }

      if (success) {
        setAmount("");
        setReceivedAmount("0");

        const balances = await getPoolBalances();
        if (balances) {
          setAltPool(Number(balances.altBalance));
          setUsdcPool(Number(balances.usdcBalance));
        }
      }
    } catch (error: any) {
      console.error("Swap error:", error);
      toast.error(`Swap failed: ${error.message}`);
    } finally {
      setIsSwapping(false);
    }
  };

  return (
    <div className="flex flex-col h-full min-h-[400px]">
      <div className="flex-1">
        <div className="space-y-2 my-2">
          <h4 className="text-md font-bold ml-1">ALT Pool</h4>
          <p className="ml-1 text-md font-semibold font-mono tracking-tighter text-amber-500">
            <NumberTicker value={altPool} decimalPlaces={2} useCommas={true} />
          </p>
          <h4 className="text-md font-bold ml-1 pt-2">USDC Pool</h4>
          <p className="ml-[4px] text-md font-semibold font-mono tracking-tighter text-sky-500">
            <NumberTicker value={usdcPool} decimalPlaces={2} useCommas={true} />
          </p>
        </div>
        <div className="relative rounded-lg border-amber-500/50 mt-7">
          <div className="bg-neutral-800/60 p-4 rounded-lg space-y-6">
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <span className={`text-md font-mono font-semibold ${altcoinFromToken === "USDC" ? "text-sky-500" : "text-amber-500"}`}>
                  You Pay
                </span>
                <div className="flex items-center gap-2">
                  <Button
                    variant="ghost"
                    size="sm"
                    className={`text-xs bg-${altcoinFromToken === "USDC" ? "sky" : "amber"}-500/10 
                      text-${altcoinFromToken === "USDC" ? "sky" : "amber"}-500 
                      border border-${altcoinFromToken === "USDC" ? "sky" : "amber"}-500/10 
                      font-semibold 
                      disabled:bg-${altcoinFromToken === "USDC" ? "sky" : "amber"}-500/10 
                      disabled:text-${altcoinFromToken === "USDC" ? "sky" : "amber"}-500 
                      disabled:opacity-100 
                      disabled:cursor-default 
                      flex items-center`}
                    disabled={true}
                  >
                    <span className="font-mono inline pt-[2.75px]">
                      Balance: {
                        Number(altcoinFromToken === "USDC" ? tokenBalances.usdc : tokenBalances.alt) > 0 ? (
                          <NumberTicker
                            value={Number(altcoinFromToken === "USDC" ? tokenBalances.usdc : tokenBalances.alt)}
                            decimalPlaces={3}
                          />
                        ) : (
                          <span>0.000</span>
                        )
                      }
                    </span>
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    className={`text-xs ${altcoinFromToken === "USDC"
                      ? "bg-sky-500/10 hover:bg-sky-500/30 text-sky-500 hover:text-sky-400 border border-sky-500/10"
                      : "bg-amber-500/10 hover:bg-amber-500/30 text-amber-500 hover:text-amber-400 border border-amber-500/10"
                      } font-semibold`}
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
                  placeholder="0"
                  className={`text-2xl pl-2 text-left font-mono bg-transparent border-none focus-visible:ring-0 focus-visible:ring-offset-0 ${amount === "" ? "text-gray-500 placeholder:text-gray-500" : "text-white"}`}
                  style={{
                    WebkitAppearance: "none",
                    MozAppearance: "textfield",
                  }}
                />
                <Select
                  value={altcoinFromToken}
                  onValueChange={setAltcoinFromToken}
                >
                  <SelectTrigger
                    className={`w-[120px] font-semibold data-[state=open]:border-${altcoinFromToken === "USDC" ? "sky" : "amber"
                      }-500 focus:ring-0 focus:ring-offset-0 bg-${altcoinFromToken === "USDC" ? "sky" : "amber"
                      }-500/10 border-${altcoinFromToken === "USDC" ? "sky" : "amber"
                      }-500/10 py-4`}
                  >
                    <SelectValue>
                      <div className="flex items-center">
                        <span className="w-6 h-6 rounded-full bg-primary text-primary-foreground flex items-center justify-center mr-2">
                          {altcoinFromToken === "USDC" ? "$" : "A"}
                        </span>
                        <span className="font-mono w-12">
                          {altcoinFromToken.padEnd(4)}
                        </span>
                      </div>
                    </SelectValue>
                  </SelectTrigger>
                  <SelectContent className={`bg-black text-white border-${altcoinFromToken === "USDC" ? "sky" : "amber"}-500/20`}>
                    <SelectItem
                      value="USDC"
                      className="font-semibold data-[highlighted]:bg-sky-500/80 data-[highlighted]:text-white"
                    >
                      <div className="flex items-center">
                        <span className="w-6 h-6 rounded-full bg-primary text-primary-foreground flex items-center justify-center mr-2">
                          $
                        </span>
                        <span className="font-mono w-12">USDC</span>
                      </div>
                    </SelectItem>
                    <SelectItem
                      value="ALT"
                      className="font-semibold data-[highlighted]:bg-amber-500/80 data-[highlighted]:text-white"
                    >
                      <div className="flex items-center">
                        <span className="w-6 h-6 rounded-full bg-primary text-primary-foreground flex items-center justify-center mr-2">
                          A
                        </span>
                        <span className="font-mono w-12">ALT </span>
                      </div>
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="space-y-4 pt-4">
              <span className={`text-md font-mono font-semibold ${altcoinFromToken === "USDC" ? "text-amber-500" : "text-sky-500"}`}>
                You Receive
              </span>
              <div className="flex items-center space-x-2">
                <div className="w-full relative">
                  {!Number(receivedAmount) && (
                    <span className="absolute inset-0 pl-2 text-2xl font-mono text-gray-500">0</span>
                  )}
                  <NumberTicker
                    value={receivedAmount && Number(receivedAmount) ? Number(receivedAmount) : 0}
                    decimalPlaces={(() => {
                      const num = Number(receivedAmount);
                      if (num === 0 || num >= 1) return 3;
                      const decimalStr = num.toFixed(6).split('.')[1];
                      const firstNonZeroIndex = decimalStr.split('').findIndex(digit => digit !== '0');
                      return Math.min(Math.max(firstNonZeroIndex + 2, 3), 6);
                    })()}
                    className={`text-2xl pl-2 pb-0 font-mono ${receivedAmount === "0" ? "text-gray-500" : "text-white"}`}
                  />
                </div>
                <div className={`h-9 font-mono font-bold text-sm w-[120px] bg-${altcoinFromToken === "USDC" ? "amber" : "sky"}-500/10 rounded-md flex items-center px-3 border border-${altcoinFromToken === "USDC" ? "amber" : "sky"}-500/10`}>
                  <div className="flex items-center">
                    <span className="w-6 h-6 rounded-full bg-primary text-primary-foreground flex items-center justify-center mr-3.5">
                      {altcoinFromToken === "USDC" ? "A" : "$"}
                    </span>
                    <span className="font-mono w-16 pt-[2.25px]">
                      {(altcoinFromToken === "USDC" ? "ALT" : "USDC").padEnd(4)}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      <div className="mt-auto mb-10">
        <Button
          onClick={handleSwap}
          disabled={!amount ||
            amount === "0" ||
            isCalculating ||
            isSwapping ||
            Math.abs(Number(receivedAmount)) < 1e-8}
          className={`w-full ${altcoinFromToken === "USDC"
            ? "bg-sky-500/10 hover:bg-sky-500/30 text-sky-500 hover:text-sky-400 border border-sky-500/10"
            : "bg-amber-500/10 hover:bg-amber-500/30 text-amber-500 hover:text-amber-400 border border-amber-500/10"
            } font-semibold py-2.5 relative overflow-hidden group disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-amber-500/10 disabled:hover:text-amber-500`}
        >
          <div className="flex justify-center items-center">
            <span className="tracking-wide">
              {isSwapping ? "Swapping..." : (isCalculating ? "Loading..." : "Swap")}
            </span>
          </div>
        </Button>
      </div>
    </div>
  );
}