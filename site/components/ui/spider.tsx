import React, { useRef, useEffect } from "react";
import { cn } from "@/lib/utils";
import { AnimatedBeam } from "@/components/magicui/animated-beam";
import * as THREE from 'three';

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
  const torusRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (torusRef.current) {
      const scene = new THREE.Scene();
      const camera = new THREE.PerspectiveCamera(75, 1, 0.1, 1000);
      const renderer = new THREE.WebGLRenderer({ 
        alpha: true,
        antialias: true
      });
      renderer.setPixelRatio(window.devicePixelRatio);
      renderer.setSize(210, 210);

      torusRef.current.appendChild(renderer.domElement);

      const geometry = new THREE.TorusGeometry(4.2, 1.4, 100, 100);
      
      // Create a higher resolution grid texture with thicker, brighter lines
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      const size = 512;
      canvas.width = canvas.height = size;
      if (ctx) {
        ctx.fillStyle = '#000000'; // Slightly lighter background
        ctx.fillRect(0, 0, size, size);
        ctx.strokeStyle = '#F59E0B'; // Brighter green
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

      const material = new THREE.MeshStandardMaterial({ 
        map: texture,
        roughness: 0.3,
        metalness: 0.2,
        emissive: new THREE.Color(0x000000),
        emissiveIntensity: 0.2
      });

      const torus = new THREE.Mesh(geometry, material);
      scene.add(torus);

      // Enhance lighting
      const ambientLight = new THREE.AmbientLight(0xffffff, 0.7);
      scene.add(ambientLight);

      const pointLight = new THREE.PointLight(0xffffff, 1.5);
      pointLight.position.set(5, 5, 5);
      scene.add(pointLight);

      torus.rotation.y = Math.PI / 3;
      torus.rotation.x = Math.PI;

      camera.position.z = 15;

      const animate = () => {
        requestAnimationFrame(animate);
        // Slow down rotation (2π / 8 seconds = π/4 radians per second)
        torus.rotation.z += (Math.PI / 4) / 120;
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
        <div className="flex items-center justify-center">
          <div ref={torusRef} className="absolute" style={{ width: '210px', height: '210px' }} />
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
        gradientStartColor="#F59E0B"
        gradientStopColor="#644B19"
        duration={7} // Increased by 30%
        delay={0} // Start immediately
      />
      <AnimatedBeam
        containerRef={containerRef}
        fromRef={input2Ref}
        toRef={leftBidirectionalRef}
        gradientStartColor="#F59E0B"
        gradientStopColor="#644B19"
        duration={7}
        delay={0.3} // Delayed start
      />
      <AnimatedBeam
        containerRef={containerRef}
        fromRef={input3Ref}
        toRef={leftBidirectionalRef}
        gradientStartColor="#F59E0B"
        gradientStopColor="#644B19"
        duration={7}
        delay={0.6} // Further delayed start
      />

      {/* Bidirectional to Bidirectional Beams */}
      <AnimatedBeam
        containerRef={containerRef}
        fromRef={leftBidirectionalRef}
        toRef={rightBidirectionalRef}
        gradientStartColor="#F59E0B"
        gradientStopColor="#644B19"
        startYOffset={10}
        endYOffset={10}
        curvature={-20}
        duration={7}
        delay={1.2} // Delayed start after input beams
      />
      <AnimatedBeam
        containerRef={containerRef}
        fromRef={leftBidirectionalRef}
        toRef={rightBidirectionalRef}
        gradientStartColor="#F59E0B"
        gradientStopColor="#644B19"
        startYOffset={-10}
        endYOffset={-10}
        curvature={20}
        reverse
        duration={7}
        delay={1.5} // Slightly delayed compared to the other bidirectional beam
      />

      {/* Right Bidirectional to Output Beams */}
      <AnimatedBeam
        containerRef={containerRef}
        fromRef={rightBidirectionalRef}
        toRef={output1Ref}
        duration={7}
        gradientStartColor="#F59E0B"
        gradientStopColor="#644B19"
        startYOffset={-5}
        endYOffset={0}
        curvature={70}
        delay={2.1} // Delayed start after bidirectional beams
      />
      <AnimatedBeam
        containerRef={containerRef}
        fromRef={rightBidirectionalRef}
        toRef={output2Ref}
        duration={7}
        gradientStartColor="#F59E0B"
        gradientStopColor="#644B19"
        delay={2.4} // Further delayed
      />
      <AnimatedBeam
        containerRef={containerRef}
        fromRef={rightBidirectionalRef}
        toRef={output3Ref}
        duration={7}
        gradientStartColor="#F59E0B"
        gradientStopColor="#644B19"
        curvature={-70}
        startYOffset={5}
        endYOffset={0}
        delay={2.7} // Last beam to start
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
