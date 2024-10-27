import LogoProps from "@/components/ui/logo-props";
import CeloLogo from "@/components/ui/celo-logo";
import AvaxLogo from "@/components/ui/avax-logo";

export interface Chain {
    name: string;
    name_id: string
    id: string;
    logoFill: string;  // Should be hex code like "#FCFF53"
    textColor: string; // Should be hex code like "#6F6D6B"
    logo: React.FC<LogoProps>
}

const Chains: Chain[] = [
    { 
      name: 'Celo Testnet', 
      name_id: 'celo',
      id: "0xaef3", 
      logoFill: "#FCFF53", 
      textColor: "#ffffff", 
      logo: (props) => <CeloLogo {...props} /> 
    },
    { 
      name: 'Fuji Testnet', 
      name_id: 'fuji',
      id: "0xa869", 
      logoFill: "#E84042", 
      textColor: "#ffffff", 
      logo: (props) => <AvaxLogo {...props} /> 
    },
];

export default Chains;