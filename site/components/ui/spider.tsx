import React, { useRef } from "react";
import { cn } from "@/lib/utils";
import { AnimatedBeam } from "@/components/magicui/animated-beam";

const Circle = React.forwardRef<
  HTMLDivElement,
  { className?: string; children?: React.ReactNode }
>(({ className, children }, ref) => {
  return (
    <div
      ref={ref}
      className={cn(
        "z-10 flex size-12 items-center justify-center rounded-full border-2 bg-white p-3 shadow-[0_0_20px_-12px_rgba(0,0,0,0.8)]",
        className
      )}
    >
      {children}
    </div>
  );
});

Circle.displayName = "Circle";

export default function Spider({ className }: { className?: string }) {
  const containerRef = useRef<HTMLDivElement>(null);
  const input1Ref = useRef<HTMLDivElement>(null);
  const input2Ref = useRef<HTMLDivElement>(null);
  const input3Ref = useRef<HTMLDivElement>(null);
  const leftBidirectionalRef = useRef<HTMLDivElement>(null);
  const rightBidirectionalRef = useRef<HTMLDivElement>(null);
  const output1Ref = useRef<HTMLDivElement>(null);
  const output2Ref = useRef<HTMLDivElement>(null);
  const output3Ref = useRef<HTMLDivElement>(null);

  return (
    <div
      className={cn(
        "relative flex h-[300px] w-full max-w-[800px] items-center justify-center overflow-hidden rounded-lg border bg-background p-10 md:shadow-xl",
        className
      )}
      ref={containerRef}
    >
      <div className="flex w-full h-full justify-between">
        <div className="flex flex-col justify-between">
          <Circle ref={input1Ref}>
            <Icons.input />
          </Circle>
          <Circle ref={input2Ref}>
            <Icons.input />
          </Circle>
          <Circle ref={input3Ref}>
            <Icons.input />
          </Circle>
        </div>
        <div className="flex items-center">
          <Circle ref={leftBidirectionalRef}>
            <Icons.bidirectional />
          </Circle>
        </div>
        <div className="flex items-center">
          <Circle ref={rightBidirectionalRef}>
            <Icons.bidirectional />
          </Circle>
        </div>
        <div className="flex flex-col justify-between">
          <Circle ref={output1Ref}>
            <Icons.output />
          </Circle>
          <Circle ref={output2Ref}>
            <Icons.output />
          </Circle>
          <Circle ref={output3Ref}>
            <Icons.output />
          </Circle>
        </div>
      </div>

      {/* Input to Left Bidirectional Beams */}
      <AnimatedBeam
        containerRef={containerRef}
        fromRef={input1Ref}
        toRef={leftBidirectionalRef}
        duration={3}
      />
      <AnimatedBeam
        containerRef={containerRef}
        fromRef={input2Ref}
        toRef={leftBidirectionalRef}
        duration={3}
      />
      <AnimatedBeam
        containerRef={containerRef}
        fromRef={input3Ref}
        toRef={leftBidirectionalRef}
        duration={3}
      />

      {/* Bidirectional to Bidirectional Beams */}
      <AnimatedBeam
        containerRef={containerRef}
        fromRef={leftBidirectionalRef}
        toRef={rightBidirectionalRef}
        startYOffset={10}
        endYOffset={10}
        curvature={-20}
      />
      <AnimatedBeam
        containerRef={containerRef}
        fromRef={leftBidirectionalRef}
        toRef={rightBidirectionalRef}
        startYOffset={-10}
        endYOffset={-10}
        curvature={20}
        reverse
      />

      {/* Right Bidirectional to Output Beams */}
      <AnimatedBeam
        containerRef={containerRef}
        fromRef={rightBidirectionalRef}
        toRef={output1Ref}
        duration={3}
        gradientStartColor="#ff6257"
        gradientStopColor="#ffaa40"
        startYOffset={-5}
        endYOffset={0}
        curvature={70}
      />
      <AnimatedBeam
        containerRef={containerRef}
        fromRef={rightBidirectionalRef}
        toRef={output2Ref}
        duration={3}
        gradientStartColor="#ff6257"
        gradientStopColor="#ffaa40"
      />
      <AnimatedBeam
        containerRef={containerRef}
        fromRef={rightBidirectionalRef}
        toRef={output3Ref}
        duration={3}
        gradientStartColor="#ff6257"
        gradientStopColor="#ffaa40"
        curvature={-70}
        startYOffset={5}
        endYOffset={0}
      />
    </div>
  );
}

const Icons = {
  input: () => (
    <svg
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        d="M21 12H3M3 12L10 5M3 12L10 19"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  ),
  bidirectional: () => (
    <svg
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        d="M7 17L17 7M17 7H7M17 7V17"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M17 17L7 7M7 7H17M7 7V17"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  ),
  output: () => (
    <svg
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        d="M3 12H21M21 12L14 5M21 12L14 19"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  ),
};
