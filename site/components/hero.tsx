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
import Tiles from "@/components/ui/tiles";
import Spider from "@/components/ui/spider";
import Image from "next/image";
import { useEffect, useState } from "react";

interface HeroProps {
  onGetStarted: () => void;
}

const Hero: React.FC<HeroProps> = ({ onGetStarted }) => {
  const [opacity, setOpacity] = useState(0);

  useEffect(() => {
    const intervalId = setInterval(() => {
      setOpacity((prev) => Math.min(prev + 5, 100));
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
            background={<Spider />}
            Icon={(props: any) => <Zap {...props} className="text-amber-500" />}
            description="One-click cross-chain swaps. Fail-safe design with auto-refunds for peace of mind. No middlemen."
            href="#"
            cta="Learn more"
          />
          <BentoCard
            name="Completely Decentralized"
            className="col-span-1 sm:col-span-2"
            background={
              <div className="absolute inset-0 overflow-hidden">
                <div className="absolute w-[200%] h-[200%] -left-1/2 -top-1/2 flex items-center justify-center">
                  <div className="relative w-full h-full">
                    <Globe
                      className="
              scale-[0.805] translate-x-[25%] translate-y-[20%]
              sm:scale-[0.7] sm:translate-x-[15%] sm:translate-y-[50%]
              md:scale-[0.6545] md:translate-x-[15%] md:translate-y-[35%]
              lg:scale-[0.736] lg:translate-x-[20%] lg:translate-y-[25%]
              xl:scale-[0.736] xl:translate-x-[25%] xl:translate-y-[25%]
              2xl:scale-[0.828] 2xl:translate-x-[25%] 2xl:translate-y-[25%]
            "
                    />
                  </div>
                </div>
              </div>
            }
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
                <div className="absolute inset-0 flex items-center justify-end">
                  <div className="relative w-2/3 h-full">
                    <Image
                      src="/images/lock.png"
                      alt="Lock"
                      layout="fill"
                      objectFit="contain"
                      className="
                        2xl:scale-[0.9] 2xl:-translate-x-[4%] 2xl:max-w-[500px]
                        xl:scale-[0.9] xl:-translate-x-[4%]
                        lg:scale-[0.9] lg:-translate-x-[4%]
                        md:scale-[0.98] md:-translate-x-[3%]
                        min-[640px]:max-[768px]:scale-[0.98] min-[640px]:max-[768px]:-translate-x-[3%]
                        min-[450px]:max-[639px]:scale-[0.75] min-[450px]:max-[639px]:-translate-x-[8%]
                        max-[449px]:scale-65 max-[449px]:-translate-x-[10%]
                      "
                    />
                  </div>
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
