"use client";

import { useState, Suspense } from "react";
import { signIn } from "next-auth/react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const callbackUrl = searchParams.get("callbackUrl") || "/dashboard";

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);
    const result = await signIn("credentials", {
      email,
      password,
      redirect: false,
    });
    setLoading(false);
    if (result?.error) {
      setError("Invalid email or password. Please try again.");
    } else {
      router.push(callbackUrl);
    }
  }

  return (
    <div style={{ display: "flex", minHeight: "100vh", fontFamily: "var(--font-poppins), system-ui, sans-serif" }}>
      {/* Left panel — brand */}
      <div
        style={{
          flex: "0 0 48%",
          background: "linear-gradient(145deg, var(--dk-purple-900) 0%, var(--dk-purple-700) 55%, var(--dk-purple-500) 100%)",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          padding: "48px 56px",
          position: "relative",
          overflow: "hidden",
        }}
        className="hidden-mobile"
      >
        {/* background orb */}
        <div
          style={{
            position: "absolute",
            top: "-80px",
            right: "-80px",
            width: "400px",
            height: "400px",
            borderRadius: "50%",
            background: "rgba(255,255,255,0.06)",
            pointerEvents: "none",
          }}
        />
        <div
          style={{
            position: "absolute",
            bottom: "80px",
            left: "-60px",
            width: "280px",
            height: "280px",
            borderRadius: "50%",
            background: "rgba(255,255,255,0.04)",
            pointerEvents: "none",
          }}
        />

        {/* Logo */}
        <div>
          <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
            <div
              style={{
                width: 36,
                height: 36,
                borderRadius: 8,
                background: "rgba(255,255,255,0.15)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: 18,
              }}
            >
              📅
            </div>
            <span style={{ color: "#fff", fontWeight: 700, fontSize: 18, letterSpacing: "-0.3px" }}>
              DClaw Calendar
            </span>
          </div>
        </div>

        {/* Central content */}
        <div>
          <h1
            style={{
              color: "#fff",
              fontSize: "clamp(28px, 3vw, 40px)",
              fontWeight: 800,
              lineHeight: 1.2,
              marginBottom: 16,
              letterSpacing: "-0.5px",
            }}
          >
            Your team's time,<br />finally organized.
          </h1>
          <p style={{ color: "rgba(255,255,255,0.72)", fontSize: 15, lineHeight: 1.6, maxWidth: 340 }}>
            AI-powered scheduling, smart conflict detection, and shared calendars — built for teams that move fast.
          </p>

          {/* Feature list */}
          <div style={{ marginTop: 36, display: "flex", flexDirection: "column", gap: 14 }}>
            {[
              { icon: "⚡", text: "Instant scheduling links — no back-and-forth" },
              { icon: "🤖", text: "AI Copilot finds the perfect meeting time" },
              { icon: "📊", text: "Analytics that show where your time goes" },
            ].map(({ icon, text }) => (
              <div key={text} style={{ display: "flex", alignItems: "center", gap: 12 }}>
                <div
                  style={{
                    width: 32,
                    height: 32,
                    borderRadius: 8,
                    background: "rgba(255,255,255,0.12)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    flexShrink: 0,
                    fontSize: 15,
                  }}
                >
                  {icon}
                </div>
                <span style={{ color: "rgba(255,255,255,0.85)", fontSize: 13.5, fontWeight: 500 }}>{text}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Bottom quote */}
        <div
          style={{
            background: "rgba(255,255,255,0.08)",
            borderRadius: 12,
            padding: "20px 24px",
            border: "1px solid rgba(255,255,255,0.12)",
          }}
        >
          <p style={{ color: "rgba(255,255,255,0.85)", fontSize: 13.5, lineHeight: 1.6, margin: 0 }}>
            "DClaw Calendar cut our meeting overhead by 40%. The AI suggestions are eerily accurate."
          </p>
          <div style={{ marginTop: 12, display: "flex", alignItems: "center", gap: 10 }}>
            <div
              style={{
                width: 32,
                height: 32,
                borderRadius: "50%",
                background: "linear-gradient(135deg, var(--dk-purple-400), var(--dk-purple-300))",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: 13,
                fontWeight: 700,
                color: "var(--dk-purple-900)",
              }}
            >
              SL
            </div>
            <div>
              <div style={{ color: "#fff", fontSize: 12.5, fontWeight: 600 }}>Sarah Lee</div>
              <div style={{ color: "rgba(255,255,255,0.55)", fontSize: 11.5 }}>Head of Ops, Stripe</div>
            </div>
          </div>
        </div>
      </div>

      {/* Right panel — form */}
      <div
        style={{
          flex: 1,
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          alignItems: "center",
          background: "var(--dk-white)",
          padding: "40px 24px",
        }}
      >
        <div style={{ width: "100%", maxWidth: 400 }}>
          {/* Header */}
          <div style={{ marginBottom: 36 }}>
            <h2
              style={{
                fontSize: 26,
                fontWeight: 800,
                color: "var(--dk-ink)",
                margin: "0 0 8px",
                letterSpacing: "-0.4px",
              }}
            >
              Welcome back
            </h2>
            <p style={{ fontSize: 14, color: "var(--dk-gray-500)", margin: 0 }}>
              Don&apos;t have an account?{" "}
              <Link
                href="/register"
                style={{ color: "var(--dk-purple-700)", fontWeight: 600, textDecoration: "none" }}
              >
                Sign up free
              </Link>
            </p>
          </div>

          {/* SSO buttons */}
          <div style={{ display: "flex", flexDirection: "column", gap: 10, marginBottom: 24 }}>
            <button
              type="button"
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                gap: 10,
                width: "100%",
                padding: "11px 16px",
                border: "1.5px solid var(--dk-gray-200)",
                borderRadius: 10,
                background: "var(--dk-white)",
                cursor: "pointer",
                fontSize: 14,
                fontWeight: 500,
                color: "var(--dk-gray-700)",
                fontFamily: "inherit",
                transition: "border-color 0.15s",
              }}
              onMouseEnter={(e) => (e.currentTarget.style.borderColor = "var(--dk-purple-300)")}
              onMouseLeave={(e) => (e.currentTarget.style.borderColor = "var(--dk-gray-200)")}
            >
              <svg width="18" height="18" viewBox="0 0 24 24">
                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z"/>
                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
              </svg>
              Continue with Google
            </button>
            <button
              type="button"
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                gap: 10,
                width: "100%",
                padding: "11px 16px",
                border: "1.5px solid var(--dk-gray-200)",
                borderRadius: 10,
                background: "var(--dk-white)",
                cursor: "pointer",
                fontSize: 14,
                fontWeight: 500,
                color: "var(--dk-gray-700)",
                fontFamily: "inherit",
                transition: "border-color 0.15s",
              }}
              onMouseEnter={(e) => (e.currentTarget.style.borderColor = "var(--dk-purple-300)")}
              onMouseLeave={(e) => (e.currentTarget.style.borderColor = "var(--dk-gray-200)")}
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
                <path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0024 12c0-6.63-5.37-12-12-12z"/>
              </svg>
              Continue with GitHub
            </button>
          </div>

          {/* Divider */}
          <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 24 }}>
            <div style={{ flex: 1, height: 1, background: "var(--dk-gray-200)" }} />
            <span style={{ fontSize: 12, color: "var(--dk-gray-400)", fontWeight: 500 }}>or sign in with email</span>
            <div style={{ flex: 1, height: 1, background: "var(--dk-gray-200)" }} />
          </div>

          {/* Error */}
          {error && (
            <div
              style={{
                background: "var(--dk-danger-bg)",
                border: "1px solid #f8c4c2",
                borderRadius: 8,
                padding: "10px 14px",
                marginBottom: 20,
                fontSize: 13.5,
                color: "var(--dk-danger)",
              }}
            >
              {error}
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: 16 }}>
            <div>
              <label
                htmlFor="email"
                style={{ display: "block", fontSize: 13, fontWeight: 600, color: "var(--dk-gray-700)", marginBottom: 6 }}
              >
                Email address
              </label>
              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="alice@company.com"
                required
                style={{
                  width: "100%",
                  padding: "10px 14px",
                  border: "1.5px solid var(--dk-gray-200)",
                  borderRadius: 10,
                  fontSize: 14,
                  color: "var(--dk-ink)",
                  background: "var(--dk-white)",
                  outline: "none",
                  fontFamily: "inherit",
                  boxSizing: "border-box",
                  transition: "border-color 0.15s",
                }}
                onFocus={(e) => (e.target.style.borderColor = "var(--dk-purple-500)")}
                onBlur={(e) => (e.target.style.borderColor = "var(--dk-gray-200)")}
              />
            </div>

            <div>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 6 }}>
                <label
                  htmlFor="password"
                  style={{ fontSize: 13, fontWeight: 600, color: "var(--dk-gray-700)" }}
                >
                  Password
                </label>
                <a href="#" style={{ fontSize: 12.5, color: "var(--dk-purple-700)", textDecoration: "none", fontWeight: 500 }}>
                  Forgot password?
                </a>
              </div>
              <input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                required
                style={{
                  width: "100%",
                  padding: "10px 14px",
                  border: "1.5px solid var(--dk-gray-200)",
                  borderRadius: 10,
                  fontSize: 14,
                  color: "var(--dk-ink)",
                  background: "var(--dk-white)",
                  outline: "none",
                  fontFamily: "inherit",
                  boxSizing: "border-box",
                  transition: "border-color 0.15s",
                }}
                onFocus={(e) => (e.target.style.borderColor = "var(--dk-purple-500)")}
                onBlur={(e) => (e.target.style.borderColor = "var(--dk-gray-200)")}
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              style={{
                width: "100%",
                padding: "12px 16px",
                background: loading ? "var(--dk-purple-400)" : "var(--dk-purple-700)",
                color: "#fff",
                border: "none",
                borderRadius: 10,
                fontSize: 14.5,
                fontWeight: 700,
                cursor: loading ? "not-allowed" : "pointer",
                fontFamily: "inherit",
                letterSpacing: "0.1px",
                transition: "background 0.15s",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                gap: 8,
              }}
              onMouseEnter={(e) => { if (!loading) e.currentTarget.style.background = "var(--dk-purple-800)"; }}
              onMouseLeave={(e) => { if (!loading) e.currentTarget.style.background = "var(--dk-purple-700)"; }}
            >
              {loading ? (
                <>
                  <svg
                    width="16"
                    height="16"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2.5"
                    style={{ animation: "spin 0.8s linear infinite" }}
                  >
                    <path d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83" />
                  </svg>
                  Signing in…
                </>
              ) : (
                "Sign in"
              )}
            </button>
          </form>

          <p style={{ marginTop: 28, fontSize: 12, color: "var(--dk-gray-400)", textAlign: "center", lineHeight: 1.6 }}>
            By continuing, you agree to our{" "}
            <a href="#" style={{ color: "var(--dk-purple-600)", textDecoration: "none" }}>Terms</a>{" "}
            and{" "}
            <a href="#" style={{ color: "var(--dk-purple-600)", textDecoration: "none" }}>Privacy Policy</a>.
          </p>
        </div>
      </div>

      <style>{`
        @keyframes spin { to { transform: rotate(360deg); } }
        @media (max-width: 768px) {
          .hidden-mobile { display: none !important; }
        }
      `}</style>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense>
      <LoginForm />
    </Suspense>
  );
}
