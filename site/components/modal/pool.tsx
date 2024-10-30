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
import { useStorage } from "../storage";
import { toast } from "sonner";
import { LiquidityPosition } from "../storage";
import coreContractABI from "../../public/ABIs/Altverse.json";
import { AbiItem } from "web3-utils";

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
  onSuccess?: () => void;  // Add this
}

const GeneralAddLiquidityModal = ({
  open,
  onOpenChange,
  onSuccess
}: GeneralAddLiquidityModalProps) => {
  const { 
    web3, 
    tokens, 
    calculateOptimalLiquidity, 
    addLiquidity,
    fetchTokenBalances 
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
        const tokenBal = balances?.find(b => b.address.toLowerCase() === selectedToken.toLowerCase());
        if (tokenBal) {
          setTokenBalance(tokenBal.balance);
        }

        // Get ALT balance
        const altBal = balances?.find(b => b.symbol === "ALT");
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
    const sanitizedValue = value.replace(/[^0-9.]/g, '');
    
    // Prevent multiple decimal points
    const decimalPoints = sanitizedValue.split('.').length - 1;
    if (decimalPoints > 1) return;
    
    // Limit decimal places to 18 (maximum for ERC20 tokens)
    const parts = sanitizedValue.split('.');
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
        const tokenWei = web3.utils.toWei(tokenAmount, 'ether');
        
        const result = await calculateOptimalLiquidity({
          tokenAddress: selectedToken,
          tokenAmount: tokenWei
        });

        setAltAmount(web3.utils.fromWei(result.altAmount, 'ether'));
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
      const tokenWei = web3.utils.toWei(tokenAmount, 'ether');
      const altWei = web3.utils.toWei(altAmount, 'ether');

      const success = await addLiquidity({
        tokenAddress: selectedToken,
        tokenAmount: tokenWei,
        altAmount: altWei
      });

      if (success) {
        onSuccess?.();  // Trigger polling
        onOpenChange(false);
      }
    } catch (error) {
      console.error("Error adding liquidity:", error);
    } finally {
      setIsLoading(false);
    }
  };

  // Filter available tokens - only show supported tokens excluding ALT
  const availableTokens = tokens.filter(t => 
    t.symbol !== "ALT" && 
    ["wBTC", "wETH", "wLINK"].includes(t.symbol)
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
                {tokens.find(t => t.address.toLowerCase() === selectedToken.toLowerCase())?.icon}
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
            type="text"
            value={altAmount}
            readOnly
            className="border border-amber-500/20 text-white bg-zinc-900"
            placeholder="0.0"
          />
        </div>
        <Button
          onClick={handleAddLiquidity}
          disabled={isLoading || !selectedToken || !tokenAmount || !altAmount || Number(tokenAmount) <= 0}
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
                    : "Add Liquidity"
                }
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
  onSuccess
}) => {
  const { 
    web3, 
    calculateOptimalLiquidity, 
    addLiquidity,
    getUserLiquidityPositions,
    fetchTokenBalances,
    tokens
  } = useStorage();
  
  const [open, setOpen] = useState(false);
  const [tokenAmount, setTokenAmount] = useState<string>("");
  const [altAmount, setAltAmount] = useState<string>("");
  const [isLoading, setIsLoading] = useState(false);
  const [tokenBalance, setTokenBalance] = useState<string>("");
  const [altBalance, setAltBalance] = useState<string>("");


  // Fetch token balance when modal opens
  useEffect(() => {
    const getBalances = async () => {
      if (!web3 || !open) return;
      
      try {
        const accounts = await web3.eth.getAccounts();
        if (!accounts[0]) return;

        const balances = await fetchTokenBalances(accounts[0]);
        
        // Get token balance
        const tokenBal = balances?.find(b => b.address.toLowerCase() === pool.token.toLowerCase());
        if (tokenBal) {
          setTokenBalance(tokenBal.balance);
        }

        // Get ALT balance
        const altBal = balances?.find(b => b.symbol === "ALT");
        if (altBal) {
          setAltBalance(altBal.balance);
        }
      } catch (error) {
        console.error("Error fetching balances:", error);
      }
    };

    getBalances();
  }, [web3, open, pool.token, fetchTokenBalances]);

  const handleTokenAmountChange = (value: string) => {
    // Remove any non-numeric characters except decimal point
    const sanitizedValue = value.replace(/[^0-9.]/g, '');
    
    // Prevent multiple decimal points
    const decimalPoints = sanitizedValue.split('.').length - 1;
    if (decimalPoints > 1) return;
    
    // Limit decimal places to 18 (maximum for ERC20 tokens)
    const parts = sanitizedValue.split('.');
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
        const tokenWei = web3.utils.toWei(tokenAmount, 'ether');
        
        const result = await calculateOptimalLiquidity({
          tokenAddress: pool.token,
          tokenAmount: tokenWei
        });

        setAltAmount(web3.utils.fromWei(result.altAmount, 'ether'));
      } catch (error) {
        console.error("Error calculating ALT amount:", error);
        setAltAmount("");
      }
    };

    calculateAlt();
  }, [web3, tokenAmount, pool.token, calculateOptimalLiquidity]);

  const handleAddLiquidity = async () => {
    if (!web3 || !tokenAmount || !altAmount) return;

    setIsLoading(true);
    try {
      const tokenWei = web3.utils.toWei(tokenAmount, 'ether');
      const altWei = web3.utils.toWei(altAmount, 'ether');

      const success = await addLiquidity({
        tokenAddress: pool.token,
        tokenAmount: tokenWei,
        altAmount: altWei
      });

      if (success) {
        // Refresh user's positions
        onSuccess?.();  // Trigger polling
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
          <div className="flex justify-between items-center">
          <label className="text-sm text-amber-500">Token Amount</label>
          {tokenBalance && (
            <button 
              onClick={handleSetMax}
              className="text-xs text-amber-500 hover:text-amber-400 flex items-center gap-1"
            >
              <span>
                {tokens.find(t => t.address.toLowerCase() === pool.token.toLowerCase())?.icon}
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
              type="text"
              value={altAmount}
              readOnly
              className="border border-amber-500/20 text-white bg-zinc-900"
              placeholder="0.0"
            />
          </div>
          <Button
            onClick={handleAddLiquidity}
            disabled={isLoading || !tokenAmount || !altAmount || Number(tokenAmount) <= 0}
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
  onSuccess
}) => {
  const { 
    web3, 
    removeLiquidity,
    getUserLiquidityPositions
  } = useStorage();
  
  const [open, setOpen] = useState(false);
  const [percentage, setPercentage] = useState<number[]>([0]);
  const [shares, setShares] = useState<string>("0");
  const [tokenAmount, setTokenAmount] = useState<string>("0");
  const [altAmount, setAltAmount] = useState<string>("0");
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (!web3) return;

    try {
      // Calculate share amount based on percentage
      const shareAmount = (percentage[0] * Number(pool.userShares)) / 100;
      const sharesFormatted = web3.utils.fromWei(
        BigInt(Math.floor(shareAmount)).toString(),
        'ether'
      );
      setShares(sharesFormatted);

      // Calculate token amounts to receive
      const tokenAmountRaw = (shareAmount * Number(pool.tokenReserve)) / Number(pool.totalShares);
      const altAmountRaw = (shareAmount * Number(pool.altReserve)) / Number(pool.totalShares);

      // Format amounts with proper decimals
      const formattedTokenAmount = web3.utils.fromWei(
        BigInt(Math.floor(tokenAmountRaw)).toString(),
        'ether'
      );
      const formattedAltAmount = web3.utils.fromWei(
        BigInt(Math.floor(altAmountRaw)).toString(),
        'ether'
      );

      setTokenAmount(formattedTokenAmount);
      setAltAmount(formattedAltAmount);
    } catch (error) {
      console.error("Error calculating removal amounts:", error);
      // Reset values on error
      setShares("0");
      setTokenAmount("0");
      setAltAmount("0");
    }
  }, [web3, percentage, pool]);

  const handleRemoveLiquidity = async () => {
    if (!web3 || Number(shares) <= 0) return;

    setIsLoading(true);
    try {
      const sharesToRemove = web3.utils.toWei(shares, 'ether');
      
      const success = await removeLiquidity({
        tokenAddress: pool.token,
        shares: sharesToRemove
      });

      if (success) {
        // Refresh user's positions
        onSuccess?.();  // Trigger polling
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
              <span>{Number(shares).toFixed(6)}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-amber-500">
                {pool.tokenSymbol} to Receive:
              </span>
              <span>{Number(tokenAmount).toFixed(6)}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-amber-500">ALT to Receive:</span>
              <span>{Number(altAmount).toFixed(6)}</span>
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
  const { web3, getUserLiquidityPositions } = useStorage();
  const [positions, setPositions] = useState<LiquidityPosition[]>([]);
  const [isInitialLoading, setIsInitialLoading] = useState(true); 
  const [showGeneralModal, setShowGeneralModal] = useState(false);
  const [isPolling, setIsPolling] = useState(false);


  const loadPositions = async (isInitial: boolean = false) => {
    if (!web3) return;
    
    try {
      // Only show loading state on initial load
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
    setTimeout(() => setIsPolling(false), 30000);
  };

  const handleModalClose = (open: boolean) => {
    setShowGeneralModal(open);
    if (!open) {
      startPolling();
    }
  };

  // Initial load
  useEffect(() => {
    loadPositions(true);  // Pass true for initial load
  }, [web3]);

  // Polling effect
  useEffect(() => {
    let intervalId: ReturnType<typeof setInterval>;

    if (isPolling) {
      intervalId = setInterval(() => loadPositions(false), 2000);  // Pass false for polling updates
    }

    return () => {
      if (intervalId) {
        clearInterval(intervalId);
      }
    };
  }, [isPolling]);

  // Render the component
  return (
    <div className="flex flex-col min-h-full">
      <ScrollArea className="h-[400px] rounded-md border border-amber-500/20 p-2 flex-grow mb-4">
        {isInitialLoading ? (  // Only show loading on initial load
          <div className="flex items-center justify-center h-full">
            <div className="text-amber-500">Loading positions...</div>
          </div>
        ) : positions.length === 0 ? (
          <>
            <h4 className="mb-2 text-medium font-bold leading-none px-2 pt-2">
              Your Positions
            </h4>
            <p className="text-sm text-muted-foreground font-bold px-2">
              You have no active positions
            </p>
          </>
        ) : (
          positions.map((position) => (
            <Card
              key={position.token}
              className="mb-2 border rounded-md hover:border-amber-500 transition-colors duration-200 last:mb-0"
            >
              <CardContent className="p-3 font-mono font-bold">
                <div className="flex justify-between items-center mb-1.5">
                  <span className="text-sm">Pair:</span>
                  <span className="text-sm">{position.tokenSymbol}/ALT</span>
                </div>
                <div className="flex justify-between items-center mb-1.5">
                  <span className="text-sm">Share:</span>
                  <span className="text-sm">{position.sharePercentage}%</span>
                </div>
                <div className="flex justify-between items-center mb-1.5">
                  <span className="text-sm">{position.tokenSymbol}:</span>
                  <span className="text-sm">
                    {Number(position.formattedTokenAmount).toFixed(6)}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm">ALT:</span>
                  <span className="text-sm">
                    {Number(position.formattedAltAmount).toFixed(6)}
                  </span>
                </div>
              </CardContent>
              <CardFooter className="p-3 pt-0 flex gap-2">
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
              </CardFooter>
            </Card>
          ))
        )}
      </ScrollArea>

      <Dialog open={showGeneralModal} onOpenChange={setShowGeneralModal}>
        <GeneralAddLiquidityModal
          open={showGeneralModal}
          onOpenChange={setShowGeneralModal}
          onSuccess={startPolling}
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
