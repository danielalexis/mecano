'use client';

export const dynamic = 'force-dynamic';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import type { Timestamp } from 'firebase/firestore';
import { Wrench, CheckCircle, Eye, FileText, User, Moon, Sun } from 'lucide-react';
import Image from 'next/image';
import { useLanguage } from '@/components/language-provider';
import { LanguageSwitcher } from '@/components/language-switcher';
import ImageViewer from '@/components/ui/image-viewer';

interface PartItem {
  name: string;
  pn: string;
  cost: number;
  quantity: number;
}

interface Service {
  id: string;
  description: string;
  customerStates?: string;
  techReport?: string;
  date: Timestamp;
  total: number;
  status: string;
  vehicleId: string | { id: string };
  imageUrls?: string[];
  subtotal: number;
  vatAmount: number;
  laborHours: number;
  laborRate?: number;
  partsMargin?: number;
  parts: PartItem[];
}

interface Vehicle {
  plate: string;
  brand: string;
  model: string;
  owner: string;
}

const getImageUrl = (path: string) => {
  if (path.startsWith('http')) return path;
  return `/api/file?key=${encodeURIComponent(path)}`;
};

export default function PublicServicePage() {
  const params = useParams();
  const id = params?.id as string;
  const { t } = useLanguage();
  
  const [service, setService] = useState<Service | null>(null);
  const [vehicle, setVehicle] = useState<Vehicle | null>(null);
  const [loading, setLoading] = useState(true);
  const [isDark, setIsDark] = useState(false);
  
  const [viewerOpen, setViewerOpen] = useState(false);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  // Initialize theme based on system preference
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
      setIsDark(prefersDark);
    }
  }, []);

  useEffect(() => {
    async function fetchData() {
      if (!id) return;
      try {
        const { doc, getDoc } = await import('firebase/firestore');
        const { db } = await import('@/lib/firebase');
        const serviceRef = doc(db, 'services', id);
        const serviceSnap = await getDoc(serviceRef);

        if (serviceSnap.exists()) {
          const serviceData = { id: serviceSnap.id, ...serviceSnap.data() } as Service;
          setService(serviceData);

          const vehicleId = typeof serviceData.vehicleId === 'object' && serviceData.vehicleId !== null
            ? (serviceData.vehicleId as { id: string }).id 
            : serviceData.vehicleId;

          if (vehicleId) {
            const vehicleRef = doc(db, 'vehicles', vehicleId);
            const vehicleSnap = await getDoc(vehicleRef);
            if (vehicleSnap.exists()) {
              setVehicle(vehicleSnap.data() as Vehicle);
            }
          }
        }
      } catch (err) {
        console.error("Error fetching data:", err);
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, [id]);

  if (loading) return (
    <div className={`min-h-screen flex items-center justify-center ${isDark ? 'bg-zinc-950 text-zinc-400' : 'bg-gray-50 text-gray-500'} font-sans animate-pulse`}>
      <div className="text-center">
        <div className={`w-12 h-12 border-4 ${isDark ? 'border-zinc-800 border-t-orange-500' : 'border-gray-200 border-t-orange-600'} rounded-full animate-spin mx-auto mb-4`}></div>
        <p>{t.common.loading}</p>
      </div>
    </div>
  );
  
  if (!service || !vehicle) return (
    <div className={`min-h-screen flex items-center justify-center ${isDark ? 'bg-zinc-950' : 'bg-gray-50'} font-sans`}>
      <div className={`text-center p-8 ${isDark ? 'bg-zinc-900 border-zinc-800 text-zinc-100' : 'bg-white border-red-100 text-red-500'} rounded-lg shadow-sm border`}>
        <p className="text-xl font-bold mb-2">{t.public.not_found}</p>
        <p className={`text-sm ${isDark ? 'text-zinc-500' : 'text-gray-400'}`}>{t.public.check_link}</p>
      </div>
    </div>
  );

  return (
    <div className={`${isDark ? 'dark' : ''} fixed inset-0 z-50 overflow-y-auto bg-gray-50 dark:bg-zinc-950 text-gray-900 dark:text-zinc-100 transition-colors duration-300`}>
      <div className="pb-20">
        
        {/* Header */}
        <header className="bg-white/80 dark:bg-zinc-900/80 backdrop-blur-md border-b border-gray-200 dark:border-zinc-800 sticky top-0 z-10 shadow-sm">
          <div className="max-w-3xl mx-auto px-6 py-4 flex justify-between items-center">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-orange-600 flex items-center justify-center rounded-lg shadow-lg">
                <Wrench className="w-6 h-6 text-white" />
              </div>
              <div>
                <span className="font-bold text-lg tracking-tight block leading-tight">{t.public.title}</span>
                <span className="text-[10px] text-gray-500 dark:text-zinc-500 uppercase tracking-[0.2em]">{t.public.subtitle}</span>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <LanguageSwitcher />
              <button 
                onClick={() => setIsDark(!isDark)}
                className={`p-2 rounded-full ${isDark ? 'bg-zinc-800 text-orange-400 hover:bg-zinc-700' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'} transition-colors`}
              >
                {isDark ? <Sun size={18} /> : <Moon size={18} />}
              </button>
              <div className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider border ${
                service.status === 'completed' ? 'bg-green-100 text-green-700 border-green-200 dark:bg-green-900/30 dark:text-green-400 dark:border-green-900/50' :
                service.status === 'approved' ? 'bg-blue-100 text-blue-700 border-blue-200 dark:bg-blue-900/30 dark:text-blue-400 dark:border-blue-900/50' :
                'bg-yellow-100 text-yellow-700 border-yellow-200 dark:bg-yellow-900/30 dark:text-yellow-400 dark:border-yellow-900/50'
              }`}>
                {t.services.status[service.status as keyof typeof t.services.status] || t.services.status.draft}
              </div>
            </div>
          </div>
        </header>

        <main className="max-w-3xl mx-auto px-6 py-8 space-y-6">
          
          {/* Vehicle Info Card */}
          <div className="bg-gray-50 dark:bg-zinc-900 rounded-2xl border border-gray-200 dark:border-zinc-800 p-6 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
            <div>
              <h1 className="text-2xl font-bold mb-1 tracking-tight text-gray-900 dark:text-white">{vehicle.brand} {vehicle.model}</h1>
              <div className="flex items-center gap-3 mt-2">
                <span className="bg-white dark:bg-zinc-800 px-3 py-1 rounded-md text-sm font-mono border border-gray-200 dark:border-zinc-700 font-bold tracking-widest text-gray-700 dark:text-zinc-300 shadow-sm">{vehicle.plate}</span>
                <span className="text-sm text-gray-500 dark:text-zinc-500 font-medium">• {vehicle.owner}</span>
              </div>
            </div>
            <div className="text-right">
              <div className="text-[10px] text-gray-400 dark:text-zinc-500 uppercase tracking-widest mb-1 font-bold">{t.public.service_date}</div>
              <div className="font-semibold text-lg text-gray-800 dark:text-zinc-200">{service.date?.toDate().toLocaleDateString()}</div>
            </div>
          </div>

          {/* Customer States */}
          {service.customerStates && (
            <div className="bg-white dark:bg-zinc-950 border-l-4 border-orange-500 p-6 rounded-r-xl">
              <h3 className="text-[10px] font-black text-gray-400 dark:text-zinc-500 uppercase tracking-[0.2em] mb-3 flex items-center gap-2">
                <User className="w-3.5 h-3.5" /> {t.public.customer_reported}
              </h3>
              <p className="text-gray-700 dark:text-zinc-300 italic text-lg font-medium leading-relaxed">&quot;{service.customerStates}&quot;</p>
            </div>
          )}

          {/* Service Details Card */}
          <div className="bg-white dark:bg-zinc-900 rounded-2xl border border-gray-200 dark:border-zinc-800 overflow-hidden shadow-sm">
            <div className="p-6 border-b border-gray-100 dark:border-zinc-800">
              <h2 className="text-lg font-bold mb-3 text-gray-900 dark:text-white flex items-center gap-2">
                 {t.public.description}
              </h2>
              <p className="text-gray-600 dark:text-zinc-400 leading-relaxed text-base">{service.description}</p>
            </div>

            {/* Tech Report */}
            {service.techReport && (
              <div className="p-6 border-b border-gray-100 dark:border-zinc-800 bg-orange-50/30 dark:bg-orange-500/5">
                <h3 className="text-[10px] font-black text-orange-700 dark:text-orange-500 uppercase tracking-[0.2em] mb-3 flex items-center gap-2">
                  <FileText className="w-3.5 h-3.5" /> {t.public.tech_findings}
                </h3>
                <p className="text-gray-700 dark:text-zinc-300 whitespace-pre-wrap text-sm md:text-base leading-relaxed">{service.techReport}</p>
              </div>
            )}

            {/* Parts List */}
            <div className="p-6 bg-gray-50/50 dark:bg-zinc-900/50">
               <h3 className="text-[10px] font-black text-gray-400 dark:text-zinc-500 uppercase tracking-[0.2em] mb-5">{t.public.parts_materials}</h3>
               <ul className="space-y-4">
                 {service.parts && service.parts.length > 0 ? (
                   service.parts.map((part, idx) => (
                     <li key={idx} className="flex justify-between items-center text-sm">
                       <span className="text-gray-800 dark:text-zinc-200 flex items-center gap-3">
                         <span className="font-bold bg-white dark:bg-zinc-800 border border-gray-200 dark:border-zinc-700 w-8 h-8 flex items-center justify-center rounded-lg text-xs text-gray-500 dark:text-zinc-400 shadow-sm">{part.quantity}x</span> 
                         <span className="font-medium">{part.name}</span>
                         {part.pn && <span className="text-gray-400 dark:text-zinc-600 text-[10px] font-mono border border-gray-100 dark:border-zinc-800 px-1.5 rounded">{part.pn}</span>}
                       </span>
                       <span className="font-mono font-bold text-gray-600 dark:text-zinc-400 text-base">
                         € {((part.cost * part.quantity) * (1 + (service.partsMargin || 0) / 100)).toFixed(2)}
                       </span>
                     </li>
                   ))
                 ) : (
                   <li className="text-gray-400 dark:text-zinc-600 text-sm italic">No replacement parts recorded.</li>
                 )}
                 
                 {service.laborHours > 0 && (
                   <li className="flex justify-between items-center text-sm pt-4 border-t border-gray-100 dark:border-zinc-800 mt-2">
                     <span className="text-gray-800 dark:text-zinc-200 font-semibold flex items-center gap-3">
                        <div className="w-8 h-8 flex items-center justify-center rounded-lg bg-orange-600/10 text-orange-600">
                          <Wrench size={14} />
                        </div>
                        {t.public.labor} ({service.laborHours}h)
                     </span>
                     <span className="font-mono font-bold text-gray-600 dark:text-zinc-400 text-base">
                       € {(service.laborHours * (service.laborRate || 0)).toFixed(2)}
                     </span> 
                   </li>
                 )}
               </ul>
            </div>

            {/* Totals Section */}
            <div className="p-8 bg-white dark:bg-zinc-900 border-t border-gray-200 dark:border-zinc-800 space-y-4">
              <div className="flex justify-between items-center text-xs uppercase tracking-widest text-gray-500 dark:text-zinc-500 font-bold">
                <span>{t.public.subtotal}</span>
                <span>€ {service.subtotal?.toFixed(2)}</span>
              </div>
              <div className="flex justify-between items-center text-xs uppercase tracking-widest text-gray-500 dark:text-zinc-500 font-bold">
                <span>{t.public.vat} ({service.vatAmount ? ((service.vatAmount / service.subtotal) * 100).toFixed(0) : 23}%)</span>
                <span>€ {service.vatAmount?.toFixed(2)}</span>
              </div>
              <div className={`flex justify-between items-center p-4 rounded-xl ${isDark ? 'bg-orange-500/10 border border-orange-500/20' : 'bg-orange-50 border border-orange-100'} mt-4`}>
                <span className="text-sm font-black uppercase tracking-widest text-orange-600 dark:text-orange-500">{t.public.total_payable}</span>
                <span className="text-3xl font-black text-orange-600 dark:text-orange-500 tracking-tighter">€ {service.total?.toFixed(2)}</span>
              </div>
            </div>
          </div>

          {/* Photo Gallery */}
          {service.imageUrls && service.imageUrls.length > 0 && (
            <div className="space-y-4">
              <h3 className="text-[10px] font-black text-gray-400 dark:text-zinc-500 uppercase tracking-[0.2em] flex items-center gap-2 ml-2">
                <CheckCircle className="w-3.5 h-3.5 text-green-500" /> {t.public.photos}
              </h3>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                {service.imageUrls.map((path, idx) => (
                  <div 
                    key={idx} 
                    className="aspect-square relative rounded-2xl overflow-hidden border border-gray-200 dark:border-zinc-800 shadow-sm bg-gray-100 dark:bg-zinc-800 group cursor-pointer"
                    onClick={() => {
                      setCurrentImageIndex(idx);
                      setViewerOpen(true);
                    }}
                  >
                    <Image 
                      src={getImageUrl(path)} 
                      alt={`Service photo ${idx + 1}`} 
                      fill 
                      className="object-cover group-hover:scale-110 transition-transform duration-700 ease-in-out"
                      sizes="(max-width: 768px) 50vw, 33vw"
                      unoptimized
                    />
                    <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity duration-300">
                      <Eye className="w-8 h-8 text-white drop-shadow-lg" />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

        </main>

        <footer className={`text-center text-[10px] font-bold uppercase tracking-[0.3em] ${isDark ? 'text-zinc-600' : 'text-gray-300'} mt-16 px-6 pb-12 transition-colors`}>
          <p className="mb-2">{t.public.record_id} {service.id.toUpperCase()}</p>
          <p>{t.public.footer.replace('{brand}', vehicle.brand)}</p>
          <p>{t.public.copyright.replace('{year}', new Date().getFullYear().toString())}</p>
        </footer>

        {service.imageUrls && (
          <ImageViewer 
            images={service.imageUrls.map(getImageUrl)} 
            initialIndex={currentImageIndex} 
            isOpen={viewerOpen} 
            onClose={() => setViewerOpen(false)}
            onIndexChange={setCurrentImageIndex}
          />
        )}
      </div>
    </div>
  );
}
