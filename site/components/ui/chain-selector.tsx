import React, { useState, useEffect } from "react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogAction,
  AlertDialogCancel,
} from "@/components/ui/alert-dialog";
import { X } from "lucide-react";
import { useStorage } from "@/components/storage";

interface ChainSwitcherDialogProps {
  currentChainId: string;
  onSwitch: (chainId: string) => Promise<boolean>;
}

const ChainSwitcherDialog: React.FC<ChainSwitcherDialogProps> = ({
  currentChainId,
  onSwitch,
}) => {
  const { chains } = useStorage();
  const otherChains = chains.filter((chain) => chain.id !== currentChainId);
  const [selectedChain, setSelectedChain] = useState<string>(otherChains[0]?.id || "");
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (otherChains.length > 0 && !otherChains.find((chain) => chain.id === selectedChain)) {
      setSelectedChain(otherChains[0].id);
    }
  }, [currentChainId, otherChains]);

  const handleSwitch = async () => {
    if (!selectedChain) return;
    setIsLoading(true);
    try {
      await onSwitch(selectedChain);
    } catch (error) {
      console.error("Failed to switch chain:", error);
    } finally {
      setIsLoading(false);
    }
  };

  if (otherChains.length === 0) return null;

  return (
    <AlertDialogContent className="sm:max-w-[425px] bg-background p-0 overflow-hidden dark rounded-lg border-2 border-sky-500/30">
      <div className="flex flex-col h-full">
        <AlertDialogHeader className="px-4 pt-4">
          <div className="flex justify-between items-center">
            <AlertDialogTitle className="text-xl font-semibold text-white pt-1 pl-1">
              Select Chain to Switch To
            </AlertDialogTitle>
            <AlertDialogCancel
              className="rounded-sm bg-sky-500/10 hover:bg-sky-500/30 border border-sky-500/10 w-7 h-7 flex items-center justify-center transition-all duration-200 p-0"
            >
              <span className="sr-only">Close</span>
              <X
                className="h-5 w-5 text-sky-500 hover:text-sky-400 transition-colors duration-200"
                aria-hidden="true"
                strokeWidth={2}
              />
            </AlertDialogCancel>
          </div>
        </AlertDialogHeader>

        <div className="px-6 mt-12 flex-1">
          <Select
            value={selectedChain}
            onValueChange={setSelectedChain}
            disabled={isLoading}
          >
            <SelectTrigger className="w-full border-sky-500/10 font-semibold data-[state=open]:border-sky-500 focus:ring-0 focus:ring-offset-0 bg-sky-500/10 py-4 transition-colors duration-200 text-white">
              <SelectValue>
                <div className="flex items-center gap-2">
                  <img
                    src={otherChains.find((chain) => chain.id === selectedChain)?.logoSrc}
                    alt={otherChains.find((chain) => chain.id === selectedChain)?.name}
                    className="w-5 h-5"
                  />
                  <span className="font-mono">
                    {otherChains.find((chain) => chain.id === selectedChain)?.name}
                  </span>
                </div>
              </SelectValue>
            </SelectTrigger>
            <SelectContent className="bg-neutral-950 text-white border-sky-500/20">
              {otherChains.map((chain) => (
                <SelectItem
                  key={chain.id}
                  value={chain.id}
                  className="font-semibold text-white data-[highlighted]:bg-sky-500/30 data-[highlighted]:text-white font-mono"
                >
                  <div className="flex items-center gap-2">
                    <img
                      src={chain.logoSrc}
                      alt={chain.name}
                      className="w-5 h-5 opacity-80"
                    />
                    {chain.name}
                  </div>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <AlertDialogDescription className="text-gray-400 text-sm mt-4 font-semibold px-1">
            The network will be added to your wallet if not already present.
          </AlertDialogDescription>
        </div>

        <AlertDialogFooter className="flex flex-col sm:flex-row justify-end gap-1 sm:gap-2 px-6 pt-8 pb-4">
          <AlertDialogAction
            className="h-9 px-4 bg-sky-500/10 hover:bg-sky-500/30 
              text-sky-500 hover:text-sky-400 
              border border-sky-500/10 font-semibold
              transition-all duration-200
              disabled:opacity-50 disabled:cursor-not-allowed
              disabled:hover:bg-sky-500/10 disabled:hover:text-sky-500
              order-1 sm:order-2"
            onClick={handleSwitch}
            disabled={isLoading || !selectedChain}
          >
            {isLoading ? "Swapping..." : "Swap"}
          </AlertDialogAction>
          <AlertDialogCancel
            className="h-9 px-4 bg-neutral-900 text-white border border-sky-500/10
              hover:bg-neutral-800 transition-colors font-semibold
              order-2 sm:order-1"
            disabled={isLoading}
          >
            Cancel
          </AlertDialogCancel>
        </AlertDialogFooter>
      </div>
    </AlertDialogContent>
  );
};

export default ChainSwitcherDialog;