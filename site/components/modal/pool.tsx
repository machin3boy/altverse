import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Card, CardContent, CardFooter } from "@/components/ui/card";

export default function Pool() {
  const samplePools = [
    {
      token: "0x1234...5678",
      tokenSymbol: "wLINK",
      tokenReserve: "1000000000000000000000000", // 100000 LINK (18 decimals)
      altReserve: "1000000000000000000000", // 1000 ALT
      totalShares: "1000000000000000000000",
      userShares: "100000000000000000000", // 10% of pool
    },
    {
      token: "0x8765...4321",
      tokenSymbol: "wETH",
      tokenReserve: "1000000000000000000", // 1 ETH (18 decimals)
      altReserve: "2000000000000000000000", // 2000 ALT
      totalShares: "500000000000000000000",
      userShares: "250000000000000000000", // 50% of pool
    },
  ];

  return (
    <>
      <ScrollArea className="h-[400px] rounded-md border-2 p-2">
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
              className="mb-2 border-2 rounded-md hover:border-amber-500 transition-colors duration-200 last:mb-0"
            >
              <CardContent className="p-3 font-mono font-bold">
                <div className="flex justify-between items-center mb-1.5">
                  <span className="text-sm">Pair:</span>
                  <span className="text-sm">
                    {pool.tokenSymbol}/ALT
                  </span>
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
                  <span className="text-sm">
                    {pool.tokenSymbol}:
                  </span>
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
                <Button
                  variant="secondary"
                  className="w-full h-8 text-sm bg-zinc-800 hover:bg-zinc-700 text-amber-500 hover:text-amber-400"
                >
                  Add Liquidity
                </Button>
                <Button
                  variant="secondary"
                  className="w-full h-8 text-sm bg-zinc-800 hover:bg-zinc-700 text-red-400 hover:text-red-300"
                >
                  Remove Liquidity
                </Button>
              </CardFooter>
            </Card>
          ))
        )}
      </ScrollArea>
      <Button className="w-full mt-2">Add Liquidity</Button>
    </>
  );
}