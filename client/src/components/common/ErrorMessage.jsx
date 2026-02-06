import React from 'react';

export const ErrorMessage = ({ children, className, ...props }) => (
  <span className={`text-red-500 text-sm mt-1 block ${className || ''}`} {...props}>
    {children}
  </span>
);
