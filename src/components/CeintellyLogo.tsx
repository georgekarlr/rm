import React from 'react';

interface CeintellyLogoProps {
  width?: number;
  height?: number;
  className?: string;
}

export function CeintellyLogo({ width = 40, height = 35, className = '' }: CeintellyLogoProps) {
  return (
    <img 
      src="/ceintelly-logo.svg" 
      alt="Ceintelly Logo" 
      width={width} 
      height={height} 
      className={className}
    />
  );
}