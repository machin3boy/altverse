import { cn } from "@/lib/utils";
import Marquee from "@/components/ui/marquee";
import { useEffect, useId, useRef, useState } from "react";
import { motion, useAnimation, useInView } from "framer-motion";

const allTokens = [
  "1INCH",
  "AAVE",
  "ADA",
  "ALT",
  "ANKR",
  "APT",
  "ATOM",
  "AVAX",
  "AXS",
  "BAND",
  "BAT",
  "BEAM",
  "BNB",
  "BTC",
  "CAKE",
  "CELO",
  "CFX",
  "CKB",
  "COMP",
  "CRV",
  "DASH",
  "DOT",
  "EGLD",
  "ENJ",
  "ETH",
  "FIL",
  "FLOW",
  "FTM",
  "GLM",
  "GRT",
  "ICP",
  "ICX",
  "KAVA",
  "KDA",
  "LINK",
  "LRC",
  "MANA",
  "MINA",
  "MKR",
  "NEAR",
  "NEO",
  "ONE",
  "ONT",
  "OP",
  "QTUM",
  "REEF",
  "REN",
  "ROSE",
  "RUNE",
  "SAND",
  "SOL",
  "SOLID",
  "SRM",
  "STORJ",
  "STRAX",
  "STX",
  "SUI",
  "SUSHI",
  "THETA",
  "TRX",
  "UNI",
  "USDC",
  "USDT",
  "WAVES",
  "XMR",
  "YFI",
  "ZEC",
  "ZIL",
];

const shuffleArray = (array: any[]) => {
  let currentIndex = array.length,
    randomIndex;
  while (currentIndex !== 0) {
    randomIndex = Math.floor(Math.random() * currentIndex);
    currentIndex--;
    [array[currentIndex], array[randomIndex]] = [
      array[randomIndex],
      array[currentIndex],
    ];
  }
  return array;
};

const getTokenGradient = (token: any) => {
  const gradients = {
    "1INCH": "from-cyan-400 via-blue-500 to-indigo-600",
    AAVE: "from-purple-400 via-purple-500 to-indigo-600",
    ADA: "from-blue-400 via-blue-500 to-indigo-600",
    ALT: "from-amber-400 via-amber-500 to-yellow-600",
    ANKR: "from-blue-400 via-indigo-500 to-purple-600",
    APT: "from-blue-400 via-indigo-500 to-violet-600",
    ATOM: "from-purple-400 via-indigo-500 to-blue-600",
    AVAX: "from-red-400 via-red-500 to-rose-600",
    AXS: "from-blue-400 via-indigo-500 to-purple-600",
    BAND: "from-blue-400 via-indigo-500 to-purple-600",
    BAT: "from-orange-400 via-red-500 to-rose-600",
    BEAM: "from-green-400 via-emerald-500 to-teal-600",
    BNB: "from-yellow-400 via-yellow-500 to-amber-600",
    BTC: "from-orange-400 via-orange-500 to-amber-600",
    CAKE: "from-yellow-400 via-amber-500 to-orange-600",
    CELO: "from-lime-400 via-lime-500 to-green-600",
    CFX: "from-blue-400 via-indigo-500 to-violet-600",
    CKB: "from-green-400 via-emerald-500 to-teal-600",
    COMP: "from-green-400 via-emerald-500 to-teal-600",
    CRV: "from-red-400 via-rose-500 to-pink-600",
    DASH: "from-blue-400 via-indigo-500 to-purple-600",
    DOT: "from-pink-400 via-rose-500 to-red-600",
    EGLD: "from-blue-400 via-indigo-500 to-violet-600",
    ENJ: "from-indigo-400 via-blue-500 to-cyan-600",
    ETH: "from-slate-400 via-slate-500 to-gray-600",
    FIL: "from-green-400 via-emerald-500 to-teal-600",
    FLOW: "from-green-400 via-teal-500 to-cyan-600",
    FTM: "from-blue-400 via-indigo-500 to-violet-600",
    GLM: "from-blue-400 via-indigo-500 to-purple-600",
    GRT: "from-purple-400 via-violet-500 to-indigo-600",
    ICP: "from-yellow-400 via-amber-500 to-orange-600",
    ICX: "from-blue-400 via-indigo-500 to-violet-600",
    KAVA: "from-orange-400 via-red-500 to-rose-600",
    KDA: "from-purple-400 via-indigo-500 to-blue-600",
    LINK: "from-blue-400 via-blue-500 to-indigo-600",
    LRC: "from-blue-400 via-indigo-500 to-purple-600",
    MANA: "from-red-400 via-rose-500 to-pink-600",
    MINA: "from-teal-400 via-cyan-500 to-blue-600",
    MKR: "from-teal-400 via-cyan-500 to-blue-600",
    NEAR: "from-black via-gray-800 to-gray-600",
    NEO: "from-green-400 via-emerald-500 to-teal-600",
    ONE: "from-blue-400 via-indigo-500 to-purple-600",
    ONT: "from-blue-400 via-indigo-500 to-violet-600",
    OP: "from-red-400 via-rose-500 to-pink-600",
    QTUM: "from-blue-400 via-indigo-500 to-purple-600",
    REEF: "from-purple-400 via-indigo-500 to-blue-600",
    REN: "from-blue-300 via-blue-400 to-indigo-500",
    ROSE: "from-pink-400 via-rose-500 to-red-600",
    RUNE: "from-green-400 via-emerald-500 to-teal-600",
    SAND: "from-yellow-400 via-amber-500 to-orange-600",
    SOL: "from-purple-400 via-indigo-500 to-blue-600",
    SOLID: "from-gray-400 via-gray-500 to-gray-600",
    SRM: "from-blue-400 via-indigo-500 to-violet-600",
    STORJ: "from-blue-400 via-indigo-500 to-purple-600",
    STRAX: "from-cyan-400 via-blue-500 to-cyan-600",
    STX: "from-purple-400 via-indigo-500 to-blue-600",
    SUI: "from-blue-400 via-indigo-500 to-violet-600",
    SUSHI: "from-blue-400 via-indigo-500 to-purple-600",
    THETA: "from-green-400 via-emerald-500 to-teal-600",
    TRX: "from-red-400 via-rose-500 to-pink-600",
    UNI: "from-pink-400 via-pink-500 to-rose-600",
    USDC: "from-blue-400 via-blue-500 to-indigo-600",
    USDT: "from-green-400 via-emerald-500 to-teal-600",
    WAVES: "from-blue-400 via-indigo-500 to-purple-600",
    XMR: "from-orange-400 via-red-500 to-rose-600",
    YFI: "from-blue-400 via-indigo-500 to-purple-600",
    ZEC: "from-yellow-400 via-amber-500 to-orange-600",
    ZIL: "from-teal-400 via-cyan-500 to-blue-600",
  };
  return (gradients as any)[token];
};

const createTiles = (tokens: any[]) =>
  tokens.map((token) => ({
    icon: (
      <img src={`/images/tokens/branded/${token}.svg`} className="size-full" />
    ),
    bg: (
      <div
        className={`pointer-events-none absolute left-1/2 top-1/2 h-1/2 w-1/2 -translate-x-1/2 -translate-y-1/2 overflow-visible rounded-full bg-gradient-to-r ${getTokenGradient(
          token,
        )} opacity-70 blur-[20px] filter`}
      ></div>
    ),
  }));

const priorityTokens = [
  "SOL",
  "ALT",
  "UNI",
  "LINK",
  "BTC",
  "CELO",
  "CRV",
  "AVAX",
  "FTM",
  "USDC",
  "ETH",
  "1INCH",
];

const remainingTokens = shuffleArray(
  allTokens.filter((token) => !priorityTokens.includes(token)),
);

// Calculate the number of tokens per tile set
const totalTokens = allTokens.length;
const tokensPerSet = Math.floor(totalTokens / 5);

// Distribute tokens evenly across tile sets
const tiles1 = createTiles([
  ...priorityTokens.slice(0, 7),
  ...remainingTokens.slice(0, tokensPerSet - 7),
]);
const tiles2 = createTiles([
  ...priorityTokens.slice(7),
  ...remainingTokens.slice(tokensPerSet - 7, tokensPerSet * 2 - 12),
]);
const tiles3 = createTiles(
  remainingTokens.slice(tokensPerSet * 2 - 12, tokensPerSet * 3 - 12),
);
const tiles4 = createTiles(
  remainingTokens.slice(tokensPerSet * 3 - 12, tokensPerSet * 4 - 12),
);
const tiles5 = createTiles(remainingTokens.slice(tokensPerSet * 4 - 12));

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
        "transform-gpu dark:bg-transparent dark:[border:1px_solid_rgba(255,255,255,.1)] dark:[box-shadow:0_-20px_80px_-20px_#ffffff1f_inset]",
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
        <Marquee
          reverse
          className="-delay-[200ms] [--duration:20s] [--gap:0.25rem] p-1"
          repeat={2}
        >
          {tiles1.map((review, idx) => (
            <Card key={idx} {...review} />
          ))}
        </Marquee>
        <Marquee className="[--duration:45s] [--gap:0.3rem] p-1" repeat={2}>
          {tiles2.map((review, idx) => (
            <Card key={idx} {...review} />
          ))}
        </Marquee>
        <Marquee
          reverse
          className="-delay-[200ms] [--duration:20s] [--gap:0.25rem] p-1"
          repeat={2}
        >
          {tiles3.map((review, idx) => (
            <Card key={idx} {...review} />
          ))}
        </Marquee>
        <Marquee className="[--duration:40s] [--gap:0.25rem] p-1" repeat={2}>
          {tiles4.map((review, idx) => (
            <Card key={idx} {...review} />
          ))}
        </Marquee>
        <Marquee
          reverse
          className="[--duration:30s] [--gap:0.3rem] p-1"
          repeat={2}
        >
          {tiles5.map((review, idx) => (
            <Card key={idx} {...review} />
          ))}
        </Marquee>
      </div>
    </>
  );
}
