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
import { Droplets, X, Timer, Share2, Coins } from "lucide-react";
import { useStorage } from "../storage";
import { toast } from "sonner";
import { LiquidityPosition } from "../storage";

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
  onSuccess?: () => void;
}

interface RemoveLiquidityModalProps {
  pool: Pool;
  onSuccess?: () => void;
}

interface GeneralAddLiquidityModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess?: () => void; // Add this
}

const GeneralAddLiquidityModal = ({
  open,
  onOpenChange,
  onSuccess,
}: GeneralAddLiquidityModalProps) => {
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
    <DialogContent className="bg-zinc-950 border border-amber-500/20 sm:max-w-[400px]">
      <DialogHeader className="flex flex-row justify-between items-center">
        <DialogTitle className="text-amber-500">
          {isExistingPool ? "Increase Liquidity" : "Add Liquidity"}
        </DialogTitle>
        <DialogClose className="w-6 h-6 text-white hover:text-amber-500 transition-colors">
          <X className="w-4 h-4" />
        </DialogClose>
      </DialogHeader>
      <div className="space-y-4 text-white">
        <Select onValueChange={handleTokenSelect} value={selectedToken}>
          <SelectTrigger className="border border-amber-500/20">
            <SelectValue placeholder="Select token" />
          </SelectTrigger>
          <SelectContent>
            {availableTokens.map((t) => (
              <SelectItem key={t.address} value={t.address}>
                {t.symbol}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <div className="space-y-2">
          <div className="flex justify-between items-center">
            <label className="text-sm text-amber-500">Token Amount</label>
            {selectedToken && tokenBalance && (
              <button
                onClick={() => setTokenAmount(tokenBalance)}
                className="text-xs text-amber-500 hover:text-amber-400 flex items-center gap-1"
              >
                <span>
                  {
                    tokens.find(
                      (t) =>
                        t.address.toLowerCase() === selectedToken.toLowerCase()
                    )?.icon
                  }
                </span>
                Balance: {Number(tokenBalance).toFixed(4)}
              </button>
            )}
          </div>
          <Input
            type="text"
            value={tokenAmount}
            onChange={(e) => handleTokenAmountChange(e.target.value)}
            className="border border-amber-500/20 text-white"
            placeholder="0.0"
          />
        </div>
        <div className="space-y-2">
          <div className="flex justify-between items-center">
            <label className="text-sm text-amber-500">ALT Amount</label>
            {altBalance && (
              <div className="text-xs text-amber-500 flex items-center gap-1">
                <span>A</span>
                Balance: {Number(altBalance).toFixed(4)}
              </div>
            )}
          </div>
          <Input
            type="number"
            value={altAmount}
            readOnly
            className="border border-amber-500/20 text-white bg-zinc-900"
            placeholder="0.0"
          />
        </div>
        <Button
          onClick={handleAddLiquidity}
          disabled={
            isLoading ||
            !selectedToken ||
            !tokenAmount ||
            !altAmount ||
            Number(tokenAmount) <= 0
          }
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
            disabled:opacity-50
            disabled:cursor-not-allowed"
        >
          <div className="relative w-full px-8">
            <div className="flex justify-center items-center">
              <span className="tracking-wide">
                {isLoading
                  ? "Adding Liquidity..."
                  : isExistingPool
                  ? "Increase Liquidity"
                  : "Add Liquidity"}
              </span>
              {!isLoading && (
                <span className="absolute right-0 opacity-0 group-hover:opacity-100 transform translate-x-2 group-hover:translate-x-0 transition-all duration-200">
                  <Droplets className="w-4 h-4" />
                </span>
              )}
            </div>
          </div>
        </Button>
      </div>
    </DialogContent>
  );
};

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
          className="w-full h-8 text-sm bg-amber-500/10 hover:bg-amber-500/30 text-amber-500 hover:text-amber-400 border border-amber-500/10 font-semibold"
        >
          Increase Liquidity
        </Button>
      </DialogTrigger>
      <DialogContent className="bg-zinc-950 border border-amber-500/20 sm:max-w-[400px]">
        <DialogHeader className="flex flex-row justify-between items-center">
          <div>
            <DialogTitle className="text-amber-500">
              Increase Liquidity
            </DialogTitle>
            <p className="text-sm text-gray-400 mt-1">
              on {getChainName(currentChain)}
            </p>
          </div>
          <DialogClose className="w-6 h-6 text-white hover:text-amber-500 transition-colors">
            <X className="w-4 h-4" />
          </DialogClose>
        </DialogHeader>
        <div className="space-y-4 text-white">
          <div className="space-y-2">
            <div className="flex justify-between items-center">
              <label className="text-sm text-amber-500">Token Amount</label>
              {tokenBalance && (
                <button
                  onClick={handleSetMax}
                  className="text-xs text-amber-500 hover:text-amber-400 flex items-center gap-1"
                >
                  <span>
                    {
                      tokens.find(
                        (t) =>
                          t.address.toLowerCase() === pool.token.toLowerCase()
                      )?.icon
                    }
                  </span>
                  Balance: {Number(tokenBalance).toFixed(4)}
                </button>
              )}
            </div>
            <Input
              type="number"
              value={tokenAmount}
              onChange={(e) => handleTokenAmountChange(e.target.value)}
              className="border border-amber-500/20 text-white"
              placeholder="0.0"
            />
          </div>
          <div className="space-y-2">
            <div className="flex justify-between items-center">
              <label className="text-sm text-amber-500">ALT Amount</label>
              {altBalance && (
                <div className="text-xs text-amber-500 flex items-center gap-1">
                  <span>A</span>
                  Balance: {Number(altBalance).toFixed(4)}
                </div>
              )}
            </div>
            <Input
              type="number"
              value={altAmount}
              readOnly
              className="border border-amber-500/20 text-white bg-zinc-900"
              placeholder="0.0"
            />
          </div>
          <Button
            onClick={handleAddLiquidity}
            disabled={
              isLoading ||
              !tokenAmount ||
              !altAmount ||
              Number(tokenAmount) <= 0
            }
            variant="secondary"
            className="w-full h-8 text-sm bg-amber-500/10 hover:bg-amber-500/30 text-amber-500 hover:text-amber-400 border border-amber-500/10 font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isLoading ? "Processing..." : "Increase Liquidity"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

const RemoveLiquidityModal: React.FC<RemoveLiquidityModalProps> = ({
  pool,
  onSuccess,
}) => {
  const { web3, removeLiquidity, currentChain } = useStorage();

  const [open, setOpen] = useState(false);
  const [percentage, setPercentage] = useState<number[]>([0]);
  const [shares, setShares] = useState<string>("0");
  const [tokenAmount, setTokenAmount] = useState<string>("0");
  const [altAmount, setAltAmount] = useState<string>("0");
  const [isLoading, setIsLoading] = useState(false);

  // Reset state when chain changes
  useEffect(() => {
    setPercentage([0]);
    setShares("0");
    setTokenAmount("0");
    setAltAmount("0");
    setOpen(false); // Close modal on chain change
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

      const tokenAmountRaw =
        (shareAmount * Number(pool.tokenReserve)) / Number(pool.totalShares);
      const altAmountRaw =
        (shareAmount * Number(pool.altReserve)) / Number(pool.totalShares);

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
    debugger;
    if (!web3 || Number(shares) <= 0) return;

    setIsLoading(true);
    try {
      const sharesToRemove = web3.utils.toWei(shares, "ether");

      const success = await removeLiquidity({
        tokenAddress: pool.token,
        shares: sharesToRemove,
      });

      if (success) {
        // Refresh user's positions
        onSuccess?.(); // Trigger polling
        setOpen(false);
      }
    } catch (error) {
      console.error("Error removing liquidity:", error);
      toast.error("Failed to remove liquidity");
    } finally {
      setIsLoading(false);
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
          className="w-full h-8 text-sm bg-sky-500/10 hover:bg-sky-500/30 text-sky-500 font-semibold hover:text-sky-400 border border-sky-500/10"
        >
          Remove Liquidity
        </Button>
      </DialogTrigger>
      <DialogContent className="bg-zinc-950 border border-amber-500/20 sm:max-w-[400px]">
        <DialogHeader className="flex flex-row justify-between items-center">
          <div>
            <DialogTitle className="text-amber-500">
              Remove Liquidity
            </DialogTitle>
            <p className="text-sm text-gray-400 mt-1">
              on {getChainName(currentChain)}
            </p>
          </div>
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
                disabled={isLoading}
              />
            </div>
            <div className="text-right text-sm text-amber-500">
              {percentage[0].toFixed(1)}%
            </div>
          </div>

          <div className="space-y-4">
            <div className="flex justify-between text-sm">
              <span className="text-amber-500">Shares to Remove:</span>
              <span>{Number(shares).toFixed(3)}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-amber-500">
                {pool.tokenSymbol} to Receive:
              </span>
              <span>{Number(tokenAmount).toFixed(3)}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-amber-500">ALT to Receive:</span>
              <span>{Number(altAmount).toFixed(3)}</span>
            </div>
          </div>

          <Button
            onClick={handleRemoveLiquidity}
            disabled={isLoading || percentage[0] <= 0}
            className="w-full bg-sky-500/10 hover:bg-sky-500/30 text-sky-500 font-semibold border border-sky-500/10 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isLoading ? "Removing Liquidity..." : "Remove Liquidity"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

const Pool: React.FC = () => {
  const { web3, getUserLiquidityPositions, currentChain, tokens } = useStorage();
  const [positions, setPositions] = useState<LiquidityPosition[]>([]);
  const [isInitialLoading, setIsInitialLoading] = useState(true);
  const [showGeneralModal, setShowGeneralModal] = useState(false);
  const [isPolling, setIsPolling] = useState(false);

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

  const loadPositions = async (isInitial: boolean = false) => {
    if (!web3) return;

    try {
      if (isInitial) {
        setIsInitialLoading(true);
      }

      const userPositions = await getUserLiquidityPositions();
      setPositions(userPositions);
    } catch (error) {
      console.error("Error fetching positions:", error);
      toast.error("Failed to fetch positions");
    } finally {
      if (isInitial) {
        setIsInitialLoading(false);
      }
    }
  };

  const startPolling = () => {
    setIsPolling(true);
    // Load positions immediately when polling starts
    loadPositions(false);
    setTimeout(() => setIsPolling(false), 30000);
  };

  const handleModalClose = (open: boolean) => {
    setShowGeneralModal(open);
    if (!open) {
      startPolling(); // Start polling when modal closes
    }
  };

  // Initial load
  useEffect(() => {
    setPositions([]);
    setIsInitialLoading(true);
    loadPositions(true);
  }, [web3, currentChain]);

  // Polling effect
  useEffect(() => {
    let intervalId: NodeJS.Timeout;

    if (isPolling) {
      intervalId = setInterval(() => loadPositions(false), 2000);
    }

    return () => {
      if (intervalId) {
        clearInterval(intervalId);
      }
    };
  }, [isPolling]);

  return (
    <div className="flex flex-col h-full relative">
      {/* Enhanced Header Section */}
      {/* <div className="px-4 pb-2 border-b border-amber-500/20">
        <div className="flex items-start">
          <div>
            <h4 className="text-md font-bold bg-gradient-to-r from-amber-500 to-amber-300 bg-clip-text text-transparent">
              Liquidity Pools
            </h4>
          </div>
        </div>
      </div> */}

      {/* Enhanced Positions List - Adjusted height */}
      <div className="flex-1 overflow-hidden px-4 pt-4">
        <ScrollArea className="h-[350px]">
          {" "}
          {/* Reduced height to ensure button visibility */}
          {isInitialLoading ? (
            <div className="flex items-center justify-center h-40">
              <div className="text-amber-500 animate-pulse">
                Loading positions...
              </div>
            </div>
          ) : positions.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-40 bg-neutral-900/30 rounded-lg border border-amber-500/10 p-6">
              <Droplets className="w-12 h-12 text-amber-500/30 mb-4" />
              <p className="text-sm font-medium text-amber-500/80">
                No active positions
              </p>
              <p className="text-xs text-gray-500 mt-2 text-center max-w-[200px]">
                Add liquidity to start earning fees from trades
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {positions.map((position) => (
                <Card
                  key={position.token}
                  className="bg-neutral-900/50 border-amber-500/10 hover:border-amber-500/30 transition-all duration-200
                    shadow-lg hover:shadow-amber-900/20 group"
                >
                  <CardContent className="p-4">
                    {/* Position Header */}
                    <div className="flex justify-between items-center mb-3">
                      <div className="flex items-center gap-2">
                        <div className="w-8 h-8 rounded-full bg-amber-500/10 flex items-center justify-center">
                          <span className="text-amber-500 font-bold">
                            {tokens.find(t => t.address === position.token)?.icon}
                          </span>
                        </div>
                        <span className="font-bold text-lg text-white">
                          {position.tokenSymbol}/ALT
                        </span>
                      </div>
                      <div className="px-2 py-1 rounded-full bg-amber-500/10 text-amber-500 text-xs font-medium">
                        {position.sharePercentage}% Share
                      </div>
                    </div>

                    {/* Position Details */}
                    <div className="grid grid-cols-2 gap-4 mb-4">
                      <div className="space-y-1">
                        <p className="text-xs text-gray-400">Token Amount</p>
                        <p className="font-mono font-bold text-white">
                          {Number(position.formattedTokenAmount).toFixed(3)}
                        </p>
                      </div>
                      <div className="space-y-1">
                        <p className="text-xs text-gray-400">ALT Amount</p>
                        <p className="font-mono font-bold text-white">
                          {Number(position.formattedAltAmount).toFixed(3)}
                        </p>
                      </div>
                    </div>

                    {/* Action Buttons */}
                    <div className="flex gap-2">
  <IncreaseLiquidityModal
    pool={{
      token: position.token,
      tokenSymbol: position.tokenSymbol,
      tokenReserve: position.tokenAmount,
      altReserve: position.altAmount,
      totalShares: position.shares,
      userShares: position.rawShares.toString()
    }}
    onSuccess={startPolling}
  />
  <RemoveLiquidityModal
    pool={{
      token: position.token,
      tokenSymbol: position.tokenSymbol,
      tokenReserve: position.tokenAmount,
      altReserve: position.altAmount,
      totalShares: position.shares,
      userShares: position.rawShares.toString()
    }}
    onSuccess={startPolling}
  />
</div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </ScrollArea>
      </div>

      {/* Enhanced Add Liquidity Button - Now always visible */}
      <div className="p-4 mt-auto bg-gradient-to-t from-black to-transparent">
        <Button
          onClick={() => setShowGeneralModal(true)}
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
          <div className="absolute inset-0 bg-gradient-to-r from-amber-500/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-200" />
          <div className="relative flex items-center justify-center gap-2">
            <Droplets className="w-5 h-5" />
            <span className="text-md">Add Liquidity</span>
          </div>
        </Button>
      </div>
      {/* Modal */}
      <Dialog open={showGeneralModal} onOpenChange={handleModalClose}>
        <GeneralAddLiquidityModal
          open={showGeneralModal}
          onOpenChange={handleModalClose}
          onSuccess={startPolling}
        />
      </Dialog>
    </div>
  );
};

export default Pool;
