'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { LayoutDashboard, Car, Wrench, Package, Settings, LogOut } from 'lucide-react';
import { signOut } from 'firebase/auth';
import { auth } from '@/lib/firebase';
import { useLanguage } from '@/components/language-provider';
import { LanguageSwitcher } from '@/components/language-switcher';
import AuthGuard from '@/components/auth-guard';

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const { t } = useLanguage();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  const handleLogout = async () => {
    try {
      await signOut(auth);
      router.push('/login');
    } catch (error) {
      console.error('Error logging out:', error);
    }
  };

  const navItems = [
    { name: t.sidebar.dashboard, href: '/dashboard', icon: LayoutDashboard },
    { name: t.sidebar.vehicles, href: '/dashboard/vehicles', icon: Car },
    { name: t.sidebar.services, href: '/dashboard/services', icon: Wrench },
    { name: t.sidebar.inventory, href: '/dashboard/inventory', icon: Package },
    { name: t.sidebar.settings, href: '/dashboard/settings', icon: Settings },
  ];

  return (
    <AuthGuard>
      <div className="flex h-screen bg-brand-dark text-slate-200 overflow-hidden font-tech">
        {/* Sidebar */}
        <aside className={`fixed inset-y-0 left-0 z-50 w-64 bg-brand-surface border-r border-brand-border transform transition-transform duration-300 ease-in-out md:relative md:translate-x-0 ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'}`}>
          <div className="flex flex-col h-full">
            {/* Logo */}
            <div className="flex items-center justify-center h-16 border-b border-brand-border bg-brand-dark">
              <h1 className="text-3xl font-bold tracking-widest text-white font-display">MECANO</h1>
            </div>

            {/* Nav Links */}
            <nav className="flex-1 px-4 py-6 space-y-2 overflow-y-auto">
              {navItems.map((item) => {
                const isActive = pathname === item.href;
                const Icon = item.icon;
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={`flex items-center px-4 py-3 rounded-md transition-colors group relative overflow-hidden ${
                      isActive 
                        ? 'bg-brand-orange text-black font-bold' 
                        : 'text-gray-400 hover:bg-brand-dark hover:text-white'
                    }`}
                  >
                    <Icon className={`w-5 h-5 mr-3 ${isActive ? 'text-black' : 'text-brand-orange group-hover:text-white'}`} />
                    <span className="tracking-wider text-sm">{item.name}</span>
                    {isActive && (
                       <div className="absolute right-0 top-0 bottom-0 w-1 bg-white" />
                    )}
                  </Link>
                );
              })}
            </nav>

            {/* Language Switcher & User Profile / Logout */}
            <div className="p-4 border-t border-brand-border bg-brand-dark/50 space-y-4">
              <div className="flex justify-center">
                <LanguageSwitcher />
              </div>
              <button 
                onClick={handleLogout}
                className="flex items-center w-full px-4 py-2 text-sm text-gray-400 hover:text-red-400 transition-colors group"
              >
                <LogOut className="w-5 h-5 mr-3 group-hover:text-red-500" />
                <span className="tracking-wider">{t.sidebar.logout}</span>
              </button>
            </div>
          </div>
        </aside>

        {/* Main Content Area */}
        <div className="flex-1 flex flex-col min-w-0 overflow-hidden relative">
          {/* Mobile Header */}
          <header className="md:hidden flex items-center justify-between px-4 h-16 bg-brand-surface border-b border-brand-border">
            <button onClick={() => setIsSidebarOpen(!isSidebarOpen)} className="text-gray-300 hover:text-white focus:outline-none">
              <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>
            <span className="font-display text-xl tracking-wider text-white">MECANO</span>
          </header>

          {/* Content Scroll Area */}
          <main className="flex-1 overflow-y-auto p-4 md:p-8 relative">
              {/* Background Texture */}
              <div className="absolute inset-0 z-0 bg-grid-pattern opacity-10 pointer-events-none fixed" />
              
              <div className="relative z-10 max-w-7xl mx-auto">
                  {children}
              </div>
          </main>
        </div>

        {/* Mobile Overlay */}
        {isSidebarOpen && (
          <div 
            className="fixed inset-0 z-40 bg-black/50 md:hidden backdrop-blur-sm"
            onClick={() => setIsSidebarOpen(false)}
          />
        )}
      </div>
    </AuthGuard>
  );
}
