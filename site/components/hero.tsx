"use client";

import React from 'react';
import { ChevronRight, Zap, Globe, Shield, Layers } from "lucide-react";
import { BentoGrid, BentoCard } from "@/components/ui/bento-grid";
import { cn } from "@/lib/utils";
import ShimmerButton from "@/components/magicui/shimmer-button";
import BlurIn from '@/components/magicui/blurin';  

interface HeroProps {
  onGetStarted: () => void;
}

const Hero: React.FC<HeroProps> = ({ onGetStarted }) => {
  return (
    <main className="flex flex-col items-center justify-center gap-6 z-10 relative">
      <BlurIn 
        word="AltVerse: Trustless, Instant Cross-Chain Swaps"
        className="text-balance bg-gradient-to-br from-white from-30% to-white/50 bg-clip-text py-2 text-center font-normal leading-tight tracking-tighter text-transparent sm:text-3xl md:text-4xl lg:text-[2.65rem]"
        // className="bg-gradient-to-br from-white from-30% to-white/1 bg-clip-text py-2 mt-4 mb-4 sm:text-3xl md:text-4xl lg:text-5xl leading-none tracking-tighter text-transparent text-balance translate-y-[-0.6rem] pointer-events-none"
        duration={2}
      />
      <div className="flex flex-col gap-4 sm:flex-row mb-4">
          <ShimmerButton
            className="h-12 shadow-2xl"
            shimmerColor="rgb(256 158 11)"
            shimmerSize="0.12em"
            shimmerDuration="2.5s"
            background="black"
            onClick={onGetStarted}
          >
            <span className="whitespace-pre-wrap px-8 text-center text-base font-bold leading-none tracking-tight text-amber-400 bg-black">
              Get Started
            </span>
          </ShimmerButton>
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