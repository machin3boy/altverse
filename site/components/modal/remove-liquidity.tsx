import React, { useState, useEffect } from 'react';
import { X } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogClose } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { toast } from "sonner";
import { Droplets } from "lucide-react";
import { useStorage } from "../storage";

interface Pool {
  token: string;
  tokenSymbol: string;
  tokenReserve: string;
  altReserve: string;
  totalShares: string;
  userShares: string;
}

interface RemoveLiquidityModalProps {
  pool: Pool;
  onSuccess?: () => void;
}

const RemoveLiquidityModal: React.FC<RemoveLiquidityModalProps> = ({
  pool,
  onSuccess,
}) => {
  const { web3, removeLiquidity, currentChain } = useStorage();

  const [open, setOpen] = useState(false);
  const [percentage, setPercentage] = useState([0]);
  const [shares, setShares] = useState("0");
  const [tokenAmount, setTokenAmount] = useState("0");
  const [altAmount, setAltAmount] = useState("0");
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    setPercentage([0]);
    setShares("0");
    setTokenAmount("0");
    setAltAmount("0");
    setOpen(false);
  }, [currentChain]);

  useEffect(() => {
    if (!web3) return;

    try {
      const shareAmount = (percentage[0] * Number(pool.userShares)) / 100;
      const sharesFormatted = web3.utils.fromWei(
        BigInt(Math.floor(shareAmount)).toString(),
        "ether"
      );
      setShares(sharesFormatted);

      const tokenAmountRaw = (shareAmount * Number(pool.tokenReserve)) / Number(pool.totalShares);
      const altAmountRaw = (shareAmount * Number(pool.altReserve)) / Number(pool.totalShares);

      const formattedTokenAmount = web3.utils.fromWei(
        BigInt(Math.floor(tokenAmountRaw)).toString(),
        "ether"
      );
      const formattedAltAmount = web3.utils.fromWei(
        BigInt(Math.floor(altAmountRaw)).toString(),
        "ether"
      );

      setTokenAmount(formattedTokenAmount);
      setAltAmount(formattedAltAmount);
    } catch (error) {
      console.error("Error calculating removal amounts:", error);
      setShares("0");
      setTokenAmount("0");
      setAltAmount("0");
    }
  }, [web3, percentage, pool, currentChain]);

  const handleRemoveLiquidity = async () => {
    if (!web3 || Number(shares) <= 0) return;

    setIsLoading(true);
    try {
      const sharesToRemove = web3.utils.toWei(shares, "ether");

      const success = await removeLiquidity({
        tokenAddress: pool.token,
        shares: sharesToRemove,
      });

      if (success) {
        onSuccess?.();
        setOpen(false);
      }
    } catch (error) {
      console.error("Error removing liquidity:", error);
      toast.error("Failed to remove liquidity");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button
          variant="secondary"
          className="w-full h-8 text-sm bg-sky-500/10 hover:bg-sky-500/30 text-sky-500 font-semibold hover:text-sky-400 border border-sky-500/10"
        >
          Remove Liquidity
        </Button>
      </DialogTrigger>
      <DialogContent className="bg-zinc-950 border-2 border-sky-500/40 sm:max-w-[400px] rounded-lg pt-4">
        <DialogHeader className="flex flex-row justify-between items-center mb-2">
          <DialogTitle className="text-white text-lg">Remove Liquidity</DialogTitle>
          <button
            type="button"
            className="rounded-sm bg-sky-500/10 hover:bg-sky-500/30 border border-sky-500/10 w-7 h-7 flex items-center justify-center transition-all duration-200"
            onClick={() => setOpen(false)}
          >
            <span className="sr-only">Close</span>
            <X
              className="h-5 w-5 text-sky-500 hover:text-sky-400 transition-colors duration-200"
              aria-hidden="true"
              strokeWidth={2}
            />
          </button>
        </DialogHeader>
        <div className="space-y-6 text-white">
          <div className="space-y-2">
            <label className="text-sm text-white font-semibold">
              Percentage to Remove
            </label>
            <div className="pt-4">
              <Slider
                value={percentage}
                onValueChange={setPercentage}
                min={0}
                max={100}
                step={0.1}
                className="[&_[role=slider]]:border-cyan-400 [&_[role=slider]]:bg-cyan-900 [&_[role=slider]]:ring-cyan-400 [&_.bg-primary]:bg-sky-500"
                disabled={isLoading}
              />
            </div>
            <div className="text-right text-sm text-sky-500 font-semibold">
              {percentage[0].toFixed(1)}%
            </div>
          </div>

          <div className="space-y-4">
            <div className="flex justify-between text-sm">
              <span className="text-white font-semibold">Shares to Remove:</span>
              <span className="font-mono font-semibold">{Number(shares).toFixed(3)}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-white font-semibold">
                {pool.tokenSymbol} to Receive:
              </span>
              <span className="font-mono font-semibold">{Number(tokenAmount).toFixed(3)}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-white font-semibold">ALT to Receive:</span>
              <span className="font-mono font-semibold">{Number(altAmount).toFixed(3)}</span>
            </div>
          </div>

          <Button
            onClick={handleRemoveLiquidity}
            disabled={isLoading || percentage[0] <= 0}
            className="w-full bg-sky-500/10 hover:bg-sky-500/30 text-sky-500 font-semibold border border-sky-500/10 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isLoading ? "Removing Liquidity..." :
              <div className="relative flex items-center justify-center gap-2">
                <Droplets className="w-5 h-5" />
                <span className="text-md">Remove Liquidity</span>
              </div>
            }
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default RemoveLiquidityModal;