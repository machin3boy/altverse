import React from "react";
import { useStorage } from "@/components/storage";
import { Card, CardContent } from "@/components/ui/card";

interface CryptoButtonProps {
  name: string;
  Icon: any;
  hoverColor: string;
  onRequest: () => Promise<void>;
  isMobile?: boolean;
}

const CryptoButton: React.FC<CryptoButtonProps> = ({
  name,
  Icon,
  hoverColor,
  onRequest,
  isMobile = false,
}) => {
  const [hoverTextColor, hoverBorderColor] = hoverColor.split(" ");

  return (
    <Card
      onClick={onRequest}
      className={`
        group cursor-pointer
        bg-neutral-900 text-neutral-400
        ${!isMobile ? "aspect-square" : "h-16"}
        border-2 ${hoverBorderColor}
        ${hoverTextColor}
        transition-all duration-200 ease-in-out
        hover:shadow-lg
      `}
    >
      <CardContent
        className={`
        flex ${isMobile ? "flex-row" : "flex-col"} 
        items-center 
        ${isMobile ? "justify-start" : "justify-center"} 
        h-full p-2
        ${isMobile ? "gap-3" : ""}
      `}
      >
        <div
          className={`
          flex items-center justify-center 
          ${isMobile ? "w-10 h-10" : "w-16 h-16 mb-2"}
        `}
        >
          <Icon
            fillColor="currentColor"
            width={isMobile ? 28 : 48}
            height={isMobile ? 28 : 48}
            className="text-current"
          />
        </div>
        <span className="font-medium text-current">
          Request <span className="font-bold font-mono">{name}</span>
        </span>
      </CardContent>
    </Card>
  );
};

const Faucet: React.FC = () => {
  const { requestTokenFromFaucet, tokens } = useStorage();

  const handleRequest = async (tokenName: string) => {
    await requestTokenFromFaucet(tokenName);
  };

  return (
    <div className="flex items-center justify-center w-full h-full -mt-4 md:-mt-3">
      <div className="w-full max-w-4xl">
        <div className="hidden md:grid md:grid-cols-2 gap-4 bg-neutral-950 rounded-xl p-4">
          {tokens.map((token, index) => (
            <CryptoButton
              key={index}
              name={token.symbol}
              Icon={token.iconElement}
              hoverColor={token.hoverColor}
              onRequest={() => handleRequest(token.symbol)}
            />
          ))}
        </div>
        <div className="md:hidden flex flex-col gap-3 bg-neutral-950 rounded-xl px-3 py-4">
          {tokens.map((token, index) => (
            <CryptoButton
              key={index}
              name={token.symbol}
              Icon={token.iconElement}
              hoverColor={token.hoverColor}
              onRequest={() => handleRequest(token.symbol)}
              isMobile={true}
            />
          ))}
        </div>
      </div>
    </div>
  );
};

export default Faucet;
