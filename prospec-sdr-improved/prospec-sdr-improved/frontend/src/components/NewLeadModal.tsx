'use client';

import { useState } from 'react';
import { addDoc, collection, Timestamp, serverTimestamp } from 'firebase/firestore';
import { auth, db } from '@/lib/firebase';
import { X } from 'lucide-react';

type Props = { onClose: () => void };

const CANAIS = ['LinkedIn', 'Email', 'Telefone', 'WhatsApp'];

export default function NewLeadModal({ onClose }: Props) {
  const [form, setForm] = useState({
    nomeComprador: '', email: '', telefone: '',
    cnpj: '', razaoSocial: '', canal: 'LinkedIn', vendedor: '', entryDate: '',
  });
  const [loading, setLoading] = useState(false);

  function set(key: string, value: string) {
    setForm((prev) => ({ ...prev, [key]: value }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const user = auth.currentUser;
    if (!user) return;
    setLoading(true);
    try {
      await addDoc(collection(db, 'leads'), {
        nomeComprador: form.nomeComprador,
        email: form.email,
        telefone: form.telefone,
        cnpj: form.cnpj,
        razaoSocial: form.razaoSocial,
        canal: form.canal,
        status: 'Novo',
        vendedor: form.vendedor,
        sdrId: user.uid,
        sdrEmail: user.email,
        createdAt: form.entryDate
          ? Timestamp.fromDate(new Date(form.entryDate))
          : serverTimestamp(),
      });
      onClose();
    } catch (err) {
      console.error('Erro ao salvar lead:', err);
      alert('Erro ao salvar lead');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white w-full max-w-2xl rounded-2xl shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-5 border-b border-slate-100">
          <h2 className="font-bold text-slate-800 text-lg">Novo Lead</h2>
          <button
            onClick={onClose}
            className="w-8 h-8 flex items-center justify-center rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors"
          >
            <X size={16} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-5">
          {/* Nome */}
          <Field label="Nome do comprador">
            <input className={inputCls} value={form.nomeComprador} onChange={(e) => set('nomeComprador', e.target.value)} required placeholder="João Silva" />
          </Field>

          {/* Contato */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Field label="E-mail">
              <input type="email" className={inputCls} value={form.email} onChange={(e) => set('email', e.target.value)} required placeholder="joao@empresa.com" />
            </Field>
            <Field label="Telefone">
              <input className={inputCls} value={form.telefone} onChange={(e) => set('telefone', e.target.value)} placeholder="(11) 99999-9999" />
            </Field>
          </div>

          {/* Empresa */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Field label="CNPJ">
              <input className={inputCls} value={form.cnpj} onChange={(e) => set('cnpj', e.target.value)} placeholder="00.000.000/0000-00" />
            </Field>
            <Field label="Razão Social">
              <input className={inputCls} value={form.razaoSocial} onChange={(e) => set('razaoSocial', e.target.value)} placeholder="Empresa Ltda" />
            </Field>
          </div>

          {/* Processo */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Field label="Canal de aquisição">
              <select className={inputCls} value={form.canal} onChange={(e) => set('canal', e.target.value)}>
                {CANAIS.map((c) => <option key={c}>{c}</option>)}
              </select>
            </Field>
            <Field label="Vendedor responsável">
              <input className={inputCls} value={form.vendedor} onChange={(e) => set('vendedor', e.target.value)} placeholder="Nome do vendedor" />
            </Field>
          </div>

          {/* Data */}
          <Field label="Data de entrada do lead (opcional)">
            <input type="date" className={inputCls} value={form.entryDate} onChange={(e) => set('entryDate', e.target.value)} max={new Date().toISOString().split('T')[0]} />
          </Field>

          {/* Actions */}
          <div className="flex justify-end gap-3 pt-2">
            <button type="button" onClick={onClose} disabled={loading}
              className="px-4 py-2.5 rounded-xl text-sm font-medium text-slate-600 hover:bg-slate-100 transition-colors disabled:opacity-50">
              Cancelar
            </button>
            <button type="submit" disabled={loading}
              className="px-5 py-2.5 rounded-xl text-sm font-semibold bg-[#0B1F33] hover:bg-[#0e2a45] text-white transition-colors disabled:opacity-50">
              {loading ? 'Salvando...' : 'Salvar Lead'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

const inputCls = 'w-full border border-slate-200 rounded-xl px-3.5 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#0B1F33]/10 focus:border-[#0B1F33]/30 transition-all bg-white';

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wide mb-1.5">{label}</label>
      {children}
    </div>
  );
}
