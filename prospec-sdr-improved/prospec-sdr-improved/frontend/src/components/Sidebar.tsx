'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  LayoutDashboard,
  Users,
  Target,
  FileText,
  LogOut,
  ChevronLeft,
  ChevronRight,
  Database,
  Monitor,
  TrendingUp,
} from 'lucide-react';
import { signOut } from 'firebase/auth';
import { auth } from '@/lib/firebase';

const NAV_ITEMS = [
  { href: '/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
  { href: '/leads', icon: Users, label: 'Leads' },
  { href: '/intec', icon: Database, label: 'INTEC' },
  { href: '/metas', icon: Target, label: 'Metas' },
  { href: '/meta-mensal', icon: TrendingUp, label: 'Meta Mensal' },
  { href: '/tv-meta', icon: Monitor, label: 'TV Meta' },
  { href: '/relatorios', icon: FileText, label: 'Relatórios' },
];

export default function Sidebar() {
  const [collapsed, setCollapsed] = useState(false);
  const pathname = usePathname();

  function Item({
    href,
    icon: Icon,
    label,
  }: {
    href: string;
    icon: any;
    label: string;
  }) {
    const active = pathname === href;

    return (
      <Link
        href={href}
        title={collapsed ? label : undefined}
        className={[
          'group flex items-center py-2.5 rounded-lg text-sm font-medium transition-all duration-150',
          collapsed ? 'justify-center px-0' : 'gap-3 px-3',
          active
            ? 'bg-emerald-500/20 text-emerald-400'
            : 'text-slate-400 hover:text-white hover:bg-white/8',
        ].join(' ')}
      >
        <Icon
          size={18}
          className={[
            'shrink-0 transition-colors',
            active ? 'text-emerald-400' : 'text-slate-500 group-hover:text-slate-300',
          ].join(' ')}
        />
        {!collapsed && <span className="truncate">{label}</span>}
        {active && !collapsed && (
          <span className="ml-auto w-1.5 h-1.5 rounded-full bg-emerald-400" />
        )}
      </Link>
    );
  }

  return (
    <aside
      className={[
        'relative h-full flex flex-col bg-[#0B1F33] border-r border-white/5 transition-all duration-300 ease-in-out',
        collapsed ? 'w-[68px]' : 'w-[240px]',
      ].join(' ')}
    >
      {/* LOGO */}
      <div
        className={[
          'flex items-center border-b border-white/5',
          collapsed ? 'justify-center px-0 py-5' : 'px-4 py-5',
        ].join(' ')}
      >
        <div className="w-8 h-8 bg-gradient-to-br from-emerald-500 to-emerald-700 rounded-lg flex items-center justify-center text-white font-bold text-sm shrink-0 shadow-lg">
          C
        </div>
        {!collapsed && (
          <div className="ml-2.5 min-w-0">
            <p className="text-white font-bold text-sm leading-none tracking-wide">COBREFLEX</p>
            <p className="text-slate-500 text-xs mt-0.5">CRM SDR</p>
          </div>
        )}
      </div>

      {/* TOGGLE */}
      <button
        onClick={() => setCollapsed(!collapsed)}
        className="absolute -right-3 top-[68px] w-6 h-6 rounded-full bg-[#0e2a45] border border-white/10 flex items-center justify-center text-slate-400 hover:text-white transition-colors z-10 shadow-md"
        aria-label={collapsed ? 'Expandir menu' : 'Recolher menu'}
      >
        {collapsed ? <ChevronRight size={12} /> : <ChevronLeft size={12} />}
      </button>

      {/* NAV */}
      <nav
        className={[
          'flex-1 overflow-y-auto py-4 space-y-0.5',
          collapsed ? 'px-2' : 'px-3',
        ].join(' ')}
      >
        {!collapsed && (
          <p className="text-[10px] font-semibold text-slate-600 uppercase tracking-widest px-3 mb-2">
            Navegação
          </p>
        )}
        {NAV_ITEMS.map((item) => (
          <Item key={item.href} {...item} />
        ))}
      </nav>

      {/* FOOTER */}
      <div
        className={[
          'border-t border-white/5',
          collapsed ? 'px-2 py-3' : 'px-3 py-3',
        ].join(' ')}
      >
        <button
          onClick={() => signOut(auth)}
          title={collapsed ? 'Sair' : undefined}
          className={[
            'group flex items-center py-2.5 rounded-lg w-full text-sm font-medium text-slate-400 hover:text-red-400 hover:bg-red-500/10 transition-all duration-150',
            collapsed ? 'justify-center px-0' : 'gap-3 px-3',
          ].join(' ')}
        >
          <LogOut size={18} className="shrink-0" />
          {!collapsed && <span>Sair da conta</span>}
        </button>
      </div>
    </aside>
  );
}
