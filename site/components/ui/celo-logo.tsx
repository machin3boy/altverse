import React from "react";
import LogoProps from "./logo-props";

const CeloLogo: React.FC<LogoProps> = ({
  fillColor,
  className,
  width,
  height,
}) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 24 24"
    className={className}
    width={width}
    height={height}
    fill="none"
  >
    <path fill={fillColor} d="M2 2h20v7.143h-3.457a7.142 7.142 0 1 0 0 5.714H22V22H2z"/>
  </svg>
);

export default CeloLogo;