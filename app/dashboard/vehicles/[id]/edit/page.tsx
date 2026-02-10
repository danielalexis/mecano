'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { doc, getDoc, updateDoc, Timestamp, deleteDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { useForm } from 'react-hook-form';
import { useLanguage } from '@/components/language-provider';
import { Trash2 } from 'lucide-react';

interface VehicleForm {
  plate: string;
  brand: string;
  model: string;
  year: string;
  vin: string;
  owner: string;
  phone: string;
}

export default function EditVehiclePage() {
  const router = useRouter();
  const { id } = useParams() as { id: string };
  const { t } = useLanguage();
  const [loading, setLoading] = useState(true);
  
  const { register, handleSubmit, reset, formState: { errors, isSubmitting } } = useForm<VehicleForm>();

  useEffect(() => {
    async function fetchVehicle() {
      if (!id) return;
      const docRef = doc(db, 'vehicles', id);
      const snap = await getDoc(docRef);
      if (snap.exists()) {
        const data = snap.data() as VehicleForm;
        reset(data);
        setLoading(false);
      } else {
        alert("Vehicle not found");
        router.push('/dashboard/vehicles');
      }
    }
    fetchVehicle();
  }, [id, reset, router]);

  const onSubmit = async (data: VehicleForm) => {
    try {
      const docRef = doc(db, 'vehicles', id);
      await updateDoc(docRef, {
        ...data,
        updatedAt: Timestamp.now(),
        searchKeywords: [data.plate.toLowerCase(), data.owner.toLowerCase()]
      });
      router.push(`/dashboard/vehicles/${id}`);
    } catch (e) {
      console.error("Error updating document: ", e);
      alert("Failed to update vehicle.");
    }
  };

  const handleDelete = async () => {
    if (confirm(t.common.delete + "?")) {
      try {
        await deleteDoc(doc(db, 'vehicles', id));
        router.push('/dashboard/vehicles');
      } catch (e) {
        console.error("Error deleting document: ", e);
        alert("Failed to delete vehicle.");
      }
    }
  };

  if (loading) return <div className="text-center py-10 font-tech">{t.common.loading}</div>;

  return (
    <div className="max-w-2xl mx-auto animate-fade-in">
      <div className="mb-8 border-b border-brand-border pb-4 flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-display text-white tracking-widest">{t.vehicles.form.title.replace('NEW', 'EDIT')}</h1>
          <p className="text-gray-400 font-tech text-sm mt-1">{t.vehicles.form.subtitle}</p>
        </div>
        <Button type="button" variant="ghost" onClick={handleDelete} className="text-red-500 hover:text-red-400">
          <Trash2 className="w-5 h-5 mr-2" /> {t.common.delete}
        </Button>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="bg-brand-surface border border-brand-border p-8 rounded-lg space-y-6 relative overflow-hidden">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="col-span-2">
            <Input 
              label={t.vehicles.form.plate} 
              placeholder="AA-00-BB" 
              {...register('plate', { required: true })}
              fullWidth
              className="font-display text-2xl tracking-widest uppercase placeholder:text-gray-600"
            />
          </div>

          <Input 
            label={t.vehicles.form.brand} 
            placeholder="BMW" 
            {...register('brand', { required: true })}
            fullWidth
          />

          <Input 
            label={t.vehicles.form.model} 
            placeholder="320d" 
            {...register('model', { required: true })}
            fullWidth
          />

          <Input 
            label={t.vehicles.form.year} 
            placeholder="2020" 
            type="number"
            {...register('year', { required: true })}
            fullWidth
          />

          <Input 
            label={t.vehicles.form.vin} 
            placeholder="VIN..." 
            {...register('vin')}
            fullWidth
            className="uppercase"
          />

          <div className="col-span-2 border-t border-brand-border pt-6 mt-2">
            <h3 className="text-white font-display mb-4">{t.vehicles.form.owner_section}</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Input 
                label={t.vehicles.form.owner_name} 
                placeholder="John Doe" 
                {...register('owner', { required: true })}
                fullWidth
              />
               <Input 
                label={t.vehicles.form.owner_phone} 
                placeholder="+351..." 
                {...register('phone')}
                fullWidth
              />
            </div>
          </div>
        </div>

        <div className="flex justify-end pt-4 gap-4">
          <Button type="button" variant="ghost" onClick={() => router.back()}>
            {t.common.cancel}
          </Button>
          <Button type="submit" variant="primary" disabled={isSubmitting}>
            {isSubmitting ? t.common.saving : t.common.save}
          </Button>
        </div>
      </form>
    </div>
  );
}
