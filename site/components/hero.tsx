import React from "react";
import Link from "next/link";
import {
  ChevronRight,
  Zap,
  Globe as GlobeIcon,
  Shield,
  Layers,
} from "lucide-react";
import { BentoGrid, BentoCard } from "@/components/ui/bento-grid";
import { cn } from "@/lib/utils";
import ShimmerButton from "@/components/magicui/shimmer-button";
import BlurIn from "@/components/magicui/blurin";
import Globe from "@/components/magicui/globe";
import Tiles from "@/components/magicui/tiles";
import Image from "next/image";
import { useEffect, useState } from "react";

interface HeroProps {
  onGetStarted: () => void;
}

const Hero: React.FC<HeroProps> = ({ onGetStarted }) => {
  const [opacity, setOpacity] = useState(0);

  useEffect(() => {
    const intervalId = setInterval(() => {
      setOpacity(prev => Math.min(prev + 5, 100));
    }, 100);
    return () => clearInterval(intervalId);
  }, []);

  return (
    <main className="flex flex-col items-center justify-center gap-4 z-10 relative">
      <Link
        href="/whitepaper.pdf"
        target="_blank"
        rel="noopener noreferrer"
        className="mb-2"
      >
        <button className="flex items-center gap-1 px-3 py-1 rounded-full bg-amber-600/10 text-gray-500/80 hover:bg-amber-600/30 hover:text-white/80 duration-300 text-xs font-semibold border border-amber-500/5 hover:border-amber-700/30">
          <span className="opacity-70">✨</span>
          <span>Learn More</span>
          <ChevronRight size={14} />
        </button>
      </Link>
      <BlurIn
        word="AltVerse: Trustless, Instant Cross-Chain Swaps"
        className="text-balance bg-gradient-to-br from-amber-50 from-30% to-amber-100/80 bg-clip-text pb-2 text-center font-normal leading-tight tracking-tighter text-transparent sm:text-3xl md:text-4xl lg:text-[2.65rem]"
        duration={2}
      />
      <div className="flex flex-col gap-4 sm:flex-row mb-4 mt-[4px]">
        <ShimmerButton
          className="h-12 shadow-2xl"
          shimmerColor="rgb(256 158 11)"
          shimmerSize="0.12em"
          shimmerDuration="2.5s"
          background="black"
          onClick={onGetStarted}
        >
          <span className="whitespace-pre-wrap px-8 text-center text-base font-semibold leading-none tracking-tight text-amber-100">
            Get Started
          </span>
        </ShimmerButton>
      </div>
      <div className="w-full max-w-6xl mx-auto">
        <BentoGrid className="grid-cols-1 gap-5 sm:grid-cols-5">
          <BentoCard
            name="Instantly Swap Across Chains"
            className="col-span-1 sm:col-span-3"
            background={<div></div>}
            Icon={(props: any) => <Zap {...props} className="text-amber-500" />}
            description="One-click cross-chain swaps. Fail-safe design with auto-refunds for peace of mind. No middlemen."
            href="#"
            cta="Learn more"
          />
          <BentoCard
            name="Completely Decentralized"
            className="col-span-1 sm:col-span-2"
            background={<Globe />}
            Icon={(props: any) => (
              <GlobeIcon {...props} className="text-amber-500" />
            )}
            description="No central entity. Zero hackable bridges. All on-chain."
            href="#"
            cta="Explore"
          />
          <BentoCard
            name="Fully Trustless"
            className="col-span-1 sm:col-span-2"
            background={
              <div className="absolute inset-0 overflow-hidden transition-all duration-200 ease-out [mask-image:linear-gradient(to_top,transparent_10%,rgba(0,0,0,1)_70%)] group-hover:scale-105">
                <div 
                  className="absolute top-1/2 left-1/2 w-[600%] h-[600%] transform -translate-x-1/2 -translate-y-1/2 scale-50 lg:-translate-x-[46.5%] lg:-translate-y-[51%] md:-translate-x-[46.5%] sm:scale-50 sm:-translate-x-[47.6%] sm:-translate-y-[51%] sm:scale-[0.12] md:scale-[0.11] lg:scale-[0.12] transition-opacity duration-1000 ease-out"
                  style={{ opacity: opacity / 100 }}
                >
                  <Image
                    src="/images/lock.png"
                    alt=""
                    layout="fill"
                    objectFit="contain"
                  />
                </div>
              </div>
            }
            Icon={(props: any) => (
              <Shield {...props} className="text-amber-500" />
            )}
            description="Secured by trustless escrows & timeouts."
            href="#"
            cta="Learn more"
          />
          <BentoCard
            name="Multichain Ecosystem"
            className="col-span-1 sm:col-span-3"
            background={<Tiles />}
            Icon={(props: any) => (
              <Layers {...props} className="text-amber-500" />
            )}
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
