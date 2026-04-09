'use client';

import { useEffect, useState } from 'react';
import { db } from '@/lib/firebase';
import { doc, onSnapshot, collection, query, where, getDocs, getDoc } from 'firebase/firestore';
import { getBusinessDays, getBusinessDaysPassed } from '@/utils/businessDays';

export default function TvMetaPage() {
  const month = new Date().toISOString().slice(0, 7);
  const [target, setTarget] = useState(0);
  const [totalSold, setTotalSold] = useState(0);
  const [remaining, setRemaining] = useState(0);
  const [dailyGoal, setDailyGoal] = useState(0);
  const [projection, setProjection] = useState(0);
  const [progress, setProgress] = useState(0);
  const [lastUpdate, setLastUpdate] = useState('');

  async function loadData() {
    const goalSnap = await getDoc(doc(db, 'sales_goals', month));
    if (!goalSnap.exists()) return;

    const meta = goalSnap.data().target || 0;
    const salesSnap = await getDocs(
      query(collection(db, 'daily_sales'), where('date', '>=', `${month}-01`), where('date', '<=', `${month}-31`))
    );

    let total = 0;
    salesSnap.forEach((d) => { total += d.data().amount || 0; });

    const businessDays = getBusinessDays(month);
    const passedDays = getBusinessDaysPassed(month);
    const remainingDays = Math.max(1, businessDays - passedDays);
    const falta = Math.max(0, meta - total);
    const media = total / passedDays;
    const proj = media * businessDays;

    setTarget(meta);
    setTotalSold(total);
    setRemaining(falta);
    setDailyGoal(falta / remainingDays);
    setProjection(proj);
    setProgress(meta > 0 ? Math.min(100, (total / meta) * 100) : 0);
    setLastUpdate(new Date().toLocaleTimeString('pt-BR'));
  }

  useEffect(() => {
    loadData();
    const unsub = onSnapshot(doc(db, 'sales_goals', month), () => loadData());
    const interval = setInterval(loadData, 5 * 60 * 1000);
    return () => { unsub(); clearInterval(interval); };
  }, [month]);

  const onTrack = projection >= target && target > 0;

  return (
    <div className="min-h-screen bg-[#0B1F33] text-white flex flex-col p-8 lg:p-14 relative overflow-hidden">
      {/* Subtle pattern */}
      <div
        className="absolute inset-0 opacity-[0.025]"
        style={{
          backgroundImage: 'radial-gradient(circle at 1px 1px, white 1px, transparent 0)',
          backgroundSize: '40px 40px',
        }}
      />
      {/* Accent glow */}
      <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-emerald-500/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/4" />

      {/* Header */}
      <div className="relative flex items-center justify-between mb-12">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 bg-gradient-to-br from-emerald-500 to-emerald-700 rounded-xl flex items-center justify-center font-bold text-xl shadow-lg shadow-emerald-900/50">
            C
          </div>
          <div>
            <p className="text-slate-400 text-sm font-medium">COBREFLEX</p>
            <h1 className="text-white font-bold text-2xl tracking-wide leading-none">META MENSAL</h1>
          </div>
        </div>
        <div className="text-right">
          <p className="text-slate-500 text-xs">Atualizado às</p>
          <p className="text-slate-300 text-sm font-medium">{lastUpdate}</p>
        </div>
      </div>

      {/* Main cards */}
      <div className="relative grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
        {[
          { label: 'Meta do Mês', value: `R$ ${target.toLocaleString('pt-BR')}`, muted: true },
          { label: 'Total Vendido', value: `R$ ${totalSold.toLocaleString('pt-BR')}`, highlight: true },
          { label: 'Falta Vender', value: `R$ ${remaining.toLocaleString('pt-BR')}`, muted: true },
        ].map(({ label, value, highlight, muted }) => (
          <div
            key={label}
            className={[
              'rounded-2xl p-8 text-center',
              highlight ? 'bg-white/10 border border-white/20' : 'bg-white/5 border border-white/8',
            ].join(' ')}
          >
            <p className="text-slate-400 text-sm font-medium uppercase tracking-wider mb-3">{label}</p>
            <p className={['font-bold text-4xl lg:text-5xl', highlight ? 'text-white' : 'text-slate-300'].join(' ')}>
              {value}
            </p>
          </div>
        ))}
      </div>

      {/* Progress bar */}
      <div className="relative mb-10">
        <div className="flex items-center justify-between mb-3">
          <p className="text-slate-300 font-medium">Progresso da meta</p>
          <span className={['font-bold text-lg', progress >= 100 ? 'text-emerald-400' : 'text-white'].join(' ')}>
            {progress.toFixed(1)}%
          </span>
        </div>
        <div className="w-full h-6 bg-white/10 rounded-full overflow-hidden">
          <div
            className={['h-full rounded-full transition-all duration-1000', progress >= 100 ? 'bg-emerald-400' : 'bg-emerald-500'].join(' ')}
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>

      {/* Bottom cards */}
      <div className="relative grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Meta diária */}
        <div className="bg-white/5 border border-white/8 rounded-2xl p-8 text-center">
          <p className="text-slate-400 text-sm font-medium uppercase tracking-wider mb-3">Meta Diária Necessária</p>
          <p className="text-emerald-400 font-bold text-4xl lg:text-5xl">
            R$ {Math.round(dailyGoal).toLocaleString('pt-BR')}
          </p>
        </div>

        {/* Projeção */}
        <div className={['rounded-2xl p-8 text-center border', onTrack ? 'bg-emerald-500/10 border-emerald-500/30' : 'bg-rose-500/10 border-rose-500/30'].join(' ')}>
          <p className="text-slate-400 text-sm font-medium uppercase tracking-wider mb-3">Projeção Final do Mês</p>
          <p className={['font-bold text-4xl lg:text-5xl', onTrack ? 'text-emerald-400' : 'text-rose-400'].join(' ')}>
            R$ {Math.round(projection).toLocaleString('pt-BR')}
          </p>
          <p className="text-slate-400 text-sm mt-3">
            {target > 0
              ? onTrack
                ? `Acima da meta em R$ ${Math.round(projection - target).toLocaleString('pt-BR')}`
                : `Abaixo da meta em R$ ${Math.round(target - projection).toLocaleString('pt-BR')}`
              : 'Meta não definida'}
          </p>
        </div>
      </div>
    </div>
  );
}
