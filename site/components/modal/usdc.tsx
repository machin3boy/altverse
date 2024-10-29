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
  const [receivedAmount, setReceivedAmount] = useState("");
  const [altPool, setAltPool] = useState(0);
  const [usdcPool, setUsdcPool] = useState(0);
  const [isSwapping, setIsSwapping] = useState(false);
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
      return;
    }

    if (value === "0") {
      setAmount("0");
      return;
    }

    if (!isNaN(value) && parseFloat(value) >= 0) {
      setAmount(
        value.startsWith("0") && !value.startsWith("0.")
          ? value.slice(1)
          : value
      );
    }
  };

  const getUSDCAddress = useCallback((chainId: number) => {
    switch (chainId) {
      case 43113: // AVAX Fuji
        return "0x5425890298aed601595a70ab815c96711a31bc65";
      case 44787: // Celo Alfajores
        return "0x2F25deB3848C207fc8E0c34035B3Ba7fC157602B";
      default:
        console.error("Unknown chain ID for USDC address");
        return null;
    }
  }, []);

    // Fetch user balances
    useEffect(() => {
      const loadBalances = async () => {
        if (!web3) return;
        
        setIsLoadingBalances(true);
        try {
          const accounts = await web3.eth.getAccounts();
          if (accounts[0]) {
            const balances = await fetchTokenBalances(accounts[0]);
            if (balances) {
              // Find ALT balance
              const altBalance = balances.find(b => 
                b.address.toLowerCase() === "0xA17Fe331Cb33CdB650dF2651A1b9603632120b7B".toLowerCase()
              );
              
              // Get USDC balance using chain-specific address
              const usdcAddress = getUSDCAddress(currentChain);
              if (!usdcAddress) {
                throw new Error("Could not determine USDC address for current chain");
              }
  
              const usdcBalance = balances.find(b => 
                b.address.toLowerCase() === usdcAddress.toLowerCase()
              );
  
              console.log("Found balances:", {
                alt: altBalance?.balance || "0",
                usdc: usdcBalance?.balance || "0",
                usdcAddress,
                currentChain
              });
  
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
  
      const balance = altcoinFromToken === "ALT" ? tokenBalances.alt : tokenBalances.usdc;
      if (balance === "0") {
        toast.warning("No balance available");
        return;
      }
  
      setAmount(balance);
    }, [web3, altcoinFromToken, tokenBalances]);

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
        // Handle error appropriately
      }
    };
  
    fetchBalances();
  
    return () => {
      mounted = false;
    };
  }, [currentChain]); // Add currentChain to dependency array

  useEffect(() => {
    if (amount === "") {
      setReceivedAmount("");
      return;
    }
    // 1:1 conversion (adjusted for decimals)
    setReceivedAmount(amount);
  }, [amount]);

  useEffect(() => {
    if (amount === "") {
      setReceivedAmount("");
      return;
    }
    // For now, 1:1 conversion (adjusted for decimals)
    setReceivedAmount(amount);
  }, [amount]);

  const handleSwap = async () => {
    if (!amount || Number(amount) <= 0) {
      toast.error("Please enter a valid amount");
      return;
    }

    setIsSwapping(true);
    try {
      let success;
      if (altcoinFromToken === "ALT") {
        // Swapping ALT to USDC
        success = await swapALTForUSDC(amount);
      } else {
        // Swapping USDC to ALT
        success = await swapUSDCForALT(amount);
      }

      if (success) {
        // Reset form
        setAmount("");
        setReceivedAmount("");
        
        // Refresh pool balances
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

  const isGrayText = amount === "";

  return (
    <div className="flex flex-col h-full min-h-[400px]">
      <div className="flex-1">
        <div className="space-y-2 my-2">
          <h4 className="text-md font-bold ml-1">ALT Pool</h4>
          <p className="ml-1 text-md font-semibold font-mono tracking-tighter text-amber-500">
            <NumberTicker value={altPool} decimalPlaces={2} />
          </p>
          <h4 className="text-md font-bold ml-1 pt-2">USDC Pool</h4>
          <p className="ml-[4px] text-md font-semibold font-mono tracking-tighter text-sky-500">
            <NumberTicker value={usdcPool} decimalPlaces={2} />
          </p>
        </div>
        <div className="relative rounded-lg border-amber-500/50 mt-7">
          <div className="bg-neutral-800/60 p-4 rounded-lg space-y-6">
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <span
                  className={`text-md font-mono font-semibold ${
                    altcoinFromToken === "USDC"
                      ? "text-sky-500"
                      : "text-amber-500"
                  }`}
                >
                  You Pay
                </span>
                <Button
                  variant="ghost"
                  size="sm"
                  className={`text-xs ${
                    altcoinFromToken === "USDC"
                      ? "bg-sky-500/10 hover:bg-sky-500/30 text-sky-500 hover:text-sky-400 border border-sky-500/10"
                      : "bg-amber-500/10 hover:bg-amber-500/30 text-amber-500 hover:text-amber-400 border border-amber-500/10"
                  } font-semibold`}
                  onClick={handleMaxClick}
                  disabled={isLoadingBalances}
                >
                  {isLoadingBalances ? "Loading..." : "max"}
                </Button>
              </div>

              {/* Balance display */}
              <div className="text-xs text-gray-400 font-mono flex items-center gap-1">
                Balance:{" "}
                <span className="flex items-center gap-1">
                  {altcoinFromToken === "USDC" ? "$" : "A"}{" "}
                  {altcoinFromToken === "USDC" ? tokenBalances.usdc : tokenBalances.alt}
                </span>
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
                <Select
                  value={altcoinFromToken}
                  onValueChange={setAltcoinFromToken}
                >
                  <SelectTrigger
                    className={`w-[120px] font-semibold data-[state=open]:border-${
                      altcoinFromToken === "USDC" ? "sky" : "amber"
                    }-500 focus:ring-0 focus:ring-offset-0 bg-${
                      altcoinFromToken === "USDC" ? "sky" : "amber"
                    }-500/10 border-${
                      altcoinFromToken === "USDC" ? "sky" : "amber"
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
                  <SelectContent
                    className={`bg-black text-white border-${
                      altcoinFromToken === "USDC" ? "sky" : "amber"
                    }-500/20`}
                  >
                    <SelectItem
                      value="USDC"
                      className={`font-semibold data-[highlighted]:bg-sky-500/80 data-[highlighted]:text-white`}
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
              <span
                className={`text-md font-mono font-semibold ${
                  altcoinFromToken === "USDC"
                    ? "text-amber-500"
                    : "text-sky-500"
                }`}
              >
                You Receive
              </span>
              <div className="flex items-center space-x-2">
                <Input
                  type="number"
                  value={amount}
                  placeholder="0.0"
                  className={`text-2xl font-mono bg-transparent border-none focus-visible:ring-0 focus-visible:ring-offset-0 ${
                    amount === ""
                      ? "text-gray-500 placeholder:text-gray-500"
                      : "text-white"
                  }`}
                  style={{
                    WebkitAppearance: "none",
                    MozAppearance: "textfield",
                  }}
                  readOnly
                />
                <div
                  className={`h-9 w-[120px] bg-${
                    altcoinFromToken === "USDC" ? "amber" : "sky"
                  }-500/10 rounded-md flex items-center px-3 border border-${
                    altcoinFromToken === "USDC" ? "amber" : "sky"
                  }-500/10 font-mono font-bold text-sm`}
                >
                  <div className="flex items-center">
                    <span className="w-6 h-6 rounded-full bg-primary text-primary-foreground flex items-center justify-center mr-3.5">
                      {altcoinFromToken === "USDC" ? "A" : "$"}
                    </span>
                    <span className="font-mono w-16 pt-[2.25px]">
                      {(altcoinFromToken === "USDC" ? "ALT " : "USDC").padEnd(
                        4
                      )}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      <div className="mt-auto space-y-4 mb-4">
        <Button
          onClick={handleSwap}
          disabled={!amount || isSwapping || Number(amount) <= 0}
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
                {isSwapping ? "Swapping..." : `Swap ${altcoinFromToken} to ${altcoinFromToken === "USDC" ? "ALT" : "USDC"}`}
              </span>
              {!isSwapping && (
                <span className="absolute right-0 opacity-0 group-hover:opacity-100 transform translate-x-2 group-hover:translate-x-0 transition-all duration-200">
                  ⇆
                </span>
              )}
            </div>
          </div>
        </Button>
      </div>
    </div>
  );
}
