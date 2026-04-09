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

type FunnelData = {
  etapa: string;
  total: number;
};

export default function LeadsFunnelChart() {
  const [data, setData] = useState<FunnelData[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchData() {
      try {
        const snap = await getDocs(collection(db, 'leads'));

        let leads = 0;
        let contatos = 0;
        let qualificados = 0;
        let reunioes = 0;

        snap.docs.forEach((doc) => {
          const status = doc.data().status;
          leads++;

          if (status === 'Contato Realizado') contatos++;
          if (status === 'Qualificado') qualificados++;
          if (status === 'Reunião') reunioes++;
        });

        setData([
          { etapa: 'Leads', total: leads },
          { etapa: 'Contato', total: contatos },
          { etapa: 'Qualificado', total: qualificados },
          { etapa: 'Reunião', total: reunioes },
        ]);
      } catch (error) {
        console.error('Erro funil leads:', error);
      } finally {
        setLoading(false);
      }
    }

    fetchData();
  }, []);

  if (loading) {
    return <p className="text-sm text-gray-500">Carregando funil...</p>;
  }

  return (
    <div className="bg-white rounded-xl shadow p-4 h-[320px]">
      <h3 className="text-sm font-semibold mb-4">
        Funil de Leads
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
            dataKey="etapa"
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
