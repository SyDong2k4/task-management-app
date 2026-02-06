import React from 'react';
import { FaTimes } from 'react-icons/fa';

const Modal = ({ isOpen, onClose, title, children }) => {
  if (!isOpen) return null;

  const handleOverlayClick = (e) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  return (
    <div
      className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 backdrop-blur-sm"
      onClick={handleOverlayClick}
    >
      <div className="bg-white dark:bg-slate-900 p-8 rounded-xl shadow-xl w-[90%] max-w-lg relative animate-fadeIn border border-slate-200 dark:border-slate-700">
        <button
          className="absolute top-4 right-4 bg-transparent border-none text-xl cursor-pointer text-slate-400 hover:text-slate-800 dark:hover:text-slate-100 transition-colors"
          onClick={onClose}
        >
          <FaTimes />
        </button>
        <h2 className="text-2xl font-bold mb-6 text-slate-800 dark:text-slate-100">{title}</h2>
        {children}
      </div>
    </div>
  );
};

export default Modal;
