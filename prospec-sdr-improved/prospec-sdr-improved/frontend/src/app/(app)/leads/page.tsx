'use client';

import { useEffect, useState } from 'react';
import { db } from '@/lib/firebase';
import {
  collection, getDocs, query, where, updateDoc, doc, Timestamp,
} from 'firebase/firestore';
import { Plus, Search, ChevronLeft, ChevronRight } from 'lucide-react';

import Header from '@/components/Header';
import NewLeadModal from '@/components/NewLeadModal';
import { useAuth } from '@/hooks/useAuth';

type Lead = {
  id: string;
  nomeComprador: string;
  email: string;
  telefone: string;
  vendedor: string;
  status: string;
  createdAt?: Timestamp;
  sdrId: string;
};

const STATUS_STYLES: Record<string, string> = {
  'Novo':              'bg-slate-100 text-slate-600',
  'Contato Realizado': 'bg-blue-100 text-blue-700',
  'Qualificado':       'bg-amber-100 text-amber-700',
  'Reunião':           'bg-emerald-100 text-emerald-700',
};

const PAGE_SIZE = 20;

export default function LeadsPage() {
  const { user, role } = useAuth();

  const [leads, setLeads] = useState<Lead[]>([]);
  const [filtered, setFiltered] = useState<Lead[]>([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [page, setPage] = useState(0);

  async function loadLeads() {
    if (!user) return;
    setLoading(true);
    try {
      const base = collection(db, 'leads');
      const q = role === 'ADMIN' ? base : query(base, where('sdrId', '==', user.uid));
      const snap = await getDocs(q);
      const data = snap.docs.map((d) => ({ id: d.id, ...(d.data() as Omit<Lead, 'id'>) }));
      setLeads(data);
      setFiltered(data);
    } catch (err) {
      console.error('Erro ao carregar leads:', err);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    if (user) loadLeads();
  }, [user, role]);

  // Filter
  useEffect(() => {
    const q = search.toLowerCase();
    setFiltered(
      q
        ? leads.filter(
            (l) =>
              l.nomeComprador?.toLowerCase().includes(q) ||
              l.email?.toLowerCase().includes(q) ||
              l.vendedor?.toLowerCase().includes(q)
          )
        : leads
    );
    setPage(0);
  }, [search, leads]);

  async function updateStatus(leadId: string, newStatus: string) {
    try {
      await updateDoc(doc(db, 'leads', leadId), { status: newStatus, updatedAt: new Date() });
      setLeads((prev) => prev.map((l) => (l.id === leadId ? { ...l, status: newStatus } : l)));
    } catch {
      alert('Erro ao atualizar status');
    }
  }

  const totalPages = Math.ceil(filtered.length / PAGE_SIZE);
  const paginated = filtered.slice(page * PAGE_SIZE, (page + 1) * PAGE_SIZE);

  if (!user) return null;

  return (
    <main className="flex-1 overflow-y-auto bg-slate-50">
      <Header email={user.email || ''} />

      <section className="p-6 lg:p-8 space-y-6 page-enter">
        {/* Header row */}
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-slate-800">Leads</h1>
            <p className="text-slate-500 text-sm mt-0.5">{filtered.length} registros</p>
          </div>
          <button
            onClick={() => setShowModal(true)}
            className="flex items-center gap-2 bg-[#0B1F33] hover:bg-[#0e2a45] text-white text-sm font-semibold px-4 py-2.5 rounded-xl transition-colors shadow-lg shadow-[#0B1F33]/20"
          >
            <Plus size={16} />
            Novo Lead
          </button>
        </div>

        {/* Search */}
        <div className="relative max-w-sm">
          <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Buscar por nome, e-mail, vendedor..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 text-sm bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#0B1F33]/10 focus:border-[#0B1F33]/30 transition-all"
          />
        </div>

        {/* Table */}
        <div className="bg-white rounded-2xl border border-slate-100 shadow-card overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full text-sm">
              <thead>
                <tr className="border-b border-slate-100 bg-slate-50/70">
                  {['Comprador', 'E-mail', 'Telefone', 'Vendedor', 'Status', 'Criado em'].map((h) => (
                    <th key={h} className="px-5 py-3.5 text-left text-xs font-semibold text-slate-500 uppercase tracking-wide whitespace-nowrap">
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {loading && (
                  [...Array(6)].map((_, i) => (
                    <tr key={i} className="border-t border-slate-50">
                      {[...Array(6)].map((_, j) => (
                        <td key={j} className="px-5 py-4">
                          <div className="h-4 rounded shimmer" style={{ width: `${60 + j * 8}%` }} />
                        </td>
                      ))}
                    </tr>
                  ))
                )}

                {!loading && paginated.length === 0 && (
                  <tr>
                    <td colSpan={6} className="px-5 py-12 text-center text-slate-400">
                      Nenhum lead encontrado.
                    </td>
                  </tr>
                )}

                {!loading && paginated.map((lead) => (
                  <tr key={lead.id} className="border-t border-slate-50 hover:bg-slate-50/70 transition-colors">
                    <td className="px-5 py-3.5 font-medium text-slate-800">{lead.nomeComprador}</td>
                    <td className="px-5 py-3.5 text-slate-500">{lead.email}</td>
                    <td className="px-5 py-3.5 text-slate-500">{lead.telefone || '—'}</td>
                    <td className="px-5 py-3.5 text-slate-500">{lead.vendedor || '—'}</td>
                    <td className="px-5 py-3.5">
                      <select
                        value={lead.status}
                        onChange={(e) => updateStatus(lead.id, e.target.value)}
                        className={[
                          'text-xs font-semibold rounded-lg px-2.5 py-1.5 border-0 cursor-pointer focus:outline-none focus:ring-2 focus:ring-[#0B1F33]/10',
                          STATUS_STYLES[lead.status] || 'bg-slate-100 text-slate-600',
                        ].join(' ')}
                      >
                        {Object.keys(STATUS_STYLES).map((s) => (
                          <option key={s} value={s}>{s}</option>
                        ))}
                      </select>
                    </td>
                    <td className="px-5 py-3.5 text-slate-400 text-xs">
                      {lead.createdAt instanceof Timestamp
                        ? lead.createdAt.toDate().toLocaleDateString('pt-BR')
                        : '—'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-between px-5 py-3.5 border-t border-slate-100 bg-slate-50/50">
              <p className="text-xs text-slate-500">
                Página {page + 1} de {totalPages}
              </p>
              <div className="flex gap-1">
                <button
                  onClick={() => setPage((p) => Math.max(0, p - 1))}
                  disabled={page === 0}
                  className="w-8 h-8 flex items-center justify-center rounded-lg text-slate-500 hover:bg-white hover:shadow-card disabled:opacity-30 transition-all"
                >
                  <ChevronLeft size={14} />
                </button>
                <button
                  onClick={() => setPage((p) => Math.min(totalPages - 1, p + 1))}
                  disabled={page >= totalPages - 1}
                  className="w-8 h-8 flex items-center justify-center rounded-lg text-slate-500 hover:bg-white hover:shadow-card disabled:opacity-30 transition-all"
                >
                  <ChevronRight size={14} />
                </button>
              </div>
            </div>
          )}
        </div>
      </section>

      {showModal && (
        <NewLeadModal
          onClose={() => {
            setShowModal(false);
            loadLeads();
          }}
        />
      )}
    </main>
  );
}
