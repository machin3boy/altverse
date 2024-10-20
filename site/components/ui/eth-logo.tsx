import React from "react";
import LogoProps from "./logo-props";

const EthLogo: React.FC<LogoProps> = ({
  fillColor,
  className,
  width,
  height,
}) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width={width}
    height={height}
    className={className}
    viewBox=".273 -.001 59.701 60"

  >
    <g>
      <path
        d="m30.123 59.999c-16.486 0-29.85-13.431-29.85-30s13.364-30 29.85-30 29.851 13.431 29.851 30-13.365 30-29.85 30z"
        fill={fillColor}
      />
      <path
        d="m16.906 33.716 12.804-26.506v33.28zm26.434 0-12.847 6.774v-33.288zm-26.434.97 12.804 6.442v10.36zm26.434 0-12.847 16.803v-10.36z"
        fill="neutral-900"
      />
    </g>
  </svg>
);

export default EthLogo;
