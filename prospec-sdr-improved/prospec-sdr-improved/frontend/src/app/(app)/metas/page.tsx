'use client';

import { useEffect, useState } from 'react';
import { auth, db } from '@/lib/firebase';
import { onAuthStateChanged } from 'firebase/auth';
import {
  collection, getDocs, query, where, doc, getDoc, setDoc, addDoc, deleteDoc, Timestamp,
} from 'firebase/firestore';
import { Save, Plus, Trash2, TrendingUp, TrendingDown } from 'lucide-react';
import Header from '@/components/Header';
import { getBusinessDays, getBusinessDaysPassed } from '@/utils/businessDays';
import { useAuth } from '@/hooks/useAuth';

export default function MetasPage() {
  const { user, role } = useAuth();
  const month = new Date().toISOString().slice(0, 7);

  const [loading, setLoading] = useState(false);
  const [target, setTarget] = useState(0);
  const [sales, setSales] = useState<any[]>([]);
  const [soldToday, setSoldToday] = useState(0);
  const [totalSold, setTotalSold] = useState(0);
  const [remaining, setRemaining] = useState(0);
  const [dailyGoal, setDailyGoal] = useState(0);
  const [avgDaily, setAvgDaily] = useState(0);
  const [projection, setProjection] = useState(0);

  async function recalcSales(currentTarget = target) {
    const snap = await getDocs(
      query(
        collection(db, 'daily_sales'),
        where('date', '>=', `${month}-01`),
        where('date', '<=', `${month}-31`)
      )
    );
    let total = 0;
    const list = snap.docs.map((d) => {
      const data = d.data();
      total += Number(data.amount || 0);
      return { id: d.id, ...data };
    });
    setSales(list);
    setTotalSold(total);

    const businessDays = getBusinessDays(month);
    const passedDays = Math.max(1, getBusinessDaysPassed(month));
    const remainingDays = Math.max(1, businessDays - passedDays);
    const falta = Math.max(0, currentTarget - total);
    const media = total / passedDays;
    const proj = media * businessDays;

    setRemaining(falta);
    setDailyGoal(falta / remainingDays);
    setAvgDaily(media);
    setProjection(proj);
  }

  useEffect(() => {
    getDoc(doc(db, 'sales_goals', month)).then((snap) => {
      const tgt = snap.exists() ? Number(snap.data().target || 0) : 0;
      setTarget(tgt);
      recalcSales(tgt);
    });
  }, [month]);

  async function handleSaveTarget() {
    if (target <= 0) return;
    setLoading(true);
    await setDoc(doc(db, 'sales_goals', month), { month, target, updatedAt: Timestamp.now(), createdAt: Timestamp.now() }, { merge: true });
    await recalcSales(target);
    setLoading(false);
  }

  async function handleAddSale() {
    if (soldToday <= 0) return;
    setLoading(true);
    await addDoc(collection(db, 'daily_sales'), { date: new Date().toISOString().slice(0, 10), amount: soldToday, createdAt: Timestamp.now() });
    setSoldToday(0);
    await recalcSales();
    setLoading(false);
  }

  async function handleRemoveSale(id: string) {
    await deleteDoc(doc(db, 'daily_sales', id));
    await recalcSales();
  }

  if (role && role !== 'ADMIN') {
    return (
      <main className="flex-1 flex items-center justify-center bg-slate-50">
        <div className="text-center">
          <div className="w-16 h-16 bg-slate-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <TrendingUp size={28} className="text-slate-400" />
          </div>
          <h1 className="text-lg font-semibold text-slate-700">Acesso restrito</h1>
          <p className="text-slate-400 text-sm mt-1">Apenas administradores podem acessar esta página.</p>
        </div>
      </main>
    );
  }

  if (!user) return null;

  const goalPct = target > 0 ? Math.min(100, Math.round((totalSold / target) * 100)) : 0;
  const onTrack = projection >= target;

  return (
    <main className="flex-1 overflow-y-auto bg-slate-50">
      <Header email={user.email || ''} />

      <section className="p-6 lg:p-8 space-y-6 page-enter">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Meta Mensal de Vendas</h1>
          <p className="text-slate-500 text-sm mt-0.5">{month}</p>
        </div>

        {/* Definir meta */}
        <div className="bg-white rounded-2xl border border-slate-100 shadow-card p-6">
          <h2 className="font-semibold text-slate-700 mb-4">Definir meta do mês</h2>
          <div className="flex flex-wrap gap-3">
            <div className="relative flex-1 min-w-[200px]">
              <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 text-sm font-medium">R$</span>
              <input
                type="number"
                placeholder="0"
                value={target || ''}
                onChange={(e) => setTarget(Number(e.target.value))}
                className="w-full border border-slate-200 rounded-xl pl-9 pr-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#0B1F33]/10 focus:border-[#0B1F33]/30"
              />
            </div>
            <button
              onClick={handleSaveTarget}
              disabled={loading || target <= 0}
              className="flex items-center gap-2 bg-[#0B1F33] hover:bg-[#0e2a45] text-white text-sm font-semibold px-5 py-2.5 rounded-xl transition-colors disabled:opacity-50"
            >
              <Save size={15} /> Salvar meta
            </button>
          </div>
        </div>

        {/* Progress */}
        {target > 0 && (
          <div className="bg-white rounded-2xl border border-slate-100 shadow-card p-6">
            <div className="flex items-center justify-between mb-3">
              <p className="text-sm font-semibold text-slate-600">Progresso da meta</p>
              <span className={['text-sm font-bold px-3 py-1 rounded-full', goalPct >= 100 ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-100 text-slate-600'].join(' ')}>
                {goalPct}%
              </span>
            </div>
            <div className="w-full h-3 bg-slate-100 rounded-full overflow-hidden">
              <div
                className="h-full bg-emerald-500 rounded-full transition-all duration-700"
                style={{ width: `${goalPct}%` }}
              />
            </div>
            <div className="flex justify-between text-xs text-slate-400 mt-1.5">
              <span>R$ {totalSold.toLocaleString('pt-BR')}</span>
              <span>R$ {target.toLocaleString('pt-BR')}</span>
            </div>
          </div>
        )}

        {/* KPI cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {[
            { label: 'Total vendido',  value: `R$ ${totalSold.toLocaleString('pt-BR')}` },
            { label: 'Falta vender',   value: `R$ ${remaining.toLocaleString('pt-BR')}` },
            { label: 'Meta diária',    value: `R$ ${Math.round(dailyGoal).toLocaleString('pt-BR')}` },
            { label: 'Média diária',   value: `R$ ${Math.round(avgDaily).toLocaleString('pt-BR')}` },
          ].map(({ label, value }) => (
            <div key={label} className="bg-white rounded-2xl border border-slate-100 shadow-card p-5">
              <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide">{label}</p>
              <p className="text-xl font-bold text-slate-800 mt-2">{value}</p>
            </div>
          ))}
        </div>

        {/* Projeção */}
        <div className={['bg-white rounded-2xl border shadow-card p-6 flex items-center gap-4', onTrack ? 'border-emerald-200' : 'border-rose-200'].join(' ')}>
          <div className={['w-12 h-12 rounded-xl flex items-center justify-center shrink-0', onTrack ? 'bg-emerald-100' : 'bg-rose-100'].join(' ')}>
            {onTrack ? <TrendingUp size={22} className="text-emerald-600" /> : <TrendingDown size={22} className="text-rose-500" />}
          </div>
          <div>
            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide">Projeção final do mês</p>
            <p className={['text-2xl font-bold mt-0.5', onTrack ? 'text-emerald-600' : 'text-rose-600'].join(' ')}>
              R$ {Math.round(projection).toLocaleString('pt-BR')}
            </p>
            <p className="text-xs text-slate-400 mt-0.5">
              {onTrack
                ? `Acima da meta em R$ ${Math.round(projection - target).toLocaleString('pt-BR')}`
                : `Abaixo da meta em R$ ${Math.round(target - projection).toLocaleString('pt-BR')}`}
            </p>
          </div>
        </div>

        {/* Lançar venda */}
        <div className="bg-white rounded-2xl border border-slate-100 shadow-card p-6">
          <h2 className="font-semibold text-slate-700 mb-4">Lançar venda do dia</h2>
          <div className="flex flex-wrap gap-3">
            <div className="relative flex-1 min-w-[200px]">
              <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 text-sm font-medium">R$</span>
              <input
                type="number"
                placeholder="Valor vendido hoje"
                value={soldToday || ''}
                onChange={(e) => setSoldToday(Number(e.target.value))}
                className="w-full border border-slate-200 rounded-xl pl-9 pr-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-400"
              />
            </div>
            <button
              onClick={handleAddSale}
              disabled={loading || soldToday <= 0}
              className="flex items-center gap-2 bg-emerald-600 hover:bg-emerald-500 text-white text-sm font-semibold px-5 py-2.5 rounded-xl transition-colors disabled:opacity-50"
            >
              <Plus size={15} /> Adicionar venda
            </button>
          </div>
        </div>

        {/* Lista de vendas */}
        <div className="bg-white rounded-2xl border border-slate-100 shadow-card overflow-hidden">
          <div className="px-6 py-4 border-b border-slate-100">
            <h2 className="font-semibold text-slate-700">Vendas lançadas</h2>
          </div>
          {sales.length === 0 ? (
            <p className="px-6 py-10 text-center text-slate-400 text-sm">Nenhuma venda registrada.</p>
          ) : (
            <div className="divide-y divide-slate-50">
              {sales.map((s) => (
                <div key={s.id} className="flex justify-between items-center px-6 py-3.5 hover:bg-slate-50/60 transition-colors">
                  <div>
                    <span className="text-sm font-medium text-slate-700">{s.date}</span>
                    <span className="text-slate-400 mx-2">—</span>
                    <span className="text-sm font-bold text-emerald-600">R$ {Number(s.amount || 0).toLocaleString('pt-BR')}</span>
                  </div>
                  <button
                    onClick={() => handleRemoveSale(s.id)}
                    className="w-8 h-8 flex items-center justify-center rounded-lg text-slate-300 hover:text-rose-500 hover:bg-rose-50 transition-colors"
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>
    </main>
  );
}
