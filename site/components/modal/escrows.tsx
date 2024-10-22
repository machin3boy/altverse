import React from "react";
import { ScrollArea } from "@/components/ui/scroll-area";

export default function Escrows() {
  return (
    <>
      <ScrollArea className="h-[400px] rounded-md border-2 p-4">
        <h4 className="mb-4 text-medium font-bold leading-none">
          Active Escrows
        </h4>
        <p className="text-sm text-muted-foreground font-bold">
          No active escrows
        </p>
      </ScrollArea>
    </>
  );
}
