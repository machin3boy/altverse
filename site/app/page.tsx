"use client";

import React, { useState } from 'react';
import Background from '@/components/background';
import Hero from '@/components/hero';
import Modal from '@/components/modal';

const Page: React.FC = () => {
  const [showModal, setShowModal] = useState(false);

  const handleGetStarted = () => {
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
  };

  return (
    <div className="relative min-h-screen bg-black text-white overflow-hidden flex items-center dark">
      <Background />
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