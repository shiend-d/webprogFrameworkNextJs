"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
import { Loader2, LockKeyhole, ShieldCheck, User } from "lucide-react";

type LoginResponse = {
  success: boolean;
  message: string;
  error?: string;
};

export default function LoginPage() {
  const router = useRouter();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setErrorMessage("");
    setIsSubmitting(true);

    try {
      const response = await fetch("/api/auth/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ username, password }),
      });

      const result: LoginResponse = await response.json();

      if (!response.ok || !result.success) {
        const detail = result.error ? ` (${result.error})` : "";
        setErrorMessage((result.message || "Login gagal. Coba lagi.") + detail);
        return;
      }

      router.push("/dashboard");
      router.refresh();
    } catch (error) {
      console.error("Login error:", error);
      setErrorMessage("Terjadi kesalahan jaringan. Silakan coba kembali.");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div className="relative flex min-h-screen items-center justify-center overflow-hidden bg-gradient-to-br from-emerald-950 via-teal-900 to-cyan-900 px-4 py-10">
      <div className="pointer-events-none absolute inset-0 opacity-25">
        <div className="absolute -left-20 -top-20 h-72 w-72 rounded-full bg-emerald-300 blur-3xl" />
        <div className="absolute bottom-0 right-0 h-96 w-96 rounded-full bg-cyan-300 blur-3xl" />
      </div>

      <div className="relative z-10 w-full max-w-md rounded-2xl border border-white/20 bg-white/10 p-7 shadow-2xl backdrop-blur-xl sm:p-8">
        <div className="mb-8 text-center text-white">
          <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-white/20 ring-1 ring-white/30">
            <ShieldCheck className="h-7 w-7" />
          </div>
          <h1 className="text-2xl font-bold tracking-tight">Dasasena Admin</h1>
          <p className="mt-2 text-sm text-emerald-50/90">
            Masuk untuk mengelola produk, transaksi, dan operasional.
          </p>
        </div>

        <form className="space-y-4" onSubmit={handleSubmit}>
          <label className="block space-y-2">
            <span className="text-xs font-semibold uppercase tracking-wider text-emerald-100">
              Username
            </span>
            <div className="flex items-center rounded-xl border border-white/25 bg-white/15 px-3">
              <User className="h-4 w-4 text-emerald-100" />
              <input
                type="text"
                value={username}
                onChange={(event) => setUsername(event.target.value)}
                required
                autoComplete="username"
                className="w-full bg-transparent px-3 py-3 text-sm text-white placeholder:text-emerald-100/70 focus:outline-none"
                placeholder="Masukkan username"
              />
            </div>
          </label>

          <label className="block space-y-2">
            <span className="text-xs font-semibold uppercase tracking-wider text-emerald-100">
              Password
            </span>
            <div className="flex items-center rounded-xl border border-white/25 bg-white/15 px-3">
              <LockKeyhole className="h-4 w-4 text-emerald-100" />
              <input
                type="password"
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                required
                autoComplete="current-password"
                className="w-full bg-transparent px-3 py-3 text-sm text-white placeholder:text-emerald-100/70 focus:outline-none"
                placeholder="Masukkan password"
              />
            </div>
          </label>

          {errorMessage && (
            <p className="rounded-lg border border-rose-300/40 bg-rose-500/20 px-3 py-2 text-xs text-rose-100">
              {errorMessage}
            </p>
          )}

          <button
            type="submit"
            disabled={isSubmitting}
            className="mt-2 flex w-full items-center justify-center gap-2 rounded-xl bg-white px-4 py-3 text-sm font-semibold text-emerald-900 transition hover:bg-emerald-50 disabled:cursor-not-allowed disabled:opacity-70">
            {isSubmitting ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Memproses...
              </>
            ) : (
              "Masuk ke Dashboard"
            )}
          </button>
        </form>
      </div>
    </div>
  );
}
