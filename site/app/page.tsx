"use client"

import { motion } from "framer-motion"
import { ChevronRight } from "lucide-react"
import { useRef } from "react"
import { useInView } from "framer-motion"
import { BentoGrid, BentoCard } from "@/components/ui/bento-grid"
import { cn } from "@/lib/utils"
import { Zap, Globe, Shield, Layers } from "lucide-react"

export default function Component() {
  const fadeInRef = useRef(null)
  const fadeInInView = useInView(fadeInRef, {
    once: true,
  })

  const fadeUpVariants = {
    initial: {
      opacity: 0,
      y: 24,
    },
    animate: {
      opacity: 1,
      y: 0,
    },
  }

  return (
    <div className="relative min-h-screen bg-black text-white overflow-hidden flex items-center">
      <div className="container mx-auto px-4 py-8 flex flex-col justify-center h-full">
        <main className="flex flex-col items-center justify-center gap-6">
          <motion.h1
            ref={fadeInRef}
            className="text-balance bg-gradient-to-br from-white from-30% to-white/60 bg-clip-text py-2 text-center text-3xl font-semibold leading-tight tracking-tighter text-transparent sm:text-4xl md:text-5xl"
            animate={fadeInInView ? "animate" : "initial"}
            variants={fadeUpVariants}
            initial={false}
            transition={{
              duration: 0.6,
              delay: 0.1,
              ease: [0.21, 0.47, 0.32, 0.98],
              type: "spring",
            }}
          >
            AltVerse: Trustless, Instant Cross-Chain Swaps
          </motion.h1>

          <motion.div
            animate={fadeInInView ? "animate" : "initial"}
            variants={fadeUpVariants}
            className="flex flex-col gap-4 sm:flex-row mb-4"
            initial={false}
            transition={{
              duration: 0.6,
              delay: 0.3,
              ease: [0.21, 0.47, 0.32, 0.98],
              type: "spring",
            }}
          >
            <a
              href="#"
              className={cn(
                "bg-white text-black shadow hover:bg-white/90",
                "group relative inline-flex h-10 items-center justify-center gap-2 overflow-hidden whitespace-pre rounded-md px-4 py-2 text-sm font-semibold tracking-tighter",
                "transform-gpu ring-offset-black transition-all duration-300 ease-out hover:ring-2 hover:ring-amber-500 hover:ring-offset-2 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-500 focus-visible:ring-offset-2",
              )}
            >
              Get Started
              <ChevronRight className="size-4 translate-x-0 transition-all duration-300 ease-out group-hover:translate-x-1" />
            </a>
          </motion.div>

          <motion.div
            animate={fadeInInView ? "animate" : "initial"}
            variants={fadeUpVariants}
            initial={false}
            transition={{
              duration: 1.4,
              delay: 0.4,
              ease: [0.21, 0.47, 0.32, 0.98],
              type: "spring",
            }}
            className="w-full max-w-6xl mx-auto"
          >
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
          </motion.div>
        </main>
      </div>
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(251,191,36,0.15),rgba(251,146,60,0.1)_70%,rgba(251,146,60,0)_100%)]" />
    </div>
  )
}