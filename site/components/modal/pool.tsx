import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";

export default function Pool() {
  return (
    <>
      <ScrollArea className="h-[400px] rounded-md border-2 p-4">
        <h4 className="mb-4 text-medium font-bold leading-none">
          Your Positions
        </h4>
        <p className="text-sm text-muted-foreground font-bold">
          No active positions
        </p>
      </ScrollArea>
      <Button className="w-full">Add Liquidity</Button>
    </>
  );
}
