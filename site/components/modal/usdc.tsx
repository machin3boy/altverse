import React, { useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { ChevronDown } from "lucide-react";
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
          size={450}
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
                  {(altcoinFromToken === "USDC" ? "ALT " : "USDC").padEnd(4)}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
      <Button className="w-full">
        Swap {altcoinFromToken} to{" "}
        {altcoinFromToken === "USDC" ? "ALT" : "USDC"}
      </Button>
    </>
  );
}
