import React, { useState, useEffect } from "react";
import {
  Dialog,
} from "@/components/ui/dialog";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Droplets, BriefcaseBusiness } from "lucide-react";
import { useStorage } from "../storage";
import { toast } from "sonner";
import { LiquidityPosition } from "../storage";
import chains from "@/app/constants";
import RemoveLiquidityModal from "@/components/modal/remove-liquidity"
import IncreaseLiquidityModal from "@/components/modal/increase-liquidity"
import AddLiquidityModal from "@/components/modal/add-liquidity"

interface Pool {
  token: string;
  tokenSymbol: string;
  tokenReserve: string;
  altReserve: string;
  totalShares: string;
  userShares: string;
}

const Pool: React.FC = () => {
  const { web3, getUserLiquidityPositions, currentChain, tokens } = useStorage();
  const [positions, setPositions] = useState<LiquidityPosition[]>([]);
  const [isInitialLoading, setIsInitialLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [isPolling, setIsPolling] = useState(false);

  const getChainName = (chainId: number) => {
    return chains.find((c) => c.decimalId === chainId)?.name || "Unknown Chain";
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
    setShowAddModal(open);
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
      {/* Enhanced Positions List - Adjusted height */}
      <div className="flex-1 overflow-hidden">
        <ScrollArea className="h-[370px]">
          {/* Reduced height to ensure button visibility */}
          {isInitialLoading ? (
            <div className="flex items-center justify-center h-[420px]">
              <div className="text-amber-500 animate-pulse flex items-center gap-2 font-semibold">
                <BriefcaseBusiness className="w-5 h-5 animate-pulse" />
                <span>Loading positions...</span>
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
                      <div className="px-2 py-1 rounded bg-amber-500/10 text-amber-500 text-xs font-medium font-semibold">
                        {position.sharePercentage}% Share
                      </div>
                    </div>

                    {/* Position Details */}
                    <div className="grid grid-cols-2 gap-4 mb-4 ml-0.5">
                      <div className="space-y-1">
                        <p className="text-sm text-gray-400 font-semibold">Token Amount</p>
                        <p className="font-mono font-bold text-white">
                          {Number(position.formattedTokenAmount).toFixed(3)}
                        </p>
                      </div>
                      <div className="space-y-1">
                        <p className="text-sm text-gray-400 font-semibold">Altcoin Amount</p>
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
      <div className="pb-4 mt-auto bg-gradient-to-t from-black to-transparent">
        <Button
          onClick={() => setShowAddModal(true)}
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
          <div className="relative flex items-center justify-center gap-2">
            <Droplets className="w-5 h-5" />
            <span className="text-md">Add Liquidity</span>
          </div>
        </Button>
      </div>
      {/* Modal */}
      <Dialog open={showAddModal} onOpenChange={handleModalClose}>
        <AddLiquidityModal
          open={showAddModal}
          onOpenChange={handleModalClose}
          onSuccess={startPolling}
        />
      </Dialog>
    </div>
  );
};

export default Pool;
