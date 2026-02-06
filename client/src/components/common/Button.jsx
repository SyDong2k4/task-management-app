import React from 'react';

export const Button = ({ children, fullWidth, className, ...props }) => {
  return (
    <button
      className={`
        flex justify-center items-center
        ${fullWidth ? 'w-full' : 'w-auto'}
        px-6 py-3
        text-base font-semibold text-white
        bg-indigo-500
        border-none rounded-md
        cursor-pointer
        transition-all duration-200
        shadow-sm
        hover:bg-indigo-600 hover:shadow-md hover:-translate-y-[1px]
        active:translate-y-0
        disabled:bg-slate-400 disabled:cursor-not-allowed disabled:transform-none
        ${className || ''}
      `}
      {...props}
    >
      {children}
    </button>
  );
};
