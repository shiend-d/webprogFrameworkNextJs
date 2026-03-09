"use client";

import { useEffect, useMemo, useState } from "react";
import {
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
  CartesianGrid,
} from "recharts";

type ApiResponse<T> = {
  success: boolean;
  message: string;
  data: T;
};

type Product = { id?: number; nama?: string; created_at?: string };
type Transaction = {
  id?: number;
  tanggal_transaksi?: string;
  tanggal?: string;
  ["tanggal_waktu"]?: string;
  nominal?: number;
};
type Material = { id?: number };

export default function DashboardPage() {
  const [totalProducts, setTotalProducts] = useState(0);
  const [totalTransactions, setTotalTransactions] = useState(0);
  const [totalMaterials, setTotalMaterials] = useState(0);
  const [recentTransactions, setRecentTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      try {
        setLoading(true);
        const [produkRes, transaksiRes, bahanRes] = await Promise.all([
          fetch("/api/produk"),
          fetch("/api/transaksi"),
          fetch("/api/bahan_baku"),
        ]);

        const produkJson: ApiResponse<Product[]> = await produkRes.json();
        const transaksiJson: ApiResponse<Transaction[]> =
          await transaksiRes.json();
        const bahanJson: ApiResponse<Material[]> = await bahanRes.json();

        if (produkJson.success && Array.isArray(produkJson.data)) {
          setTotalProducts(produkJson.data.length);
        }
        if (transaksiJson.success && Array.isArray(transaksiJson.data)) {
          setTotalTransactions(transaksiJson.data.length);

          const sorted = [...transaksiJson.data].sort((a, b) => {
            const aDate =
              a.tanggal_transaksi ??
              a.tanggal ??
              (a["tanggal_waktu"] as string) ??
              "";
            const bDate =
              b.tanggal_transaksi ??
              b.tanggal ??
              (b["tanggal_waktu"] as string) ??
              "";
            return new Date(bDate).getTime() - new Date(aDate).getTime();
          });
          setRecentTransactions(sorted.slice(0, 5));
        }
        if (bahanJson.success && Array.isArray(bahanJson.data)) {
          setTotalMaterials(bahanJson.data.length);
        }
      } catch (error) {
        console.error("Failed to load dashboard stats", error);
      } finally {
        setLoading(false);
      }
    }

    load();
  }, []);

  const cards = [
    {
      label: "Total Produk",
      value: loading ? "…" : totalProducts.toString(),
    },
    {
      label: "Total Transaksi",
      value: loading ? "…" : totalTransactions.toString(),
    },
    {
      label: "Total Bahan Baku",
      value: loading ? "…" : totalMaterials.toString(),
    },
  ];

  const chartData = useMemo(() => {
    const aggregated: Record<string, number> = {};
    recentTransactions.forEach((t) => {
      const rawDate =
        t.tanggal_transaksi ??
        t.tanggal ??
        (t["tanggal_waktu"] as string) ??
        "";
      if (!rawDate) return;
      const day = rawDate.split(" ")[0];
      const key = day || rawDate;
      const amount = typeof t.nominal === "number" ? t.nominal : 0;
      aggregated[key] = (aggregated[key] ?? 0) + amount;
    });
    return Object.entries(aggregated)
      .sort((a, b) => new Date(a[0]).getTime() - new Date(b[0]).getTime())
      .map(([date, total]) => ({ date, total }));
  }, [recentTransactions]);

  return (
    <div className="space-y-8">
      <header className="flex flex-col gap-1">
        <h1 className="text-lg font-semibold text-slate-900">
          Ringkasan Dasasena
        </h1>
        <p className="text-xs text-slate-600">
          Ikhtisar singkat produk, transaksi, dan stok bahan baku.
        </p>
      </header>

      <section className="grid gap-4 md:grid-cols-3">
        {cards.map((card) => (
          <div
            key={card.label}
            className="rounded-xl border border-slate-200 bg-white px-5 py-4 shadow-sm"
          >
            <p className="text-[11px] font-medium uppercase tracking-wide text-slate-600">
              {card.label}
            </p>
            <p className="mt-3 text-2xl font-semibold text-slate-900">
              {card.value}
            </p>
          </div>
        ))}
      </section>

      <section className="grid gap-6 lg:grid-cols-[2fr,1.4fr]">
        <div className="rounded-xl border border-slate-200 bg-white px-5 py-4 shadow-sm">
          <div className="mb-3 flex items-center justify-between">
            <div>
              <h2 className="text-sm font-semibold text-slate-900">
                Tren Nominal Transaksi
              </h2>
              <p className="text-xs text-slate-600">
                Ringkasan per tanggal dari transaksi terbaru.
              </p>
            </div>
          </div>
          <div className="h-64">
            {chartData.length === 0 ? (
              <div className="flex h-full items-center justify-center text-xs text-slate-500">
                Belum ada data transaksi untuk ditampilkan.
              </div>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={chartData} margin={{ left: 0, right: 8, top: 8 }}>
                  <CartesianGrid stroke="#e2e8f0" strokeDasharray="3 3" />
                  <XAxis
                    dataKey="date"
                    tick={{ fontSize: 10, fill: "#4b5563" }}
                    axisLine={{ stroke: "#cbd5f5" }}
                    tickLine={{ stroke: "#cbd5f5" }}
                  />
                  <YAxis
                    tick={{ fontSize: 10, fill: "#4b5563" }}
                    axisLine={{ stroke: "#cbd5f5" }}
                    tickLine={{ stroke: "#cbd5f5" }}
                  />
                  <Tooltip
                    contentStyle={{
                      fontSize: 12,
                      borderRadius: 8,
                      borderColor: "#e2e8f0",
                    }}
                    formatter={(value: any) =>
                      typeof value === "number"
                        ? value.toLocaleString("id-ID")
                        : value
                    }
                  />
                  <Line
                    type="monotone"
                    dataKey="total"
                    stroke="#047857"
                    strokeWidth={2.2}
                    dot={{ r: 3, stroke: "#047857", fill: "#ecfdf5" }}
                    activeDot={{ r: 5 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>

        <div className="rounded-xl border border-slate-200 bg-white px-5 py-4 shadow-sm">
          <div className="mb-3 flex items-center justify-between">
            <div>
              <h2 className="text-sm font-semibold text-slate-900">
                Transaksi Terbaru
              </h2>
              <p className="text-xs text-slate-600">
                5 transaksi terakhir yang tercatat di sistem.
              </p>
            </div>
          </div>
          <div className="divide-y divide-slate-100">
            {recentTransactions.length === 0 ? (
              <p className="py-6 text-center text-xs text-slate-500">
                Belum ada transaksi tercatat.
              </p>
            ) : (
              recentTransactions.map((t) => {
                const date =
                  t.tanggal_transaksi ??
                  t.tanggal ??
                  (t["tanggal_waktu"] as string) ??
                  "-";
                const amount =
                  typeof t.nominal === "number"
                    ? t.nominal.toLocaleString("id-ID")
                    : t.nominal ?? "-";
                return (
                  <div
                    key={t.id}
                    className="flex items-center justify-between py-3 text-xs"
                  >
                    <div className="flex flex-col">
                      <span className="font-medium text-slate-900">
                        Transaksi #{t.id ?? "-"}
                      </span>
                      <span className="text-[11px] text-slate-600">{date}</span>
                    </div>
                    <span className="text-[11px] font-semibold text-emerald-700">
                      Rp {amount}
                    </span>
                  </div>
                );
              })
            )}
          </div>
        </div>
      </section>
    </div>
  );
}

