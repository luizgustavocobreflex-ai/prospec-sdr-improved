'use client';

import { useEffect, useState } from 'react';
import { collection, getDocs } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';

const COLORS = ['#071a2f', '#cbd5e1'];

export default function IntecConversionChart() {
  const [cotacoes, setCotacoes] = useState(0);
  const [fechamentos, setFechamentos] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchData() {
      try {
        const snap = await getDocs(collection(db, 'intec'));

        let c = 0;
        let f = 0;

        snap.docs.forEach((doc) => {
          const data = doc.data();
          if (data.tipo === 'cotacao') c++;
          if (data.tipo === 'fechamento') f++;
        });

        setCotacoes(c);
        setFechamentos(f);
      } catch (error) {
        console.error('Erro conversão INTEC:', error);
      } finally {
        setLoading(false);
      }
    }

    fetchData();
  }, []);

  if (loading) {
    return <p className="text-sm text-gray-500">Carregando conversão INTEC...</p>;
  }

  const total = cotacoes + fechamentos;
  const conversion =
    cotacoes > 0 ? Math.round((fechamentos / cotacoes) * 100) : 0;

  const data = [
    { name: 'Fechamentos', value: fechamentos },
    { name: 'Cotações', value: cotacoes },
  ];

  return (
    <div className="bg-white rounded-xl shadow p-6 h-[320px]">
      <h3 className="text-sm font-semibold mb-4">
        Conversão INTEC
      </h3>

      <div className="flex flex-col md:flex-row items-center h-full gap-6">
        {/* Donut */}
        <div className="w-full md:w-1/2 h-full">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={data}
                innerRadius={60}
                outerRadius={90}
                dataKey="value"
              >
                {data.map((_, index) => (
                  <Cell
                    key={index}
                    fill={COLORS[index % COLORS.length]}
                  />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </div>

        {/* Métricas */}
        <div className="space-y-3 text-center md:text-left">
          <p className="text-sm text-gray-500">
            Cotações: <strong>{cotacoes}</strong>
          </p>
          <p className="text-sm text-gray-500">
            Fechamentos: <strong>{fechamentos}</strong>
          </p>
          <p className="text-xl font-bold text-[#071a2f]">
            {conversion}% de conversão
          </p>
        </div>
      </div>
    </div>
  );
}
