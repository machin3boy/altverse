import React from 'react';

interface ModalProps {
  onClose: () => void;
}

const Modal: React.FC<ModalProps> = ({ onClose }) => {
  return (
    <div className="bg-white text-black p-8 rounded-lg max-w-md w-full mx-auto">
      <h2 className="text-2xl font-bold mb-4">Get Started with AltVerse</h2>
      <p className="mb-4">Welcome to AltVerse! Here you can start your journey into trustless, instant cross-chain swaps.</p>
      <button
        onClick={onClose}
        className="bg-amber-500 text-white px-4 py-2 rounded hover:bg-amber-600 transition-colors"
      >
        Close
      </button>
    </div>
  );
};

export default Modal;