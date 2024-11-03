"use client";

import createGlobe, { COBEOptions } from "cobe";
import { useCallback, useEffect, useRef, useState } from "react";

import { cn } from "@/lib/utils";

const GLOBE_CONFIG: COBEOptions = {
  width: 800,
  height: 800,
  onRender: () => {},
  devicePixelRatio: 2,
  phi: 0.5,
  theta: 0.3,
  dark: 0.98,
  diffuse: 0.4,
  mapSamples: 10000,
  mapBrightness: 1.8,
  baseColor: [0.3, 0.3, 0.3],
  markerColor: [1, 0.6, 0.2],
  glowColor: [0.4, 0.3, 0.1],
  markers: [
    { location: [14.5995, 120.9842], size: 0.03 }, // Manila
    { location: [19.076, 72.8777], size: 0.04 }, // Mumbai
    { location: [23.8103, 90.4125], size: 0.05 }, // Dhaka
    { location: [30.0444, 31.2357], size: 0.04 }, // Cairo
    { location: [39.9042, 116.4074], size: 0.04 }, // Beijing
    { location: [-23.5505, -46.6333], size: 0.05 }, // São Paulo
    { location: [19.4326, -99.1332], size: 0.05 }, // Mexico City
    { location: [40.7128, -74.006], size: 0.04 }, // New York
    { location: [34.6937, 135.5022], size: 0.05 }, // Osaka
    { location: [41.0082, 28.9784], size: 0.05 }, // Istanbul
    { location: [51.5074, -0.1278], size: 0.04 }, // London
    { location: [-33.8688, 151.2093], size: 0.05 }, // Sydney
    { location: [55.7558, 37.6173], size: 0.04 }, // Moscow
    { location: [-1.2921, 36.8219], size: 0.03 }, // Nairobi
    { location: [-15.7801, -47.9292], size: 0.04 }, // Brasília
    { location: [-22.9068, -43.1729], size: 0.05 }, // Rio de Janeiro
    { location: [34.0522, -118.2437], size: 0.05 }, // Los Angeles
    { location: [25.2048, 55.2708], size: 0.04 }, // Dubai
    { location: [15.3229, 38.9251], size: 0.03 }, // Asmara (Northeast Africa)
  ],
};

export default function Globe({
  className,
  config = GLOBE_CONFIG,
}: {
  className?: string;
  config?: COBEOptions;
}) {
  let phi = 0;
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const pointerInteracting = useRef(null);
  const pointerInteractionMovement = useRef(0);
  const [r, setR] = useState(0);
  const [size, setSize] = useState({ width: 0, height: 0 });
  const containerRef = useRef<HTMLDivElement>(null);

  const updatePointerInteraction = (value: any) => {
    pointerInteracting.current = value;
    if (canvasRef.current) {
      canvasRef.current.style.cursor = value ? "grabbing" : "grab";
    }
  };

  const updateMovement = (clientX: any) => {
    if (pointerInteracting.current !== null) {
      const delta = clientX - pointerInteracting.current;
      pointerInteractionMovement.current = delta;
      setR(delta / 200);
    }
  };

  const onRender = useCallback(
    (state: Record<string, any>) => {
      if (!pointerInteracting.current) phi += 0.005;
      state.phi = phi + r;
      state.width = size.width;
      state.height = size.height;
    },
    [r, size],
  );

  useEffect(() => {
    if (!containerRef.current) return;

    const resizeObserver = new ResizeObserver((entries) => {
      for (let entry of entries) {
        const { width, height } = entry.contentRect;
        setSize({ width: width * 2, height: height * 2 });
      }
    });

    resizeObserver.observe(containerRef.current);

    return () => {
      resizeObserver.disconnect();
    };
  }, []);

  useEffect(() => {
    if (!canvasRef.current || size.width === 0 || size.height === 0) return;

    const globe = createGlobe(canvasRef.current, {
      ...config,
      width: size.width,
      height: size.height,
      onRender,
    });

    canvasRef.current.style.opacity = "1";

    return () => globe.destroy();
  }, [size, config, onRender]);

  return (
    <div
      ref={containerRef}
      className={cn(
        "absolute inset-0 mx-auto aspect-[1/1] w-full max-w-[600px]",
        className,
      )}
    >
      <canvas
        className={cn(
          "size-full opacity-0 transition-opacity duration-500 [contain:layout_paint_size]",
        )}
        ref={canvasRef}
        onPointerDown={(e) =>
          updatePointerInteraction(
            e.clientX - pointerInteractionMovement.current,
          )
        }
        onPointerUp={() => updatePointerInteraction(null)}
        onPointerOut={() => updatePointerInteraction(null)}
        onMouseMove={(e) => updateMovement(e.clientX)}
        onTouchMove={(e) =>
          e.touches[0] && updateMovement(e.touches[0].clientX)
        }
      />
    </div>
  );
}
