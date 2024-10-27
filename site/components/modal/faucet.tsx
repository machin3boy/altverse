import React from "react";
import ZeroLogo from "../ui/alt-logo";
import BitcoinLogo from "../ui/bitcoin-logo";
import EthLogo from "../ui/eth-logo";
import ChainlinkLogo from "../ui/chainlink-logo";
import { useStorage } from "../storage";

interface CryptoButtonProps {
  name: string;
  Icon: any;
  hoverColor: string;
  onRequest: () => Promise<void>;
}

const CryptoButton: React.FC<CryptoButtonProps> = ({
  name,
  Icon,
  hoverColor,
  onRequest,
}) => {
  const [hoverTextColor, hoverBorderColor] = hoverColor.split(" ");

  return (
    <button
      onClick={onRequest}
      className={`
    flex flex-col items-center justify-center
    bg-neutral-900 text-neutral-400
    w-full aspect-square rounded-lg
    border-2 ${hoverBorderColor}
    ${hoverTextColor}
    transition-all duration-200 ease-in-out
    hover:shadow-lg
  `}
    >
      <div className="flex items-center justify-center w-16 h-16 mb-2">
        <Icon
          fillColor="currentColor"
          width={48}
          height={48}
          className="text-current"
        />
      </div>
      <span className="font-medium text-current">Request <span className="font-bold font-mono">{name}</span></span>
    </button>

  );
};

const Faucet: React.FC = () => {
  const { requestTokenFromFaucet } = useStorage();

const cryptos = [
  {
    name: "ALT",
    Icon: ZeroLogo,
    hoverColor: "hover:text-amber-500 hover:border-amber-500",
  },
  {
    name: "wBTC",
    Icon: BitcoinLogo,
    hoverColor: "hover:text-[#F7931A] hover:border-[#F7931A]", // Changed to Bitcoin orange
  },
  {
    name: "wLINK",
    Icon: ChainlinkLogo,
    hoverColor: "hover:text-blue-500 hover:border-blue-500",
  },
  {
    name: "wETH",
    Icon: EthLogo,
    hoverColor: "hover:text-indigo-300 hover:border-indigo-300",
  },
];

  const handleRequest = async (tokenName: string) => {
    await requestTokenFromFaucet(tokenName);
  };

  return (
    <div className="grid grid-cols-2 gap-4 p-4 bg-neutral-950 rounded-xl mt-8">
      {cryptos.map((crypto, index) => (
        <CryptoButton
          key={index}
          {...crypto}
          onRequest={() => handleRequest(crypto.name)}
        />
      ))}
    </div>
  );
};

export default Faucet;
