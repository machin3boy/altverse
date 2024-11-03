"use client";
import React, { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import Swap from "@/components/modal/swap";
import Pool from "@/components/modal/pool";
import Escrows from "@/components/modal/escrows";
import Faucet from "@/components/modal/faucet";
import USDC from "@/components/modal/usdc";
import { X } from "lucide-react";
import { Chain } from "@/components/storage";

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  chain: Chain;
}

export default function Modal({
  isOpen = true,
  onClose = () => {},
  chain,
}: ModalProps) {
  const [activeTab, setActiveTab] = useState("swap");

  const handleClose = (open: boolean): void => {
    console.log("Close button clicked");
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose} modal={false}>
      <DialogContent className="sm:max-w-[425px] bg-background text-foreground border-2 border-amber-500 h-[600px] p-0 overflow-hidden dark rounded-lg">
        <div className="flex flex-col h-full">
          <DialogHeader className="px-4 pt-4 pb-2">
            <div className="flex justify-between items-center">
              <DialogTitle className="relative text-2xl font-semibold tracking-wider text-white drop-shadow-[0_0_15px_rgba(217,119,6,0.3)] pl-1">
                <span className="relative">Altverse</span>
              </DialogTitle>
              <button
                type="button"
                className="rounded-sm bg-amber-500/10 hover:bg-amber-500/30 border border-amber-500/10 w-7 h-7 flex items-center justify-center transition-all duration-200"
                onClick={() => handleClose(true)}
              >
                <span className="sr-only">Close</span>
                <X
                  className="h-5 w-5 text-amber-500 hover:text-amber-400 transition-colors duration-200"
                  aria-hidden="true"
                  strokeWidth={2}
                />
              </button>
            </div>
          </DialogHeader>
          <Tabs
            defaultValue="swap"
            className="flex-1 flex flex-col mt-2"
            value={activeTab}
            onValueChange={setActiveTab}
          >
            <div className="px-4 mb-2">
              <TabsList className="grid w-full grid-cols-5">
                <TabsTrigger value="swap" className="font-bold">
                  <span className="-mt-0.5">Swap</span>
                </TabsTrigger>
                <TabsTrigger value="pool" className="font-bold">
                  <span className="-mt-0.5">Pool</span>
                </TabsTrigger>
                <TabsTrigger value="escrows" className="font-bold">
                  <span className="-mt-0.5">Escrows</span>
                </TabsTrigger>
                <TabsTrigger value="faucet" className="font-bold">
                  <span className="-mt-0.5">Faucet</span>
                </TabsTrigger>
                <TabsTrigger value="usdc" className="font-bold">
                  <span className="-mt-0.5">USDC</span>
                </TabsTrigger>
              </TabsList>
            </div>
            <div className="flex-1 overflow-hidden">
              <TabsContent value="swap" className="h-full p-4 space-y-4 mt-8">
                <Swap />
              </TabsContent>
              <TabsContent value="pool" className="h-full p-4 space-y-4">
                <Pool />
              </TabsContent>
              <TabsContent value="escrows" className="h-full p-4">
                <Escrows />
              </TabsContent>
              <TabsContent value="faucet" className="h-full p-4 space-y-4">
                <Faucet />
              </TabsContent>
              <TabsContent value="usdc" className="h-full p-4 space-y-4">
                <USDC />
              </TabsContent>
            </div>
          </Tabs>
        </div>
      </DialogContent>
    </Dialog>
  );
}
