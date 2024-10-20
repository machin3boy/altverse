"use client";

import React, { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { ArrowLeftRight, Droplet, ChevronDown } from "lucide-react";
import { BorderBeam } from "@/components/magicui/border-beam";
import CryptoRequestGrid from "./modal/faucet";

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function Modal(
  { isOpen, onClose }: ModalProps = { isOpen: true, onClose: () => {} }
) {
  const [activeTab, setActiveTab] = useState("swap");
  const [swapFromToken, setSwapFromToken] = useState("ALT ");
  const [swapToToken, setSwapToToken] = useState("wBTC");
  const [altcoinFromToken, setAltcoinFromToken] = useState("USDC");

  const tokens = [
    { symbol: "ALT ", icon: "A" },
    { symbol: "USDC", icon: "$" },
    { symbol: "wBTC", icon: "₿" },
    { symbol: "wETH", icon: "Ξ" },
    { symbol: "wLNK", icon: "⬡" },
  ];

  const chains = [
    { name: "Celo Testnet", id: "celo" },
    { name: "Fuji Testnet", id: "fuji" },
  ];

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px] bg-background text-foreground border-2 border-amber-500 h-[600px] p-0 overflow-hidden dark">
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
                <TabsTrigger value="swap">
                  <ArrowLeftRight className="w-4 h-4 mr-2" />
                  Swap
                </TabsTrigger>
                <TabsTrigger value="pool">
                  <Droplet className="w-4 h-4 mr-2" />
                  Pool
                </TabsTrigger>
                <TabsTrigger value="escrows">Escrows</TabsTrigger>
                <TabsTrigger value="faucet">Faucet</TabsTrigger>
                <TabsTrigger value="usdc">USDC</TabsTrigger>
              </TabsList>
            </div>
            <div className="flex-1 overflow-hidden">
              <TabsContent value="swap" className="h-full p-4 space-y-4 mt-8">
                <div className="relative rounded-lg">
                  <BorderBeam
                    size={300}
                    duration={10}
                    colorFrom="#F59E0B"
                    colorTo="#1C1205"
                  />
                  <div className="bg-secondary p-4 rounded-lg space-y-6">
                    <div className="space-y-2">
                      <div className="flex justify-between items-center">
                        <span className="text-sm font-medium">You pay</span>
                        <Button variant="ghost" size="sm" className="text-xs">
                          Max
                        </Button>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Input
                          type="number"
                          placeholder="0.0"
                          className="text-2xl font-mono bg-transparent border-none focus-visible:ring-0 focus-visible:ring-offset-0"
                          style={{
                            WebkitAppearance: "none",
                            MozAppearance: "textfield",
                          }}
                        />
                        <Select
                          value={swapFromToken}
                          onValueChange={setSwapFromToken}
                        >
                          <SelectTrigger className="w-[120px]">
                            <SelectValue>
                              <div className="flex items-center">
                                <span className="w-6 h-6 rounded-full bg-primary text-primary-foreground flex items-center justify-center mr-2">
                                  {
                                    tokens.find(
                                      (t) => t.symbol === swapFromToken
                                    )?.icon
                                  }
                                </span>
                                <span className="font-mono w-12">
                                  {swapFromToken.padEnd(4)}
                                </span>
                              </div>
                            </SelectValue>
                          </SelectTrigger>
                          <SelectContent>
                            {tokens.map((token) => (
                              <SelectItem
                                key={token.symbol}
                                value={token.symbol}
                              >
                                <div className="flex items-center">
                                  <span className="w-6 h-6 rounded-full bg-primary text-primary-foreground flex items-center justify-center mr-2">
                                    {token.icon}
                                  </span>
                                  <span className="font-mono w-12">
                                    {token.symbol.padEnd(4)}
                                  </span>
                                </div>
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                    <div className="flex justify-center">
                      <ChevronDown className="w-6 h-6" />
                    </div>
                    <div className="space-y-2">
                      <span className="text-sm font-medium">You receive</span>
                      <div className="flex items-center space-x-2">
                        <Input
                          type="number"
                          placeholder="0.0"
                          className="text-2xl font-mono bg-transparent border-none focus-visible:ring-0 focus-visible:ring-offset-0"
                          readOnly
                          style={{
                            WebkitAppearance: "none",
                            MozAppearance: "textfield",
                          }}
                        />
                        <Select
                          value={swapToToken}
                          onValueChange={setSwapToToken}
                        >
                          <SelectTrigger className="w-[120px]">
                            <SelectValue>
                              <div className="flex items-center">
                                <span className="w-6 h-6 rounded-full bg-primary text-primary-foreground flex items-center justify-center mr-2">
                                  {
                                    tokens.find((t) => t.symbol === swapToToken)
                                      ?.icon
                                  }
                                </span>
                                <span className="font-mono w-12">
                                  {swapToToken.padEnd(4)}
                                </span>
                              </div>
                            </SelectValue>
                          </SelectTrigger>
                          <SelectContent>
                            {tokens.map((token) => (
                              <SelectItem
                                key={token.symbol}
                                value={token.symbol}
                              >
                                <div className="flex items-center">
                                  <span className="w-6 h-6 rounded-full bg-primary text-primary-foreground flex items-center justify-center mr-2">
                                    {token.icon}
                                  </span>
                                  <span className="font-mono w-12">
                                    {token.symbol.padEnd(4)}
                                  </span>
                                </div>
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                  </div>
                </div>
                <Select>
                  <SelectTrigger>
                    <SelectValue placeholder="Select destination chain" />
                  </SelectTrigger>
                  <SelectContent>
                    {chains.map((chain) => (
                      <SelectItem key={chain.id} value={chain.id}>
                        {chain.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Button className="w-full">Connect Wallet</Button>
              </TabsContent>
              <TabsContent value="pool" className="h-full p-4 space-y-4">
                <ScrollArea className="h-[400px] rounded-md border p-4">
                  <h4 className="mb-4 text-sm font-medium leading-none">
                    Your Positions
                  </h4>
                  <p className="text-sm text-muted-foreground">
                    No active positions
                  </p>
                </ScrollArea>
                <Button className="w-full">Add Liquidity</Button>
              </TabsContent>
              <TabsContent value="escrows" className="h-full p-4">
                <ScrollArea className="h-[400px] rounded-md border p-4">
                  <h4 className="mb-4 text-sm font-medium leading-none">
                    Active Escrows
                  </h4>
                  <p className="text-sm text-muted-foreground">
                    No active escrows
                  </p>
                </ScrollArea>
              </TabsContent>
              <TabsContent value="faucet" className="h-full p-4 space-y-4">
                <CryptoRequestGrid />
              </TabsContent>
              <TabsContent value="usdc" className="h-full p-4 space-y-4">
                <div className="space-y-4">
                  <h4 className="text-sm font-medium">USDC Pool</h4>
                  <Input
                    type="text"
                    placeholder="0.0"
                    readOnly
                    className="font-mono"
                  />
                  <h4 className="text-sm font-medium">AltCoin Pool</h4>
                  <Input
                    type="text"
                    placeholder="0.0"
                    readOnly
                    className="font-mono"
                  />
                </div>
                <div className="bg-secondary p-4 rounded-lg space-y-6">
                  <div className="space-y-2">
                    <div className="flex justify-between items-center">
                      <span className="text-sm font-medium">You pay</span>
                      <Button variant="ghost" size="sm" className="text-xs">
                        Max
                      </Button>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Input
                        type="number"
                        placeholder="0.0"
                        className="text-2xl font-mono bg-transparent border-none focus-visible:ring-0 focus-visible:ring-offset-0"
                        style={{
                          WebkitAppearance: "none",
                          MozAppearance: "textfield",
                        }}
                      />
                      <Select
                        value={altcoinFromToken}
                        onValueChange={setAltcoinFromToken}
                      >
                        <SelectTrigger className="w-[120px]">
                          <SelectValue>
                            <div className="flex items-center">
                              <span className="w-6 h-6 rounded-full bg-primary text-primary-foreground flex items-center justify-center mr-2">
                                {altcoinFromToken === "USDC" ? "$" : "A"}
                              </span>
                              <span className="font-mono w-12">
                                {altcoinFromToken.padEnd(4)}
                              </span>
                            </div>
                          </SelectValue>
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="USDC">
                            <div className="flex items-center">
                              <span className="w-6 h-6 rounded-full bg-primary text-primary-foreground flex items-center justify-center mr-2">
                                $
                              </span>
                              <span className="font-mono w-12">USDC</span>
                            </div>
                          </SelectItem>
                          <SelectItem value="ALT">
                            <div className="flex items-center">
                              <span className="w-6 h-6 rounded-full bg-primary text-primary-foreground flex items-center justify-center mr-2">
                                A
                              </span>
                              <span className="font-mono w-12">ALT </span>
                            </div>
                          </SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  <div className="flex justify-center">
                    <ChevronDown className="w-6 h-6" />
                  </div>
                  <div className="space-y-2">
                    <span className="text-sm font-medium">You receive</span>
                    <div className="flex items-center space-x-2">
                      <Input
                        type="number"
                        placeholder="0.0"
                        className="text-2xl font-mono bg-transparent border-none focus-visible:ring-0 focus-visible:ring-offset-0"
                        readOnly
                        style={{
                          WebkitAppearance: "none",
                          MozAppearance: "textfield",
                        }}
                      />
                      <div className="w-[120px] h-10 px-3 py-2 rounded-md border border-input bg-background text-sm flex items-center">
                        <span className="w-6 h-6 rounded-full bg-primary text-primary-foreground flex items-center justify-center mr-2">
                          {altcoinFromToken === "USDC" ? "A" : "$"}
                        </span>
                        <span className="font-mono w-12">
                          {(altcoinFromToken === "USDC"
                            ? "ALT "
                            : "USDC"
                          ).padEnd(4)}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
                <Button className="w-full">
                  Swap {altcoinFromToken}/
                  {altcoinFromToken === "USDC" ? "ALT" : "USDC"}
                </Button>
                <div className="space-y-2">
                  <h4 className="text-sm font-medium">Your USDC Balance</h4>
                  <Input
                    type="text"
                    placeholder="0.0"
                    readOnly
                    className="font-mono"
                  />
                </div>
                <div className="space-y-2">
                  <h4 className="text-sm font-medium">Your AltCoin Balance</h4>
                  <Input
                    type="text"
                    placeholder="0.0"
                    readOnly
                    className="font-mono"
                  />
                </div>
              </TabsContent>
            </div>
          </Tabs>
        </div>
      </DialogContent>
    </Dialog>
  );
}
