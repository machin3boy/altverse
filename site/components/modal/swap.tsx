import React, { useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { BorderBeam } from "@/components/magicui/border-beam";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

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

export default function Swap() {
  const [swapFromToken, setSwapFromToken] = useState("ALT ");
  const [swapToToken, setSwapToToken] = useState("wBTC");
  const [amount, setAmount] = useState("");
  const [receivedAmount, setReceivedAmount] = useState("");

  const handleAmountChange = (e: any) => {
    const value = e.target.value;

    // Handle empty input case
    if (value === "") {
      setAmount("");
      return;
    }

    // Only allow numbers and a single decimal point
    const hasValidCharacters = /^[0-9.]*$/.test(value);
    if (!hasValidCharacters) {
      return;
    }

    // Count decimal points
    const decimalCount = (value.match(/\./g) || []).length;
    if (decimalCount > 1) {
      return;
    }

    // If we get here, the input is valid - update the state
    setAmount(value);
  };

  // Only show gray when the input is completely empty
  const isGrayText = amount === "";

  return (
    <>
      <div className="relative rounded-lg">
        <BorderBeam
          borderWidth={2}
          size={350}
          duration={10}
          colorFrom="#F59E0B"
          colorTo="#1C1205"
        />
        <div className="bg-secondary p-4 rounded-lg space-y-6">
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <span className="text-sm font-mono font-bold">You pay</span>
              <Button
                variant="ghost"
                size="sm"
                className="text-xs bg-amber-500/10 hover:bg-amber-500/20 text-amber-500"
              >
                max
              </Button>
            </div>
            <div className="flex items-center space-x-2">
              <Input
                type="number"
                value={amount}
                onChange={handleAmountChange}
                placeholder="0.0"
                className={`text-2xl font-mono bg-transparent border-none focus-visible:ring-0 focus-visible:ring-offset-0 ${
                  isGrayText
                    ? "text-gray-500 placeholder:text-gray-500"
                    : "text-white"
                }`}
                style={{
                  WebkitAppearance: "none",
                  MozAppearance: "textfield",
                }}
              />
              <Select value={swapFromToken} onValueChange={setSwapFromToken}>
                <SelectTrigger className="w-[120px] border-2 border-amber-500/10 font-semibold data-[state=open]:border-amber-500 focus:ring-0 focus:ring-offset-0 bg-amber-500/10 py-4">
                  <SelectValue>
                    <div className="flex items-center">
                      <span className="w-6 h-6 rounded-full bg-primary text-primary-foreground flex items-center justify-center mr-2">
                        {tokens.find((t) => t.symbol === swapFromToken)?.icon}
                      </span>
                      <span className="font-mono w-12">
                        {swapFromToken.padEnd(4)}
                      </span>
                    </div>
                  </SelectValue>
                </SelectTrigger>
                <SelectContent className="bg-black text-white border-amber-500/20 border-2">
                  {tokens.map((token) => (
                    <SelectItem
                      key={token.symbol}
                      value={token.symbol}
                      className="font-semibold data-[highlighted]:bg-amber-500 data-[highlighted]:text-white"
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
          <div className="space-y-4 pt-4">
            <span className="text-sm font-mono font-bold">You receive</span>
            <div className="flex items-center space-x-2">
              <Input
                type="text"
                value={receivedAmount}
                placeholder="0.0"
                className={`text-2xl font-mono bg-transparent border-none focus-visible:ring-0 focus-visible:ring-offset-0 ${
                  receivedAmount === ""
                    ? "text-gray-500 placeholder:text-gray-500"
                    : "text-white"
                }`}
                style={{
                  WebkitAppearance: "none",
                  MozAppearance: "textfield",
                }}
                readOnly
              />
              <Select value={swapToToken} onValueChange={setSwapToToken}>
                <SelectTrigger className="w-[120px] border-2 border-amber-500/10 font-semibold data-[state=open]:border-amber-500 focus:ring-0 focus:ring-offset-0 bg-amber-500/10 py-4">
                  <SelectValue>
                    <div className="flex items-center">
                      <span className="w-6 h-6 rounded-full bg-primary text-primary-foreground flex items-center justify-center mr-2">
                        {tokens.find((t) => t.symbol === swapToToken)?.icon}
                      </span>
                      <span className="font-mono w-12">
                        {swapToToken.padEnd(4)}
                      </span>
                    </div>
                  </SelectValue>
                </SelectTrigger>
                <SelectContent className="bg-black text-white border-amber-500/20 border-2">
                  {tokens.map((token) => (
                    <SelectItem
                      key={token.symbol}
                      value={token.symbol}
                      className="font-semibold data-[highlighted]:bg-amber-500 data-[highlighted]:text-white"
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
        <SelectTrigger className="border-2 border-gray-700 font-semibold data-[state=open]:border-amber-500 focus:ring-0 focus:ring-offset-0 bg-transparent">
          <SelectValue placeholder="Select destination chain" />
        </SelectTrigger>
        <SelectContent className="bg-black text-white border-amber-500/20 border-2">
          {chains.map((chain) => (
            <SelectItem
              key={chain.id}
              value={chain.id}
              className="font-semibold data-[highlighted]:bg-amber-500 data-[highlighted]:text-white"
            >
              {chain.name}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
      <Button className="w-full">Swap</Button>
    </>
  );
}
