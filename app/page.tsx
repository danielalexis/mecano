'use client';

import Link from 'next/link';
import { Wrench, Car, ClipboardList, Gauge, Settings } from 'lucide-react';
import { useLanguage } from '@/components/language-provider';
import { LanguageSwitcher } from '@/components/language-switcher';

export default function Home() {
  const { t } = useLanguage();

  return (
    <div className="relative min-h-screen flex flex-col items-center justify-center overflow-hidden bg-brand-dark text-slate-100">
      {/* Background Grid */}
      <div className="absolute inset-0 z-0 bg-grid-pattern opacity-20 pointer-events-none" />
      
      {/* Ambient Glow */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[600px] bg-brand-orange/10 rounded-full blur-[120px] pointer-events-none" />

      <nav className="absolute top-0 left-0 right-0 z-50 p-6 flex justify-between items-center max-w-7xl mx-auto w-full">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-brand-orange flex items-center justify-center transform rotate-45">
            <Wrench className="w-5 h-5 text-white transform -rotate-45" />
          </div>
          <span className="text-2xl font-bold tracking-wider font-display text-white">MECANO</span>
        </div>
        <div className="flex items-center gap-6">
          <LanguageSwitcher />
          <Link 
            href="/login" 
            className="px-4 py-2 text-sm font-medium text-gray-400 hover:text-brand-orange transition-colors font-tech uppercase tracking-widest"
          >
            {t.landing.login_btn}
          </Link>
        </div>
      </nav>

      <main className="relative z-10 flex flex-col items-center gap-12 max-w-5xl text-center px-6 mt-20">
        
        {/* Hero Section */}
        <div className="space-y-6 animate-fade-in">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-brand-surface border border-brand-border/50 text-brand-orange text-xs font-tech tracking-wider uppercase">
            <span className="w-2 h-2 rounded-full bg-brand-orange animate-pulse" />
            {t.dashboard.status}
          </div>
          
          <h1 className="text-7xl md:text-9xl font-bold leading-none tracking-tighter text-white font-display">
            {t.landing.title_start} <span className="text-transparent bg-clip-text bg-gradient-to-r from-brand-orange to-brand-yellow">{t.landing.title_end}</span>
            <br />
            {t.landing.subtitle}
          </h1>
          
          <p className="text-lg md:text-xl text-gray-400 max-w-2xl mx-auto font-tech">
            {t.landing.description}
            <br/>
            <span className="text-brand-orange/80">{t.landing.for_pros}</span>
          </p>

          <div className="flex flex-col sm:flex-row gap-6 justify-center mt-8">
             <Link href="/login" className="group">
              <div className="relative px-8 py-4 bg-brand-orange text-black font-bold font-display text-xl tracking-wide hover:bg-orange-500 transition-all clip-path-slant">
                <span className="relative z-10 flex items-center gap-2">
                  {t.landing.session_btn} <Gauge className="w-5 h-5" />
                </span>
                <div className="absolute inset-0 bg-white/20 translate-y-full group-hover:translate-y-0 transition-transform duration-300" />
              </div>
            </Link>
          </div>
        </div>

        {/* Feature Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 w-full mt-16 animate-slide-up" style={{ animationDelay: '0.2s' }}>
          <FeatureCard 
            icon={<Car className="w-8 h-8 text-brand-orange" />}
            title={t.landing.features.vehicle_logs}
            code="MOD: TRACK_01"
            description={t.landing.features.vehicle_desc}
          />
          <FeatureCard 
            icon={<ClipboardList className="w-8 h-8 text-brand-yellow" />}
            title={t.landing.features.parts_inventory}
            code="MOD: STOCK_02"
            description={t.landing.features.parts_desc}
          />
          <FeatureCard 
            icon={<Settings className="w-8 h-8 text-blue-500" />}
            title={t.landing.features.fiscal_core}
            code="MOD: TAX_03"
            description={t.landing.features.fiscal_desc}
          />
        </div>

        {/* Mock Interface Preview */}
        <div className="w-full max-w-4xl mt-20 p-1 bg-gradient-to-b from-brand-border to-transparent rounded-lg">
          <div className="bg-brand-dark border border-brand-border rounded-lg overflow-hidden shadow-2xl">
            <div className="flex items-center gap-2 px-4 py-2 bg-brand-surface border-b border-brand-border">
              <div className="flex gap-1.5">
                <div className="w-3 h-3 rounded-full bg-red-500/20 border border-red-500/50" />
                <div className="w-3 h-3 rounded-full bg-yellow-500/20 border border-yellow-500/50" />
                <div className="w-3 h-3 rounded-full bg-green-500/20 border border-green-500/50" />
              </div>
              <div className="ml-4 text-xs font-tech text-gray-500">mecano_sys_terminal // user: admin</div>
            </div>
            <div className="p-6 font-tech text-sm space-y-2 text-left">
              <div className="flex justify-between text-gray-500 border-b border-brand-border pb-2 mb-4">
                <span>ID</span>
                <span>STATUS</span>
                <span>TOTAL</span>
              </div>
              <div className="flex justify-between items-center group cursor-pointer hover:bg-brand-surface/50 p-2 rounded transition-colors">
                <span className="text-brand-orange">SRV-2024-001</span>
                <span className="px-2 py-0.5 bg-green-900/30 text-green-400 text-xs rounded border border-green-900/50">COMPLETED</span>
                <span className="text-gray-300">€ 450.00</span>
              </div>
               <div className="flex justify-between items-center group cursor-pointer hover:bg-brand-surface/50 p-2 rounded transition-colors">
                <span className="text-brand-orange">SRV-2024-002</span>
                <span className="px-2 py-0.5 bg-yellow-900/30 text-yellow-400 text-xs rounded border border-yellow-900/50">IN_PROGRESS</span>
                <span className="text-gray-300">€ 125.50</span>
              </div>
               <div className="flex justify-between items-center group cursor-pointer hover:bg-brand-surface/50 p-2 rounded transition-colors">
                <span className="text-brand-orange">SRV-2024-003</span>
                <span className="px-2 py-0.5 bg-red-900/30 text-red-400 text-xs rounded border border-red-900/50">PENDING_PARTS</span>
                <span className="text-gray-300">--</span>
              </div>
               <div className="text-gray-600 mt-4 animate-pulse">_ Awaiting input...</div>
            </div>
          </div>
        </div>

      </main>

      <footer className="mt-24 py-8 text-xs font-tech text-gray-600 border-t border-brand-border w-full text-center">
        {t.landing.footer.replace('{year}', new Date().getFullYear().toString())}
      </footer>
    </div>
  );
}

function FeatureCard({ icon, title, code, description }: { icon: React.ReactNode, title: string, code: string, description: string }) {
  return (
    <div className="group relative p-6 bg-brand-surface border border-brand-border hover:border-brand-orange/50 transition-all duration-300 overflow-hidden">
      <div className="absolute top-0 right-0 p-2 opacity-50">
        <div className="w-16 h-16 border-t border-r border-brand-border rounded-tr-3xl" />
      </div>
      
      <div className="relative z-10 flex flex-col items-start gap-4 text-left">
        <div className="p-3 bg-brand-dark border border-brand-border rounded mb-2 group-hover:scale-110 transition-transform duration-300">
          {icon}
        </div>
        <div>
          <span className="text-xs font-tech text-brand-orange tracking-widest block mb-1">{code}</span>
          <h3 className="font-display text-3xl font-bold tracking-wide text-white group-hover:text-brand-orange transition-colors">{title}</h3>
        </div>
        <p className="text-sm font-tech text-gray-400 leading-relaxed border-l-2 border-brand-border pl-4 group-hover:border-brand-orange transition-colors">
          {description}
        </p>
      </div>

      <div className="absolute bottom-0 left-0 w-full h-1 bg-brand-orange scale-x-0 group-hover:scale-x-100 transition-transform duration-500 origin-left" />
    </div>
  );
}