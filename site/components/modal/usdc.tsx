import React, { useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { BorderBeam } from "@/components/magicui/border-beam";
import NumberTicker from "@/components/magicui/number-ticker";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export default function USDC() {
  const [altcoinFromToken, setAltcoinFromToken] = useState("USDC");
  const [amount, setAmount] = useState("");
  const [receivedAmount, setReceivedAmount] = useState("");

  const handleAmountChange = (e: any) => {
    const value = e.target.value;

    if (value === "") {
      setAmount("");
      return;
    }

    if (value === "0") {
      setAmount("0");
      return;
    }

    if (!isNaN(value) && parseFloat(value) >= 0) {
      setAmount(
        value.startsWith("0") && !value.startsWith("0.")
          ? value.slice(1)
          : value
      );
    }
  };

  const isGrayText = amount === "";

  return (
    <>
      <div className="space-y-2 my-2">
        <h4 className="text-md font-bold ml-1">USDC Pool</h4>
        <p className="ml-1 text-md font-semibold font-mono tracking-tighter text-sky-500">
          <NumberTicker value={7630.47} decimalPlaces={2} />
        </p>
        <h4 className="text-md font-bold ml-1">ALT Pool</h4>
        <p className="ml-1 text-md font-semibold font-mono tracking-tighter text-amber-500">
          <NumberTicker value={1132259387.22} decimalPlaces={2} />
        </p>
      </div>
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
              <Select
                value={altcoinFromToken}
                onValueChange={setAltcoinFromToken}
              >
                <SelectTrigger className="w-[120px] border-2 border-amber-500/10 font-semibold data-[state=open]:border-amber-500 focus:ring-0 focus:ring-offset-0 bg-amber-500/10">
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
                <SelectContent className="bg-black text-white border-amber-500/20 border-2">
                  <SelectItem
                    value="USDC"
                    className="font-semibold data-[highlighted]:bg-amber-500 data-[highlighted]:text-white"
                  >
                    <div className="flex items-center">
                      <span className="w-6 h-6 rounded-full bg-primary text-primary-foreground flex items-center justify-center mr-2">
                        $
                      </span>
                      <span className="font-mono w-12">USDC</span>
                    </div>
                  </SelectItem>
                  <SelectItem
                    value="ALT"
                    className="font-semibold data-[highlighted]:bg-amber-500 data-[highlighted]:text-white"
                  >
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
          <div className="space-y-4 pt-4">
            <span className="text-sm font-mono font-bold">You receive</span>
            <div className="flex items-center space-x-2">
              <Input
                type="number"
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
              <div className="h-9 w-[120px] border-2 border-amber-500/10 font-semibold bg-amber-500/10 rounded-md flex items-center px-3">
                <div className="flex items-center">
                  <span className="w-6 h-6 rounded-full bg-primary text-primary-foreground flex items-center justify-center mr-3">
                    {altcoinFromToken === "USDC" ? "A" : "$"}
                  </span>
                  <span className="font-mono w-16">
                    {(altcoinFromToken === "USDC" ? "ALT " : "USDC").padEnd(4)}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      <Button
        className="w-full bg-gradient-to-r from-amber-900 to-amber-800 
    hover:from-amber-800 hover:to-amber-700
    active:from-amber-950 active:to-amber-900
    border border-amber-500/20 hover:border-amber-500/40
    text-amber-200 hover:text-amber-100
    shadow-lg hover:shadow-amber-900/20
    transition-all duration-200
    font-semibold
    py-2.5
    rounded-lg
    relative
    overflow-hidden
    group
    active:ring-amber-500/20
    before:absolute before:inset-0 before:bg-gradient-to-r before:from-amber-500/0 before:via-amber-500/30 before:to-amber-500/0 
    before:translate-x-[-200%] hover:before:translate-x-[200%] before:transition-transform before:duration-1000
    before:blur-md"
      >
        <div className="absolute inset-0 bg-gradient-to-r from-amber-500/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-200" />
        <div className="relative w-full px-8">
          <div className="flex justify-center items-center">
            <span className="tracking-wide">
              Swap {altcoinFromToken} to{" "}
              {altcoinFromToken === "USDC" ? "ALT" : "USDC"}
            </span>
            <span className="absolute right-0 opacity-0 group-hover:opacity-100 transform translate-x-2 group-hover:translate-x-0 transition-all duration-200">
              ⇆
            </span>
          </div>
        </div>
      </Button>
    </>
  );
}