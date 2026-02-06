import React from 'react';

export const InputGroup = ({ children, className, ...props }) => (
  <div className={`flex flex-col mb-4 ${className || ''}`} {...props}>
    {children}
  </div>
);

export const Label = ({ children, className, ...props }) => (
  <label className={`text-sm font-medium text-slate-800 mb-2 block ${className || ''}`} {...props}>
    {children}
  </label>
);

export const Input = ({ className, ...props }) => (
  <input
    className={`
      w-full px-4 py-3
      text-base text-slate-800
      bg-white
      border border-slate-200 rounded-md
      outline-none
      transition-all duration-200
      focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/20
      placeholder:text-slate-400
      ${className || ''}
    `}
    {...props}
  />
);
