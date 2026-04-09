import { LucideIcon } from 'lucide-react';

interface StatsCardProps {
  title: string;
  value: string | number;
  icon?: LucideIcon;
  trend?: { value: number; label?: string };
  accent?: 'blue' | 'emerald' | 'amber' | 'rose' | 'default';
}

const accentMap = {
  blue: { bg: 'bg-blue-50', icon: 'text-blue-500', border: 'border-blue-100' },
  emerald: { bg: 'bg-emerald-50', icon: 'text-emerald-600', border: 'border-emerald-100' },
  amber: { bg: 'bg-amber-50', icon: 'text-amber-500', border: 'border-amber-100' },
  rose: { bg: 'bg-rose-50', icon: 'text-rose-500', border: 'border-rose-100' },
  default: { bg: 'bg-slate-50', icon: 'text-slate-500', border: 'border-slate-100' },
};

export default function StatsCard({
  title,
  value,
  icon: Icon,
  trend,
  accent = 'default',
}: StatsCardProps) {
  const colors = accentMap[accent];

  return (
    <div className="bg-white rounded-2xl border border-slate-100 shadow-card p-5 card-hover">
      <div className="flex items-start justify-between">
        <div className="flex-1 min-w-0">
          <p className="text-xs font-medium text-slate-500 uppercase tracking-wide truncate">
            {title}
          </p>
          <p className="text-3xl font-bold text-slate-800 mt-2 leading-none">
            {value}
          </p>
          {trend && (
            <p
              className={[
                'text-xs mt-2 font-medium',
                trend.value >= 0 ? 'text-emerald-600' : 'text-rose-500',
              ].join(' ')}
            >
              {trend.value >= 0 ? '↑' : '↓'} {Math.abs(trend.value)}%
              {trend.label && (
                <span className="text-slate-400 font-normal ml-1">{trend.label}</span>
              )}
            </p>
          )}
        </div>
        {Icon && (
          <div className={`w-10 h-10 rounded-xl ${colors.bg} ${colors.border} border flex items-center justify-center shrink-0`}>
            <Icon size={20} className={colors.icon} />
          </div>
        )}
      </div>
    </div>
  );
}
