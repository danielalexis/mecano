'use client';

export const dynamic = 'force-dynamic';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import type { Timestamp } from 'firebase/firestore';
import { Button } from '@/components/ui/button';
import { Car, Calendar, Activity, Wrench, Share2 } from 'lucide-react';
import Link from 'next/link';
import { useLanguage } from '@/components/language-provider';

interface Vehicle {
  id: string;
  plate: string;
  brand: string;
  model: string;
  vin: string;
  owner: string;
  year: string;
}

interface Service {
  id: string;
  date: Timestamp;
  description: string;
  total: number;
  status: string;
}

export default function VehicleDetailPage() {
  const router = useRouter();
  const { id } = useParams() as { id: string };
  const { t } = useLanguage();
  const [vehicle, setVehicle] = useState<Vehicle | null>(null);
  const [services, setServices] = useState<Service[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchVehicleData() {
      if (!id) return;
      try {
        const { doc, getDoc, collection, query, where, orderBy, getDocs } = await import('firebase/firestore');
        const { db } = await import('@/lib/firebase');
        const vehicleRef = doc(db, 'vehicles', id);
        const vehicleSnap = await getDoc(vehicleRef);

        if (vehicleSnap.exists()) {
          setVehicle({ id: vehicleSnap.id, ...vehicleSnap.data() } as Vehicle);

          // Fetch services for this vehicle
          const servicesQuery = query(
            collection(db, 'services'),
            where('vehicleId', '==', id),
            orderBy('date', 'desc')
          );
          const servicesSnap = await getDocs(servicesQuery);
          const servicesData = servicesSnap.docs.map(doc => ({
            id: doc.id,
            ...doc.data()
          })) as Service[];
          setServices(servicesData);
        } else {
          console.log("No such vehicle!");
        }
      } catch (err) {
        console.error("Error fetching vehicle:", err);
      } finally {
        setLoading(false);
      }
    }
    fetchVehicleData();
  }, [id]);

  const handleShare = (serviceId: string) => {
    const url = `${window.location.origin}/share/${serviceId}`;
    navigator.clipboard.writeText(url);
    alert(t.common.link_copied);
  };

  if (loading) return <div className="p-8 text-center text-gray-500 font-tech animate-pulse">{t.common.loading}</div>;
  if (!vehicle) return <div className="p-8 text-center text-red-500 font-tech">ERROR: VEHICLE_NOT_FOUND</div>;

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Header */}
      <div className="flex justify-between items-start border-b border-brand-border pb-6">
        <div>
          <div className="flex items-center gap-3 mb-2">
            <h1 className="text-4xl font-display text-white tracking-widest">{vehicle.plate}</h1>
            <span className="bg-brand-orange text-black font-bold px-2 py-0.5 rounded text-xs font-tech uppercase">
              {t.vehicles.detail.active}
            </span>
          </div>
          <p className="text-gray-400 font-tech text-lg">{vehicle.brand} {vehicle.model} ({vehicle.year})</p>
          <div className="flex items-center gap-2 mt-2 text-sm text-gray-500 font-tech">
            <span className="font-bold text-brand-orange">VIN:</span> {vehicle.vin || 'N/A'}
          </div>
        </div>
        <div className="flex gap-3">
          <Link href={`/dashboard/services/new?vehicleId=${id}`}>
            <Button variant="primary" size="sm">
              {t.dashboard.new_service}
            </Button>
          </Link>
          <Link href={`/dashboard/vehicles/${id}/edit`}>
            <Button variant="secondary" size="sm">
              {t.common.edit}
            </Button>
          </Link>
        </div>
      </div>

      {/* Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="card-panel bg-brand-surface border border-brand-border p-6 relative overflow-hidden">
          <div className="text-gray-500 font-tech uppercase text-xs mb-2 tracking-widest">{t.vehicles.detail.total_spent}</div>
          <div className="text-3xl font-display text-white">
            € {services.reduce((acc, curr) => acc + (curr.total || 0), 0).toFixed(2)}
          </div>
          <Activity className="absolute bottom-4 right-4 text-brand-orange w-8 h-8 opacity-20" />
        </div>
        
        <div className="card-panel bg-brand-surface border border-brand-border p-6 relative overflow-hidden">
           <div className="text-gray-500 font-tech uppercase text-xs mb-2 tracking-widest">{t.vehicles.detail.service_count}</div>
           <div className="text-3xl font-display text-white">{services.length}</div>
           <Wrench className="absolute bottom-4 right-4 text-brand-yellow w-8 h-8 opacity-20" />
        </div>

        <div className="card-panel bg-brand-surface border border-brand-border p-6 relative overflow-hidden">
           <div className="text-gray-500 font-tech uppercase text-xs mb-2 tracking-widest">{t.vehicles.detail.owner}</div>
           <div className="text-xl font-display text-white truncate">{vehicle.owner}</div>
           <div className="text-xs text-gray-400 mt-1">Last Contact: --</div>
           <Car className="absolute bottom-4 right-4 text-blue-500 w-8 h-8 opacity-20" />
        </div>
      </div>

      {/* Service History */}
      <div className="mt-8">
        <h2 className="text-2xl font-display text-white mb-4 flex items-center gap-2">
          <Calendar className="w-5 h-5 text-brand-orange" /> {t.vehicles.detail.service_history}
        </h2>
        
        {services.length === 0 ? (
          <div className="p-8 border border-dashed border-brand-border rounded text-center text-gray-500 font-tech">
            {t.vehicles.detail.no_services}
          </div>
        ) : (
          <div className="space-y-4">
            {services.map((service) => (
              <div 
                key={service.id} 
                onClick={() => router.push(`/dashboard/services/${service.id}`)}
                className="group relative bg-brand-dark border border-brand-border p-4 hover:border-brand-orange transition-all cursor-pointer overflow-hidden"
              >
                                  <div className="flex justify-between items-center relative z-10">
                                  <div className="flex items-start gap-4">
                                    <div className="bg-brand-surface p-3 rounded border border-brand-border group-hover:bg-brand-orange group-hover:text-black transition-colors">
                                      <Calendar className="w-5 h-5" />
                                    </div>
                                    <div>
                                      <div className="text-white font-display text-xl mb-1">{service.description}</div>
                                      <div className="text-xs font-tech text-gray-500">
                                        {t.common.date}: {service.date?.toDate().toLocaleDateString() || 'N/A'}
                                      </div>
                                    </div>
                                  </div>
                                  <div className="text-right flex items-center gap-4">                    <div className="text-right">
                        <div className="text-2xl font-display text-brand-orange">€ {service.total?.toFixed(2)}</div>
                        <span className={`text-xs font-bold uppercase px-2 py-0.5 rounded border ${
                        service.status === 'completed' ? 'text-green-400 border-green-900 bg-green-900/20' :
                        service.status === 'in_progress' ? 'text-yellow-400 border-yellow-900 bg-yellow-900/20' :
                        'text-gray-400 border-gray-700'
                        }`}>
                        {service.status ? service.status.replace('_', ' ') : t.services.status.draft}
                        </span>
                    </div>
                    <button 
                        onClick={(e) => { e.stopPropagation(); handleShare(service.id); }}
                        className="p-2 text-gray-500 hover:text-brand-orange transition-colors z-20"
                        title={t.common.share}
                    >
                        <Share2 className="w-5 h-5" />
                    </button>
                  </div>
                </div>
                {/* Hover Effect */}
                <div className="absolute inset-y-0 left-0 w-1 bg-brand-orange scale-y-0 group-hover:scale-y-100 transition-transform origin-bottom duration-300" />
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
