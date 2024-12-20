"use client";

import React, { useEffect, useState } from "react";
import Background from "@/components/background";
import Hero from "@/components/hero";
import Modal from "@/components/modal";
import MetamaskLogo from "@/components/ui/metamask-logo";
import { useStorage } from "@/components/storage";
import { toast } from "sonner";
import {
  AlertDialog,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import ChainSwitcherDialog from "@/components/ui/chain-selector";

declare global {
  interface Window {
    ethereum?: {
      isMetaMask?: boolean;
      on: (event: string, callback: (...args: any[]) => void) => void;
      removeListener: (
        event: string,
        callback: (...args: any[]) => void,
      ) => void;
      request: (args: { method: string; params?: any[] }) => Promise<any>;
    };
  }
}

const Page: React.FC = () => {
  const { web3, connectToWeb3, switchChain, chains } = useStorage();
  const [showModal, setShowModal] = useState(false);
  const [address, setAddress] = useState("");
  const [chainId, setChainId] = useState("");

  const [currentChain, setCurrentChain] = useState(chains[0]);
  const [otherChain, setOtherChain] = useState(chains[1]);

  const handleConnectWallet = async () => {
    const isConnected = await connectToWeb3();

    if (!isConnected) {
      toast.error(
        "Failed to connect to Web3. Ensure you connect from a Web3 connected browser/device.",
      );
      return false;
    }
    return true;
  };

  const fetchAddress = async () => {
    if (!web3) {
      return false;
    }

    let accs = await web3.eth.getAccounts();
    let userAddress = accs[0];
    setAddress(userAddress);

    const chain = (await web3.eth.getChainId()).toString();
    setChainId(chain);

    if (!userAddress) {
      return;
    }
  };

  const handleAccountChange = async (accounts: string[]) => {

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
            handleAccountChange,
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
      const otherChain = chains.find((c) => c.id !== formatChainId(chainId));
      if (chain && otherChain) {
        setCurrentChain(chain);
        setOtherChain(otherChain);
      }
    }
  }, [chainId]);

  return (
    <>
      <div className="relative min-h-screen bg-black text-white overflow-hidden flex items-center dark">
        <Background showModal={showModal} />
        <div className="container mx-auto px-4 py-8 flex flex-col justify-center h-full z-10">
          {!showModal ? <Hero onGetStarted={handleGetStarted} /> : null}
        </div>
      </div>

      {showModal && (
        <div className="fixed top-4 right-4 z-[60] hidden md:flex md:flex-col md:space-y-2">
          {/* Metamask Address Button */}
          <div className="inline-flex items-center bg-orange-900/50 hover:bg-orange-800/70 rounded-lg transition-all duration-200 h-10">
            <div className="flex items-center space-x-3 px-4">
              <div className="w-5 h-5 flex items-center justify-center">
                <MetamaskLogo
                  className="text-sky-500 bg-transparent fill-transparent stroke-orange-500"
                  width={20}
                  height={20}
                  fillColor="orange-500"
                />
              </div>
              <span className="font-mono font-light text-orange-300 hover:text-orange-200 transition-all duration-200">
                {address.substring(0, 6)}...{address.substring(38)}
              </span>
            </div>
          </div>

          {/* Chain Selection Button */}
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <div
                className={`inline-flex items-center rounded-lg transition-all duration-200 h-10 cursor-pointer ${currentChain.bgStyle}`}
              >
                <div className="flex items-center space-x-3 px-4">
                  <div className="w-5 h-5 flex items-center justify-center">
                    <img
                      src={currentChain.logoSrc}
                      alt={currentChain.name}
                      className="w-5 h-5"
                    />
                  </div>
                  <span className="font-mono font-light text-[#FFF] hover:text-[#FFF] transition-all duration-200">
                    {currentChain.name}
                  </span>
                </div>
              </div>
            </AlertDialogTrigger>

            <ChainSwitcherDialog
              currentChainId={currentChain.id}
              onSwitch={(targetChain) => switchChain(targetChain)}
            />
          </AlertDialog>
        </div>
      )}

      {showModal && (
        <Modal isOpen={true} onClose={handleCloseModal} chain={currentChain} />
      )}
    </>
  );
};

export default Page;
