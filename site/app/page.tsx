"use client";

import React, { useState } from 'react';
import Background from '@/components/background';
import Hero from '@/components/hero';
import Modal from '@/components/modal';

const Page = () => {
  const [showModal, setShowModal] = useState(false);

  const handleGetStarted = () => {
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
  };

  return (
    <div className="relative min-h-screen bg-black text-white overflow-hidden flex items-center">
      <Background />
      <div className="container mx-auto px-4 py-8 flex flex-col justify-center h-full z-10">
        {showModal ? (
          <Modal onClose={handleCloseModal} />
        ) : (
          <Hero onGetStarted={handleGetStarted} />
        )}
      </div>
    </div>
  );
};

export default Page;