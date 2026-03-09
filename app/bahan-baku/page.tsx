"use client";

import { useEffect, useMemo, useState } from "react";
import { DataTable, ColumnDef } from "@/components/DataTable";

type Material = {
  id?: number;
  nama?: string;
  tipe?: string;
  stok?: number;
  satuan?: string;
  harga_satuan?: number;
  [key: string]: any;
};

type ApiResponse<T> = {
  success: boolean;
  message: string;
  data: T;
};

export default function BahanBakuPage() {
  const [materials, setMaterials] = useState<Material[]>([]);
  const [loading, setLoading] = useState(false);
  const [modalMode, setModalMode] = useState<"view" | "create" | "edit" | null>(
    null
  );
  const [selected, setSelected] = useState<Material | null>(null);
  const [form, setForm] = useState({
    nama: "",
    tipe: "",
    stok: "",
    satuan: "",
    harga_satuan: "",
  });
  const [submitting, setSubmitting] = useState(false);

  const columns: ColumnDef<Material>[] = useMemo(
    () => [
      { key: "id", header: "ID Bahan Baku" },
      { key: "nama", header: "Nama Bahan Baku" }, 
      { key: "tipe", header: "Tipe" },
      {
        key: "stok",
        header: "Stok",
        align: "center",
        render: (_value, row) => {
          const qty =
            typeof row.stok === "number" ? row.stok.toString() : row.stok ?? "";
          const unit = row.satuan ?? "";
          return [qty, unit].filter(Boolean).join(" ");
        },
      },
      {
        key: "harga_satuan",
        header: "Harga (Rp)",
        align: "right",
        render: (value: number) =>
          typeof value === "number"
            ? value.toLocaleString("id-ID")
            : value ?? "-",
      },
    ],
    []
  );

  async function load() {
    try {
      setLoading(true);
      const res = await fetch("/api/bahan_baku");
      const json: ApiResponse<Material[]> = await res.json();
      if (json.success) {
        setMaterials(json.data ?? []);
      }
    } catch (error) {
      console.error("Failed to fetch bahan baku", error);
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
      nama: "",
      tipe: "",
      stok: "",
      satuan: "",
      harga_satuan: "",
    });
    setModalMode("create");
  }

  function openView(row: Material) {
    setSelected(row);
    setModalMode("view");
  }

  function openEdit(row: Material) {
    setSelected(row);
    setForm({
      nama: String(row.nama ?? ""),
      tipe: String(row.tipe ?? ""),
      stok: row.stok != null ? String(row.stok) : "",
      satuan: String(row.satuan ?? ""),
      harga_satuan:
        row.harga_satuan != null ? String(row.harga_satuan) : "",
    });
    setModalMode("edit");
  }

  async function handleSubmit() {
    if (!modalMode || modalMode === "view") return;

    const payload: Material = {
      nama: form.nama,
      tipe: form.tipe,
      stok: form.stok ? Number(form.stok) : undefined,
      satuan: form.satuan || undefined,
      harga_satuan: form.harga_satuan
        ? Number(form.harga_satuan)
        : undefined,
    };

    try {
      setSubmitting(true);
      const isEdit = modalMode === "edit" && selected?.id != null;
      const url = isEdit
        ? `/api/bahan_baku?id=${selected?.id}`
        : "/api/bahan_baku";
      const method = isEdit ? "PUT" : "POST";

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const json: ApiResponse<Material> = await res.json();
      if (!json.success) {
        console.error(json.message);
      }
      await load();
      setModalMode(null);
    } catch (error) {
      console.error("Failed to submit bahan baku", error);
    } finally {
      setSubmitting(false);
    }
  }

  async function handleDelete(row: Material) {
    if (!row.id) return;
    const ok = window.confirm(
      `Hapus bahan baku "${row.nama ?? row.id}" dari data?`
    );
    if (!ok) return;

    try {
      setSubmitting(true);
      const res = await fetch(`/api/bahan_baku?id=${row.id}`, {
        method: "DELETE",
      });
      const json: ApiResponse<{ id: number }> = await res.json();
      if (!json.success) {
        console.error(json.message);
      }
      await load();
    } catch (error) {
      console.error("Failed to delete bahan baku", error);
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="space-y-6">
      <header className="flex flex-col gap-1">
        <h1 className="text-lg font-semibold text-slate-900">
          Kelola Stok &amp; Bahan Baku
        </h1>
        <p className="text-xs text-slate-500">
          Pantau dan kelola ketersediaan bahan baku untuk produksi.
        </p>
      </header>

      <DataTable<Material>
        title="Daftar Bahan Baku"
        columns={columns}
        data={materials}
        loading={loading}
        filterPlaceholder="Cari tipe atau nama bahan..."
        filterKeys={["tipe", "nama"]}
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
                {modalMode === "view" && "Detail Bahan Baku"}
                {modalMode === "create" && "Tambah Bahan Baku"}
                {modalMode === "edit" && "Edit Data Bahan Baku"}
              </h2>
            </div>

            <div className="space-y-4 overflow-y-auto px-6 py-4 text-xs text-black">
              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                <div className="space-y-1">
                  <label className="font-medium text-black">
                    ID Bahan Baku
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
                    Nama Bahan Baku
                  </label>
                  <input
                    type="text"
                    value={
                      modalMode === "view" ? selected?.nama ?? "" : form.nama
                    }
                    onChange={(e) =>
                      modalMode !== "view" &&
                      setForm((f) => ({ ...f, nama: e.target.value }))
                    }
                    disabled={modalMode === "view"}
                    className="h-9 rounded-md border border-slate-300 bg-white px-3 text-xs text-black outline-none placeholder:text-slate-500 disabled:bg-slate-100"
                    placeholder="Masukkan nama bahan"
                  />
                </div>
                <div className="space-y-1">
                  <label className="font-medium text-black">Tipe</label>
                  <input
                    type="text"
                    value={
                      modalMode === "view" ? selected?.tipe ?? "" : form.tipe
                    }
                    onChange={(e) =>
                      modalMode !== "view" &&
                      setForm((f) => ({ ...f, tipe: e.target.value }))
                    }
                    disabled={modalMode === "view"}
                    className="h-9 rounded-md border border-slate-300 bg-white px-3 text-xs text-black outline-none placeholder:text-slate-500 disabled:bg-slate-100"
                    placeholder="Contoh: Cyan"
                  />
                </div>
                <div className="space-y-1">
                  <label className="font-medium text-black">Stok</label>
                  <input
                    type="number"
                    value={
                      modalMode === "view" ? selected?.stok ?? "" : form.stok
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
                <div className="space-y-1">
                  <label className="font-medium text-black">Satuan</label>
                  <input
                    type="text"
                    value={
                      modalMode === "view"
                        ? selected?.satuan ?? ""
                        : form.satuan
                    }
                    onChange={(e) =>
                      modalMode !== "view" &&
                      setForm((f) => ({ ...f, satuan: e.target.value }))
                    }
                    disabled={modalMode === "view"}
                    className="h-9 rounded-md border border-slate-300 bg-white px-3 text-xs text-black outline-none placeholder:text-slate-500 disabled:bg-slate-100"
                    placeholder="Contoh: ml, pcs, lembar"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="font-medium text-black">
                  Harga (Rp)
                </label>
                <input
                  type="number"
                  value={
                    modalMode === "view"
                      ? selected?.harga_satuan ?? ""
                      : form.harga_satuan
                  }
                  onChange={(e) =>
                    modalMode !== "view" &&
                    setForm((f) => ({ ...f, harga_satuan: e.target.value }))
                  }
                  disabled={modalMode === "view"}
                  className="h-9 w-full rounded-md border border-slate-300 bg-white px-3 text-xs text-black outline-none placeholder:text-slate-500 disabled:bg-slate-100"
                  placeholder="Masukkan harga satuan"
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

