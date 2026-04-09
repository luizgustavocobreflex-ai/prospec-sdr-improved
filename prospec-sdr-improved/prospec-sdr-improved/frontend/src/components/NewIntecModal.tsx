'use client';

import { useState } from 'react';
import { addDoc, collection, serverTimestamp } from 'firebase/firestore';
import { auth, db } from '@/lib/firebase';
import { X } from 'lucide-react';

type Props = { onClose: () => void; onSaved: () => void };

export default function NewIntecModal({ onClose, onSaved }: Props) {
  const [form, setForm] = useState({
    tipo: 'cotacao', razaoSocial: '', cnpj: '', valor: '', status: 'aberto',
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
      await addDoc(collection(db, 'intec'), {
        tipo: form.tipo,
        razaoSocial: form.razaoSocial,
        cnpj: form.cnpj,
        valor: Number(form.valor),
        status: form.status,
        sdrId: user.uid,
        sdrEmail: user.email,
        createdAt: serverTimestamp(),
      });
      onSaved();
      onClose();
    } catch (err) {
      console.error('Erro ao salvar INTEC:', err);
      alert('Erro ao salvar registro');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white w-full max-w-lg rounded-2xl shadow-2xl">
        <div className="flex items-center justify-between px-6 py-5 border-b border-slate-100">
          <h2 className="font-bold text-slate-800 text-lg">Novo Registro INTEC</h2>
          <button onClick={onClose} className="w-8 h-8 flex items-center justify-center rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors">
            <X size={16} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <Field label="Tipo">
            <select className={inputCls} value={form.tipo} onChange={(e) => set('tipo', e.target.value)}>
              <option value="cotacao">Cotação</option>
              <option value="fechamento">Fechamento</option>
            </select>
          </Field>

          <Field label="Razão Social">
            <input className={inputCls} value={form.razaoSocial} onChange={(e) => set('razaoSocial', e.target.value)} required placeholder="Empresa Ltda" />
          </Field>

          <Field label="CNPJ">
            <input className={inputCls} value={form.cnpj} onChange={(e) => set('cnpj', e.target.value)} placeholder="00.000.000/0000-00" />
          </Field>

          <Field label="Valor (R$)">
            <div className="relative">
              <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 text-sm font-medium">R$</span>
              <input type="number" className={inputCls + ' pl-9'} value={form.valor} onChange={(e) => set('valor', e.target.value)} required placeholder="0,00" />
            </div>
          </Field>

          <Field label="Status">
            <select className={inputCls} value={form.status} onChange={(e) => set('status', e.target.value)}>
              <option value="aberto">Aberto</option>
              <option value="ganho">Ganho</option>
              <option value="perdido">Perdido</option>
            </select>
          </Field>

          <div className="flex justify-end gap-3 pt-2">
            <button type="button" onClick={onClose} disabled={loading}
              className="px-4 py-2.5 rounded-xl text-sm font-medium text-slate-600 hover:bg-slate-100 transition-colors disabled:opacity-50">
              Cancelar
            </button>
            <button type="submit" disabled={loading}
              className="px-5 py-2.5 rounded-xl text-sm font-semibold bg-[#0B1F33] hover:bg-[#0e2a45] text-white transition-colors disabled:opacity-50">
              {loading ? 'Salvando...' : 'Salvar'}
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
