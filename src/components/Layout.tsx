import React, { useState } from 'react';
import { Outlet } from 'react-router-dom';
import Navbar from './Navbar';
import Sidebar from './Sidebar';
import Footer from './Footer';

const Layout: React.FC = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="min-h-screen bg-neutral-50 flex flex-col">
      <Navbar onMenuClick={() => setSidebarOpen(!sidebarOpen)} />
      
      <div className="flex flex-1 relative">
        <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
        
        <main className="flex-1 p-4 md:p-6 pt-20 md:ml-64 min-h-[calc(100vh-4rem)]">
          <div className="max-w-7xl mx-auto">
            <Outlet />
          </div>
        </main>
      </div>
      
      <Footer />
    </div>
  );
};

export default Layout;