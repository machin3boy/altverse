import LogoProps from "@/components/ui/logo-props";
import CeloLogo from "@/components/ui/celo-logo";
import AvaxLogo from "@/components/ui/avax-logo";
import OPLogo from "@/components/ui/op-logo";

export interface Chain {
    name: string;
    alt_name: string;
    full_name: string;
    name_id: string
    symbol: string;
    id: string;
    rpc: string;
    blockExplorer: string;
    decimalId: number;
    wormholeId: number;
    logoFill: string;  // Should be hex code like "#FCFF53"
    textColor: string; // Should be hex code like "#6F6D6B"
    logoSrc: string;
    logo: React.FC<LogoProps>
    usdcAddress: string;
}

const chains: Chain[] = [
    { 
      name: 'Celo Testnet', 
      alt_name: 'Celo Alfajores',
      full_name: "Celo Alfajores Testnet",
      name_id: 'celo',
      symbol: "CELO",
      id: "0xaef3", 
      rpc: "https://alfajores-forno.celo-testnet.org",
      blockExplorer: "https://alfajores.celoscan.io",
      decimalId: 44787,
      wormholeId: 14,
      logoFill: "#FCFF53", 
      textColor: "#ffffff", 
      logoSrc: "/images/tokens/branded/CELO.svg",
      logo: (props) => <CeloLogo {...props} /> ,
      usdcAddress: "0x2F25deB3848C207fc8E0c34035B3Ba7fC157602B"
    },
    { 
      name: 'Fuji Testnet',
      alt_name: 'Avalanche Fuji', 
      full_name: "Avalanche Fuji Testnet",
      name_id: 'fuji',
      symbol: "AVAX",
      rpc: "https://api.avax-test.network/ext/bc/C/rpc",
      blockExplorer: "https://testnet.snowtrace.io/",
      id: "0xa869", 
      decimalId: 43113,
      wormholeId: 6,
      logoFill: "#E84042", 
      textColor: "#ffffff", 
      logoSrc: "/images/tokens/branded/AVAX.svg",
      logo: (props) => <AvaxLogo {...props} /> ,
      usdcAddress: "0x5425890298aed601595a70ab815c96711a31bc65"
    },
    { 
      name: 'Sepolia Testnet',
      alt_name: 'Optimism Sepolia', 
      full_name: "OP Sepolia Testnet",
      name_id: 'optimism',
      id: "0xaa37dc", 
      rpc: "https://sepolia.optimism.io",
      blockExplorer: "https://sepolia-optimism.etherscan.io/",
      symbol: "ETH",
      decimalId: 11155420,
      wormholeId: 24,
      logoFill: "#383FEE", 
      textColor: "#ffffff", 
      logoSrc: "/images/tokens/branded/OP2.svg",
      logo: (props) => <OPLogo {...props} /> ,
      usdcAddress: "0x5fd84259d66Cd46123540766Be93DFE6D43130D7"
    },

];

export default chains;