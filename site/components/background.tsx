import React, { useEffect, useState } from 'react';
import Particles from "@/components/magicui/particles";

const Background: React.FC = () => {
  const [opacity, setOpacity] = useState(0);

  useEffect(() => {
    const intervalId = setInterval(() => {
      setOpacity(prev => Math.min(prev + 0.5, 25));
    }, 100);
    return () => clearInterval(intervalId);
  }, []);

  return (
    <div className="fixed inset-0 z-0 overflow-hidden bg-black">
      <Particles
        className="absolute inset-0 pointer-events-none"
        quantity={5000}
        staticity={10}
        ease={70}
        size={0.015}
        color="#944115"
      />
      <div 
        className="pointer-events-none absolute inset-0 transition-opacity duration-1000 ease-out"
        style={{ opacity: opacity / 100 }}
      >
        <div className="absolute inset-0 bg-gradient-to-t from-transparent via-amber-800/20 to-amber-400/30"></div>
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-amber-800/20 to-amber-400/30"></div>
        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-amber-800/30 to-transparent"></div>
        <div className="absolute inset-0 bg-gradient-to-l from-transparent via-amber-800/30 to-transparent"></div>
        <div className="absolute inset-[10%] bg-amber-800/10 blur-3xl"></div>
      </div>
    </div>
  );
};

export default Background;