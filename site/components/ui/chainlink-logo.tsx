import React from "react";
import LogoProps from "./logo-props";

const ChainlinkLogo: React.FC<LogoProps> = ({
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
    viewBox="0 0 247 284"
    fill="none"
  >
    <path
      d="M123.5 0L0 70.9726V212.918L123.5 283.89L247 212.918V70.9726L123.5 0ZM194.679 182.837L123.523 223.728L52.3663 182.837V101.054L123.523 60.1621L194.679 101.054V182.837Z"
      fill={fillColor}
    />
  </svg>
);

export default ChainlinkLogo;