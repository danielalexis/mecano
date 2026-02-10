'use client';

import { Activity, Car, DollarSign, Wrench } from 'lucide-react';
import Link from 'next/link';
import { useFirestoreCollection } from '@/lib/hooks';
import { orderBy, Timestamp } from 'firebase/firestore';
import { useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { useLanguage } from '@/components/language-provider';

interface Service {
  id: string;
  description: string;
  date: Timestamp;
  total: number;
  status: string;
  vehicleId: string;
}

interface Part {
  stock: number;
}

export default function DashboardPage() {
  const router = useRouter();
  const { t } = useLanguage();
  const { data: services, loading: loadingServices } = useFirestoreCollection<Service>('services', [orderBy('date', 'desc')]);
  const { data: parts, loading: loadingParts } = useFirestoreCollection<Part>('inventory');
  
  const metrics = useMemo(() => {
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

    const activeJobs = services.filter(s => s.status === 'in_progress' || s.status === 'pending_parts').length;
    
    const monthlyRevenue = services
      .filter(s => s.date?.toDate() >= startOfMonth)
      .reduce((acc, curr) => acc + (curr.total || 0), 0);
      
    const completedJobs = services.filter(s => s.status === 'completed').length;
    
    const lowStockParts = parts.filter(p => p.stock < 5).length;

    return { activeJobs, monthlyRevenue, completedJobs, lowStockParts };
  }, [services, parts]);

  return (
    <div className="space-y-8 animate-fade-in">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-4xl font-display text-white tracking-widest">{t.dashboard.title}</h1>
          <p className="text-gray-400 font-tech text-sm mt-1">{t.dashboard.status} {'//'} {new Date().toLocaleDateString()}</p>
        </div>
        <div className="flex gap-3">
          <Link href="/dashboard/vehicles/new">
            <div className="bg-transparent border-2 border-brand-orange text-brand-orange hover:bg-brand-orange hover:text-black active:scale-95 inline-flex items-center justify-center font-display uppercase tracking-widest font-bold transition-all px-3 py-1 text-sm h-10 w-32" style={{ clipPath: 'polygon(10px 0, 100% 0, 100% calc(100% - 10px), calc(100% - 10px) 100%, 0 100%, 0 10px)' }}>
              {t.dashboard.new_vehicle}
            </div>
          </Link>
          <Link href="/dashboard/services/new">
             <div className="bg-brand-orange text-black hover:bg-orange-500 active:scale-95 shadow-lg shadow-orange-900/20 inline-flex items-center justify-center font-display uppercase tracking-widest font-bold transition-all px-3 py-1 text-sm h-10 w-32" style={{ clipPath: 'polygon(10px 0, 100% 0, 100% calc(100% - 10px), calc(100% - 10px) 100%, 0 100%, 0 10px)' }}>
              {t.dashboard.new_service}
            </div>
          </Link>
        </div>
      </div>

      {/* Metrics Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <MetricCard 
          title={t.dashboard.metrics.active_jobs} 
          value={loadingServices ? "..." : metrics.activeJobs.toString()} 
          change="" 
          icon={<Wrench className="text-brand-orange" />} 
          trend="neutral"
        />
        <MetricCard 
          title={t.dashboard.metrics.revenue} 
          value={loadingServices ? "..." : `€ ${metrics.monthlyRevenue.toFixed(0)}`} 
          change="" 
          icon={<DollarSign className="text-green-500" />} 
          trend="up"
        />
        <MetricCard 
          title={t.dashboard.metrics.completed_jobs} 
          value={loadingServices ? "..." : metrics.completedJobs.toString()} 
          change="" 
          icon={<Car className="text-blue-500" />} 
          trend="up"
        />
        <MetricCard 
          title={t.dashboard.metrics.parts_alert} 
          value={loadingParts ? "..." : metrics.lowStockParts.toString()} 
          change="" 
          icon={<Activity className="text-red-500" />} 
          trend={metrics.lowStockParts > 0 ? "down" : "neutral"}
        />
      </div>

      {/* Recent Activity Table */}
      <div className="card-panel rounded-lg mt-8">
        <h2 className="text-xl font-display text-white mb-6 border-b border-brand-border pb-2 flex justify-between items-center">
          <span>{t.dashboard.recent_logs}</span>
          <span className="text-xs font-tech text-brand-orange animate-pulse">{t.dashboard.live_feed}</span>
        </h2>
        
        {loadingServices ? (
           <div className="text-center py-8 text-gray-500 font-tech">{t.common.loading}</div>
        ) : services.length === 0 ? (
           <div className="text-center py-8 text-gray-500 font-tech">{t.dashboard.no_activity}</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left font-tech text-sm text-gray-400">
              <thead className="bg-brand-dark text-xs uppercase text-gray-500 border-b border-brand-border">
                <tr>
                  <th className="px-4 py-3">{t.services.form.job_id}</th>
                  <th className="px-4 py-3">{t.services.form.description}</th>
                  <th className="px-4 py-3">{t.common.status}</th>
                  <th className="px-4 py-3">{t.common.date}</th>
                  <th className="px-4 py-3 text-right">{t.common.total}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-brand-border/50">
                {services.slice(0, 5).map((service) => (
                  <tr 
                    key={service.id} 
                    onClick={() => router.push(`/dashboard/vehicles/${service.vehicleId}`)}
                    className="hover:bg-brand-dark/50 transition-colors cursor-pointer group"
                  >
                    <td className="px-4 py-3 font-tech text-brand-orange group-hover:text-white transition-colors">
                      {service.id.slice(0, 8)}
                    </td>
                    <td className="px-4 py-3 text-white">{service.description}</td>
                    <td className="px-4 py-3">
                       <span className={`px-2 py-0.5 rounded text-xs border uppercase ${
                        service.status === 'completed' ? 'text-green-400 border-green-900 bg-green-900/20' :
                        service.status === 'in_progress' ? 'text-yellow-400 border-yellow-900 bg-yellow-900/20' :
                        'text-gray-400 border-gray-700'
                      }`}>
                        {service.status ? service.status.replace('_', ' ') : 'DRAFT'}
                      </span>
                    </td>
                    <td className="px-4 py-3">{service.date?.toDate().toLocaleDateString()}</td>
                    <td className="px-4 py-3 text-right font-tech">€ {service.total?.toFixed(2)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}

function MetricCard({ title, value, change, icon, trend }: { title: string, value: string, change: string, icon: React.ReactNode, trend: 'up' | 'down' | 'neutral' }) {
  return (
    <div className="bg-brand-surface border border-brand-border p-6 relative overflow-hidden group hover:border-brand-orange/50 transition-colors">
      <div className="flex justify-between items-start mb-4">
        <div className="p-2 bg-brand-dark rounded border border-brand-border/50 group-hover:scale-110 transition-transform">
          {icon}
        </div>
        <span className={`text-xs font-bold px-2 py-1 rounded bg-brand-dark border ${
            trend === 'up' ? 'text-green-400 border-green-900' : 
            trend === 'down' ? 'text-red-400 border-red-900' : 'text-gray-400 border-gray-700'
        }`}>
          {trend === 'up' ? '▲' : trend === 'down' ? '▼' : '•'}
        </span>
      </div>
      <div className="text-3xl font-display font-bold text-white mb-1">{value}</div>
      <div className="text-xs font-tech text-gray-500 uppercase tracking-widest mb-2">{title}</div>
      {change && (
        <div className="text-xs text-gray-400 border-t border-brand-border pt-2 mt-2">
          {change}
        </div>
      )}
      {/* Hover Effect */}
      <div className="absolute bottom-0 left-0 h-1 bg-brand-orange w-0 group-hover:w-full transition-all duration-500" />
    </div>
  );
}