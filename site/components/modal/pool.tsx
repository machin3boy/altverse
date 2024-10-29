import React, { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogClose,
} from "@/components/ui/dialog";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Slider } from "@/components/ui/slider";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Droplets, X } from "lucide-react";

interface Token {
  address: string;
  symbol: string;
}

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
}

interface RemoveLiquidityModalProps {
  pool: Pool;
}

const GeneralAddLiquidityModal = ({
  open,
  onOpenChange,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) => {
  const [token, setToken] = useState<string>("");
  const [tokenAmount, setTokenAmount] = useState<string>("");
  const [altAmount, setAltAmount] = useState<string>("");

  const tokens: Token[] = [
    { address: "0x1234...5678", symbol: "wLINK" },
    { address: "0x8765...4321", symbol: "wETH" },
  ];

  const handleTokenSelect = (value: string) => {
    setToken(value);
  };

  const handleTokenAmountChange = (value: string) => {
    setTokenAmount(value);
  };

  const handleAddLiquidity = () => {
    // Contract call
    onOpenChange(false);
  };

  return (
    <DialogContent className="bg-zinc-950 border border-amber-500/20 sm:max-w-[400px]">
      <DialogHeader className="flex flex-row justify-between items-center">
        <DialogTitle className="text-amber-500">Add Liquidity</DialogTitle>
        <DialogClose className="w-6 h-6 text-white hover:text-amber-500 transition-colors">
          <X className="w-4 h-4" />
        </DialogClose>
      </DialogHeader>
      <div className="space-y-4 text-white">
        <Select onValueChange={handleTokenSelect} value={token}>
          <SelectTrigger className="border border-amber-500/20">
            <SelectValue placeholder="Select token" />
          </SelectTrigger>
          <SelectContent>
            {tokens.map((t) => (
              <SelectItem key={t.address} value={t.address}>
                {t.symbol}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <div className="space-y-2">
          <label className="text-sm text-amber-500">Token Amount</label>
          <Input
            type="number"
            value={tokenAmount}
            onChange={(e) => handleTokenAmountChange(e.target.value)}
            className="border border-amber-500/20 text-white"
            placeholder="0.0"
          />
        </div>
        <div className="space-y-2">
          <label className="text-sm text-amber-500">ALT Amount</label>
          <Input
            type="number"
            value={altAmount}
            onChange={(e) => setAltAmount(e.target.value)}
            className="border border-amber-500/20 text-white"
            placeholder="0.0"
          />
        </div>
        <DialogClose asChild>
          <Button
            onClick={handleAddLiquidity}
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
              before:absolute before:inset-0
              before:bg-gradient-to-r before:from-amber-500/0 before:via-amber-500/30 before:to-amber-500/0 
              before:translate-x-[-200%] hover:before:translate-x-[200%] before:transition-transform before:duration-1000
              before:blur-md"
          >
            <div className="absolute inset-0 bg-gradient-to-r from-amber-500/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-200" />
            <div className="relative w-full px-8">
              <div className="flex justify-center items-center">
                <span className="tracking-wide">Add Liquidity</span>
                <span className="absolute right-0 opacity-0 group-hover:opacity-100 transform translate-x-2 group-hover:translate-x-0 transition-all duration-200">
                  <Droplets className="w-4 h-4" />
                </span>
              </div>
            </div>
          </Button>
        </DialogClose>
      </div>
    </DialogContent>
  );
};

const IncreaseLiquidityModal: React.FC<IncreaseLiquidityModalProps> = ({
  pool,
}) => {
  const [open, setOpen] = useState(false);
  const [tokenAmount, setTokenAmount] = useState<string>("");
  const [altAmount, setAltAmount] = useState<string>("");

  const handleTokenAmountChange = (value: string) => {
    setTokenAmount(value);
    const altRequired =
      (Number(value) * Number(pool.altReserve)) / Number(pool.tokenReserve);
    setAltAmount(altRequired.toFixed(3));
  };

  const handleAddLiquidity = () => {
    // Contract call
    setOpen(false);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button
          variant="secondary"
          className="w-full h-8 text-sm bg-amber-500/10 hover:bg-amber-500/30 text-amber-500 hover:text-amber-400 border border-amber-500/10 font-semibold"
        >
          Increase Liquidity
        </Button>
      </DialogTrigger>
      <DialogContent className="bg-zinc-950 border border-amber-500/20 sm:max-w-[400px]">
        <DialogHeader className="flex flex-row justify-between items-center">
          <DialogTitle className="text-amber-500">
            Increase Liquidity
          </DialogTitle>
          <DialogClose className="w-6 h-6 text-white hover:text-amber-500 transition-colors">
            <X className="w-4 h-4" />
          </DialogClose>
        </DialogHeader>
        <div className="space-y-4 text-white">
          <div className="space-y-2">
            <label className="text-sm text-amber-500">Token Amount</label>
            <Input
              type="number"
              value={tokenAmount}
              onChange={(e) => handleTokenAmountChange(e.target.value)}
              className="border border-amber-500/20 text-white"
              placeholder="0.0"
            />
          </div>
          <div className="space-y-2">
            <label className="text-sm text-amber-500">ALT Amount</label>
            <Input
              type="number"
              value={altAmount}
              onChange={(e) => setAltAmount(e.target.value)}
              className="border border-amber-500/20 text-white"
              placeholder="0.0"
              disabled
            />
          </div>
          <DialogClose asChild>
            <Button
              onClick={handleAddLiquidity}
              variant="secondary"
              className="w-full h-8 text-sm bg-amber-500/10 hover:bg-amber-500/30 text-amber-500 hover:text-amber-400 border border-amber-500/10 font-semibold"
            >
              Increase Liquidity
            </Button>
          </DialogClose>
        </div>
      </DialogContent>
    </Dialog>
  );
};

const RemoveLiquidityModal: React.FC<RemoveLiquidityModalProps> = ({
  pool,
}) => {
  const [open, setOpen] = useState(false);
  const [percentage, setPercentage] = useState<number[]>([0]);
  const [shares, setShares] = useState<string>("0");
  const [tokenAmount, setTokenAmount] = useState<string>("0");
  const [altAmount, setAltAmount] = useState<string>("0");

  useEffect(() => {
    const shareAmount = (percentage[0] * Number(pool.userShares)) / 100;
    setShares(shareAmount.toFixed(3));

    const tokenAmount =
      (shareAmount * Number(pool.tokenReserve)) / Number(pool.totalShares);
    const altAmount =
      (shareAmount * Number(pool.altReserve)) / Number(pool.totalShares);

    setTokenAmount(tokenAmount.toFixed(3));
    setAltAmount(altAmount.toFixed(3));
  }, [percentage, pool]);

  const handleRemoveLiquidity = () => {
    // Contract call would go here
    setOpen(false);
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
      <DialogContent className="bg-zinc-950 border border-amber-500/20 sm:max-w-[400px]">
        <DialogHeader className="flex flex-row justify-between items-center">
          <DialogTitle className="text-amber-500">Remove Liquidity</DialogTitle>
          <DialogClose className="w-6 h-6 text-white hover:text-amber-500 transition-colors">
            <X className="w-4 h-4" />
          </DialogClose>
        </DialogHeader>
        <div className="space-y-6 text-white">
          <div className="space-y-2">
            <label className="text-sm text-amber-500">
              Percentage to Remove
            </label>
            <div className="pt-4">
              <Slider
                value={percentage}
                onValueChange={setPercentage}
                min={0}
                max={100}
                step={0.1}
                className="[&_[role=slider]]:border-amber-500 [&_[role=slider]]:bg-white"
              />
            </div>
            <div className="text-right text-sm text-amber-500">
              {percentage[0].toFixed(1)}%
            </div>
          </div>

          <div className="space-y-4">
            <div className="flex justify-between text-sm">
              <span className="text-amber-500">Shares to Remove:</span>
              <span>{shares}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-amber-500">
                {pool.tokenSymbol} to Receive:
              </span>
              <span>{tokenAmount}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-amber-500">ALT to Receive:</span>
              <span>{altAmount}</span>
            </div>
          </div>

          <DialogClose asChild>
            <Button
              onClick={handleRemoveLiquidity}
              className="w-full bg-sky-500/10 hover:bg-sky-500/30 text-sky-500 font-semibold border border-sky-500/10"
            >
              Remove Liquidity
            </Button>
          </DialogClose>
        </div>
      </DialogContent>
    </Dialog>
  );
};

const Pool: React.FC = () => {
  const samplePools: Pool[] = [
    {
      token: "0x1234...5678",
      tokenSymbol: "wLINK",
      tokenReserve: "1000000000000000000000000",
      altReserve: "1000000000000000000000",
      totalShares: "1000000000000000000000",
      userShares: "100000000000000000000",
    },
    {
      token: "0x8765...4321",
      tokenSymbol: "wETH",
      tokenReserve: "1000000000000000000",
      altReserve: "2000000000000000000000",
      totalShares: "500000000000000000000",
      userShares: "250000000000000000000",
    },
  ];
  const [showGeneralModal, setShowGeneralModal] = useState(false);

  return (
    <div className="flex flex-col min-h-full">
      <ScrollArea className="h-[400px] rounded-md border border-amber-500/20 p-2 flex-grow mb-4">
        {samplePools.length === 0 ? (
          <>
            <h4 className="mb-2 text-medium font-bold leading-none px-2 pt-2">
              Your Positions
            </h4>
            <p className="text-sm text-muted-foreground font-bold px-2">
              You have no active positions
            </p>
          </>
        ) : (
          samplePools.map((pool, index) => (
            <Card
              key={index}
              className="mb-2 border rounded-md hover:border-amber-500 transition-colors duration-200 last:mb-0"
            >
              <CardContent className="p-3 font-mono font-bold">
                <div className="flex justify-between items-center mb-1.5">
                  <span className="text-sm">Pair:</span>
                  <span className="text-sm">{pool.tokenSymbol}/ALT</span>
                </div>
                <div className="flex justify-between items-center mb-1.5">
                  <span className="text-sm">Share:</span>
                  <span className="text-sm">
                    {(
                      (Number(pool.userShares) / Number(pool.totalShares)) *
                      100
                    ).toFixed(2)}
                    %
                  </span>
                </div>
                <div className="flex justify-between items-center mb-1.5">
                  <span className="text-sm">{pool.tokenSymbol}:</span>
                  <span className="text-sm">
                    {(
                      (Number(pool.tokenReserve) * Number(pool.userShares)) /
                      Number(pool.totalShares) /
                      (pool.tokenSymbol === "USDC" ? 1e6 : 1e18)
                    ).toFixed(4)}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm">ALT:</span>
                  <span className="text-sm">
                    {(
                      (Number(pool.altReserve) * Number(pool.userShares)) /
                      Number(pool.totalShares) /
                      1e18
                    ).toFixed(4)}
                  </span>
                </div>
              </CardContent>
              <CardFooter className="p-3 pt-0 flex gap-2">
                <IncreaseLiquidityModal pool={pool} />
                <RemoveLiquidityModal pool={pool} />
              </CardFooter>
            </Card>
          ))
        )}
      </ScrollArea>

      <Dialog open={showGeneralModal} onOpenChange={setShowGeneralModal}>
        <GeneralAddLiquidityModal
          open={showGeneralModal}
          onOpenChange={setShowGeneralModal}
        />
      </Dialog>

      <div className="mt-auto mb-4">
        <Button
          onClick={() => setShowGeneralModal(true)}
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
              before:absolute before:inset-0
              before:bg-gradient-to-r before:from-amber-500/0 before:via-amber-500/30 before:to-amber-500/0 
              before:translate-x-[-200%] hover:before:translate-x-[200%] before:transition-transform before:duration-1000
              before:blur-md"
        >
          <div className="absolute inset-0 bg-gradient-to-r from-amber-500/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-200" />
          <div className="relative w-full px-8">
            <div className="flex justify-center items-center">
              <span className="tracking-wide">Add Liquidity</span>
              <span className="absolute right-0 opacity-0 group-hover:opacity-100 transform translate-x-2 group-hover:translate-x-0 transition-all duration-200">
                <Droplets className="w-4 h-4" />
              </span>
            </div>
          </div>
        </Button>
      </div>
    </div>
  );
};

export default Pool;
