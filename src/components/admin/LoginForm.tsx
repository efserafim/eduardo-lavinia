"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createBrowserSupabase } from "@/lib/supabase/client";

export function LoginForm() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const supabase = createBrowserSupabase();
      const { error: signError } = await supabase.auth.signInWithPassword({
        email: email.trim(),
        password,
      });

      if (signError) {
        setError(
          signError.message === "Invalid login credentials"
            ? "E-mail ou senha incorretos."
            : signError.message
        );
        setLoading(false);
        return;
      }

      router.refresh();
    } catch {
      setError("Não foi possível entrar. Tente novamente.");
      setLoading(false);
    }
  }

  return (
    <form onSubmit={onSubmit} className="admin-panel mx-auto w-full max-w-sm space-y-5">
      <div>
        <label className="label" htmlFor="email">
          E-mail
        </label>
        <input
          id="email"
          type="email"
          className="field"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="voces@email.com"
          required
          autoFocus
          autoComplete="email"
        />
      </div>
      <div>
        <div className="mb-2 flex items-center justify-between gap-3">
          <label className="label !mb-0" htmlFor="password">
            Senha
          </label>
          <button
            type="button"
            className="text-[0.7rem] tracking-wide text-ink-faint uppercase transition hover:text-marsala"
            onClick={() => setShowPassword((v) => !v)}
          >
            {showPassword ? "Ocultar" : "Mostrar"}
          </button>
        </div>
        <input
          id="password"
          type={showPassword ? "text" : "password"}
          className="field"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
          autoComplete="current-password"
        />
      </div>
      {error && (
        <p role="alert" className="text-sm text-marsala">
          {error}
        </p>
      )}
      <button type="submit" className="btn-primary w-full" disabled={loading}>
        {loading ? "Entrando…" : "Entrar"}
      </button>
    </form>
  );
}
