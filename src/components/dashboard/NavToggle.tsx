import React from 'react';
import { Menu } from 'lucide-react';

interface NavToggleProps {
  isNavOpen: boolean;
  onClick: () => void;
}

export function NavToggle({ isNavOpen, onClick }: NavToggleProps) {
  return (
    <button
      onClick={onClick}
      className={`
        fixed top-4 left-4 z-50 p-3 bg-white shadow-xl border border-gray-200 
        rounded-xl hover:bg-blue-50 hover:border-blue-300 hover:shadow-2xl
        transition-all duration-300 ease-out group
        ${isNavOpen ? 'opacity-0 pointer-events-none scale-75' : 'opacity-100 scale-100'}
        sm:top-6 sm:left-6
      `}
      style={{
        backdropFilter: 'blur(12px)',
        WebkitBackdropFilter: 'blur(12px)',
      }}
    >
      <Menu className="h-5 w-5 sm:h-6 sm:w-6 text-gray-700 group-hover:text-blue-600 transition-colors duration-200" />
    </button>
  );
}