'use client';

export const dynamic = 'force-dynamic';

import { useState } from 'react';
import { useFirestoreCollection } from '@/lib/hooks';
import Link from 'next/link';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Car, Search } from 'lucide-react';
import { useLanguage } from '@/components/language-provider';

interface Vehicle {
  id: string;
  plate: string;
  brand: string;
  model: string;
  owner: string;
}

export default function VehiclesPage() {
  const { t } = useLanguage();
  const { data: vehicles, loading } = useFirestoreCollection<Vehicle>('vehicles');
  const [filter, setFilter] = useState('');

  const filteredVehicles = vehicles.filter((v) =>
    v.plate.toLowerCase().includes(filter.toLowerCase()) ||
    v.brand.toLowerCase().includes(filter.toLowerCase()) ||
    v.owner.toLowerCase().includes(filter.toLowerCase())
  );

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-display text-white tracking-widest">{t.vehicles.title}</h1>
          <p className="text-gray-400 font-tech text-sm mt-1">{t.vehicles.subtitle}</p>
        </div>
        <Link href="/dashboard/vehicles/new">
          <Button>{t.vehicles.add_btn}</Button>
        </Link>
      </div>

      <div className="relative">
        <Search className="absolute left-3 top-3.5 h-5 w-5 text-gray-500" />
        <Input
          placeholder={t.vehicles.search_placeholder}
          className="pl-10"
          value={filter}
          onChange={(e) => setFilter(e.target.value)}
        />
      </div>

      <div className="card-panel rounded-lg">
        {loading ? (
          <div className="text-center py-12 text-gray-500 font-tech animate-pulse">{t.common.loading}</div>
        ) : filteredVehicles.length === 0 ? (
          <div className="text-center py-12 text-gray-500 font-tech">
            {t.vehicles.no_records}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredVehicles.map((vehicle) => (
              <Link key={vehicle.id} href={`/dashboard/vehicles/${vehicle.id}`} className="block group">
                <div className="p-4 bg-brand-dark border border-brand-border hover:border-brand-orange transition-all relative overflow-hidden h-full flex flex-col justify-between">
                  <div className="absolute top-0 right-0 p-2 opacity-50 group-hover:opacity-100 transition-opacity">
                    <Car className="w-12 h-12 text-brand-surface stroke-1" />
                  </div>
                  
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-2xl font-display text-white group-hover:text-brand-orange transition-colors">
                        {vehicle.plate.toUpperCase()}
                      </span>
                      <span className="text-xs font-tech text-gray-500 bg-brand-surface px-2 py-0.5 rounded border border-brand-border">
                        ID: {vehicle.id.slice(0, 4)}
                      </span>
                    </div>
                    <div className="text-gray-300 font-bold text-lg mb-1">{vehicle.brand} {vehicle.model}</div>
                    <div className="text-sm font-tech text-gray-500">{t.vehicles.detail.owner}: {vehicle.owner}</div>
                  </div>

                  <div className="mt-4 pt-4 border-t border-brand-border flex justify-between items-center text-xs font-tech text-gray-400">
                    <span>{t.vehicles.view_history}</span>
                    <span className="group-hover:text-brand-orange transition-colors">{t.vehicles.access_log}</span>
                  </div>
                  
                  <div className="absolute bottom-0 left-0 h-1 bg-brand-orange w-0 group-hover:w-full transition-all duration-300" />
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}