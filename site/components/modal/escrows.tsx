import React, { useState, useEffect } from "react";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { useStorage } from "../storage";
import { toast } from "sonner";

interface Escrow {
  id: string;         // This should be the bytes32 hash
  user: string;
  altAmount: string;
  timeout: number;
  active: boolean;
}

export default function Escrows() {
  const { fetchUserEscrows, claimTimedOutEscrow, web3 } = useStorage();
  const [escrows, setEscrows] = useState<Escrow[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isPolling, setIsPolling] = useState(false);

  const loadEscrows = async () => {
    if (!web3) return;

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
    }
  };

  // Initial load
  useEffect(() => {
    const load = async () => {
      setIsLoading(true);
      await loadEscrows();
      setIsLoading(false);
    };
    load();
  }, [web3]);

  // Polling effect
  useEffect(() => {
    let intervalId: NodeJS.Timeout;

    if (isPolling) {
      intervalId = setInterval(loadEscrows, 2000);
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
    return Number(formatted).toFixed(6);
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

  return (
    <div className="flex flex-col h-full max-h-[500px]">
      {/* Title section */}
      <div className="px-2 py-4">
        <h4 className="text-lg font-bold text-amber-500">Active Escrows</h4>
        <p className="text-sm text-gray-400">
          View and manage your cross-chain escrows
        </p>
      </div>

      {/* Scrollable content */}
      <div className="flex-1 min-h-0"> {/* This ensures proper scrolling */}
        <ScrollArea className="h-full rounded-md border border-amber-500/20">
          <div className="p-2">
            {isLoading ? (
              <div className="flex items-center justify-center h-40">
                <span className="text-amber-500">Loading escrows...</span>
              </div>
            ) : escrows.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-40">
                <p className="text-sm text-muted-foreground font-bold">
                  You have no active escrows
                </p>
                <p className="text-xs text-gray-500 mt-2">
                  Escrows will appear here when you perform cross-chain swaps
                </p>
              </div>
            ) : (
              <div className="space-y-2">
                {escrows.map((escrow, index) => (
                  <Card
                    key={index}
                    className={`border rounded-md transition-colors duration-200 
                      ${escrow.active 
                        ? "hover:border-amber-500" 
                        : "opacity-50 hover:border-gray-500"}`}
                  >
                    <CardContent className="p-3 font-mono font-bold">
                      <div className="flex justify-between items-center mb-1.5">
                        <span className="text-sm">Amount:</span>
                        <span className="text-sm">
                          {formatAltAmount(escrow.altAmount)} ALT
                        </span>
                      </div>
                      <div className="flex justify-between items-center mb-1.5">
                        <span className="text-sm">Status:</span>
                        <span className={`text-sm ${escrow.active ? "text-green-500" : "text-red-500"}`}>
                          {escrow.active ? "Active" : "Inactive"}
                        </span>
                      </div>
                      <div className="flex justify-between items-center mb-1.5">
                        <span className="text-sm">Address:</span>
                        <span className="text-sm">
                          {formatAddress(escrow.user)}
                        </span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-sm">Time Left:</span>
                        <span className={`text-sm ${
                          Date.now() >= escrow.timeout ? "text-red-500" : "text-amber-500"
                        }`}>
                          {getTimeLeft(escrow.timeout)}
                        </span>
                      </div>
                    </CardContent>
                    <CardFooter className="p-3 pt-0">
                      <Button
                        variant="secondary"
                        className={`w-full h-8 text-sm font-semibold
                          ${Date.now() >= escrow.timeout && escrow.active
                            ? "bg-sky-500/10 hover:bg-sky-500/30 text-sky-500 hover:text-sky-400 border border-sky-500/10"
                            : "bg-neutral-800 text-neutral-400 cursor-not-allowed"}
                        `}
                        disabled={Date.now() < escrow.timeout || !escrow.active}
                        onClick={() => handleClaimEscrow(escrow.id)}
                      >
                        {!escrow.active 
                          ? "Escrow Inactive"
                          : Date.now() >= escrow.timeout 
                            ? "Claim Escrow" 
                            : "Awaiting Timeout"}
                      </Button>
                    </CardFooter>
                  </Card>
                ))}
              </div>
            )}
          </div>
        </ScrollArea>
      </div>
    </div>
  );
}
