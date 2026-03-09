"use client";

import { useMemo, useState } from "react";
import { Search, SlidersHorizontal, Eye, Pencil, Trash2, Plus } from "lucide-react";

export type ColumnDef<T> = {
  key: keyof T;
  header: string;
  align?: "left" | "center" | "right";
  render?: (value: any, row: T) => React.ReactNode;
};

type DataTableProps<T> = {
  title: string;
  columns: ColumnDef<T>[];
  data: T[];
  loading?: boolean;
  filterPlaceholder?: string;
  filterKeys?: (keyof T)[];
  onAdd?: () => void;
  onView?: (row: T) => void;
  onEdit?: (row: T) => void;
  onDelete?: (row: T) => void;
};

export function DataTable<T extends { id?: number | string }>({
  title,
  columns,
  data,
  loading,
  filterPlaceholder = "Cari data...",
  filterKeys,
  onAdd,
  onView,
  onEdit,
  onDelete,
}: DataTableProps<T>) {
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const pageSize = 10;

  const filtered = useMemo(() => {
    if (!search.trim()) return data;
    const q = search.toLowerCase();
    return data.filter((row) => {
      const entries = filterKeys && filterKeys.length > 0
        ? filterKeys.map((key) => row[key])
        : Object.values(row ?? {});
      return entries.some((value) =>
        String(value ?? "").toLowerCase().includes(q)
      );
    });
  }, [data, search, filterKeys]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / pageSize));
  const currentPage = Math.min(page, totalPages);
  const pageData = filtered.slice(
    (currentPage - 1) * pageSize,
    currentPage * pageSize
  );

  return (
    <section className="rounded-xl border border-slate-200 bg-white shadow-sm">
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 px-4 py-4 md:px-6">
        <div>
          <h2 className="text-sm font-semibold text-slate-800">{title}</h2>
          <p className="text-xs text-slate-500">
            Menampilkan {filtered.length} data{" "}
            {filtered.length !== data.length && `(difilter dari ${data.length})`}
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <div className="flex items-center rounded-full border border-slate-300 bg-slate-50 px-3 py-1.5 text-sm text-slate-700">
            <Search className="mr-2 h-3.5 w-3.5 text-slate-400" />
            <input
              type="text"
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setPage(1);
              }}
              placeholder={filterPlaceholder}
              className="w-32 bg-transparent text-sm text-black outline-none placeholder:text-slate-500 md:w-40"
            />
            {search && (
              <button
                type="button"
                onClick={() => {
                  setSearch("");
                  setPage(1);
                }}
                className="ml-2 text-xs font-medium text-slate-500 hover:text-slate-700"
              >
                Hapus
              </button>
            )}
          </div>
          <button
            type="button"
            className="flex items-center gap-1 rounded-full border border-emerald-700 bg-emerald-700 px-4 py-1.5 text-sm font-medium text-white shadow-sm hover:bg-emerald-800"
            onClick={onAdd}
          >
            <Plus className="h-3.5 w-3.5" />
            <span>Tambah Data</span>
          </button>
          <button
            type="button"
            className="flex items-center gap-1 rounded-full border border-slate-200 bg-white px-4 py-1.5 text-sm font-medium text-slate-600 shadow-sm hover:border-emerald-500 hover:text-emerald-700"
          >
            <SlidersHorizontal className="h-3.5 w-3.5" />
            <span>Filter</span>
          </button>
        </div>
      </div>

      <div className="w-full overflow-x-auto">
        <table className="min-w-full border-t border-slate-100 text-sm">
          <thead className="bg-[#005b4f] text-[12px] uppercase tracking-wide text-emerald-50">
            <tr>
              <th className="whitespace-nowrap border-b border-emerald-900/40 px-4 py-2.5 text-center">
                No
              </th>
              {columns.map((col) => (
                <th
                  key={String(col.key)}
                  className={`whitespace-nowrap border-b border-emerald-900/40 px-4 py-2.5 ${
                    col.align === "right"
                      ? "text-right"
                      : col.align === "center"
                      ? "text-center"
                      : "text-left"
                  }`}
                >
                  {col.header}
                </th>
              ))}
              <th className="whitespace-nowrap border-b border-emerald-900/40 px-4 py-2 text-center">
                Aksi
              </th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td
                  colSpan={columns.length + 2}
                  className="px-4 py-8 text-center text-sm text-slate-500"
                >
                  Memuat data...
                </td>
              </tr>
            ) : pageData.length === 0 ? (
              <tr>
                <td
                  colSpan={columns.length + 2}
                  className="px-4 py-8 text-center text-sm text-slate-500"
                >
                  Tidak ada data yang ditampilkan.
                </td>
              </tr>
            ) : (
              pageData.map((row, index) => (
                <tr
                  key={(row.id as string | number | undefined) ?? index}
                  className={index % 2 === 0 ? "bg-white" : "bg-slate-50/60"}
                >
                  <td className="border-b border-slate-100 px-4 py-2.5 text-center text-xs text-slate-600">
                    {(currentPage - 1) * pageSize + index + 1}
                  </td>
                  {columns.map((col) => {
                    const align =
                      col.align === "right"
                        ? "text-right"
                        : col.align === "center"
                        ? "text-center"
                        : "text-left";
                    const value = row[col.key];
                    return (
                      <td
                        key={String(col.key)}
                        className={`border-b border-slate-100 px-4 py-2.5 text-xs text-slate-800 ${align}`}
                      >
                        {col.render ? col.render(value, row) : String(value ?? "-")}
                      </td>
                    );
                  })}
                  <td className="border-b border-slate-100 px-4 py-2 text-center">
                    <div className="flex items-center justify-center gap-2">
                      <button
                        type="button"
                        className="flex h-8 w-8 items-center justify-center rounded-md bg-emerald-50 text-emerald-700 hover:bg-emerald-100"
                        onClick={() => onView?.(row)}
                      >
                        <Eye className="h-3.5 w-3.5" />
                      </button>
                      <button
                        type="button"
                        className="flex h-8 w-8 items-center justify-center rounded-md bg-sky-50 text-sky-700 hover:bg-sky-100"
                        onClick={() => onEdit?.(row)}
                      >
                        <Pencil className="h-3.5 w-3.5" />
                      </button>
                      <button
                        type="button"
                        className="flex h-8 w-8 items-center justify-center rounded-md bg-rose-50 text-rose-700 hover:bg-rose-100"
                        onClick={() => onDelete?.(row)}
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      <div className="flex items-center justify-between gap-3 border-t border-slate-100 px-4 py-3 text-xs text-slate-500 md:px-6">
        <span>
          Halaman {currentPage} dari {totalPages}
        </span>
        <div className="flex items-center gap-1">
          {Array.from({ length: totalPages }).map((_, i) => {
            const pageNumber = i + 1;
            const active = pageNumber === currentPage;
            return (
              <button
                key={pageNumber}
                type="button"
                onClick={() => setPage(pageNumber)}
                className={`h-8 min-w-8 rounded-md border px-2 text-xs ${
                  active
                    ? "border-emerald-700 bg-emerald-700 text-white"
                    : "border-slate-200 bg-white text-slate-600 hover:border-emerald-500 hover:text-emerald-700"
                }`}
              >
                {pageNumber}
              </button>
            );
          })}
        </div>
      </div>
    </section>
  );
}

