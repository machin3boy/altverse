"use client"

import Image from "next/image"
import { motion } from "framer-motion"
import { ChevronRight } from "lucide-react"
import { useRef } from "react"
import { useInView } from "framer-motion"
import { BentoGrid, BentoCard } from "@/components/ui/bento-grid"
import { cn } from "@/lib/utils"

export default function Home() {
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
    <div className="min-h-screen bg-black text-white">
      <div className="container mx-auto px-4 py-14">
        <main className="mt-20 flex flex-col items-center gap-8">
          <motion.h1
            ref={fadeInRef}
            className="text-balance bg-gradient-to-br from-white from-30% to-white/60 bg-clip-text py-6 text-center text-2xl font-semibold leading-none tracking-tighter text-transparent sm:text-6xl md:text-7xl lg:text-8xl"
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

          <motion.p
            className="text-balance text-center text-lg tracking-tight text-gray-400 md:text-xl"
            animate={fadeInInView ? "animate" : "initial"}
            variants={fadeUpVariants}
            initial={false}
            transition={{
              duration: 0.6,
              delay: 0.2,
              ease: [0.21, 0.47, 0.32, 0.98],
              type: "spring",
            }}
          >
            Experience seamless, secure, and decentralized cross-chain swaps
          </motion.p>

          <motion.div
            animate={fadeInInView ? "animate" : "initial"}
            variants={fadeUpVariants}
            className="flex flex-col gap-4 sm:flex-row"
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
                "group relative inline-flex h-12 items-center justify-center gap-2 overflow-hidden whitespace-pre rounded-md px-6 py-3 text-base font-semibold tracking-tighter",
                "transform-gpu ring-offset-black transition-all duration-300 ease-out hover:ring-2 hover:ring-amber-500 hover:ring-offset-2 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-500 focus-visible:ring-offset-2",
              )}
            >
              Get Started
              <ChevronRight className="size-5 translate-x-0 transition-all duration-300 ease-out group-hover:translate-x-1" />
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
            className="mt-16 w-full"
          >
            <BentoGrid className="grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
              <BentoCard
                name="Instantly Swap Across Chains"
                className="col-span-1 sm:col-span-2"
                background={<div className="absolute inset-0 bg-gradient-to-br from-amber-500/30 to-transparent" />}
                Icon={() => <div className="h-12 w-12 rounded-full bg-amber-500/20" />}
                description="One-click cross-chain swaps. Fail-safe design with auto-refunds for peace of mind. No middlemen."
                href="#"
                cta="Learn more"
              />
              <BentoCard
                name="Completely Decentralized"
                className="col-span-1 sm:col-span-2"
                background={<div className="absolute inset-0 bg-gradient-to-bl from-amber-500/30 to-transparent" />}
                Icon={() => <div className="h-12 w-12 rounded-full bg-amber-500/20" />}
                description="No central entity. Zero hackable bridges. All on-chain."
                href="#"
                cta="Explore"
              />
              <BentoCard
                name="Fully Trustless"
                className="col-span-1 sm:col-span-1 lg:col-span-2"
                background={<div className="absolute inset-0 bg-gradient-to-tr from-amber-500/30 to-transparent" />}
                Icon={() => <div className="h-12 w-12 rounded-full bg-amber-500/20" />}
                description="Secured by trustless escrows & timeouts."
                href="#"
                cta="Learn more"
              />
              <BentoCard
                name="Multichain Ecosystem"
                className="col-span-1 sm:col-span-1 lg:col-span-2"
                background={<div className="absolute inset-0 bg-gradient-to-tl from-amber-500/30 to-transparent" />}
                Icon={() => <div className="h-12 w-12 rounded-full bg-amber-500/20" />}
                description="Swap across popular L1s/L2s, etc. seamlessly. Earn by providing liquidity to pools on any chain."
                href="#"
                cta="Join now"
              />
            </BentoGrid>
          </motion.div>
        </main>

        <footer className="mt-20 flex flex-wrap items-center justify-center gap-6">
          <a
            className="flex items-center gap-2 hover:text-amber-500 hover:underline hover:underline-offset-4"
            href="#"
            target="_blank"
            rel="noopener noreferrer"
          >
            <Image
              src="/placeholder.svg?height=16&width=16"
              alt="Learn icon"
              width={16}
              height={16}
              className="invert"
            />
            Learn
          </a>
          <a
            className="flex items-center gap-2 hover:text-amber-500 hover:underline hover:underline-offset-4"
            href="#"
            target="_blank"
            rel="noopener noreferrer"
          >
            <Image
              src="/placeholder.svg?height=16&width=16"
              alt="Examples icon"
              width={16}
              height={16}
              className="invert"
            />
            Examples
          </a>
          <a
            className="flex items-center gap-2 hover:text-amber-500 hover:underline hover:underline-offset-4"
            href="#"
            target="_blank"
            rel="noopener noreferrer"
          >
            <Image
              src="/placeholder.svg?height=16&width=16"
              alt="Documentation icon"
              width={16}
              height={16}
              className="invert"
            />
            Documentation →
          </a>
        </footer>
      </div>
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_50%_120%,rgba(251,146,60,0.15),rgba(251,146,60,0)_50%)]" />
    </div>
  )
}