'use client';

import { useEffect, useState } from 'react';
import { collection, getDocs } from 'firebase/firestore';
import { getAuth } from 'firebase/auth';
import { db } from '@/lib/firebase';
import { FileText, Loader2, Sparkles } from 'lucide-react';
import Header from '@/components/Header';
import { useAuth } from '@/hooks/useAuth';

type SDR = { id: string; name: string };

export default function RelatoriosPage() {
  const { user, role } = useAuth();
  const [sdrs, setSdrs] = useState<SDR[]>([]);
  const [selectedSdr, setSelectedSdr] = useState('');
  const [selectedMonth, setSelectedMonth] = useState('');
  const [report, setReport] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    getDocs(collection(db, 'users')).then((snap) => {
      const list: SDR[] = [];
      snap.forEach((d) => {
        const data = d.data();
        if (data.role === 'SDR') list.push({ id: d.id, name: data.name || data.email || d.id });
      });
      setSdrs(list);
    });
  }, []);

  async function handleGenerate() {
    if (!selectedSdr || !selectedMonth) return;
    setLoading(true);
    setReport('');
    try {
      const auth = getAuth();
      const token = await auth.currentUser?.getIdToken();
      const res = await fetch('/api/ai-report', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ sdrId: selectedSdr, month: selectedMonth }),
      });
      if (!res.ok) throw new Error('Erro ao gerar relatório');
      const data = await res.json();
      setReport(data.report);
    } catch (err) {
      console.error(err);
      alert('Erro ao gerar relatório com IA');
    } finally {
      setLoading(false);
    }
  }

  if (!user) return null;

  return (
    <main className="flex-1 overflow-y-auto bg-slate-50">
      <Header email={user.email || ''} />

      <section className="p-6 lg:p-8 space-y-6 page-enter">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Relatórios com IA</h1>
          <p className="text-slate-500 text-sm mt-0.5">Gere análises automáticas de performance por SDR</p>
        </div>

        {/* Controls */}
        <div className="bg-white rounded-2xl border border-slate-100 shadow-card p-6">
          <h2 className="font-semibold text-slate-700 mb-4">Configurar relatório</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wide mb-1.5">SDR</label>
              <select
                value={selectedSdr}
                onChange={(e) => setSelectedSdr(e.target.value)}
                className="w-full border border-slate-200 rounded-xl px-3.5 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#0B1F33]/10 focus:border-[#0B1F33]/30"
              >
                <option value="">Selecione um SDR</option>
                {sdrs.map((sdr) => (
                  <option key={sdr.id} value={sdr.id}>{sdr.name}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wide mb-1.5">Mês</label>
              <input
                type="month"
                value={selectedMonth}
                onChange={(e) => setSelectedMonth(e.target.value)}
                className="w-full border border-slate-200 rounded-xl px-3.5 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#0B1F33]/10 focus:border-[#0B1F33]/30"
              />
            </div>
            <div className="flex items-end">
              <button
                onClick={handleGenerate}
                disabled={loading || !selectedSdr || !selectedMonth}
                className="w-full flex items-center justify-center gap-2 bg-[#0B1F33] hover:bg-[#0e2a45] text-white text-sm font-semibold py-2.5 rounded-xl transition-colors disabled:opacity-50"
              >
                {loading ? (
                  <><Loader2 size={15} className="animate-spin" /> Gerando...</>
                ) : (
                  <><Sparkles size={15} /> Gerar com IA</>
                )}
              </button>
            </div>
          </div>
        </div>

        {/* Result */}
        <div className="bg-white rounded-2xl border border-slate-100 shadow-card overflow-hidden">
          <div className="flex items-center gap-2.5 px-6 py-4 border-b border-slate-100">
            <FileText size={16} className="text-slate-400" />
            <h2 className="font-semibold text-slate-700 text-sm">Resultado</h2>
          </div>
          <div className="p-6 min-h-[240px]">
            {loading && (
              <div className="flex flex-col items-center justify-center py-12 gap-3">
                <Loader2 size={28} className="animate-spin text-[#0B1F33]/30" />
                <p className="text-slate-400 text-sm">Analisando dados e gerando relatório...</p>
              </div>
            )}
            {!loading && !report && (
              <div className="flex flex-col items-center justify-center py-12 gap-3 text-center">
                <div className="w-14 h-14 bg-slate-100 rounded-2xl flex items-center justify-center">
                  <Sparkles size={22} className="text-slate-400" />
                </div>
                <p className="text-slate-500 text-sm font-medium">Relatório aparecerá aqui</p>
                <p className="text-slate-400 text-xs max-w-xs">Selecione um SDR e um mês, depois clique em "Gerar com IA"</p>
              </div>
            )}
            {!loading && report && (
              <div className="prose prose-sm max-w-none text-slate-700 whitespace-pre-wrap leading-relaxed">
                {report}
              </div>
            )}
          </div>
        </div>
      </section>
    </main>
  );
}
