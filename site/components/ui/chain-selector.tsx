import React, { useState, useEffect } from 'react';
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
import chains from '@/app/constants';

interface ChainSwitcherDialogProps {
  currentChainId: string;
  onSwitch: (chainId: string) => Promise<boolean>;
}

const ChainSwitcherDialog: React.FC<ChainSwitcherDialogProps> = ({ 
  currentChainId, 
  onSwitch
}) => {
  // Filter out current chain and format remaining chains
  const otherChains = chains.filter(chain => chain.id !== currentChainId);
  
  // Set initial selected chain
  const [selectedChain, setSelectedChain] = useState<string>(otherChains[0]?.id || '');
  const [isLoading, setIsLoading] = useState(false);

  // Update selected chain if available chains change
  useEffect(() => {
    if (otherChains.length > 0 && !otherChains.find(chain => chain.id === selectedChain)) {
      setSelectedChain(otherChains[0].id);
    }
  }, [currentChainId, otherChains]);

  const handleSwitch = async () => {
    if (!selectedChain) return;
    
    setIsLoading(true);
    try {
      await onSwitch(selectedChain);
    } catch (error) {
      console.error('Failed to switch chain:', error);
    } finally {
      setIsLoading(false);
    }
  };

  if (otherChains.length === 0) {
    return null;
  }

  return (
    <AlertDialogContent className="dark rounded-lg">
      <AlertDialogHeader className="flex flex-col gap-3">
        <AlertDialogTitle className="flex text-white">
          Select chain to switch to
        </AlertDialogTitle>
        <div className="w-full">
          <Select 
            value={selectedChain} 
            onValueChange={setSelectedChain}
            disabled={isLoading}
          >
            <SelectTrigger 
              className="w-full bg-neutral-800 border-amber-500/20 
                text-white hover:border-amber-500/40 transition-colors
                disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <SelectValue>
                <div className="flex items-center gap-2">
                  <img
                    src={otherChains.find(chain => chain.id === selectedChain)?.logoSrc}
                    alt={otherChains.find(chain => chain.id === selectedChain)?.name}
                    className="w-4 h-4"
                    />
                  {otherChains.find(chain => chain.id === selectedChain)?.name}
                </div>
              </SelectValue>
            </SelectTrigger>
            <SelectContent className="dark bg-neutral-900 border-amber-500/20">
              {otherChains.map((chain) => (
                <SelectItem 
                  key={chain.id} 
                  value={chain.id}
                  className="text-white hover:bg-amber-500/20 cursor-pointer"
                >
                  <div className="flex items-center gap-2">
                    <img
                      src={chain.logoSrc}
                      alt={chain.name}
                      className="w-4 h-4"
                    />
                    {chain.name}
                  </div>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <AlertDialogDescription className="flex dark">
          The network will be added to your wallet if not already present.
        </AlertDialogDescription>
      </AlertDialogHeader>
      <AlertDialogFooter className="flex justify-end mt-8">
        <div className="flex justify-end items-center space-x-4">
          <AlertDialogCancel 
            className="w-20 text-white h-9"
            disabled={isLoading}
          >
            Cancel
          </AlertDialogCancel>
          <AlertDialogAction
            className="w-20 h-9 bg-amber-800 hover:bg-amber-800/50 text-white
              disabled:opacity-50 disabled:cursor-not-allowed"
            onClick={handleSwitch}
            disabled={isLoading || !selectedChain}
          >
            {isLoading ? "Swapping..." : "Swap"}
          </AlertDialogAction>
        </div>
      </AlertDialogFooter>
    </AlertDialogContent>
  );
};

export default ChainSwitcherDialog;