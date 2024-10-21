import React, { useRef, useEffect } from "react";
import { cn } from "@/lib/utils";
import { AnimatedBeam } from "@/components/magicui/animated-beam";
import * as THREE from "three";

const Circle = React.forwardRef<
  HTMLDivElement,
  { className?: string; children?: React.ReactNode }
>(({ className, children }, ref) => {
  return (
    <div
      ref={ref}
      className={cn(
        "z-10 flex h-10 w-10 items-center justify-center rounded-full bg-neutral-900 p-1.5 shadow-[0_0_20px_-5px_rgba(245,158,11,0.8)]",
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
  const torusRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (torusRef.current) {
      const scene = new THREE.Scene();
      const camera = new THREE.PerspectiveCamera(75, 1, 0.1, 1000);
      const renderer = new THREE.WebGLRenderer({
        alpha: true,
        antialias: true,
      });
      renderer.setPixelRatio(window.devicePixelRatio);
      renderer.setSize(210, 210);

      torusRef.current.appendChild(renderer.domElement);

      const geometry = new THREE.TorusGeometry(4.2, 1.4, 100, 100);

      // Create a higher resolution grid texture with thicker, brighter lines
      const canvas = document.createElement("canvas");
      const ctx = canvas.getContext("2d");
      const size = 512;
      canvas.width = canvas.height = size;
      if (ctx) {
        ctx.fillStyle = "#000000"; // Black background
        ctx.fillRect(0, 0, size, size);
        ctx.strokeStyle = "#F59E0B"; // Bright orange
        ctx.lineWidth = 8; // Thicker lines
        const gridSize = 64;
        for (let i = 0; i <= size; i += gridSize) {
          ctx.moveTo(i, 0);
          ctx.lineTo(i, size);
          ctx.moveTo(0, i);
          ctx.lineTo(size, i);
        }
        ctx.stroke();
      }

      const texture = new THREE.CanvasTexture(canvas);
      texture.wrapS = texture.wrapT = THREE.RepeatWrapping;
      texture.repeat.set(8, 2);
      texture.anisotropy = renderer.capabilities.getMaxAnisotropy();

      // Use MeshBasicMaterial for a non-shiny appearance
      const material = new THREE.MeshBasicMaterial({
        map: texture,
      });

      const torus = new THREE.Mesh(geometry, material);
      scene.add(torus);

      // Simplify lighting
      const ambientLight = new THREE.AmbientLight(0xffffff, 1);
      scene.add(ambientLight);

      torus.rotation.y = Math.PI / 3;
      torus.rotation.x = Math.PI;

      camera.position.z = 15;

      const animate = () => {
        requestAnimationFrame(animate);
        torus.rotation.z += Math.PI / 16 / 120;
        renderer.render(scene, camera);
      };

      animate();

      return () => {
        if (torusRef.current) {
          torusRef.current.removeChild(renderer.domElement);
        }
      };
    }
  }, []);

  return (
    <div
      className={cn(
        "absolute inset-0 flex items-center justify-center overflow-hidden pointer-events-none",
        className
      )}
      ref={containerRef}
    >
      <div
        className="flex w-full h-full justify-between lg:px-16 px-4 
              pb-32 pt-5
              sm:pb-40 
              max-sm:pb-44"
      >
        <div className="flex flex-col justify-between">
          <Circle ref={input1Ref}>
            <img src="/images/tokens/branded/BTC.svg" />
          </Circle>
          <Circle ref={input2Ref}>
            <img src="/images/tokens/branded/AVAX.svg" />
          </Circle>
          <Circle ref={input3Ref}>
            <img src="/images/tokens/branded/LINK.svg" />
          </Circle>
        </div>
        <div className="flex items-center">
          <Circle ref={leftBidirectionalRef}>
            <img src="/images/tokens/branded/ALT.svg" />
          </Circle>
        </div>
        <div className="flex items-center justify-center">
          <div
            ref={torusRef}
            className="absolute"
            style={{ width: "210px", height: "210px" }}
          />
        </div>
        <div className="flex items-center">
          <Circle ref={rightBidirectionalRef}>
            <img src="/images/zero-sky-500.svg" />
          </Circle>
        </div>
        <div className="flex flex-col justify-between">
          <Circle ref={output1Ref}>
            <img src="/images/tokens/branded/BTC.svg" />
          </Circle>
          <Circle ref={output2Ref}>
            <img src="/images/tokens/branded/SUI.svg" />
          </Circle>
          <Circle ref={output3Ref}>
            <img src="/images/tokens/branded/SOL.svg" />
          </Circle>
        </div>
      </div>

      {/* Input to Left Bidirectional Beams */}
      <AnimatedBeam
        containerRef={containerRef}
        fromRef={input1Ref}
        toRef={leftBidirectionalRef}
        gradientStartColor="#F59E0B"
        gradientStopColor="#D97706"
        duration={7}
        delay={0}
        pathColor="rgba(217, 119, 6, 1)"
        pathWidth={2}
        pathOpacity={0.25}
      />
      <AnimatedBeam
        containerRef={containerRef}
        fromRef={input2Ref}
        toRef={leftBidirectionalRef}
        gradientStartColor="#F59E0B"
        gradientStopColor="#D97706"
        duration={7}
        delay={0.25}
        pathColor="rgba(217, 119, 6, 1)"
        pathWidth={2}
        pathOpacity={0.25}
      />
      <AnimatedBeam
        containerRef={containerRef}
        fromRef={input3Ref}
        toRef={leftBidirectionalRef}
        gradientStartColor="#F59E0B"
        gradientStopColor="#D97706"
        duration={7}
        delay={0.6}
        pathColor="rgba(217, 119, 6, 1)"
        pathWidth={2}
        pathOpacity={0.25}
      />

      {/* Bidirectional to Bidirectional Beams */}
      <AnimatedBeam
        containerRef={containerRef}
        fromRef={leftBidirectionalRef}
        toRef={rightBidirectionalRef}
        gradientStartColor="#F59E0B"
        gradientStopColor="#D97706"
        startYOffset={10}
        endYOffset={10}
        curvature={-20}
        duration={7}
        delay={1.2}
        pathColor="rgba(217, 119, 6, 1)"
        pathWidth={2}
        pathOpacity={0.25}
      />
      <AnimatedBeam
        containerRef={containerRef}
        fromRef={leftBidirectionalRef}
        toRef={rightBidirectionalRef}
        gradientStartColor="#0EA5E9"
        gradientStopColor="#0284C7"
        startYOffset={-10}
        endYOffset={-10}
        curvature={20}
        reverse
        duration={7}
        delay={1.5}
        pathColor="rgba(217, 119, 6, 1)"
        pathWidth={2}
        pathOpacity={0.25}
      />

      {/* Right Bidirectional to Output Beams */}
      <AnimatedBeam
        containerRef={containerRef}
        fromRef={rightBidirectionalRef}
        toRef={output1Ref}
        duration={7}
        gradientStartColor="#0EA5E9"
        gradientStopColor="#0284C7"
        curvature={60}
        startYOffset={-5}
        endYOffset={0}
        delay={2.1}
        pathColor="rgba(217, 119, 6, 1)"
        pathWidth={2}
        pathOpacity={0.25}
      />
      <AnimatedBeam
        containerRef={containerRef}
        fromRef={rightBidirectionalRef}
        toRef={output2Ref}
        duration={7}
        gradientStartColor="#0EA5E9"
        gradientStopColor="#0284C7"
        delay={2.4}
        pathColor="rgba(217, 119, 6, 1)"
        pathWidth={2}
        pathOpacity={0.25}
      />
      <AnimatedBeam
        containerRef={containerRef}
        fromRef={rightBidirectionalRef}
        toRef={output3Ref}
        duration={7}
        gradientStartColor="#0EA5E9"
        gradientStopColor="#0284C7"
        curvature={-60}
        startYOffset={5}
        endYOffset={0}
        delay={2.7}
        pathColor="rgba(217, 119, 6, 1)"
        pathWidth={2}
        pathOpacity={0.25}
      />
    </div>
  );
}
