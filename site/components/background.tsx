import React from 'react';
import Particles from "@/components/magicui/particles";

const Background: React.FC = () => (
  <div className="fixed inset-0 z-0">
    <Particles
      className="absolute inset-0 pointer-events-none"
      quantity={150}
      staticity={100}
      ease={70}
      size={0.03}
      color="#fde68a"
    />
    <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(251,191,36,0.15),rgba(251,146,60,0.1)_70%,rgba(251,146,60,0)_100%)]" />
  </div>
);

export default Background;
