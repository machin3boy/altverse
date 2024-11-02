import React, { useState, useEffect } from "react";
import { useStorage } from "../storage";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogClose,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { X } from "lucide-react";
import { Input } from "@/components/ui/input";
import NumberTicker from "@/components/magicui/number-ticker";

interface Pool {
  token: string;
  tokenSymbol: string;
  tokenReserve: string;
  altReserve: string;
  totalShares: string;
  userShares: string;
}

interface IncreaseLiquidityModalProps {
  pool: Pool;
  onSuccess?: () => void;
}

const IncreaseLiquidityModal: React.FC<IncreaseLiquidityModalProps> = ({
  pool,
  onSuccess,
}) => {
  const {
    web3,
    calculateOptimalLiquidity,
    addLiquidity,
    fetchTokenBalances,
    tokens,
    currentChain,
  } = useStorage();
  const [open, setOpen] = useState(false);
  const [tokenAmount, setTokenAmount] = useState<string>("");
  const [altAmount, setAltAmount] = useState<string>("");
  const [isLoading, setIsLoading] = useState(false);
  const [tokenBalance, setTokenBalance] = useState<string>("");
  const [altBalance, setAltBalance] = useState<string>("");

  useEffect(() => {
    setTokenAmount("");
    setAltAmount("");
    setTokenBalance("");
    setAltBalance("");
    setOpen(false); // Close modal on chain change
  }, [currentChain]);

  // Fetch token balance when modal opens
  useEffect(() => {
    const getBalances = async () => {
      if (!web3 || !open) return;

      try {
        const accounts = await web3.eth.getAccounts();
        if (!accounts[0]) return;

        const balances = await fetchTokenBalances(accounts[0]);

        const tokenBal = balances?.find(
          (b) => b.address.toLowerCase() === pool.token.toLowerCase()
        );
        if (tokenBal) {
          setTokenBalance(tokenBal.balance);
        }

        const altBal = balances?.find((b) => b.symbol === "ALT");
        if (altBal) {
          setAltBalance(altBal.balance);
        }
      } catch (error) {
        console.error("Error fetching balances:", error);
      }
    };

    getBalances();
  }, [web3, open, pool.token, currentChain, fetchTokenBalances]);

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
      if (!web3 || !tokenAmount || Number(tokenAmount) <= 0) {
        setAltAmount("");
        return;
      }

      try {
        const tokenWei = web3.utils.toWei(tokenAmount, "ether");
        const result = await calculateOptimalLiquidity({
          tokenAddress: pool.token,
          tokenAmount: tokenWei,
        });
        setAltAmount(web3.utils.fromWei(result.altAmount, "ether"));
      } catch (error) {
        console.error("Error calculating ALT amount:", error);
        setAltAmount("");
      }
    };

    calculateAlt();
  }, [web3, tokenAmount, pool.token, currentChain, calculateOptimalLiquidity]);

  const handleAddLiquidity = async () => {
    if (!web3 || !tokenAmount || !altAmount) return;

    setIsLoading(true);
    try {
      const tokenWei = web3.utils.toWei(tokenAmount, "ether");
      const altWei = web3.utils.toWei(altAmount, "ether");

      const success = await addLiquidity({
        tokenAddress: pool.token,
        tokenAmount: tokenWei,
        altAmount: altWei,
      });

      if (success) {
        // Refresh user's positions
        onSuccess?.(); // Trigger polling
        setOpen(false);
      }
    } catch (error) {
      console.error("Error increasing liquidity:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSetMax = () => {
    if (tokenBalance) {
      setTokenAmount(tokenBalance);
    }
  };

  const getChainName = (chainId: number) => {
    switch (chainId) {
      case 43113:
        return "Avalanche Fuji";
      case 44787:
        return "Celo Alfajores";
      default:
        return "Unknown Chain";
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button
          variant="secondary"
          className="w-full h-8 text-sm bg-amber-500/10 hover:bg-amber-500/30 text-amber-500 font-semibold hover:text-amber-400 border border-amber-500/10"
        >
          Increase Liquidity
        </Button>
      </DialogTrigger>
      <DialogContent className="bg-zinc-950 border-2 border-amber-500/40 sm:max-w-[400px] rounded-lg pt-4">
        <DialogHeader className="flex flex-row justify-between items-center mb-2">
          <DialogTitle className="text-white text-lg">Increase Liquidity</DialogTitle>
          <button
            type="button"
            className="rounded-sm bg-amber-500/10 hover:bg-amber-500/30 border border-amber-500/10 w-7 h-7 flex items-center justify-center transition-all duration-200"
            onClick={() => setOpen(false)}
          >
            <span className="sr-only">Close</span>
            <X
              className="h-5 w-5 text-amber-500 hover:text-amber-400 transition-colors duration-200"
              aria-hidden="true"
              strokeWidth={2}
            />
          </button>
        </DialogHeader>
        <div className="space-y-6 text-white">
          <div className="space-y-2">
            <div className="flex justify-between items-center">
              <label className="text-sm text-white font-semibold ml-1">Token Amount</label>
              {tokenBalance && (
                <div className="text-sm text-white font-mono font-semibold">
                  Balance: {Number(tokenBalance).toFixed(3)}
                </div>
              )}
            </div>
            <Input
              type="number"
              value={tokenAmount}
              onChange={(e) => handleTokenAmountChange(e.target.value)}
              className="border border-amber-500/20 text-white text-base font-mono font-semibold bg-zinc-900 h-11 px-3"
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
            <div className="border border-amber-500/20 bg-zinc-900 rounded-md h-11 px-3 flex items-center">
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
          <Button
            onClick={handleAddLiquidity}
            disabled={isLoading || !tokenAmount || !altAmount || Number(tokenAmount) <= 0}
            className="w-full bg-amber-500/10 hover:bg-amber-500/30 text-amber-500 font-semibold border border-amber-500/10 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isLoading ? "Processing..." : "Increase Liquidity"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default IncreaseLiquidityModal;