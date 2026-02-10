'use client';

import { useState } from 'react';
import { useFirestoreCollection } from '@/lib/hooks';
import { addDoc, collection, doc, deleteDoc, updateDoc, Timestamp } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Package, Trash2, Edit, Save } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { useLanguage } from '@/components/language-provider';

interface Part {
  id: string;
  name: string;
  pn: string;
  cost: number;
  stock: number;
}

export default function InventoryPage() {
  const { t } = useLanguage();
  const { data: parts, loading } = useFirestoreCollection<Part>('inventory');
  const [editingId, setEditingId] = useState<string | null>(null);
  
  const { register, handleSubmit, reset, formState: { errors } } = useForm<Omit<Part, 'id'>>();

  const onAddPart = async (data: Omit<Part, 'id'>) => {
    try {
      await addDoc(collection(db, 'inventory'), {
        ...data,
        updatedAt: Timestamp.now(),
      });
      reset();
    } catch (err) {
      console.error("Error adding part:", err);
    }
  };

  const onDeletePart = async (id: string) => {
    if (confirm(t.common.delete + "?")) {
      await deleteDoc(doc(db, 'inventory', id));
    }
  };

  return (
    <div className="space-y-8 animate-fade-in">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-display text-white tracking-widest">{t.inventory.title}</h1>
          <p className="text-gray-400 font-tech text-sm mt-1">{t.inventory.subtitle}</p>
        </div>
      </div>

      {/* Add New Part Form */}
      <div className="card-panel rounded-lg border-l-4 border-l-brand-orange">
        <h3 className="text-white font-display text-xl mb-4 flex items-center gap-2">
          <Package className="w-5 h-5 text-brand-orange" /> {t.inventory.add_title}
        </h3>
        <form onSubmit={handleSubmit(onAddPart)} className="grid grid-cols-1 md:grid-cols-5 gap-4 items-end">
          <div className="md:col-span-2">
            <Input 
              label={t.inventory.name}
              placeholder="Brake Pads" 
              {...register('name', { required: true })} 
              fullWidth 
            />
          </div>
          <div>
            <Input 
              label={t.inventory.pn}
              placeholder="BP-1234" 
              {...register('pn', { required: true })} 
              fullWidth 
            />
          </div>
          <div>
             <Input 
              label={t.inventory.cost}
              type="number" 
              step="0.01" 
              {...register('cost', { required: true, valueAsNumber: true })} 
              fullWidth 
            />
          </div>
          <div>
             <Input 
              label={t.inventory.stock}
              type="number" 
              {...register('stock', { required: true, valueAsNumber: true })} 
              fullWidth 
            />
          </div>
          <div className="md:col-span-5 flex justify-end">
            <Button type="submit" variant="secondary" size="sm">
              <Save className="w-4 h-4 mr-2" /> {t.inventory.submit}
            </Button>
          </div>
        </form>
      </div>

      {/* Inventory List */}
      <div className="card-panel rounded-lg">
        {loading ? (
          <div className="text-center py-12 text-gray-500 font-tech animate-pulse">{t.common.loading}</div>
        ) : parts.length === 0 ? (
          <div className="text-center py-12 text-gray-500 font-tech">
            {t.inventory.empty}
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left font-tech text-sm text-gray-400">
              <thead className="bg-brand-dark text-xs uppercase text-gray-500 border-b border-brand-border">
                <tr>
                  <th className="px-4 py-3">{t.inventory.name}</th>
                  <th className="px-4 py-3">{t.inventory.pn}</th>
                  <th className="px-4 py-3 text-right">{t.inventory.cost}</th>
                  <th className="px-4 py-3 text-right">{t.inventory.stock}</th>
                  <th className="px-4 py-3 text-right">{t.common.actions}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-brand-border/50">
                {parts.map((part) => (
                  <tr key={part.id} className="hover:bg-brand-dark/50 transition-colors group">
                    <td className="px-4 py-3 text-white font-bold">{part.name}</td>
                    <td className="px-4 py-3 font-mono text-xs">{part.pn}</td>
                    <td className="px-4 py-3 text-right">€ {part.cost?.toFixed(2)}</td>
                    <td className={`px-4 py-3 text-right font-bold ${part.stock < 5 ? 'text-red-500' : 'text-green-500'}`}>
                      {part.stock}
                    </td>
                    <td className="px-4 py-3 text-right">
                      <button 
                        onClick={() => onDeletePart(part.id)}
                        className="text-gray-500 hover:text-red-500 transition-colors"
                        title={t.common.delete}
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </td>
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