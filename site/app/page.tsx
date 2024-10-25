"use client";

import React, { useEffect, useState } from "react";
import Background from "@/components/background";
import Hero from "@/components/hero";
import Modal from "@/components/modal";
import { Button } from "@/components/ui/button";
import MetamaskLogo from "@/components/ui/metamask-logo";
import { useStorage } from "@/components/storage";
import { toast } from "sonner";
import Chains from "./constants";
import CeloLogo from "@/components/ui/celo-logo";
import { format } from "path";

declare global {
  interface Window {
    ethereum?: {
      isMetaMask?: boolean;
      on: (event: string, callback: (...args: any[]) => void) => void;
      removeListener: (
        event: string,
        callback: (...args: any[]) => void
      ) => void;
      request: (args: { method: string; params?: any[] }) => Promise<any>;
    };
  }
}

const Page: React.FC = () => {
  const { web3, connectToWeb3, getStorage, setStorage } = useStorage();
  const [showModal, setShowModal] = useState(false);
  const [address, setAddress] = useState("");
  const [chainId, setChainId] = useState("");

  const chains = Chains;
  const [currentChain, setCurrentChain] = useState(chains[0]);

  const handleConnectWallet = async () => {
    const isConnected = await connectToWeb3();

    if (!isConnected) {
      toast.error(
        "Failed to connect to web3. Ensure you connect from a Web3 connected browser/device."
      );
      return false;
    }
    return true;
  };

  const fetchAddress = async () => {
    if (!web3) {
      toast.error("Failed to fetch user address.");
      return false;
    }

    let accs = await web3.eth.getAccounts();
    let userAddress = accs[0];
    setAddress(userAddress);

    const chain = (await web3.eth.getChainId()).toString();
    console.log("fetched chainid in dapp-main:");
    console.log(chain);
    setChainId(chain);

    if (!userAddress) {
      return;
    }
  };

  const handleAccountChange = async (accounts: string[]) => {
    console.log("Account changed:", accounts[0]);

    if (accounts[0]) {
      // Check if we need to reconnect
      try {
        const currentAccounts = await web3?.eth.getAccounts();
        if (!currentAccounts || currentAccounts.length === 0) {
          // Need to reconnect
          const isConnected = await handleConnectWallet();
          if (isConnected) {
            await fetchAddress();
          } else {
            setAddress("");
            setShowModal(false);
            toast.error("Please connect your wallet to continue");
          }
        } else {
          setAddress(accounts[0]);
        }
      } catch (error) {
        console.error("Error handling account change:", error);
        // Attempt to reconnect
        const isConnected = await handleConnectWallet();
        if (isConnected) {
          await fetchAddress();
        } else {
          setAddress("");
          setShowModal(false);
          toast.error("Please connect your wallet to continue");
        }
      }
    } else {
      // Handle disconnection
      setAddress("");
      setShowModal(false);
      toast.error("Wallet disconnected");
    }
  };

  const handleChainChanged = (newChainId: string) => {
    console.log("Chain changed:", newChainId);
    setChainId(newChainId);
  };

  const handleGetStarted = async () => {
    const connectedToWeb3 = await handleConnectWallet();
    if (connectedToWeb3) setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
  };

  const formatChainId = (chainId: string): string => {
    return "0x" + parseInt(chainId).toString(16);
  };

  useEffect(() => {
    if (typeof window !== "undefined" && window.ethereum) {
      // Listen for account changes
      window.ethereum.on("accountsChanged", handleAccountChange);

      // Listen for chain changes
      window.ethereum.on("chainChanged", handleChainChanged);

      // Cleanup function
      return () => {
        if (window.ethereum?.removeListener) {
          window.ethereum.removeListener(
            "accountsChanged",
            handleAccountChange
          );
          window.ethereum.removeListener("chainChanged", handleChainChanged);
        }
      };
    }
  }, [web3]); // Added web3 as a dependency since we use it in handleAccountChange

  // Fetch initial address
  useEffect(() => {
    fetchAddress();
  }, [showModal]);

  useEffect(() => {
    if (chainId) {
      const chain = chains.find((c) => c.id === formatChainId(chainId));
      if (chain) {
        setCurrentChain(chain);
      }
    }
  }, [chainId]);

  return (
    <>
      <div className="relative min-h-screen bg-black text-white overflow-hidden flex items-center dark">
        <Background />
        <div className="container mx-auto px-4 py-8 flex flex-col justify-center h-full z-10">
          {!showModal ? <Hero onGetStarted={handleGetStarted} /> : null}
        </div>
      </div>

      {showModal && (
        <div className="fixed top-4 right-4 z-[60] flex flex-col space-y-2">
          {/* Added flex-col and space-y-2 */}
          <div className="inline-flex items-center bg-orange-900/50 hover:bg-orange-800/70 rounded-lg transition-all duration-200 py-1 px-4">
            <div className="flex items-center space-x-2 py-1 px-5">
              <MetamaskLogo
                className="text-sky-500 bg-transparent fill-transparent stroke-orange-500"
                width={1}
                height={1}
                fillColor="orange-500"
              />
              <span className="font-mono font-light text-orange-300 hover:text-orange-200 transition-all duration-200">
                {address.substring(0, 6)}...{address.substring(38)}
              </span>
            </div>
          </div>
            <div className={`inline-flex items-center rounded-lg transition-all duration-200 py-1 px-4 
              ${currentChain.id === '0xaef3' ? 'bg-[#888a2d]/50 hover:bg-[#888a2d]/70' : 'bg-[#7d2324]/50 hover:bg-[#7d2324]/70'}`}>
            <div className="flex items-center space-x-2 py-1 px-5">
              {currentChain.logo({
                className: `text-sky-500 bg-transparent fill-transparent stroke-[${currentChain.logoFill}]`, // Use Tailwind color class
                width: 20,
                height: 20,
                fillColor: currentChain.logoFill,
              })}
              <span className={`font-mono font-light text-[#FFF] hover:text-[#FFF]  transition-all duration-200`}>
                {currentChain.name}
              </span>
            </div>
          </div>
        </div>
      )}

      {showModal && <Modal isOpen={true} onClose={handleCloseModal} />}
    </>
  );
};

export default Page;
