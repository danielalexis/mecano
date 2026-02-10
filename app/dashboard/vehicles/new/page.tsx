'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { collection, addDoc, Timestamp } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { useForm } from 'react-hook-form';

interface VehicleForm {
  plate: string;
  brand: string;
  model: string;
  year: string;
  vin: string;
  owner: string;
  phone: string;
}

export default function NewVehiclePage() {
  const router = useRouter();
  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<VehicleForm>();
  const [error, setError] = useState<string | null>(null);

  const onSubmit = async (data: VehicleForm) => {
    try {
      const docRef = await addDoc(collection(db, 'vehicles'), {
        ...data,
        createdAt: Timestamp.now(),
        searchKeywords: [data.plate.toLowerCase(), data.owner.toLowerCase()] // Helper for search
      });
      console.log("Document written with ID: ", docRef.id);
      router.push(`/dashboard/vehicles/${docRef.id}`);
    } catch (e) {
      console.error("Error adding document: ", e);
      setError("Failed to register vehicle. Please try again.");
    }
  };

  return (
    <div className="max-w-2xl mx-auto animate-fade-in">
      <div className="mb-8 border-b border-brand-border pb-4">
        <h1 className="text-3xl font-display text-white tracking-widest">NEW_CHASSIS_ENTRY</h1>
        <p className="text-gray-400 font-tech text-sm mt-1">Register a new vehicle into the system database.</p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="bg-brand-surface border border-brand-border p-8 rounded-lg space-y-6 relative overflow-hidden">
        {/* Decorative elements */}
        <div className="absolute top-0 right-0 w-16 h-16 border-t-2 border-r-2 border-brand-orange/20 rounded-tr-3xl pointer-events-none" />

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="col-span-2">
            <Input 
              label="LICENSE PLATE" 
              placeholder="AA-00-BB" 
              {...register('plate', { required: 'Plate is required' })}
              error={errors.plate?.message}
              fullWidth
              className="font-display text-2xl tracking-widest uppercase placeholder:text-gray-600"
            />
          </div>

          <Input 
            label="BRAND (MAKE)" 
            placeholder="BMW, Ford, Toyota..." 
            {...register('brand', { required: 'Brand is required' })}
            error={errors.brand?.message}
            fullWidth
          />

          <Input 
            label="MODEL" 
            placeholder="320d, Focus, Yaris..." 
            {...register('model', { required: 'Model is required' })}
            error={errors.model?.message}
            fullWidth
          />

          <Input 
            label="YEAR" 
            placeholder="2020" 
            type="number"
            {...register('year', { required: 'Year is required', min: 1900, max: new Date().getFullYear() + 1 })}
            error={errors.year?.message}
            fullWidth
          />

          <Input 
            label="VIN (CHASSIS NO.)" 
            placeholder="XXXXXXXXXXXXXXXXX" 
            {...register('vin')}
            fullWidth
            className="uppercase"
          />

          <div className="col-span-2 border-t border-brand-border pt-6 mt-2">
            <h3 className="text-white font-display mb-4">OWNER INFORMATION</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Input 
                label="FULL NAME" 
                placeholder="John Doe" 
                {...register('owner', { required: 'Owner name is required' })}
                error={errors.owner?.message}
                fullWidth
              />
               <Input 
                label="CONTACT PHONE" 
                placeholder="+351 910 000 000" 
                {...register('phone')}
                fullWidth
              />
            </div>
          </div>
        </div>

        {error && (
          <div className="p-3 bg-red-900/20 border border-red-500/50 text-red-400 text-sm font-tech">
            ⚠ {error}
          </div>
        )}

        <div className="flex justify-end pt-4 gap-4">
          <Button type="button" variant="ghost" onClick={() => router.back()}>
            CANCEL
          </Button>
          <Button type="submit" variant="primary" disabled={isSubmitting}>
            {isSubmitting ? 'SAVING...' : 'REGISTER VEHICLE'}
          </Button>
        </div>
      </form>
    </div>
  );
}
