import React from 'react';
import Router from './Router';
import TopNav from './components/TopNav';

const Layout: React.FC = () => {
  return (
    <div className="flex flex-col min-h-screen bg-[#F3F4F6] text-slate-800 font-sans selection:bg-indigo-100 selection:text-indigo-700 overflow-x-hidden">
      <TopNav />
      <main className="flex-grow relative z-0 pt-4">
        {/* Modern subtle background blobs */}
        <div className="fixed top-0 left-0 w-full h-full overflow-hidden -z-10 pointer-events-none">
            <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-indigo-200/30 rounded-full blur-3xl opacity-50 mix-blend-multiply filter animate-blob"></div>
            <div className="absolute top-[-10%] right-[-10%] w-[40%] h-[40%] bg-purple-200/30 rounded-full blur-3xl opacity-50 mix-blend-multiply filter animate-blob animation-delay-2000"></div>
            <div className="absolute bottom-[-20%] left-[20%] w-[40%] h-[40%] bg-pink-200/30 rounded-full blur-3xl opacity-50 mix-blend-multiply filter animate-blob animation-delay-4000"></div>
        </div>
        <Router />
      </main>
    </div>
  );
};

export default Layout;