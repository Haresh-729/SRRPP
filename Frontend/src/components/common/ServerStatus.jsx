import { useMemo, useState } from "react";
import { IconCheck, IconRefresh, IconServer, IconX } from "@tabler/icons-react";
import { apiConnector } from "../../services/Connector.js";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:3000/api";

const getHealthUrl = () => {
  const base = API_BASE_URL.replace(/\/$/, "");
  return `${base}/v1/health`;
};

const ServerStatus = () => {
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);

  const healthUrl = useMemo(() => getHealthUrl(), []);

  const runHealthCheck = async () => {
    setLoading(true);
    setError(null);

    const startedAt = performance.now();
    try {
      const response = await apiConnector("GET", healthUrl);
      const latency = Math.round(performance.now() - startedAt);

      setResult({
        ok: true,
        statusCode: response.status,
        latency,
        data: response.data,
        checkedAt: new Date().toLocaleString("en-IN"),
      });
    } catch (err) {
      const latency = Math.round(performance.now() - startedAt);
      const statusCode = err?.response?.status || "N/A";
      const message = err?.response?.data?.message || err?.message || "Unable to connect to backend.";

      setResult({
        ok: false,
        statusCode,
        latency,
        data: err?.response?.data || null,
        checkedAt: new Date().toLocaleString("en-IN"),
      });
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-6 md:p-8 min-h-full" style={{ backgroundColor: "var(--surface-bg)" }}>
      <div className="mb-6">
        <h1 className="text-xl font-bold" style={{ color: "var(--text-main)" }}>Server Status</h1>
        <p className="text-sm mt-0.5" style={{ color: "var(--text-muted)" }}>
          Test backend connectivity using the health endpoint.
        </p>
      </div>

      <div
        className="rounded-2xl border overflow-hidden"
        style={{ backgroundColor: "var(--surface-card)", borderColor: "var(--surface-border)" }}
      >
        <div className="px-5 py-4 border-b" style={{ borderColor: "var(--surface-border)" }}>
          <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
            <div>
              <p className="text-xs uppercase tracking-wide font-semibold" style={{ color: "var(--text-muted)" }}>
                Health Endpoint
              </p>
              <p className="text-sm font-medium break-all" style={{ color: "var(--text-main)" }}>{healthUrl}</p>
            </div>

            <button
              onClick={runHealthCheck}
              disabled={loading}
              className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg text-sm font-semibold transition-all disabled:opacity-70"
              style={{
                backgroundColor: "var(--brand-primary)",
                color: "var(--text-inverse)",
              }}
            >
              <IconRefresh size={15} className={loading ? "animate-spin" : ""} />
              {loading ? "Checking..." : "Check Connectivity"}
            </button>
          </div>
        </div>

        <div className="p-5 space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            <div className="rounded-xl border p-4" style={{ borderColor: "var(--surface-border)", backgroundColor: "var(--surface-bg)" }}>
              <p className="text-xs" style={{ color: "var(--text-muted)" }}>Connection</p>
              <p className="text-base font-bold mt-1" style={{ color: result?.ok ? "var(--success)" : "var(--danger)" }}>
                {result ? (result.ok ? "Connected" : "Failed") : "Not Checked"}
              </p>
            </div>

            <div className="rounded-xl border p-4" style={{ borderColor: "var(--surface-border)", backgroundColor: "var(--surface-bg)" }}>
              <p className="text-xs" style={{ color: "var(--text-muted)" }}>Status Code</p>
              <p className="text-base font-bold mt-1" style={{ color: "var(--text-main)" }}>
                {result ? result.statusCode : "-"}
              </p>
            </div>

            <div className="rounded-xl border p-4" style={{ borderColor: "var(--surface-border)", backgroundColor: "var(--surface-bg)" }}>
              <p className="text-xs" style={{ color: "var(--text-muted)" }}>Latency</p>
              <p className="text-base font-bold mt-1" style={{ color: "var(--text-main)" }}>
                {result ? `${result.latency} ms` : "-"}
              </p>
            </div>
          </div>

          {result && (
            <div
              className="rounded-xl border p-4"
              style={{
                borderColor: result.ok ? "rgba(30,140,74,0.25)" : "rgba(229,72,77,0.25)",
                backgroundColor: result.ok ? "rgba(30,140,74,0.08)" : "rgba(229,72,77,0.08)",
              }}
            >
              <div className="flex items-start gap-2">
                {result.ok ? (
                  <IconCheck size={18} style={{ color: "var(--success)" }} className="shrink-0 mt-0.5" />
                ) : (
                  <IconX size={18} style={{ color: "var(--danger)" }} className="shrink-0 mt-0.5" />
                )}
                <div>
                  <p className="text-sm font-semibold" style={{ color: result.ok ? "var(--success)" : "var(--danger)" }}>
                    {result.ok ? "Backend is reachable" : "Backend check failed"}
                  </p>
                  <p className="text-xs mt-1" style={{ color: "var(--text-muted)" }}>
                    Checked at: {result.checkedAt}
                  </p>
                  {!result.ok && error && (
                    <p className="text-xs mt-1" style={{ color: "var(--danger)" }}>{error}</p>
                  )}
                </div>
              </div>
            </div>
          )}

          {result?.data && (
            <div>
              <p className="text-xs uppercase tracking-wide font-semibold mb-2" style={{ color: "var(--text-muted)" }}>
                Response
              </p>
              <pre
                className="rounded-xl border p-3 text-xs overflow-auto"
                style={{
                  borderColor: "var(--surface-border)",
                  backgroundColor: "var(--surface-bg)",
                  color: "var(--text-main)",
                }}
              >
                {JSON.stringify(result.data, null, 2)}
              </pre>
            </div>
          )}

          {!result && (
            <div className="rounded-xl border p-6 text-center" style={{ borderColor: "var(--surface-border)", backgroundColor: "var(--surface-bg)" }}>
              <IconServer size={24} className="mx-auto mb-2" style={{ color: "var(--text-muted)" }} />
              <p className="text-sm font-medium" style={{ color: "var(--text-main)" }}>No checks run yet</p>
              <p className="text-xs mt-1" style={{ color: "var(--text-muted)" }}>
                Click "Check Connectivity" to test your backend.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ServerStatus;