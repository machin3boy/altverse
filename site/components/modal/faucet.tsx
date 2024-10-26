import React from 'react';
import ZeroLogo from '../ui/alt-logo';
import BitcoinLogo from '../ui/bitcoin-logo';
import EthLogo from '../ui/eth-logo';
import ChainlinkLogo from '../ui/chainlink-logo';

interface CryptoButtonProps {
  name: string;
  Icon: any;
  hoverColor: string;
}

const CryptoButton: React.FC<CryptoButtonProps> = ({ name, Icon, hoverColor }) => {
  const [hoverTextColor, hoverBorderColor] = hoverColor.split(' ');
  
  return (
    <button
      className={`
        flex flex-col items-center justify-center
        bg-neutral-900 text-neutral-400
        w-full aspect-square rounded-lg
        border-2 ${hoverBorderColor}
        ${hoverTextColor}
        transition-all duration-200 ease-in-out
        hover:shadow-lg group
      `}
    >
      <div className="flex items-center justify-center w-16 h-16 mb-2">
        <Icon
          fillColor="currentColor"
          width={48}
          height={48}
          className="text-neutral-400 group-hover:text-current"
        />
      </div>
      <span className="font-medium text-neutral-400 group-hover:text-current">
        Request {name}
      </span>
    </button>
  );
};

const Faucet: React.FC = () => {
  const cryptos = [
    { name: 'ALT', Icon: ZeroLogo, hoverColor: 'hover:text-amber-400 hover:border-amber-400' },
    { name: 'BTC', Icon: BitcoinLogo, hoverColor: 'hover:text-amber-500 hover:border-amber-500' },
    { name: 'LINK', Icon: ChainlinkLogo, hoverColor: 'hover:text-blue-500 hover:border-blue-500' },
    { name: 'ETH', Icon: EthLogo, hoverColor: 'hover:text-indigo-300 hover:border-indigo-300' },
  ];

  return (
    <div className="grid grid-cols-2 gap-4 p-4 bg-neutral-950 rounded-xl mt-8">
      {cryptos.map((crypto, index) => (
        <CryptoButton key={index} {...crypto} />
      ))}
    </div>
  );
};

export default Faucet;