'use client';

import { useEffect, useState } from 'react';
import { auth, db } from '@/lib/firebase';
import { onAuthStateChanged } from 'firebase/auth';
import { collection, getDocs, query, where, doc, setDoc, getDoc, Timestamp } from 'firebase/firestore';
import { Save, Target } from 'lucide-react';
import Header from '@/components/Header';
import { useAuth } from '@/hooks/useAuth';

type SDR = { id: string; email: string };

export default function MetaMensalPage() {
  const { user, role } = useAuth();
  const month = new Date().toISOString().slice(0, 7);

  const [sdrs, setSdrs] = useState<SDR[]>([]);
  const [selectedSdr, setSelectedSdr] = useState('');
  const [targetValue, setTargetValue] = useState(0);
  const [currentGoal, setCurrentGoal] = useState<number | null>(null);
  const [loading, setLoading] = useState(false);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    if (role !== 'ADMIN') return;
    getDocs(query(collection(db, 'users'), where('role', '==', 'SDR'))).then((snap) => {
      setSdrs(snap.docs.map((d) => ({ id: d.id, email: d.data().email || d.id })));
    });
  }, [role]);

  useEffect(() => {
    if (!selectedSdr) return;
    getDoc(doc(db, 'goals', `${selectedSdr}_${month}`)).then((snap) => {
      if (snap.exists()) {
        setCurrentGoal(snap.data().target);
        setTargetValue(snap.data().target);
      } else {
        setCurrentGoal(null);
        setTargetValue(0);
      }
    });
  }, [selectedSdr, month]);

  async function handleSave() {
    if (!selectedSdr || targetValue <= 0) return;
    setLoading(true);
    await setDoc(doc(db, 'goals', `${selectedSdr}_${month}`), {
      target: targetValue,
      month,
      sdrId: selectedSdr,
      updatedAt: Timestamp.now(),
    }, { merge: true });
    setCurrentGoal(targetValue);
    setLoading(false);
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  }

  if (!user) return null;

  if (role && role !== 'ADMIN') {
    return (
      <main className="flex-1 flex items-center justify-center bg-slate-50">
        <div className="text-center">
          <div className="w-16 h-16 bg-slate-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <Target size={28} className="text-slate-400" />
          </div>
          <h1 className="text-lg font-semibold text-slate-700">Acesso restrito</h1>
          <p className="text-slate-400 text-sm mt-1">Apenas administradores podem definir metas.</p>
        </div>
      </main>
    );
  }

  return (
    <main className="flex-1 overflow-y-auto bg-slate-50">
      <Header email={user.email || ''} />

      <section className="p-6 lg:p-8 space-y-6 page-enter max-w-2xl">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Meta Mensal por SDR</h1>
          <p className="text-slate-500 text-sm mt-0.5">Defina a meta de leads para cada SDR em {month}</p>
        </div>

        <div className="bg-white rounded-2xl border border-slate-100 shadow-card p-6 space-y-5">
          {/* Select SDR */}
          <div>
            <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wide mb-1.5">SDR</label>
            <select
              value={selectedSdr}
              onChange={(e) => setSelectedSdr(e.target.value)}
              className="w-full border border-slate-200 rounded-xl px-3.5 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#0B1F33]/10 focus:border-[#0B1F33]/30"
            >
              <option value="">Selecione um SDR</option>
              {sdrs.map((sdr) => (
                <option key={sdr.id} value={sdr.id}>{sdr.email}</option>
              ))}
            </select>
          </div>

          {/* Current goal */}
          {selectedSdr && currentGoal !== null && (
            <div className="bg-emerald-50 border border-emerald-200 rounded-xl px-4 py-3">
              <p className="text-xs font-semibold text-emerald-600 uppercase tracking-wide">Meta atual</p>
              <p className="text-lg font-bold text-emerald-700 mt-0.5">{currentGoal} leads</p>
            </div>
          )}

          {/* Input */}
          {selectedSdr && (
            <>
              <div>
                <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wide mb-1.5">
                  Nova meta (leads)
                </label>
                <input
                  type="number"
                  placeholder="Ex: 60"
                  value={targetValue || ''}
                  onChange={(e) => setTargetValue(Number(e.target.value))}
                  className="w-full border border-slate-200 rounded-xl px-3.5 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#0B1F33]/10 focus:border-[#0B1F33]/30"
                />
              </div>

              <button
                onClick={handleSave}
                disabled={loading || targetValue <= 0}
                className={[
                  'w-full flex items-center justify-center gap-2 text-white text-sm font-semibold py-3 rounded-xl transition-all disabled:opacity-50',
                  saved ? 'bg-emerald-600' : 'bg-[#0B1F33] hover:bg-[#0e2a45]',
                ].join(' ')}
              >
                <Save size={15} />
                {saved ? 'Meta salva!' : loading ? 'Salvando...' : 'Salvar meta'}
              </button>
            </>
          )}
        </div>
      </section>
    </main>
  );
}
