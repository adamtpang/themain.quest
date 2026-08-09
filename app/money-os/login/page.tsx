"use client";

import { useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";

function LoginForm() {
  const router = useRouter();
  const params = useSearchParams();
  const next = params.get("next") || "/money-os";
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");
    const res = await fetch("/api/money-os-auth", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ password, next }),
    });
    const data = await res.json();
    setLoading(false);
    if (!res.ok) {
      setError(data.error || "Wrong password");
      return;
    }
    router.push(data.next);
    router.refresh();
  }

  return (
    <div
      style={{
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: "1.5rem",
      }}
    >
      <form
        onSubmit={handleSubmit}
        style={{
          background: "var(--paper)",
          border: "3px solid var(--ink)",
          borderRadius: "12px",
          padding: "2rem",
          width: "100%",
          maxWidth: "340px",
          boxShadow: "6px 6px 0 var(--ink)",
        }}
      >
        <p style={{ fontSize: "13px", letterSpacing: "0.08em", textTransform: "uppercase", opacity: 0.6, marginBottom: "0.4rem" }}>
          money os
        </p>
        <h1 style={{ fontSize: "20px", fontWeight: 700, marginBottom: "1.25rem" }}>Locked</h1>
        <input
          type="password"
          autoFocus
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="password"
          style={{
            width: "100%",
            padding: "0.65rem 0.8rem",
            border: "2px solid var(--ink)",
            borderRadius: "8px",
            marginBottom: "0.9rem",
            fontSize: "16px",
            background: "#fff",
            color: "var(--ink)",
          }}
        />
        {error && (
          <p style={{ color: "#b03a2e", fontSize: "13px", marginBottom: "0.9rem" }}>{error}</p>
        )}
        <button
          type="submit"
          disabled={loading}
          style={{
            width: "100%",
            padding: "0.65rem",
            background: "var(--ink)",
            color: "var(--paper)",
            border: "none",
            borderRadius: "8px",
            fontWeight: 700,
            cursor: "pointer",
          }}
        >
          {loading ? "..." : "enter"}
        </button>
      </form>
    </div>
  );
}

export default function MoneyOSLoginPage() {
  return (
    <Suspense fallback={null}>
      <LoginForm />
    </Suspense>
  );
}
