'use client';

import { auth } from '@/lib/firebase';
import { signOut } from 'firebase/auth';
import { Bell, LogOut, ChevronDown } from 'lucide-react';

export default function Header({ email }: { email: string }) {
  async function logout() {
    await signOut(auth);
    window.location.href = '/login';
  }

  const initials = email
    ? email.slice(0, 2).toUpperCase()
    : 'U';

  const hours = new Date().getHours();
  const greeting =
    hours < 12 ? 'Bom dia' : hours < 18 ? 'Boa tarde' : 'Boa noite';

  return (
    <header className="flex items-center justify-between px-8 py-4 bg-white border-b border-slate-100 sticky top-0 z-20">
      <div>
        <p className="text-xs text-slate-400 font-medium uppercase tracking-wide">
          {greeting},
        </p>
        <h2 className="text-sm font-semibold text-slate-700 mt-0.5 truncate max-w-[260px]">
          {email}
        </h2>
      </div>

      <div className="flex items-center gap-2">
        {/* Notificações (placeholder) */}
        <button className="relative w-9 h-9 flex items-center justify-center rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors">
          <Bell size={18} />
        </button>

        {/* Avatar + menu */}
        <button
          onClick={logout}
          className="flex items-center gap-2.5 pl-3 pr-3 py-2 rounded-lg hover:bg-slate-100 transition-colors group"
        >
          <div className="w-7 h-7 rounded-full bg-gradient-to-br from-[#0B1F33] to-[#143656] flex items-center justify-center text-white text-xs font-semibold">
            {initials}
          </div>
          <LogOut
            size={14}
            className="text-slate-400 group-hover:text-red-500 transition-colors"
          />
        </button>
      </div>
    </header>
  );
}
