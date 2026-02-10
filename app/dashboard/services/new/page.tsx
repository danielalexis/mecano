'use client';

import { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { collection, addDoc, Timestamp, doc, getDoc, getDocs, query, orderBy } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { useForm, useFieldArray } from 'react-hook-form';
import { Trash2, Plus, Save, Upload, Image as ImageIcon } from 'lucide-react';
import { useLanguage } from '@/components/language-provider';

interface PartItem {
  name: string;
  pn: string;
  cost: number;
  quantity: number;
}

interface ServiceForm {
  vehicleId: string;
  description: string;
  customerStates: string;
  techReport: string;
  date: string;
  parts: PartItem[];
  laborHours: number;
  laborRate: number;
  vatRate: number;
  partsMargin: number;
  status: 'draft' | 'pending_approval' | 'approved' | 'in_progress' | 'pending_pickup' | 'completed';
}

interface Vehicle {
  id: string;
  plate: string;
  brand: string;
  model: string;
}

async function uploadFileToR2(file: File): Promise<string> {
  const res = await fetch('/api/upload', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ filename: file.name, contentType: file.type }),
  });

  if (!res.ok) throw new Error('Failed to get upload URL');
  const { uploadUrl, fileKey } = await res.json();

  const uploadRes = await fetch(uploadUrl, {
    method: 'PUT',
    body: file,
    headers: { 'Content-Type': file.type },
  });

  if (!uploadRes.ok) throw new Error('Failed to upload file to R2');

  return fileKey;
}

function ServiceFormContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const vehicleIdParam = searchParams.get('vehicleId');
  const { t } = useLanguage();
  
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [loadingVehicles, setLoadingVehicles] = useState(true);
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [uploading, setUploading] = useState(false);

  const { register, control, handleSubmit, watch, setValue, formState: { isSubmitting } } = useForm<ServiceForm>({
    defaultValues: {
      vehicleId: vehicleIdParam || '',
      description: '',
      customerStates: '',
      techReport: '',
      date: new Date().toISOString().split('T')[0],
      parts: [{ name: '', pn: '', cost: 0, quantity: 1 }],
      laborHours: 1,
      laborRate: 45,
      vatRate: 23,
      partsMargin: 0,
      status: 'draft',
    }
  });

  const { fields, append, remove } = useFieldArray({
    control,
    name: "parts"
  });

  const parts = watch('parts');
  const laborHours = watch('laborHours');
  const laborRate = watch('laborRate');
  const vatRate = watch('vatRate');
  const partsMargin = watch('partsMargin');

  useEffect(() => {
    const fetchVehicles = async () => {
      try {
        const q = query(collection(db, 'vehicles'), orderBy('plate'));
        const querySnapshot = await getDocs(q);
        const fetchedVehicles = querySnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        })) as Vehicle[];
        setVehicles(fetchedVehicles);
      } catch (error) {
        console.error("Error fetching vehicles:", error);
      } finally {
        setLoadingVehicles(false);
      }
    };
    fetchVehicles();
  }, []);

  useEffect(() => {
    if (vehicleIdParam) {
      setValue('vehicleId', vehicleIdParam);
    }
  }, [vehicleIdParam, setValue]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      setSelectedFiles(Array.from(e.target.files));
    }
  };

  const partsBaseTotal = parts.reduce((acc, part) => acc + (Number(part.cost) * Number(part.quantity)), 0);
  const partsTotal = partsBaseTotal * (1 + (Number(partsMargin || 0) / 100));
  const laborTotal = Number(laborHours) * Number(laborRate);
  const subtotal = partsTotal + laborTotal;
  const vatAmount = subtotal * (Number(vatRate) / 100);
  const grandTotal = subtotal + vatAmount;

  const onSubmit = async (data: ServiceForm) => {
    if (!data.vehicleId) {
      alert("Please select a vehicle.");
      return;
    }

    try {
      setUploading(true);
      const imageUrls: string[] = [];

      for (const file of selectedFiles) {
        try {
          const url = await uploadFileToR2(file);
          imageUrls.push(url);
        } catch (err) {
          console.error(`Failed to upload ${file.name}:`, err);
          alert(`Failed to upload ${file.name}. Continuing without it.`);
        }
      }

      await addDoc(collection(db, 'services'), {
        ...data,
        date: Timestamp.fromDate(new Date(data.date)),
        subtotal,
        vatAmount,
        total: grandTotal,
        imageUrls, 
        createdAt: Timestamp.now(),
      });
      
      router.push(`/dashboard/vehicles/${data.vehicleId}`);
    } catch (e) {
      console.error("Error adding service: ", e);
      alert("Failed to save service record.");
    } finally {
      setUploading(false);
    }
  };

  return (
    <>
      <div className="mb-8 border-b border-brand-border pb-4 flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-display text-white tracking-widest">{t.services.form.create_title}</h1>
          <p className="text-gray-400 font-tech text-sm mt-1">{t.services.form.create_subtitle}</p>
        </div>
        <div className="text-right">
            <div className="text-xs font-tech text-gray-500 uppercase tracking-widest">{t.services.form.job_id}</div>
            <div className="text-xl font-display text-brand-orange">{t.services.form.auto_gen}</div>
        </div>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
        
        {/* Basic Info & Vehicle Selection */}
        <div className="bg-brand-surface border border-brand-border p-6 rounded relative overflow-hidden">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="md:col-span-2">
              <label className="block mb-1 text-xs font-display text-gray-500 uppercase tracking-widest ml-1">
                {t.services.form.vehicle_selection}
              </label>
              {loadingVehicles ? (
                <div className="animate-pulse h-12 bg-brand-dark/50 rounded border border-brand-border" />
              ) : (
                <div className="relative">
                  <select 
                    {...register('vehicleId', { required: 'Vehicle is required' })}
                    className="w-full px-4 py-3 bg-brand-surface border border-brand-border text-gray-300 font-tech focus:outline-none focus:border-brand-orange focus:ring-1 focus:ring-brand-orange appearance-none transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    style={{ clipPath: 'polygon(0 0, 100% 0, 100% calc(100% - 8px), calc(100% - 8px) 100%, 0 100%)' }}
                  >
                    <option value="">{t.services.form.select_vehicle}</option>
                    {vehicles.map(v => (
                      <option key={v.id} value={v.id}>
                        {v.plate} - {v.brand} {v.model}
                      </option>
                    ))}
                  </select>
                  <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-gray-500">▼</div>
                   {/* Corner Accent */}
                  <div className="absolute bottom-0 right-0 w-2 h-2 bg-brand-border pointer-events-none" style={{ clipPath: 'polygon(100% 0, 0 100%, 100% 100%)' }} />
                </div>
              )}
            </div>

            <Input 
              label={t.services.form.description}
              placeholder="Full Diagnostic Check" 
              {...register('description', { required: 'Description is required' })}
              fullWidth
              className="md:col-span-2"
            />

            <div className="md:col-span-2">
              <label className="block mb-1 text-xs font-display text-gray-500 uppercase tracking-widest ml-1">
                {t.services.form.customer_states}
              </label>
              <textarea 
                {...register('customerStates')}
                placeholder="Client reports..."
                className="w-full px-4 py-3 bg-brand-surface border border-brand-border text-gray-300 font-tech focus:outline-none focus:border-brand-orange focus:ring-1 focus:ring-brand-orange h-24 resize-none"
                style={{ clipPath: 'polygon(0 0, 100% 0, 100% calc(100% - 8px), calc(100% - 8px) 100%, 0 100%)' }}
              />
            </div>

            <div className="md:col-span-2">
              <label className="block mb-1 text-xs font-display text-gray-500 uppercase tracking-widest ml-1">
                {t.services.form.tech_report}
              </label>
              <textarea 
                {...register('techReport')}
                placeholder="Findings..."
                className="w-full px-4 py-3 bg-brand-surface border border-brand-border text-gray-300 font-tech focus:outline-none focus:border-brand-orange focus:ring-1 focus:ring-brand-orange h-32 resize-none"
                style={{ clipPath: 'polygon(0 0, 100% 0, 100% calc(100% - 8px), calc(100% - 8px) 100%, 0 100%)' }}
              />
            </div>
            
            <div className="md:col-span-1">
              <label className="block mb-1 text-xs font-display text-gray-500 uppercase tracking-widest ml-1">
                {t.services.form.status}
              </label>
              <div className="relative">
                <select 
                  {...register('status')}
                  className="w-full px-4 py-3 bg-brand-surface border border-brand-border text-gray-300 font-tech focus:outline-none focus:border-brand-orange focus:ring-1 focus:ring-brand-orange appearance-none"
                  style={{ clipPath: 'polygon(0 0, 100% 0, 100% calc(100% - 8px), calc(100% - 8px) 100%, 0 100%, 0 10px)' }}
                >
                  <option value="draft">{t.services.status.draft}</option>
                  <option value="pending_approval">{t.services.status.pending_approval}</option>
                  <option value="approved">{t.services.status.approved}</option>
                  <option value="in_progress">{t.services.status.in_progress}</option>
                  <option value="pending_pickup">{t.services.status.pending_pickup}</option>
                  <option value="completed">{t.services.status.completed}</option>
                </select>
                <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-gray-500">▼</div>
                 <div className="absolute bottom-0 right-0 w-2 h-2 bg-brand-border pointer-events-none" style={{ clipPath: 'polygon(100% 0, 0 100%, 100% 100%)' }} />
              </div>
            </div>

            <Input 
              label={t.services.form.date} 
              type="date"
              {...register('date', { required: 'Date is required' })}
              fullWidth
            />
             <Input 
              label={t.services.form.vat_rate} 
              type="number"
              {...register('vatRate')}
              fullWidth
            />
          </div>
        </div>

        {/* Photo Upload Section */}
        <div className="bg-brand-surface border border-brand-border p-6 rounded relative">
           <div className="flex justify-between items-center mb-4 border-b border-brand-border pb-2">
            <h3 className="text-white font-display text-xl flex items-center gap-2">
              <Upload className="w-5 h-5 text-blue-500" /> {t.services.form.photo_section}
            </h3>
          </div>
          <div className="border-2 border-dashed border-brand-border rounded-lg p-8 text-center hover:border-brand-orange transition-colors cursor-pointer relative group">
            <input 
              type="file" 
              multiple 
              accept="image/*,video/*" 
              onChange={handleFileChange}
              className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
            />
            <div className="flex flex-col items-center justify-center pointer-events-none">
              <ImageIcon className="w-10 h-10 text-gray-500 mb-2 group-hover:text-brand-orange transition-colors" />
              <p className="text-gray-400 font-tech text-sm">
                {selectedFiles.length > 0 
                  ? `${selectedFiles.length} file(s) selected` 
                  : t.services.form.upload_text
                }
              </p>
              <p className="text-xs text-gray-600 mt-1">{t.services.form.upload_sub}</p>
            </div>
          </div>
        </div>

        {/* Parts Section */}
        <div className="bg-brand-surface border border-brand-border p-6 rounded relative">
          <div className="flex justify-between items-center mb-4 border-b border-brand-border pb-2">
            <h3 className="text-white font-display text-xl flex items-center gap-2">
              <span className="bg-brand-orange text-black px-2 rounded text-sm">01</span> {t.services.form.parts_section}
            </h3>
            <div className="flex gap-4">
               <div className="w-32">
                <Input 
                  label={t.services.form.parts_margin} 
                  type="number" 
                  {...register('partsMargin', { valueAsNumber: true })} 
                  fullWidth 
                  className="py-1 text-sm"
                />
              </div>
              <Button type="button" size="sm" onClick={() => append({ name: '', pn: '', cost: 0, quantity: 1 })} variant="secondary">
                <Plus className="w-4 h-4 mr-1" /> {t.services.form.add_row}
              </Button>
            </div>
          </div>

          <div className="space-y-4">
            {fields.map((field, index) => (
              <div key={field.id} className="grid grid-cols-12 gap-2 items-end bg-brand-dark/30 p-2 rounded border border-brand-border/50">
                <div className="col-span-4 md:col-span-5">
                   <Input label={index === 0 ? t.services.form.part_name : ""} placeholder="Part Name" {...register(`parts.${index}.name` as const, { required: true })} fullWidth />
                </div>
                <div className="col-span-3 md:col-span-3">
                   <Input label={index === 0 ? t.services.form.pn : ""} placeholder="P/N" {...register(`parts.${index}.pn` as const)} fullWidth />
                </div>
                <div className="col-span-2 md:col-span-1">
                   <Input label={index === 0 ? t.services.form.qty : ""} type="number" {...register(`parts.${index}.quantity` as const, { valueAsNumber: true })} fullWidth />
                </div>
                <div className="col-span-2 md:col-span-2">
                   <Input label={index === 0 ? t.services.form.cost : ""} type="number" step="0.01" {...register(`parts.${index}.cost` as const, { valueAsNumber: true })} fullWidth />
                </div>
                <div className="col-span-1 flex justify-center pb-3">
                  <button type="button" onClick={() => remove(index)} className="text-red-500 hover:text-red-400">
                    <Trash2 className="w-5 h-5" />
                  </button>
                </div>
              </div>
            ))}
          </div>
          <div className="mt-4 text-right font-tech text-gray-400 text-sm">
            {t.services.form.parts_subtotal.replace('{margin}', (partsMargin || 0).toString())} <span className="text-white font-bold">€ {partsTotal.toFixed(2)}</span>
          </div>
        </div>

        {/* Labor Section */}
        <div className="bg-brand-surface border border-brand-border p-6 rounded relative">
           <div className="flex justify-between items-center mb-4 border-b border-brand-border pb-2">
            <h3 className="text-white font-display text-xl flex items-center gap-2">
              <span className="bg-brand-yellow text-black px-2 rounded text-sm">02</span> {t.services.form.labor_section}
            </h3>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Input 
              label={t.services.form.hours} 
              type="number" 
              step="0.5"
              {...register('laborHours', { valueAsNumber: true })}
              fullWidth
            />
            <Input 
              label={t.services.form.rate} 
              type="number" 
              {...register('laborRate', { valueAsNumber: true })}
              fullWidth
            />
          </div>
           <div className="mt-4 text-right font-tech text-gray-400 text-sm">
            {t.services.form.labor_subtotal} <span className="text-white font-bold">€ {laborTotal.toFixed(2)}</span>
          </div>
        </div>

        {/* Totals Summary */}
        <div className="fixed bottom-0 left-0 right-0 md:left-64 bg-brand-dark border-t-2 border-brand-orange p-4 shadow-2xl z-40">
           <div className="max-w-4xl mx-auto flex flex-col md:flex-row justify-between items-center gap-4">
              <div className="flex gap-8 text-sm font-tech">
                <div>
                  <div className="text-gray-500 uppercase tracking-widest text-xs">{t.common.subtotal}</div>
                  <div className="text-white text-xl">€ {subtotal.toFixed(2)}</div>
                </div>
                <div>
                  <div className="text-gray-500 uppercase tracking-widest text-xs">{t.common.vat} ({vatRate}%)</div>
                  <div className="text-gray-300 text-xl">€ {vatAmount.toFixed(2)}</div>
                </div>
                 <div>
                  <div className="text-brand-orange uppercase tracking-widest text-xs font-bold">{t.services.form.total_payable}</div>
                  <div className="text-brand-orange text-3xl font-display font-bold">€ {grandTotal.toFixed(2)}</div>
                </div>
              </div>

              <div className="flex gap-4 w-full md:w-auto">
                 <Button type="button" variant="ghost" onClick={() => router.back()}>
                  {t.common.discard}
                </Button>
                <Button type="submit" variant="primary" disabled={isSubmitting || uploading} className="flex-1 md:flex-none">
                  <Save className="w-5 h-5 mr-2" /> 
                  {uploading ? t.common.upload : isSubmitting ? t.common.saving : t.common.save}
                </Button>
              </div>
           </div>
        </div>

      </form>
    </>
  );
}

export default function NewServicePage() {
  const { t } = useLanguage();
  return (
    <div className="max-w-4xl mx-auto animate-fade-in pb-20">
      <Suspense fallback={<div className="text-center py-10 font-tech animate-pulse">{t.common.loading}</div>}>
        <ServiceFormContent />
      </Suspense>
    </div>
  );
}
