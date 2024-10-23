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

const SwapModal = () => {
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
}