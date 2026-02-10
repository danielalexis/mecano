'use client';

import { useLanguage } from '@/components/language-provider';

export function LanguageSwitcher({ className }: { className?: string }) {
  const { language, setLanguage } = useLanguage();

  return (
    <div className={`flex items-center gap-2 ${className}`}>
      <button 
        onClick={() => setLanguage('en')}
        className={`px-2 py-1 rounded text-xs font-bold transition-colors ${
          language === 'en' 
            ? 'bg-brand-orange text-black' 
            : 'text-gray-500 hover:text-white'
        }`}
      >
        EN
      </button>
      <span className="text-gray-600">/</span>
      <button 
        onClick={() => setLanguage('pt')}
        className={`px-2 py-1 rounded text-xs font-bold transition-colors ${
          language === 'pt' 
            ? 'bg-brand-orange text-black' 
            : 'text-gray-500 hover:text-white'
        }`}
      >
        PT
      </button>
    </div>
  );
}
