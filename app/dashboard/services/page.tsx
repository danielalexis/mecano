'use client';

export const dynamic = 'force-dynamic';

import { useFirestoreCollection } from '@/lib/hooks';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { orderBy, Timestamp } from 'firebase/firestore';
import { useRouter } from 'next/navigation';
import { useLanguage } from '@/components/language-provider';

interface Service {
  id: string;
  description: string;
  date: Timestamp;
  total: number;
  status: string;
  vehicleId: string | { id: string };
}

export default function ServicesPage() {
  const router = useRouter();
  const { t } = useLanguage();
  const { data: services, loading } = useFirestoreCollection<Service>('services', [orderBy('date', 'desc')]);

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-display text-white tracking-widest">{t.services.title}</h1>
          <p className="text-gray-400 font-tech text-sm mt-1">{t.services.subtitle}</p>
        </div>
        <Link href="/dashboard/services/new">
          <Button>{t.services.add_btn}</Button>
        </Link>
      </div>

      <div className="card-panel rounded-lg">
        {loading ? (
          <div className="text-center py-12 text-gray-500 font-tech animate-pulse">{t.common.loading}</div>
        ) : services.length === 0 ? (
          <div className="text-center py-12 text-gray-500 font-tech">
            {t.vehicles.detail.no_services}
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left font-tech text-sm text-gray-400">
              <thead className="bg-brand-dark text-xs uppercase text-gray-500 border-b border-brand-border">
                <tr>
                  <th className="px-4 py-3">{t.common.date}</th>
                  <th className="px-4 py-3">{t.services.form.description}</th>
                  <th className="px-4 py-3">{t.common.status}</th>
                  <th className="px-4 py-3 text-right">{t.common.total}</th>
                  <th className="px-4 py-3 text-right">{t.sidebar.vehicles}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-brand-border/50">
                {services.map((service) => {
                  const vehicleId = typeof service.vehicleId === 'object' && service.vehicleId !== null
                    ? (service.vehicleId as { id: string }).id 
                    : service.vehicleId;

                  return (
                    <tr 
                      key={service.id} 
                      onClick={() => router.push(`/dashboard/services/${service.id}`)}
                      className="hover:bg-brand-dark/50 transition-colors group cursor-pointer"
                    >
                      <td className="px-4 py-3 text-white">
                        {service.date?.toDate ? service.date.toDate().toLocaleDateString() : 'N/A'}
                      </td>
                      <td className="px-4 py-3">
                        <div className="font-bold text-white mb-0.5">{service.description}</div>
                        <div className="text-xs text-gray-500">REF: {service.id.slice(0, 8)}</div>
                      </td>
                      <td className="px-4 py-3">
                        <span className={`px-2 py-0.5 rounded text-xs border uppercase ${
                          service.status === 'completed' ? 'text-green-400 border-green-900 bg-green-900/20' :
                          service.status === 'in_progress' ? 'text-yellow-400 border-yellow-900 bg-yellow-900/20' :
                          'text-gray-400 border-gray-700'
                        }`}>
                          {service.status?.replace('_', ' ') || t.services.status.draft}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-right font-bold text-brand-orange">
                        € {service.total?.toFixed(2)}
                      </td>
                      <td className="px-4 py-3 text-right">
                        {vehicleId ? (
                           <button 
                            onClick={(e) => { e.stopPropagation(); router.push(`/dashboard/vehicles/${vehicleId}`); }}
                            className="text-xs text-brand-orange hover:text-white underline decoration-dashed underline-offset-4"
                           >
                            {t.services.view_vehicle}
                           </button>
                        ) : (
                          <span className="text-xs text-gray-600">{t.common.unlinked}</span>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}