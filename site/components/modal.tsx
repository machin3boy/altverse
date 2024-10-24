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
import { useStorage } from "@/components/storage";
import { toast } from "sonner";

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function Modal(
  { isOpen, onClose }: ModalProps = { isOpen: true, onClose: () => {} }
) {
  const [activeTab, setActiveTab] = useState("swap");

  const handleOpenChange = (open: boolean) => {
    if (!open) {
      // Only call onClose when the Dialog is actually closing
      onClose();
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleOpenChange} modal={false}>
      <DialogContent 
        className="sm:max-w-[425px] bg-background text-foreground border-2 border-amber-500 h-[600px] p-0 overflow-hidden dark"
        onPointerDownOutside={(e) => {
          e.preventDefault();
        }}
        onEscapeKeyDown={(e) => {
          e.preventDefault();
        }}
      >
        <div className="flex flex-col h-full">
          <DialogHeader className="px-4 py-2">
            <DialogTitle className="text-2xl font-bold">AltVerse</DialogTitle>
          </DialogHeader>
          <Tabs
            defaultValue="swap"
            className="flex-1 flex flex-col"
            value={activeTab}
            onValueChange={setActiveTab}
          >
            <div className="px-4">
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