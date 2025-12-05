import React, { useState, useEffect } from 'react';
import Link from './Link';
import UserMenu from './UserMenu';

const TopNav: React.FC = () => {
  const [hash, setHash] = useState(window.location.hash);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleHashChange = () => {
      setHash(window.location.hash);
    };
    const handleScroll = () => {
        setScrolled(window.scrollY > 10);
    }
    window.addEventListener('hashchange', handleHashChange);
    window.addEventListener('scroll', handleScroll);
    return () => {
        window.removeEventListener('hashchange', handleHashChange);
        window.removeEventListener('scroll', handleScroll);
    };
  }, []);

  const getLinkClass = (path: string) => {
    const baseClass = "px-5 py-2 rounded-full text-sm font-medium transition-all duration-300";
    const isActive = hash === path || (path === '#dashboard' && hash === '');
    return isActive 
      ? `${baseClass} bg-indigo-600 text-white shadow-lg shadow-indigo-500/30 ring-2 ring-indigo-600 ring-offset-2` 
      : `${baseClass} text-slate-600 hover:bg-white hover:shadow-md hover:text-indigo-600`;
  };

  return (
    <nav className={`sticky top-4 mx-auto max-w-7xl z-50 transition-all duration-300 rounded-2xl ${scrolled ? 'bg-white/90 backdrop-blur-xl shadow-lg border border-white/20 mt-4' : 'bg-transparent mt-0'}`}>
      <div className="px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center gap-8">
            <div className="flex-shrink-0 flex items-center gap-3 cursor-pointer group" onClick={() => window.location.hash = '#dashboard'}>
              <div className="w-10 h-10 bg-gradient-to-br from-indigo-600 to-violet-600 rounded-xl flex items-center justify-center text-white shadow-lg shadow-indigo-500/30 group-hover:scale-105 transition-transform">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M11.3 1.046A1 1 0 0112 2v5h4a1 1 0 01.82 1.573l-7 10A1 1 0 018 18v-5H4a1 1 0 01-.82-1.573l7-10a1 1 0 011.12-.38z" clipRule="evenodd" />
                </svg>
              </div>
              <span className="text-slate-800 font-bold text-xl tracking-tight">Ad Studio</span>
            </div>
            <div className="hidden md:block">
              <div className="flex items-baseline space-x-2">
                <Link href="#dashboard" className={getLinkClass('#dashboard')}>Dashboard</Link>
                <Link href="#ads" className={getLinkClass('#ads')}>My Ads</Link>
                <Link href="#templates" className={getLinkClass('#templates')}>Gallery</Link>
              </div>
            </div>
          </div>
          <div className="hidden md:block">
            <UserMenu />
          </div>
        </div>
      </div>
    </nav>
  );
};

export default TopNav;