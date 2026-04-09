'use client';

import { useEffect, useState } from 'react';
import { collection, getDocs, orderBy, query } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { Plus, TrendingUp, TrendingDown, Minus } from 'lucide-react';
import NewIntecModal from '@/components/NewIntecModal';
import Header from '@/components/Header';
import { useAuth } from '@/hooks/useAuth';

type IntecRecord = {
  id: string;
  tipo: string;
  razaoSocial: string;
  cnpj: string;
  valor: number;
  status: string;
  sdrEmail: string;
  createdAt: any;
};

const STATUS_CONFIG: Record<string, { label: string; cls: string; icon: React.ElementType }> = {
  aberto:  { label: 'Aberto',  cls: 'bg-amber-100 text-amber-700',    icon: Minus },
  ganho:   { label: 'Ganho',   cls: 'bg-emerald-100 text-emerald-700', icon: TrendingUp },
  perdido: { label: 'Perdido', cls: 'bg-rose-100 text-rose-600',       icon: TrendingDown },
};

export default function IntecPage() {
  const { user } = useAuth();
  const [records, setRecords] = useState<IntecRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [openModal, setOpenModal] = useState(false);

  async function fetchIntec() {
    setLoading(true);
    try {
      const snap = await getDocs(query(collection(db, 'intec'), orderBy('createdAt', 'desc')));
      setRecords(snap.docs.map((d) => ({ id: d.id, ...(d.data() as Omit<IntecRecord, 'id'>) })));
    } catch (err) {
      console.error('Erro ao buscar INTEC:', err);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { fetchIntec(); }, []);

  // Totais rápidos
  const totalValor = records.reduce((sum, r) => sum + (r.valor || 0), 0);
  const totalGanho = records.filter((r) => r.status === 'ganho').reduce((sum, r) => sum + (r.valor || 0), 0);
  const totalAberto = records.filter((r) => r.status === 'aberto').length;

  if (!user) return null;

  return (
    <main className="flex-1 overflow-y-auto bg-slate-50">
      <Header email={user.email || ''} />

      <section className="p-6 lg:p-8 space-y-6 page-enter">
        {/* Header */}
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-slate-800">INTEC</h1>
            <p className="text-slate-500 text-sm mt-0.5">Cotações e fechamentos</p>
          </div>
          <button
            onClick={() => setOpenModal(true)}
            className="flex items-center gap-2 bg-[#0B1F33] hover:bg-[#0e2a45] text-white text-sm font-semibold px-4 py-2.5 rounded-xl transition-colors shadow-lg shadow-[#0B1F33]/20"
          >
            <Plus size={16} /> Novo Registro
          </button>
        </div>

        {/* Summary cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="bg-white rounded-2xl border border-slate-100 shadow-card p-5">
            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide">Total em cotações</p>
            <p className="text-2xl font-bold text-slate-800 mt-2">
              R$ {totalValor.toLocaleString('pt-BR')}
            </p>
          </div>
          <div className="bg-white rounded-2xl border border-slate-100 shadow-card p-5">
            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide">Total ganho</p>
            <p className="text-2xl font-bold text-emerald-600 mt-2">
              R$ {totalGanho.toLocaleString('pt-BR')}
            </p>
          </div>
          <div className="bg-white rounded-2xl border border-slate-100 shadow-card p-5">
            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide">Em aberto</p>
            <p className="text-2xl font-bold text-amber-600 mt-2">{totalAberto}</p>
          </div>
        </div>

        {/* Table */}
        <div className="bg-white rounded-2xl border border-slate-100 shadow-card overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full text-sm">
              <thead>
                <tr className="border-b border-slate-100 bg-slate-50/70">
                  {['Tipo', 'Cliente', 'CNPJ', 'Valor', 'Status', 'SDR', 'Data'].map((h) => (
                    <th key={h} className="px-5 py-3.5 text-left text-xs font-semibold text-slate-500 uppercase tracking-wide whitespace-nowrap">
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {loading && (
                  [...Array(5)].map((_, i) => (
                    <tr key={i} className="border-t border-slate-50">
                      {[...Array(7)].map((_, j) => (
                        <td key={j} className="px-5 py-4">
                          <div className="h-4 rounded shimmer" style={{ width: '70%' }} />
                        </td>
                      ))}
                    </tr>
                  ))
                )}
                {!loading && records.length === 0 && (
                  <tr>
                    <td colSpan={7} className="px-5 py-12 text-center text-slate-400">
                      Nenhum registro encontrado.
                    </td>
                  </tr>
                )}
                {!loading && records.map((item) => {
                  const cfg = STATUS_CONFIG[item.status] || { label: item.status, cls: 'bg-slate-100 text-slate-600', icon: Minus };
                  const Icon = cfg.icon;
                  return (
                    <tr key={item.id} className="border-t border-slate-50 hover:bg-slate-50/70 transition-colors">
                      <td className="px-5 py-3.5 capitalize font-medium text-slate-700">{item.tipo}</td>
                      <td className="px-5 py-3.5 text-slate-800 font-medium">{item.razaoSocial}</td>
                      <td className="px-5 py-3.5 text-slate-400 text-xs font-mono">{item.cnpj}</td>
                      <td className="px-5 py-3.5 font-semibold text-slate-800">
                        R$ {item.valor.toLocaleString('pt-BR')}
                      </td>
                      <td className="px-5 py-3.5">
                        <span className={['inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold', cfg.cls].join(' ')}>
                          <Icon size={11} />
                          {cfg.label}
                        </span>
                      </td>
                      <td className="px-5 py-3.5 text-slate-500 text-xs">{item.sdrEmail}</td>
                      <td className="px-5 py-3.5 text-slate-400 text-xs">
                        {item.createdAt?.toDate ? item.createdAt.toDate().toLocaleDateString('pt-BR') : '—'}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      </section>

      {openModal && (
        <NewIntecModal onClose={() => setOpenModal(false)} onSaved={fetchIntec} />
      )}
    </main>
  );
}
