"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { LayoutDashboard, Wallet, Package, Boxes } from "lucide-react";

const navItems = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/keuangan", label: "Keuangan", icon: Wallet },
  { href: "/produk", label: "Produk", icon: Package },
  { href: "/bahan-baku", label: "Stok & Bahan Baku", icon: Boxes },
];

export function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="sticky top-0 hidden h-screen w-64 flex-shrink-0 border-r border-[#004d40] bg-[#004d40] text-emerald-50 shadow-xl md:flex">
      <div className="flex h-full w-full flex-col">
        <div className="flex items-center gap-3 px-6 py-5">
          <div className="flex h-12 w-12 items-center justify-center overflow-hidden rounded-full bg-white">
            <Image
              src="/logo.svg"
              alt="Dasasena"
              width={48}
              height={48}
              className="h-12 w-12 rounded-full object-cover"
            />
          </div>
          <div className="flex flex-col">
            <span className="text-sm font-semibold uppercase tracking-[0.2em]">
              Dasasena
            </span>
            <span className="text-xs text-emerald-100">Admin Dashboard</span>
          </div>
        </div>
        <nav className="mt-4 flex-1 space-y-1 px-3 text-sm">
          {navItems.map((item) => {
            const Icon = item.icon;
            const active =
              pathname === item.href || pathname.startsWith(item.href + "/");

            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center gap-3 rounded-md px-3 py-2 transition-colors ${
                  active
                    ? "bg-white text-emerald-900 shadow-sm"
                    : "text-emerald-100/90 hover:bg-white/10 hover:text-white"
                }`}
              >
                <Icon className="h-4 w-4" />
                <span className="truncate">{item.label}</span>
              </Link>
            );
          })}
        </nav>
        <div className="px-6 pb-6 pt-3 text-[11px] text-emerald-100/80">
          © {new Date().getFullYear()} Dasasena
        </div>
      </div>
    </aside>
  );
}

