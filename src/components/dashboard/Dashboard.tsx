import React, { useState } from 'react';
import { FloatingNav } from './FloatingNav';
import { Header } from './Header';
import { NavToggle } from './NavToggle';
import { useAuth } from '../../hooks/useAuth';
import { ExternalLink } from 'lucide-react';

interface DashboardProps {
  user: any;
  children: React.ReactNode;
}

export function Dashboard({ children }: DashboardProps) {
  const [navOpen, setNavOpen] = useState(false);
  const { user } = useAuth();

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50/30 to-purple-50/20">
      {/* Floating Navigation */}
      <FloatingNav 
        isOpen={navOpen} 
        onClose={() => setNavOpen(false)}
      />
      
      {/* Floating Navigation Toggle Button - Always visible when nav is closed */}
      <NavToggle 
        isNavOpen={navOpen}
        onClick={() => setNavOpen(true)}
      />
      
      <div className="flex flex-col min-h-screen">
        <Header 
          onMenuClick={() => setNavOpen(true)}
          user={user}
        />
        <main className="flex-1 px-4 sm:px-6 lg:px-8">
          {children}
        </main>
        
        {/* Ceintelly Footer */}
        <footer className="py-4 px-4 sm:px-6 lg:px-8 border-t border-gray-200 bg-white/80 backdrop-blur-sm">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-2">
            <p className="text-sm text-gray-600">
              &copy; {new Date().getFullYear()} Rent Management Tool
            </p>
            <a 
              href="https://ceintelly.org" 
              target="_blank" 
              rel="noopener noreferrer"
              className="flex items-center space-x-1 text-sm text-gray-600 hover:text-blue-600 transition-colors"
            >
              <span>Powered by Ceintelly</span>
              <ExternalLink className="h-3.5 w-3.5" />
            </a>
          </div>
        </footer>
      </div>
    </div>
  );
}