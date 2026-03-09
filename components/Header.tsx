"use client";

import { LogOut, Bell } from "lucide-react";

export function Header() {
  return (
    <header className="sticky top-0 z-20 flex h-20 items-center justify-between border-b border-slate-200 bg-white/90 px-4 backdrop-blur md:px-8">
      <div className="flex flex-col">
        <span className="text-xs font-medium uppercase tracking-[0.2em] text-emerald-700">
          Dashboard
        </span>
        <span className="text-sm text-slate-500">
          Selamat datang kembali, Admin
        </span>
      </div>

      <div className="flex items-center gap-4">
        <button
          type="button"
          className="relative flex h-9 w-9 items-center justify-center rounded-full border border-slate-200 bg-white text-slate-500 hover:border-emerald-600 hover:text-emerald-700"
        >
          <Bell className="h-4 w-4" />
          <span className="absolute -right-0.5 -top-0.5 inline-flex h-3 w-3 items-center justify-center rounded-full bg-emerald-500 text-[9px] font-semibold text-white">
            3
          </span>
        </button>

        <div className="flex items-center gap-3 rounded-full border border-slate-200 bg-slate-50 px-3 py-1.5">
          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-emerald-700 text-xs font-semibold text-white">
            A
          </div>
          <div className="hidden flex-col text-xs text-right md:flex">
            <span className="font-semibold text-slate-800">Admin</span>
            <span className="text-[11px] text-slate-500">Super Admin</span>
          </div>
          <button
            type="button"
            className="ml-1 flex h-8 w-8 items-center justify-center rounded-full bg-white text-slate-500 shadow-sm transition hover:bg-emerald-600 hover:text-white"
          >
            <LogOut className="h-4 w-4" />
          </button>
        </div>
      </div>
    </header>
  );
}

