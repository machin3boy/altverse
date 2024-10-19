import { cn } from "@/lib/utils";
import Marquee from "@/components/magicui/marquee";
import { useEffect, useId, useRef, useState } from "react";
import { motion, useAnimation, useInView } from "framer-motion";

const tiles = [
  {
    icon: <img src="/images/zero-amber-400.svg" className="size-full" />,
    bg: (
      <div className="pointer-events-none absolute left-1/2 top-1/2 h-1/2 w-1/2 -translate-x-1/2 -translate-y-1/2 overflow-visible rounded-full bg-gradient-to-r from-sky-100 via-sky-200 to-slate-200 opacity-100 blur-[70px] filter"></div>
    ),
  },
  {
    icon: <img src="/images/zero-amber-500.svg" className="size-full" />,
    bg: (
      <div className="pointer-events-none absolute left-1/2 top-1/2 h-1/2 w-1/2 -translate-x-1/2 -translate-y-1/2 overflow-visible rounded-full bg-gradient-to-r from-cyan-500 via-blue-500 to-indigo-500 opacity-70 blur-[20px] filter"></div>
    ),
  },
  {
    icon: <img src="/images/zero-amber-600.svg" className="size-full" />,
    bg: (
      <div className="pointer-events-none absolute left-1/2 top-1/2 h-1/2 w-1/2 -translate-x-1/2 -translate-y-1/2 overflow-visible rounded-full bg-gradient-to-r from-sky-500 via-sky-500 to-sky-600 opacity-70 blur-[20px] filter"></div>
    ),
  },
  {
    icon: <img src="/images/zero-sky-500.svg" className="size-full" />,
    bg: (
      <div className="pointer-events-none absolute left-1/2 top-1/2 h-1/2 w-1/2 -translate-x-1/2 -translate-y-1/2 overflow-visible rounded-full bg-gradient-to-r from-yellow-400 via-orange-500 to-yellow-600 opacity-70 blur-[20px] filter"></div>
    ),
  },
  {
    icon: <img src="/images/zero-amber-500.svg" className="size-full" />,
    bg: (
      <div className="pointer-events-none absolute left-1/2 top-1/2 h-1/2 w-1/2 -translate-x-1/2 -translate-y-1/2 overflow-visible rounded-full bg-gradient-to-r from-orange-600 via-rose-600 to-violet-600 opacity-70 blur-[20px] filter"></div>
    ),
  },
  {
    icon: <img src="/images/zero-amber-400.svg" className="size-full" />,
    bg: (
      <div className="pointer-events-none absolute left-1/2 top-1/2 h-1/2 w-1/2 -translate-x-1/2 -translate-y-1/2 overflow-visible rounded-full bg-gradient-to-r from-indigo-400 via-violet-500 to-purple-600 opacity-70 blur-[20px] filter"></div>
    ),
  },
];

const shuffleArray = (array: any[]) => {
  let currentIndex = array.length,
    randomIndex;
  // While there remain elements to shuffle.
  while (currentIndex !== 0) {
    // Pick a remaining element.
    randomIndex = Math.floor(Math.random() * currentIndex);
    currentIndex--;
    // And swap it with the current element.
    [array[currentIndex], array[randomIndex]] = [
      array[randomIndex],
      array[currentIndex],
    ];
  }
  return array;
};

const randomTiles1 = shuffleArray([...tiles]);
const randomTiles2 = shuffleArray([...tiles]);
const randomTiles3 = shuffleArray([...tiles]);
const randomTiles4 = shuffleArray([...tiles]);
const randomTiles5 = shuffleArray([...tiles]);

const Card = (card: { icon: JSX.Element; bg: JSX.Element }) => {
  const id = useId();
  const controls = useAnimation();
  const ref = useRef(null);
  const inView = useInView(ref, { once: true });

  useEffect(() => {
    if (inView) {
      controls.start({
        opacity: 1,
        transition: { delay: Math.random() * 2, ease: "easeOut", duration: 1 },
      });
    }
  }, [controls, inView]);

  return (
    <motion.div
      key={id}
      ref={ref}
      initial={{ opacity: 0 }}
      animate={controls}
      className={cn(
        "relative size-12 cursor-pointer overflow-hidden rounded-lg border p-2",
        // light styles
        "bg-white",
        // dark styles
        "transform-gpu dark:bg-transparent dark:[border:1px_solid_rgba(255,255,255,.1)] dark:[box-shadow:0_-20px_80px_-20px_#ffffff1f_inset]"
      )}
    >
      {card.icon}
      {card.bg}
    </motion.div>
  );
};

export default function Tiles() {
  return (
    <>
      <div className="absolute inset-0 mt-1.5 overflow-hidden transition-all duration-200 ease-out [mask-image:linear-gradient(to_top,transparent_10%,#000_100%)] group-hover:scale-105">
        <Marquee reverse className="-delay-[200ms] [--duration:20s] [--gap:0.25rem] p-1" repeat={4}>
          {randomTiles1.map((review, idx) => (
            <Card key={idx} {...review} />
          ))}
        </Marquee>
        <Marquee className="[--duration:45s] [--gap:0.3rem] p-1" repeat={4}>
          {randomTiles2.map((review, idx) => (
            <Card key={idx} {...review} />
          ))}
        </Marquee>
        <Marquee reverse className="-delay-[200ms] [--duration:20s] [--gap:0.25rem] p-1" repeat={4}>
          {randomTiles3.map((review, idx) => (
            <Card key={idx} {...review} />
          ))}
        </Marquee>
        <Marquee className="[--duration:40s] [--gap:0.25rem] p-1" repeat={4}>
          {randomTiles4.map((review, idx) => (
            <Card key={idx} {...review} />
          ))}
        </Marquee>
        <Marquee reverse className="[--duration:30s] [--gap:0.3rem] p-1" repeat={4}>
          {randomTiles5.map((review, idx) => (
            <Card key={idx} {...review} />
          ))}
        </Marquee>
      </div>
    </>
  );
}