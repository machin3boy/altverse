"use client";

import React, { useEffect, useState } from 'react';
import Background from '@/components/background';
import Hero from '@/components/hero';
import Modal from '@/components/modal';
import { Button } from '@/components/ui/button';
import MetamaskLogo from '@/components/ui/metamask-logo';
import { useStorage } from '@/components/storage';
import { toast } from 'sonner';

const Page: React.FC = () => {
  const { web3, connectToWeb3, getStorage, setStorage } = useStorage();
  const [showModal, setShowModal] = useState(false);
  const [address, setAddress] = useState("");
  const [chainId, setChainId] = useState("");

  // Connect to web3
  const handleConnectWallet = async () => {
    const isConnected = await connectToWeb3();

    if (!isConnected) {
      toast.error("Failed to connect to web3. Ensure you connect from a Web3 connected browser/device.");
      return false;
    }
    return true;
  };

  const fetchAddress = async () => {
    if(!web3) {
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
  }

  const handleGetStarted = async () => {
    const connectedToWeb3 = await handleConnectWallet();
    if(connectedToWeb3) setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
  };

  useEffect(() => {
    fetchAddress();
  }, [])

  return (
    <div className="relative min-h-screen bg-black text-white overflow-hidden flex items-center dark">
      <Background />
      {showModal && address && (
        <div className="fixed top-4 right-4 z-50">
          <Button 
            className="bg-orange-900 bg-opacity-50 hover:bg-orange-950 cursor-default rounded-lg"
          >
            <div className="flex items-center space-x-2 py-1 px-5">
              <MetamaskLogo 
                className="text-sky-500 bg-transparent fill-transparent stroke-orange-500" 
                width={24}
                height={24}
                fillColor='orange-500'
              />
              <span className="font-mono font-light text-orange-300">
                {address.substring(0, 6)}...{address.substring(38)}
              </span>
            </div>
          </Button>
        </div>
      )}
      <div className="container mx-auto px-4 py-8 flex flex-col justify-center h-full z-10">
        {!showModal ? (
          <Hero onGetStarted={handleGetStarted} />
        ) : (
          <Modal isOpen={true} onClose={handleCloseModal} />
        )}
      </div>
    </div>
  );
};

export default Page;