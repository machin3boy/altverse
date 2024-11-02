import React, { useState, useEffect } from "react";
import { useStorage } from "../storage";
import {
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogClose,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { X } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Droplets } from "lucide-react";
import NumberTicker from "@/components/magicui/number-ticker";

interface Pool {
  token: string;
  tokenSymbol: string;
  tokenReserve: string;
  altReserve: string;
  totalShares: string;
  userShares: string;
}

interface AddLiquidityModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess?: () => void; // Add this
}

const AddLiquidityModal = ({
  open,
  onOpenChange,
  onSuccess,
}: AddLiquidityModalProps) => {
  const {
    web3,
    tokens,
    calculateOptimalLiquidity,
    addLiquidity,
    fetchTokenBalances,
  } = useStorage();

  const [selectedToken, setSelectedToken] = useState<string>("");
  const [tokenAmount, setTokenAmount] = useState<string>("");
  const [altAmount, setAltAmount] = useState<string>("");
  const [isLoading, setIsLoading] = useState(false);
  const [isExistingPool, setIsExistingPool] = useState(false);
  const [tokenBalance, setTokenBalance] = useState<string>("");
  const [altBalance, setAltBalance] = useState<string>("");

  // Check if pool exists when token is selected
  useEffect(() => {
    const getBalances = async () => {
      if (!web3 || !selectedToken) return;

      try {
        const accounts = await web3.eth.getAccounts();
        if (!accounts[0]) return;

        const balances = await fetchTokenBalances(accounts[0]);

        // Get selected token balance
        const tokenBal = balances?.find(
          (b) => b.address.toLowerCase() === selectedToken.toLowerCase()
        );
        if (tokenBal) {
          setTokenBalance(tokenBal.balance);
        }

        // Get ALT balance
        const altBal = balances?.find((b) => b.symbol === "ALT");
        if (altBal) {
          setAltBalance(altBal.balance);
        }
      } catch (error) {
        console.error("Error fetching balances:", error);
      }
    };

    getBalances();
  }, [web3, selectedToken, fetchTokenBalances]);

  const handleTokenAmountChange = (value: string) => {
    // Remove any non-numeric characters except decimal point
    const sanitizedValue = value.replace(/[^0-9.]/g, "");

    // Prevent multiple decimal points
    const decimalPoints = sanitizedValue.split(".").length - 1;
    if (decimalPoints > 1) return;

    // Limit decimal places to 18 (maximum for ERC20 tokens)
    const parts = sanitizedValue.split(".");
    if (parts[1] && parts[1].length > 18) return;

    setTokenAmount(sanitizedValue);
  };

  useEffect(() => {
    const calculateAlt = async () => {
      if (!web3 || !selectedToken || !tokenAmount || Number(tokenAmount) <= 0) {
        setAltAmount("");
        return;
      }

      try {
        const tokenWei = web3.utils.toWei(tokenAmount, "ether");

        const result = await calculateOptimalLiquidity({
          tokenAddress: selectedToken,
          tokenAmount: tokenWei,
        });

        setAltAmount(web3.utils.fromWei(result.altAmount, "ether"));
      } catch (error) {
        console.error("Error calculating ALT amount:", error);
        setAltAmount("");
      }
    };

    calculateAlt();
  }, [web3, selectedToken, tokenAmount, calculateOptimalLiquidity]);

  const handleTokenSelect = (value: string) => {
    setSelectedToken(value);
    setTokenAmount("");
    setAltAmount("");
  };

  const handleAddLiquidity = async () => {
    if (!web3 || !selectedToken || !tokenAmount || !altAmount) return;

    setIsLoading(true);
    try {
      const tokenWei = web3.utils.toWei(tokenAmount, "ether");
      const altWei = web3.utils.toWei(altAmount, "ether");

      const success = await addLiquidity({
        tokenAddress: selectedToken,
        tokenAmount: tokenWei,
        altAmount: altWei,
      });

      if (success) {
        onSuccess?.(); // Trigger polling
        onOpenChange(false);
      }
    } catch (error) {
      console.error("Error adding liquidity:", error);
    } finally {
      setIsLoading(false);
    }
  };

  // Filter available tokens - only show supported tokens excluding ALT
  const availableTokens = tokens.filter(
    (t) => t.symbol !== "ALT" && ["wBTC", "wETH", "wLINK"].includes(t.symbol)
  );

  return (
    <DialogContent className="bg-zinc-950 border-2 border-amber-500/40 sm:max-w-[400px] rounded-lg pt-4">
      <DialogHeader className="flex flex-row justify-between items-center mb-4">
        <DialogTitle className="text-white text-lg">
          {isExistingPool ? "Increase Liquidity" : "Add Liquidity"}
        </DialogTitle>
        <button
          type="button"
          className="rounded-sm bg-amber-500/10 hover:bg-amber-500/30 border border-amber-500/10 w-7 h-7 flex items-center justify-center transition-all duration-200"
          onClick={() => onOpenChange(false)}
        >
          <span className="sr-only">Close</span>
          <X
            className="h-5 w-5 text-amber-500 hover:text-amber-400 transition-colors duration-200"
            aria-hidden="true"
            strokeWidth={2}
          />
        </button>
      </DialogHeader>
      <div className="space-y-4 text-white">
        <div className="space-y-2">
          <Select onValueChange={handleTokenSelect} value={selectedToken}>
            <SelectTrigger className="w-full border border-amber-500/20 font-semibold data-[state=open]:border-amber-500 focus:ring-0 focus:ring-offset-0 bg-amber-500/5 h-9 px-3">
              <SelectValue placeholder="Select Token">
                {selectedToken && (
                  <div className="flex items-center">
                    <img
                      src={tokens.find(t => t.address.toLowerCase() === selectedToken.toLowerCase())?.logoSrc}
                      className="w-6 h-6 mr-2 -ml-[2.75px]"
                      alt=""
                    />
                    <span className="font-mono">
                      {tokens.find(t => t.address.toLowerCase() === selectedToken.toLowerCase())?.symbol}
                    </span>
                  </div>
                )}
              </SelectValue>
            </SelectTrigger>
            <SelectContent className="bg-zinc-950 text-white border border-amber-500/20">
              {availableTokens.map((token) => (
                <SelectItem
                  key={token.address}
                  value={token.address}
                  className="font-semibold data-[highlighted]:bg-amber-500/40 data-[highlighted]:text-white"
                >
                  <div className="flex items-center">
                    <img
                      src={token.logoSrc}
                      className="w-6 h-6 mr-2"
                      alt=""
                    />
                    <span className="font-mono">
                      {token.symbol.padEnd(4)}
                    </span>
                  </div>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <div className="flex justify-between items-center">
            <label className="text-sm text-white font-semibold ml-1">Token Amount</label>
            {selectedToken && tokenBalance && (
              <div className="text-sm text-white font-mono font-semibold -mb-1">
                Balance: {Number(tokenBalance).toFixed(3)}
              </div>
            )}
          </div>
          <Input
            type="text"
            value={tokenAmount}
            onChange={(e) => handleTokenAmountChange(e.target.value)}
            className="border border-amber-500/20 text-white text-base font-mono font-semibold bg-amber-500/5 h-9 px-3 focus:border-amber-500 focus:outline-none transition-colors duration-200"
            placeholder="0.0"
            style={{
              WebkitAppearance: "none",
              MozAppearance: "textfield",
            }}
          />
        </div>

        <div className="space-y-2">
          <div className="flex justify-between items-center">
            <label className="text-sm text-white font-semibold ml-1">ALT Amount</label>
            {altBalance && (
              <div className="text-sm text-white font-mono font-semibold">
                Balance: {Number(altBalance).toFixed(3)}
              </div>
            )}
          </div>
          <div className="border border-amber-500/20 bg-amber-500/5 rounded-md h-9 px-3 flex items-center">
            {altAmount === "" ? (
              <span className="font-mono font-semibold text-base text-amber-500">0.0</span>
            ) : (
              <NumberTicker
                value={Number(altAmount)}
                decimalPlaces={3}
                useCommas={false}
                direction="up"
                className="font-mono font-semibold text-base text-amber-500"
              />
            )}
          </div>
        </div>

        <div className="pt-4">
          <Button
            onClick={handleAddLiquidity}
            disabled={isLoading || !selectedToken || !tokenAmount || !altAmount || Number(tokenAmount) <= 0}
            className="w-full bg-amber-500/10 hover:bg-amber-500/30 text-amber-500 font-semibold border border-amber-500/10 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isLoading ? "Processing..." : (isExistingPool ? "Increase Liquidity" : "Add Liquidity")}
          </Button>
        </div>
      </div>
    </DialogContent>
  );
};

export default AddLiquidityModal;