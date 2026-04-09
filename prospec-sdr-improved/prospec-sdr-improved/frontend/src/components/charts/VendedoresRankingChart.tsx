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

type VendorData = {
  vendedor: string;
  total: number;
};

export default function VendedoresRankingChart() {
  const [data, setData] = useState<VendorData[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchData() {
      try {
        const snap = await getDocs(collection(db, 'leads'));

        const counter: Record<string, number> = {};

        snap.docs.forEach((doc) => {
          const vendedor = doc.data().vendedor;
          if (!vendedor) return;

          counter[vendedor] = (counter[vendedor] || 0) + 1;
        });

        const formatted = Object.entries(counter)
          .map(([vendedor, total]) => ({ vendedor, total }))
          .sort((a, b) => b.total - a.total);

        setData(formatted);
      } catch (error) {
        console.error('Erro ranking vendedores:', error);
      } finally {
        setLoading(false);
      }
    }

    fetchData();
  }, []);

  if (loading) {
    return <p className="text-sm text-gray-500">Carregando vendedores...</p>;
  }

  if (data.length === 0) {
    return (
      <div className="bg-white rounded-xl shadow p-6">
        <p className="text-sm text-gray-500">
          Nenhum lead vinculado a vendedores.
        </p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl shadow p-4 h-[300px]">
      <h3 className="text-sm font-semibold mb-4">
        Vendedores que mais recebem leads
      </h3>

      <ResponsiveContainer width="100%" height="100%">
        <BarChart
          data={data}
          layout="vertical"
          margin={{ left: 40 }}
        >
          <XAxis type="number" allowDecimals={false} />
          <YAxis
            type="category"
            dataKey="vendedor"
            width={120}
          />
          <Tooltip />
          <Bar
            dataKey="total"
            fill="#071a2f"
            radius={[0, 4, 4, 0]}
          />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
