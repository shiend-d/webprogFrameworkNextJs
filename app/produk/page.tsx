"use client";

import { useEffect, useMemo, useState } from "react";
import { DataTable, ColumnDef } from "@/components/DataTable";

type Product = {
  id?: number;
  nama?: string;
  harga?: number;
  stok?: number;
  deskripsi?: string;
  status_stok?: string;
  [key: string]: any;
};

type ApiResponse<T> = {
  success: boolean;
  message: string;
  data: T;
};

type ModalMode = "view" | "create" | "edit" | null;

export default function ProdukPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(false);
  const [modalMode, setModalMode] = useState<ModalMode>(null);
  const [selected, setSelected] = useState<Product | null>(null);
  const [form, setForm] = useState({
    nama: "",
    harga: "",
    stok: "",
    deskripsi: "",
  });
  const [submitting, setSubmitting] = useState(false);

  const columns: ColumnDef<Product>[] = useMemo(
    () => [
      { key: "id", header: "ID Produk", align: "left" },
      { key: "nama", header: "Nama Produk", align: "left" },
      {
        key: "harga",
        header: "Harga Produk (Rp)",
        align: "right",
        render: (value: number) =>
          typeof value === "number"
            ? value.toLocaleString("id-ID")
            : (value ?? "-"),
      },
      {
        key: "stok",
        header: "Jumlah Stok",
        align: "center",
      },
    ],
    [],
  );

  async function fetchProducts() {
    try {
      setLoading(true);
      const res = await fetch("/api/produk");
      const json: ApiResponse<Product[]> = await res.json();
      if (json.success) {
        setProducts(
          (json.data ?? []).map((row) => ({
            ...row,
            status_stok:
              typeof row.stok === "number" && row.stok > 0
                ? "Tersedia"
                : "Habis",
          })),
        );
      } else {
        console.error(json.message);
      }
    } catch (error) {
      console.error("Failed to fetch produk", error);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchProducts();
  }, []);

  function openCreate() {
    setSelected(null);
    setForm({
      nama: "",
      harga: "",
      stok: "",
      deskripsi: "",
    });
    setModalMode("create");
  }

  function openView(row: Product) {
    setSelected(row);
    setModalMode("view");
  }

  function openEdit(row: Product) {
    setSelected(row);
    setForm({
      nama: String(row.nama ?? ""),
      harga: row.harga != null ? String(row.harga) : "",
      stok: row.stok != null ? String(row.stok) : "",
      deskripsi: String(row.deskripsi ?? ""),
    });
    setModalMode("edit");
  }

  async function handleSubmit() {
    if (!modalMode || modalMode === "view") return;

    const payload: Product = {
      nama: form.nama,
      harga: form.harga ? Number(form.harga) : undefined,
      stok: form.stok ? Number(form.stok) : undefined,
      deskripsi: form.deskripsi,
    };

    try {
      setSubmitting(true);
      const isEdit = modalMode === "edit" && selected?.id != null;
      const url = isEdit ? `/api/produk?id=${selected?.id}` : "/api/produk";
      const method = isEdit ? "PUT" : "POST";

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const json: ApiResponse<Product> = await res.json();
      if (!json.success) {
        console.error(json.message);
      }
      await fetchProducts();
      setModalMode(null);
    } catch (error) {
      console.error("Failed to submit produk", error);
    } finally {
      setSubmitting(false);
    }
  }

  async function handleDelete(row: Product) {
    if (!row.id) return;
    const confirmed = window.confirm(
      `Hapus produk "${row.nama ?? row.id}" dari data?`,
    );
    if (!confirmed) return;

    try {
      setSubmitting(true);
      const res = await fetch(`/api/produk?id=${row.id}`, { method: "DELETE" });
      const json: ApiResponse<{ id: number }> = await res.json();
      if (!json.success) {
        console.error(json.message);
      }
      await fetchProducts();
    } catch (error) {
      console.error("Failed to delete produk", error);
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="space-y-6">
      <header className="flex flex-col gap-1">
        <h1 className="text-lg font-semibold text-slate-800">Kelola Produk</h1>
        <p className="text-xs text-slate-500">
          Atur katalog produk Dasasena: tambah, ubah, dan kelola stok produk.
        </p>
      </header>

      <DataTable<Product>
        title="Daftar Produk"
        columns={columns}
        data={products}
        loading={loading}
        filterPlaceholder="Cari nama produk..."
        filterKeys={["nama"]}
        filterableColumns={[{ key: "status_stok", label: "Status Stok" }]}
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
                {modalMode === "view" && "Detail Produk"}
                {modalMode === "create" && "Tambah Produk"}
                {modalMode === "edit" && "Edit Data Produk"}
              </h2>
            </div>

            <div className="space-y-4 overflow-y-auto px-6 py-4 text-xs text-black">
              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                <div className="space-y-1">
                  <label className="font-medium text-black">ID Produk</label>
                  <input
                    type="text"
                    value={selected?.id ?? "-"}
                    disabled
                    className="h-9 rounded-md border border-slate-300 bg-slate-100 px-3 text-xs text-black outline-none"
                  />
                </div>
                <div className="space-y-1">
                  <label className="font-medium text-black">Nama Produk</label>
                  <input
                    type="text"
                    value={
                      modalMode === "view" ? (selected?.nama ?? "") : form.nama
                    }
                    onChange={(e) =>
                      modalMode !== "view" &&
                      setForm((f) => ({ ...f, nama: e.target.value }))
                    }
                    disabled={modalMode === "view"}
                    className="h-9 rounded-md border border-slate-300 bg-white px-3 text-xs text-black outline-none placeholder:text-slate-500 disabled:bg-slate-100"
                    placeholder="Masukkan nama produk"
                  />
                </div>
                <div className="space-y-1">
                  <label className="font-medium text-black">
                    Harga Produk (Rp)
                  </label>
                  <input
                    type="number"
                    value={
                      modalMode === "view"
                        ? (selected?.harga ?? "")
                        : (form.harga ?? "")
                    }
                    onChange={(e) =>
                      modalMode !== "view" &&
                      setForm((f) => ({ ...f, harga: e.target.value }))
                    }
                    disabled={modalMode === "view"}
                    className="h-9 rounded-md border border-slate-300 bg-white px-3 text-xs text-black outline-none placeholder:text-slate-500 disabled:bg-slate-100"
                    placeholder="Masukkan harga"
                  />
                </div>
                <div className="space-y-1">
                  <label className="font-medium text-black">Stok</label>
                  <input
                    type="number"
                    value={
                      modalMode === "view"
                        ? (selected?.stok ?? "")
                        : (form.stok ?? "")
                    }
                    onChange={(e) =>
                      modalMode !== "view" &&
                      setForm((f) => ({ ...f, stok: e.target.value }))
                    }
                    disabled={modalMode === "view"}
                    className="h-9 rounded-md border border-slate-300 bg-white px-3 text-xs text-black outline-none placeholder:text-slate-500 disabled:bg-slate-100"
                    placeholder="Masukkan stok"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="font-medium text-black">Detail Produk</label>
                <textarea
                  rows={4}
                  value={
                    modalMode === "view"
                      ? (selected?.deskripsi ?? "")
                      : (form.deskripsi ?? "")
                  }
                  onChange={(e) =>
                    modalMode !== "view" &&
                    setForm((f) => ({ ...f, deskripsi: e.target.value }))
                  }
                  disabled={modalMode === "view"}
                  className="w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-xs text-black outline-none placeholder:text-slate-500 disabled:bg-slate-100"
                  placeholder="Masukkan detail atau spesifikasi produk..."
                />
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 border-t border-slate-200 bg-slate-50/80 px-6 py-3">
              <button
                type="button"
                onClick={() => setModalMode(null)}
                className="rounded-md bg-slate-200 px-4 py-1.5 text-xs font-medium text-slate-700 hover:bg-slate-300">
                Tutup
              </button>
              {modalMode === "view" && (
                <>
                  <button
                    type="button"
                    onClick={() => {
                      if (selected) openEdit(selected);
                    }}
                    className="rounded-md bg-emerald-600 px-4 py-1.5 text-xs font-medium text-white hover:bg-emerald-700">
                    Edit Data
                  </button>
                  <button
                    type="button"
                    onClick={() => selected && handleDelete(selected)}
                    className="rounded-md bg-rose-500 px-4 py-1.5 text-xs font-medium text-white hover:bg-rose-600">
                    Hapus
                  </button>
                </>
              )}
              {(modalMode === "create" || modalMode === "edit") && (
                <button
                  type="button"
                  onClick={handleSubmit}
                  disabled={submitting}
                  className="rounded-md bg-emerald-700 px-5 py-1.5 text-xs font-medium text-white shadow-sm hover:bg-emerald-800 disabled:cursor-not-allowed disabled:opacity-70">
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
