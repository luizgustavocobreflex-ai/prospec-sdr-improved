'use client';

import { useEffect, useState } from 'react';
import { auth, db } from '@/lib/firebase';
import { collection, getDocs, query, where, doc, getDoc, Timestamp } from 'firebase/firestore';
import { Users, Phone, CheckCircle, Calendar, Filter } from 'lucide-react';

import Header from '@/components/Header';
import StatsCard from '@/components/StatsCard';
import LeadsChart from '@/components/LeadsChart';
import SdrRankingChart from '@/components/charts/SdrRankingChart';
import VendedoresRankingChart from '@/components/charts/VendedoresRankingChart';
import LeadsFunnelChart from '@/components/charts/LeadsFunnelChart';
import IntecConversionChart from '@/components/charts/IntecConversionChart';
import { useAuth } from '@/hooks/useAuth';

type SDR = { id: string; email: string };
type Metrics = { leads: number; qualificados: number; contatos: number; reunioes: number };

function ChartCard({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="bg-white rounded-2xl border border-slate-100 shadow-card p-6">
      <h3 className="text-sm font-semibold text-slate-700 mb-5">{title}</h3>
      {children}
    </div>
  );
}

export default function DashboardPage() {
  const { user, role } = useAuth();

  const [sdrs, setSdrs] = useState<SDR[]>([]);
  const [selectedSdr, setSelectedSdr] = useState<string>('ALL');
  const [metrics, setMetrics] = useState<Metrics>({ leads: 0, qualificados: 0, contatos: 0, reunioes: 0 });
  const [chartData, setChartData] = useState<{ day: string; total: number }[]>([]);
  const [goal, setGoal] = useState<number | null>(null);

  useEffect(() => {
    if (role !== 'ADMIN') return;
    getDocs(query(collection(db, 'users'), where('role', '==', 'SDR'))).then((snap) => {
      setSdrs(snap.docs.map((d) => ({ id: d.id, email: d.data().email || d.id })));
    });
  }, [role]);

  useEffect(() => {
    if (!user) return;
    const base = collection(db, 'leads');
    const q =
      role === 'ADMIN' && selectedSdr !== 'ALL'
        ? query(base, where('sdrId', '==', selectedSdr))
        : role === 'SDR'
        ? query(base, where('sdrId', '==', user.uid))
        : base;

    getDocs(q).then((snap) => {
      let leads = 0, qualificados = 0, contatos = 0, reunioes = 0;
      const dailyMap: Record<string, number> = {};
      snap.docs.forEach((d) => {
        const data = d.data();
        leads++;
        if (data.status === 'Qualificado') qualificados++;
        if (data.status === 'Contato Realizado') contatos++;
        if (data.status === 'Reunião') reunioes++;
        if (data.createdAt instanceof Timestamp) {
          const day = String(data.createdAt.toDate().getDate()).padStart(2, '0');
          dailyMap[day] = (dailyMap[day] || 0) + 1;
        }
      });
      setMetrics({ leads, qualificados, contatos, reunioes });
      setChartData(Object.keys(dailyMap).sort().map((day) => ({ day, total: dailyMap[day] })));
    });

    const month = new Date().toISOString().slice(0, 7);
    const uid = selectedSdr === 'ALL' ? user.uid : selectedSdr;
    getDoc(doc(db, 'goals', `${uid}_${month}`)).then((snap) => {
      setGoal(snap.exists() ? snap.data().target : null);
    });
  }, [user, role, selectedSdr]);

  if (!user) return null;

  const goalPct = goal && goal > 0 ? Math.min(100, Math.round((metrics.leads / goal) * 100)) : 0;

  return (
    <main className="flex-1 overflow-y-auto bg-slate-50">
      <Header email={user.email || ''} />

      <section className="p-6 lg:p-8 space-y-8 page-enter">
        {/* Page header */}
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-slate-800">Dashboard</h1>
            <p className="text-slate-500 text-sm mt-0.5">
              {new Date().toLocaleDateString('pt-BR', { weekday: 'long', day: 'numeric', month: 'long' })}
            </p>
          </div>
          {role === 'ADMIN' && (
            <div className="flex items-center gap-2 bg-white border border-slate-200 rounded-xl px-3 py-2 shadow-card">
              <Filter size={14} className="text-slate-400" />
              <select
                value={selectedSdr}
                onChange={(e) => setSelectedSdr(e.target.value)}
                className="text-sm text-slate-700 bg-transparent focus:outline-none pr-2"
              >
                <option value="ALL">Todos os SDRs</option>
                {sdrs.map((sdr) => (
                  <option key={sdr.id} value={sdr.id}>{sdr.email}</option>
                ))}
              </select>
            </div>
          )}
        </div>

        {/* Metric cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
          <StatsCard title="Total de Leads" value={metrics.leads} icon={Users} accent="blue" />
          <StatsCard title="Contatos Realizados" value={metrics.contatos} icon={Phone} accent="amber" />
          <StatsCard title="Qualificados" value={metrics.qualificados} icon={CheckCircle} accent="emerald" />
          <StatsCard title="Reuniões" value={metrics.reunioes} icon={Calendar} accent="rose" />
        </div>

        {/* Meta progress */}
        {goal !== null && (
          <div className="bg-white rounded-2xl border border-slate-100 shadow-card p-6">
            <div className="flex items-center justify-between mb-3">
              <div>
                <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide">Meta mensal de leads</p>
                <p className="text-2xl font-bold text-slate-800 mt-1">
                  {metrics.leads}
                  <span className="text-slate-400 font-normal text-lg"> / {goal}</span>
                </p>
              </div>
              <span
                className={[
                  'text-sm font-bold px-3 py-1.5 rounded-full',
                  goalPct >= 100
                    ? 'bg-emerald-100 text-emerald-700'
                    : goalPct >= 60
                    ? 'bg-amber-100 text-amber-700'
                    : 'bg-rose-100 text-rose-600',
                ].join(' ')}
              >
                {goalPct}% atingido
              </span>
            </div>
            <div className="w-full h-2.5 bg-slate-100 rounded-full overflow-hidden">
              <div
                className={[
                  'h-full rounded-full transition-all duration-700',
                  goalPct >= 100 ? 'bg-emerald-500' : goalPct >= 60 ? 'bg-amber-500' : 'bg-rose-500',
                ].join(' ')}
                style={{ width: `${goalPct}%` }}
              />
            </div>
          </div>
        )}

        {/* Chart: leads over time */}
        <ChartCard title="Leads ao longo do mês">
          <LeadsChart data={chartData} goal={goal} />
        </ChartCard>

        {/* Admin charts */}
        {role === 'ADMIN' && (
          <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
            <ChartCard title="SDRs com mais leads gerados">
              <SdrRankingChart />
            </ChartCard>
            <ChartCard title="Vendedores que mais recebem leads">
              <VendedoresRankingChart />
            </ChartCard>
          </div>
        )}

        <ChartCard title="Funil de Leads">
          <LeadsFunnelChart />
        </ChartCard>

        <ChartCard title="Conversão de cotações em fechamentos (INTEC)">
          <IntecConversionChart />
        </ChartCard>
      </section>
    </main>
  );
}
