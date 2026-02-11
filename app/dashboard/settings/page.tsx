'use client';

export const dynamic = 'force-dynamic';

import { useState, useEffect } from 'react';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Save } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { useLanguage } from '@/components/language-provider';

interface AppSettings {
  vatRate: number;
  currency: string;
  garageName: string;
  hourlyRateDefault: number;
}

export default function SettingsPage() {
  const { t } = useLanguage();
  const [loading, setLoading] = useState(true);
  const { register, handleSubmit, setValue, formState: { isSubmitting } } = useForm<AppSettings>();

  useEffect(() => {
    const fetchSettings = async () => {
      try {
        const docRef = doc(db, 'settings', 'global');
        const snap = await getDoc(docRef);
        if (snap.exists()) {
          const data = snap.data() as AppSettings;
          setValue('vatRate', data.vatRate);
          setValue('currency', data.currency);
          setValue('garageName', data.garageName);
          setValue('hourlyRateDefault', data.hourlyRateDefault);
        }
      } catch (err) {
        console.error("Error fetching settings:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchSettings();
  }, [setValue]);

  const onSave = async (data: AppSettings) => {
    try {
      await setDoc(doc(db, 'settings', 'global'), data);
      alert(t.common.saving.replace('...', 'd!'));
    } catch (err) {
      console.error("Error saving settings:", err);
      alert('Failed to save settings.');
    }
  };

  if (loading) return <div className="text-center py-12 text-gray-500 font-tech animate-pulse">{t.common.loading}</div>;

  return (
    <div className="space-y-8 animate-fade-in max-w-2xl mx-auto">
      <div className="border-b border-brand-border pb-4">
        <h1 className="text-3xl font-display text-white tracking-widest">{t.settings.title}</h1>
        <p className="text-gray-400 font-tech text-sm mt-1">{t.settings.subtitle}</p>
      </div>

      <form onSubmit={handleSubmit(onSave)} className="card-panel rounded-lg space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Input 
            label={t.settings.garage_name}
            placeholder="My Auto Shop" 
            {...register('garageName')} 
            fullWidth 
            className="md:col-span-2"
          />
          
          <Input 
            label={t.settings.default_vat}
            type="number" 
            step="0.1" 
            {...register('vatRate', { valueAsNumber: true })} 
            fullWidth 
          />
          
          <Input 
            label={t.settings.currency}
            placeholder="€" 
            {...register('currency')} 
            fullWidth 
          />

          <Input 
            label={t.settings.hourly_rate} 
            type="number" 
            step="0.5" 
            {...register('hourlyRateDefault', { valueAsNumber: true })} 
            fullWidth 
          />
        </div>

        <div className="flex justify-end pt-4 border-t border-brand-border">
          <Button type="submit" variant="primary" disabled={isSubmitting}>
            <Save className="w-4 h-4 mr-2" /> {t.settings.submit}
          </Button>
        </div>
      </form>
    </div>
  );
}