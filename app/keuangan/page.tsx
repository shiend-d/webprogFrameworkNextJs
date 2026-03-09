"use client";

import { useEffect, useMemo, useState } from "react";
import { DataTable, ColumnDef } from "@/components/DataTable";

type Transaction = {
  id?: number;
  tanggal?: string;
  tanggal_transaksi?: string;
  nominal?: number;
  kategori?: string;
  jenis_transaksi?: string;
  [key: string]: any;
};

type ApiResponse<T> = {
  success: boolean;
  message: string;
  data: T;
};

export default function KeuanganPage() {
  const [rows, setRows] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(false);
  const [modalMode, setModalMode] = useState<"view" | "create" | "edit" | null>(
    null
  );
  const [selected, setSelected] = useState<Transaction | null>(null);
  const [form, setForm] = useState({
    tanggal: "",
    nominal: "",
    kategori: "",
    keterangan: "",
  });
  const [submitting, setSubmitting] = useState(false);

  const columns: ColumnDef<Transaction>[] = useMemo(
    () => [
      {
        key: "id",
        header: "ID Transaksi",
      },
      {
        key: "tanggal",
        header: "Tanggal / Waktu",
        render: (_value, row) =>
          row.tanggal_transaksi ?? row.tanggal ?? row["tanggal_waktu"] ?? "-",
      },
      {
        key: "nominal",
        header: "Nominal (Rp)",
        align: "right",
        render: (value: number) =>
          typeof value === "number"
            ? value.toLocaleString("id-ID")
            : value ?? "-",
      },
      {
        key: "kategori",
        header: "Kategori",
        render: (_value, row) =>
          row.kategori ?? row.jenis_transaksi ?? "Tidak diketahui",
      },
    ],
    []
  );

  async function load() {
    try {
      setLoading(true);
      const res = await fetch("/api/transaksi");
      const json: ApiResponse<Transaction[]> = await res.json();
      if (json.success) {
        setRows(json.data ?? []);
      }
    } catch (error) {
      console.error("Failed to fetch transaksi", error);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
  }, []);

  function openCreate() {
    setSelected(null);
    setForm({
      tanggal: "",
      nominal: "",
      kategori: "",
      keterangan: "",
    });
    setModalMode("create");
  }

  function openView(row: Transaction) {
    setSelected(row);
    setModalMode("view");
  }

  function openEdit(row: Transaction) {
    setSelected(row);
    setForm({
      tanggal:
        (row.tanggal_transaksi as string) ??
        (row.tanggal as string) ??
        (row["tanggal_waktu"] as string) ??
        "",
      nominal:
        typeof row.nominal === "number" ? String(row.nominal) : String(row.nominal ?? ""),
      kategori:
        (row.kategori as string) ??
        (row.jenis_transaksi as string) ??
        "",
      keterangan: String(row["detail"] ?? row["deskripsi"] ?? ""),
    });
    setModalMode("edit");
  }

  async function handleSubmit() {
    if (!modalMode || modalMode === "view") return;

    const payload: Transaction = {
      tanggal_transaksi: form.tanggal,
      nominal: form.nominal ? Number(form.nominal) : undefined,
      kategori: form.kategori,
      detail: form.keterangan,
    };

    try {
      setSubmitting(true);
      const isEdit = modalMode === "edit" && selected?.id != null;
      const url = isEdit ? `/api/transaksi?id=${selected?.id}` : "/api/transaksi";
      const method = isEdit ? "PUT" : "POST";

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const json: ApiResponse<Transaction> = await res.json();
      if (!json.success) {
        console.error(json.message);
      }
      await load();
      setModalMode(null);
    } catch (error) {
      console.error("Failed to submit transaksi", error);
    } finally {
      setSubmitting(false);
    }
  }

  async function handleDelete(row: Transaction) {
    if (!row.id) return;
    const ok = window.confirm(
      `Hapus transaksi dengan ID "${row.id}" dari data?`
    );
    if (!ok) return;

    try {
      setSubmitting(true);
      const res = await fetch(`/api/transaksi?id=${row.id}`, {
        method: "DELETE",
      });
      const json: ApiResponse<{ id: number }> = await res.json();
      if (!json.success) {
        console.error(json.message);
      }
      await load();
    } catch (error) {
      console.error("Failed to delete transaksi", error);
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="space-y-6">
      <header className="flex flex-col gap-1">
        <h1 className="text-lg font-semibold text-slate-900">
          Kelola Transaksi dan Keuangan
        </h1>
        <p className="text-xs text-slate-500">
          Pantau alur pemasukan dan pengeluaran transaksi Dasasena.
        </p>
      </header>

      <DataTable<Transaction>
        title="Daftar Transaksi"
        columns={columns}
        data={rows}
        loading={loading}
        filterPlaceholder="Cari berdasarkan kategori..."
        filterKeys={["kategori", "jenis_transaksi"]}
        onAdd={openCreate}
        onView={openView}
        onEdit={openEdit}
        onDelete={handleDelete}
      />

      {modalMode && (
        <div className="fixed inset-0 z-40 flex items-center justify-center bg-slate-900/40 px-4 py-8">
          <div className="max-h-[90vh] w-full max-w-2xl overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-2xl">
            <div className="border-b border-slate-200 bg-slate-50/80 px-6 py-3">
              <h2 className="text-sm font-semibold text-slate-800">
                {modalMode === "view" && "Detail Transaksi"}
                {modalMode === "create" && "Tambah Transaksi"}
                {modalMode === "edit" && "Edit Data Transaksi"}
              </h2>
            </div>

            <div className="space-y-4 overflow-y-auto px-6 py-4 text-xs text-black">
              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                <div className="space-y-1">
                  <label className="font-medium text-black">
                    ID Transaksi
                  </label>
                  <input
                    type="text"
                    value={selected?.id ?? "-"}
                    disabled
                    className="h-9 rounded-md border border-slate-300 bg-slate-100 px-3 text-xs text-black outline-none"
                  />
                </div>
                <div className="space-y-1">
                  <label className="font-medium text-black">
                    Jenis / Kategori
                  </label>
                  <input
                    type="text"
                    value={
                      modalMode === "view"
                        ? (selected?.kategori ??
                            selected?.jenis_transaksi ??
                            "") ?? ""
                        : form.kategori
                    }
                    onChange={(e) =>
                      modalMode !== "view" &&
                      setForm((f) => ({ ...f, kategori: e.target.value }))
                    }
                    disabled={modalMode === "view"}
                    className="h-9 rounded-md border border-slate-300 bg-white px-3 text-xs text-black outline-none placeholder:text-slate-500 disabled:bg-slate-100"
                    placeholder="Pemasukan / Pengeluaran"
                  />
                </div>
                <div className="space-y-1">
                  <label className="font-medium text-black">
                    Tanggal / Waktu
                  </label>
                  <input
                    type="text"
                    value={
                      modalMode === "view"
                        ? (selected?.tanggal_transaksi ??
                            selected?.tanggal ??
                            selected?.["tanggal_waktu"] ??
                            "") ?? ""
                        : form.tanggal
                    }
                    onChange={(e) =>
                      modalMode !== "view" &&
                      setForm((f) => ({ ...f, tanggal: e.target.value }))
                    }
                    disabled={modalMode === "view"}
                    className="h-9 rounded-md border border-slate-300 bg-white px-3 text-xs text-black outline-none placeholder:text-slate-500 disabled:bg-slate-100"
                    placeholder="2025-11-20 / 15:00"
                  />
                </div>
                <div className="space-y-1">
                  <label className="font-medium text-black">
                    Nominal (Rp)
                  </label>
                  <input
                    type="number"
                    value={
                      modalMode === "view"
                        ? selected?.nominal ?? ""
                        : form.nominal
                    }
                    onChange={(e) =>
                      modalMode !== "view" &&
                      setForm((f) => ({ ...f, nominal: e.target.value }))
                    }
                    disabled={modalMode === "view"}
                    className="h-9 rounded-md border border-slate-300 bg-white px-3 text-xs text-black outline-none placeholder:text-slate-500 disabled:bg-slate-100"
                    placeholder="Masukkan nominal"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="font-medium text-black">
                  Detail Transaksi
                </label>
                <textarea
                  rows={4}
                  value={
                    modalMode === "view"
                      ? (selected?.["detail"] ??
                          selected?.["deskripsi"] ??
                          "") ?? ""
                      : form.keterangan
                  }
                  onChange={(e) =>
                    modalMode !== "view" &&
                    setForm((f) => ({ ...f, keterangan: e.target.value }))
                  }
                  disabled={modalMode === "view"}
                  className="w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-xs text-black outline-none placeholder:text-slate-500 disabled:bg-slate-100"
                  placeholder="Catatan atau deskripsi transaksi..."
                />
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 border-t border-slate-200 bg-slate-50/80 px-6 py-3">
              <button
                type="button"
                onClick={() => setModalMode(null)}
                className="rounded-md bg-slate-200 px-4 py-1.5 text-xs font-medium text-slate-700 hover:bg-slate-300"
              >
                Tutup
              </button>
              {modalMode === "view" && (
                <>
                  <button
                    type="button"
                    onClick={() => selected && openEdit(selected)}
                    className="rounded-md bg-emerald-600 px-4 py-1.5 text-xs font-medium text-white hover:bg-emerald-700"
                  >
                    Edit Data
                  </button>
                  <button
                    type="button"
                    onClick={() => selected && handleDelete(selected)}
                    className="rounded-md bg-rose-600 px-4 py-1.5 text-xs font-medium text-white hover:bg-rose-700"
                  >
                    Hapus
                  </button>
                </>
              )}
              {(modalMode === "create" || modalMode === "edit") && (
                <button
                  type="button"
                  onClick={handleSubmit}
                  disabled={submitting}
                  className="rounded-md bg-emerald-700 px-5 py-1.5 text-xs font-medium text-white shadow-sm hover:bg-emerald-800 disabled:cursor-not-allowed disabled:opacity-70"
                >
                  {submitting
                    ? "Menyimpan..."
                    : modalMode === "create"
                    ? "Simpan"
                    : "Perbarui"}
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

