import React, { useState, useEffect } from "react";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { useStorage } from "../storage";
import { toast } from "sonner";
import { Clock, WalletCards, Lock, Unlock, Shield, CheckCircle, XCircle } from "lucide-react";

interface Escrow {
  id: string;
  user: string;
  altAmount: string;
  timeout: number;
  active: boolean;
}

export default function Escrows() {
  const { fetchUserEscrows, claimTimedOutEscrow, web3, currentChain } = useStorage();
  const [escrows, setEscrows] = useState<Escrow[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isPolling, setIsPolling] = useState(false);
  const [totalEscrowedAmount, setTotalEscrowedAmount] = useState("0");

  const loadEscrows = async (isInitialLoad: boolean = false) => {
    if (!web3) return;

    if (isInitialLoad) {
      setIsLoading(true);
    }

    try {
      const userEscrows = await fetchUserEscrows();
      // Sort escrows by timeout - active ones first, then by closest to timeout
      const sortedEscrows = userEscrows.sort((a, b) => {
        if (a.active && !b.active) return -1;
        if (!a.active && b.active) return 1;
        return a.timeout - b.timeout;
      });
      setEscrows(sortedEscrows);
    } catch (error) {
      console.error("Error loading escrows:", error);
      toast.error("Failed to load escrows");
    } finally {
      if (isInitialLoad) {
        setIsLoading(false);
      }
    }
  };

  // Initial load and chain change effect
  useEffect(() => {
    loadEscrows(true);
  }, [web3, currentChain]); // Re-run when chain changes

  // Polling effect
  useEffect(() => {
    let intervalId: NodeJS.Timeout;

    if (isPolling) {
      intervalId = setInterval(() => loadEscrows(false), 2000);
      // Stop polling after 30 seconds
      setTimeout(() => setIsPolling(false), 30000);
    }

    return () => {
      if (intervalId) {
        clearInterval(intervalId);
      }
    };
  }, [isPolling]);

  const handleClaimEscrow = async (escrowId: string) => {
    try {
      const success = await claimTimedOutEscrow(escrowId);
      if (success) {
        setIsPolling(true); // Start polling to update the UI
      }
    } catch (error) {
      console.error("Error claiming escrow:", error);
      toast.error("Failed to claim escrow");
    }
  };

  const formatAddress = (address: string) => {
    return `${address.slice(0, 6)}...${address.slice(-4)}`;
  };

  const formatAltAmount = (amount: string) => {
    if (!web3) return "0";
    const formatted = web3.utils.fromWei(amount, "ether");
    return Number(formatted).toFixed(3);
  };

  const getTimeLeft = (timeout: number) => {
    const now = Date.now();
    const timeLeft = timeout - now;

    if (timeLeft <= 0) return "Timed Out";

    const hours = Math.floor(timeLeft / (1000 * 60 * 60));
    const minutes = Math.floor((timeLeft % (1000 * 60 * 60)) / (1000 * 60));
    const seconds = Math.floor((timeLeft % (1000 * 60)) / 1000);

    if (hours > 0) return `${hours}h ${minutes}m`;
    if (minutes > 0) return `${minutes}m ${seconds}s`;
    return `${seconds}s`;
  };

  useEffect(() => {
    if (!web3 || !escrows.length) {
      setTotalEscrowedAmount("0");
      return;
    }

    const total = escrows.reduce((sum, escrow) => {
      if (escrow.active) {
        return sum + Number(web3.utils.fromWei(escrow.altAmount, "ether"));
      }
      return sum;
    }, 0);

    setTotalEscrowedAmount(total.toFixed(3));
  }, [escrows, web3]);

  return (
    <div className="flex flex-col h-full relative">
      {/* Enhanced Scrollable Content */}
      <div className="flex-1 overflow-hidden">
        <ScrollArea className="h-[420px]">
          {isLoading ? (
            <div className="flex items-center justify-center h-[420px]">
              <div className="text-sky-500 animate-pulse flex items-center gap-2 font-semibold">
                <Lock className="w-5 h-5 animate-pulse" />
                <span>Loading escrows...</span>
              </div>
            </div>
          ) : escrows.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-40 bg-amber-950/20 rounded-lg border border-amber-500/10 p-6">
              <WalletCards className="w-12 h-12 text-amber-500/30 mb-4" />
              <p className="text-sm font-medium text-amber-500/80">
                No active escrows
              </p>
              <p className="text-xs text-gray-500 mt-2 text-center max-w-[200px]">
                Escrows will appear here when you perform cross-chain swaps
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {escrows.map((escrow, index) => (
                <Card
                  key={index}
                  className={`bg-neutral-900/50 transition-all duration-200 shadow-lg ${escrow.active
                    ? "border-amber-500/10 hover:border-amber-500/30 hover:shadow-amber-900/20"
                    : "border-sky-500/10"}`} // Removed opacity-50
                >
                  <CardContent className="p-4">
                    {/* Escrow Header */}
                    <div className="flex justify-between items-center mb-3">
                      <div className="flex items-center gap-2">
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center ${escrow.active
                          ? "bg-sky-500/10"
                          : "bg-sky-500/5"}`}
                        >
                          {escrow.active
                            ? <Lock className="w-4 h-4 text-sky-500" />
                            : <Unlock className="w-4 h-4 text-sky-500/50" />}
                        </div>
                        <span className="font-bold text-lg text-white">
                          {formatAltAmount(escrow.altAmount)} ALT
                        </span>
                      </div>
                      <div className={`px-2 py-1 rounded text-xs font-medium font-semibold ${escrow.active
                        ? "bg-sky-500/10 text-sky-500"
                        : "bg-sky-500/10 text-sky-500/50"}`}
                      >
                        {escrow.active ? "Escrow Active" : "Escrow Inactive"}
                      </div>
                    </div>

                    {/* Escrow Details */}
                    <div className="grid grid-cols-2 gap-4 mb-4 ml-0.5">
                      <div className="space-y-1">
                        <p className="text-sm text-gray-400 font-semibold">Address</p>
                        <p className="font-mono font-bold text-white">
                          {formatAddress(escrow.user)}
                        </p>
                      </div>
                      <div className="space-y-1">
                        <p className="text-sm text-gray-400 font-semibold">Time Left</p>
                        <p className={`font-mono font-bold ${Date.now() >= escrow.timeout ? "text-sky-500" : "text-amber-500"}`}
                        >
                          {getTimeLeft(escrow.timeout)}
                        </p>
                      </div>
                    </div>

                    {/* Action Button */}
                    <Button
                      className={`w-full h-1/2 py-1 relative overflow-hidden group transition-all duration-200 ${!escrow.active
                        ? "bg-sky-500/10 text-sky-500/50 border border-sky-500/10 cursor-not-allowed" // Removed opacity
                        : Date.now() >= escrow.timeout
                          ? "bg-sky-500/10 hover:bg-sky-500/20 text-sky-500 border border-sky-500/20 hover:border-sky-500/30"
                          : "bg-amber-500/10 text-amber-500/50 border border-amber-500/10 cursor-not-allowed"}`}
                      disabled={Date.now() < escrow.timeout || !escrow.active}
                      onClick={() => handleClaimEscrow(escrow.id)}
                    >
                      <div className="relative flex items-center justify-center gap-2">
                        {!escrow.active ? (
                          <>
                            <XCircle className="w-4 h-4" />
                            <span>Escrow Inactive</span>
                          </>
                        ) : Date.now() >= escrow.timeout ? (
                          <>
                            <CheckCircle className="w-4 h-4" />
                            <span>Claim Escrow</span>
                          </>
                        ) : (
                          <>
                            <Clock className="w-4 h-4" />
                            <span>Awaiting Timeout</span>
                          </>
                        )}
                      </div>
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </ScrollArea>
      </div>
    </div>
  );
}