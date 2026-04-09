'use client';

import { useEffect, useState } from 'react';
import { collection, getDocs } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';

type SdrData = {
  sdr: string;
  total: number;
};

export default function SdrRankingChart() {
  const [data, setData] = useState<SdrData[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchData() {
      try {
        const snap = await getDocs(collection(db, 'leads'));

        const counter: Record<string, number> = {};

        snap.docs.forEach((doc) => {
          const sdr = doc.data().sdrEmail;
          if (!sdr) return;

          counter[sdr] = (counter[sdr] || 0) + 1;
        });

        const formatted = Object.entries(counter)
          .map(([sdr, total]) => ({ sdr, total }))
          .sort((a, b) => b.total - a.total);

        setData(formatted);
      } catch (error) {
        console.error('Erro ranking SDR:', error);
      } finally {
        setLoading(false);
      }
    }

    fetchData();
  }, []);

  if (loading) {
    return <p className="text-sm text-gray-500">Carregando ranking...</p>;
  }

  return (
    <div className="bg-white rounded-xl shadow p-4 h-[300px]">
      <h3 className="text-sm font-semibold mb-4">
        Ranking de SDRs
      </h3>

      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data}>
          <XAxis dataKey="sdr" hide />
          <YAxis allowDecimals={false} />
          <Tooltip />
          <Bar dataKey="total" fill="#071a2f" radius={[4, 4, 0, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
