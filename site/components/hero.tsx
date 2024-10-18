"use client";

import React from 'react';
import { ChevronRight, Zap, Globe, Shield, Layers } from "lucide-react";
import { BentoGrid, BentoCard } from "@/components/ui/bento-grid";
import { cn } from "@/lib/utils";
import BlurIn from '@/components/magicui/blurin';  

interface HeroProps {
  onGetStarted: () => void;
}

const Hero: React.FC<HeroProps> = ({ onGetStarted }) => {
  return (
    <main className="flex flex-col items-center justify-center gap-6 z-10 relative">
      <BlurIn 
        word="AltVerse: Trustless, Instant Cross-Chain Swaps"
        className="text-balance bg-gradient-to-br from-white from-30% to-white/60 bg-clip-text py-2 text-center text-3xl font-semibold leading-tight tracking-tighter text-transparent sm:text-4xl md:text-5xl"
      />

      <div className="flex flex-col gap-4 sm:flex-row mb-4">
        <button
          onClick={onGetStarted}
          className={cn(
            "bg-white text-black shadow hover:bg-white/90",
            "group relative inline-flex h-10 items-center justify-center gap-2 overflow-hidden whitespace-pre rounded-md px-4 py-2 text-sm font-semibold tracking-tighter",
            "transform-gpu ring-offset-black transition-all duration-300 ease-out hover:ring-2 hover:ring-amber-500 hover:ring-offset-2 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-500 focus-visible:ring-offset-2",
          )}
        >
          Get Started
          <ChevronRight className="size-4 translate-x-0 transition-all duration-300 ease-out group-hover:translate-x-1" />
        </button>
      </div>

      <div className="w-full max-w-6xl mx-auto">
        <BentoGrid className="grid-cols-1 gap-4 sm:grid-cols-5">
          <BentoCard
            name="Instantly Swap Across Chains"
            className="col-span-1 sm:col-span-3"
            background={<div className="absolute inset-0 bg-gradient-to-br from-amber-500/10 to-transparent" />}
            Icon={Zap}
            description="One-click cross-chain swaps. Fail-safe design with auto-refunds for peace of mind. No middlemen."
            href="#"
            cta="Learn more"
          />
          <BentoCard
            name="Completely Decentralized"
            className="col-span-1 sm:col-span-2"
            background={<div className="absolute inset-0 bg-gradient-to-bl from-amber-500/10 to-transparent" />}
            Icon={Globe}
            description="No central entity. Zero hackable bridges. All on-chain."
            href="#"
            cta="Explore"
          />
          <BentoCard
            name="Fully Trustless"
            className="col-span-1 sm:col-span-2"
            background={<div className="absolute inset-0 bg-gradient-to-tr from-amber-500/10 to-transparent" />}
            Icon={Shield}
            description="Secured by trustless escrows & timeouts."
            href="#"
            cta="Learn more"
          />
          <BentoCard
            name="Multichain Ecosystem"
            className="col-span-1 sm:col-span-3"
            background={<div className="absolute inset-0 bg-gradient-to-tl from-amber-500/10 to-transparent" />}
            Icon={Layers}
            description="Swap across popular L1s/L2s, etc. seamlessly. Earn by providing liquidity to pools on any chain."
            href="#"
            cta="Join now"
          />
        </BentoGrid>
      </div>
    </main>
  );
};

export default Hero;