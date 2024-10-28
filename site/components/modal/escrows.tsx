import React from "react";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter } from "@/components/ui/card";

export default function Escrows() {
  const sampleEscrows = [
    {
      user: "0x1234...5678",
      altAmount: "1000000000000000000", // 1 ALT
      timeout: Date.now() + 3600000, // 1 hour from now
      active: true,
    },
    {
      user: "0x8765...4321",
      altAmount: "2000000000000000000", // 2 ALT
      timeout: Date.now() - 3600000, // 1 hour ago (timed out)
      active: true,
    },
    {
      user: "0x9876...1234",
      altAmount: "500000000000000000", // 0.5 ALT
      timeout: Date.now() + 7200000, // 2 hours from now
      active: true,
    },
  ];

  return (
    <>
      <ScrollArea className="h-[450px] rounded-md border p-2 border-amber-500/20">
        {sampleEscrows.length === 0 ? (
          <>
            <h4 className="mb-2 text-medium font-bold leading-none px-2 pt-2">
              Active Escrows
            </h4>
            <p className="text-sm text-muted-foreground font-bold px-2">
              You have no active escrows
            </p>
          </>
        ) : (
          sampleEscrows
            .sort((a, b) => a.timeout - b.timeout)
            .map((escrow, index) => (
              <Card
                key={index}
                className="mb-2 border rounded-md hover:border-amber-500 transition-colors duration-200 last:mb-0"
              >
                <CardContent className="p-3 font-mono font-bold">
                  <div className="flex justify-between items-center mb-1.5">
                    <span className="text-sm">Amount:</span>
                    <span className="text-sm">
                      {(Number(escrow.altAmount) / 1e18).toFixed(2)} ALT
                    </span>
                  </div>
                  <div className="flex justify-between items-center mb-1.5">
                    <span className="text-sm">Status:</span>
                    <span className="text-sm text-green-500">Active</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm">Timeout:</span>
                    <span className="text-sm">
                      {new Date(escrow.timeout).toLocaleString()}
                    </span>
                  </div>
                </CardContent>
                <CardFooter className="p-3 pt-0">
                  <Button
                    variant="secondary"
                    className="w-full h-8 text-sm bg-sky-500/10 hover:bg-sky-500/30 text-sky-500 font-semibold hover:text-sky-400 border border-sky-500/10"
                    disabled={escrow.timeout > Date.now()}
                  >
                    {escrow.timeout <= Date.now()
                      ? "Redeem Escrow"
                      : "Awaiting Timeout"}
                  </Button>
                </CardFooter>
              </Card>
            ))
        )}
      </ScrollArea>
    </>
  );
}
