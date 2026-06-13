import { createFileRoute, Link } from "@tanstack/react-router";
import { AppLayout } from "@/components/AppLayout";
import { useEffect, useState } from "react";
import { loadAll, type Verification } from "@/lib/storage";
import { BarChart3, CheckCircle2, Cloud, History as HistoryIcon, MapPin, QrCode, Shield } from "lucide-react";

export const Route = createFileRoute("/dashboard")({
  head: () => ({ meta: [{ title: "Dashboard — GeoProof" }] }),
  component: Dashboard,
});

function Dashboard() {
  const [list, setList] = useState<Verification[]>([]);
  useEffect(() => {
    const refresh = () => setList(loadAll());
    refresh();
    window.addEventListener("geoproof:updated", refresh);
    window.addEventListener("storage", refresh);
    return () => {
      window.removeEventListener("geoproof:updated", refresh);
      window.removeEventListener("storage", refresh);
    };
  }, []);

  const verified = list.filter((v) => v.status === "verified").length;
  const today = list.filter((v) => new Date(v.timestamp).toDateString() === new Date().toDateString()).length;

  return (
    <AppLayout>
      {/* Hero header */}
      <section className="relative overflow-hidden text-primary-foreground" style={{ background: "var(--gradient-hero)" }}>
        <div className="max-w-7xl mx-auto px-6 py-10 md:py-14 flex items-start justify-between gap-6">
          <div>
            <p className="text-sm opacity-80 font-medium">Real-time verification analytics</p>
            <h1 className="text-3xl md:text-5xl font-bold tracking-tight mt-2">GEO-PROOF DASHBOARD</h1>
          </div>
          <div className="hidden sm:flex h-16 w-16 rounded-2xl bg-white/15 items-center justify-center backdrop-blur">
            <BarChart3 className="h-8 w-8" />
          </div>
        </div>
      </section>

      <div className="max-w-7xl mx-auto px-4 -mt-8 space-y-6">
        {/* Stat cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          <StatCard icon={<CheckCircle2 className="h-5 w-5 text-success" />} value={String(verified)} label="Verified Total" />
          <StatCard icon={<Cloud className="h-5 w-5 text-primary" />} value="Active" label="Cloud Sync" />
          <StatCard icon={<QrCode className="h-5 w-5 text-primary" />} value={String(list.length)} label="QR Scans" />
          <StatCard icon={<HistoryIcon className="h-5 w-5 text-primary" />} value={String(today)} label="Today's Captures" />
        </div>

        {/* Security Status */}
        <div className="rounded-2xl border border-border bg-card p-5 shadow-[var(--shadow-card)]">
          <h2 className="text-primary font-bold tracking-wide">SECURITY STATUS</h2>
          <div className="mt-4 space-y-3">
            <StatusRow icon={<Shield className="h-5 w-5" />} label="Anti-Tamper Protection" status="Enabled" />
            <StatusRow icon={<MapPin className="h-5 w-5" />} label="GPS Encryption" status="Active" />
            <StatusRow icon={<QrCode className="h-5 w-5" />} label="QR Digital Signature" status="Secure" />
          </div>
        </div>

        {/* Recent */}
        <div>
          <h2 className="font-bold text-foreground mb-3">RECENT VERIFICATIONS</h2>
          <div className="space-y-2">
            {list.length === 0 && (
              <div className="rounded-2xl border border-dashed border-border bg-card/50 p-6 text-center text-sm text-muted-foreground">
                No verifications yet. <Link to="/capture" className="text-primary font-medium">Capture your first image →</Link>
              </div>
            )}
            {list.slice(0, 5).map((v) => (
              <Link
                key={v.id}
                to="/v/$id"
                params={{ id: v.id }}
                className="flex items-center gap-3 rounded-2xl border border-border bg-card p-3 hover:shadow-[var(--shadow-card)] transition"
              >
                <div className="h-12 w-12 rounded-xl bg-primary/10 flex items-center justify-center">
                  <HistoryIcon className="h-5 w-5 text-primary" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-semibold truncate">{v.address || "Unknown location"}</p>
                  <p className="text-xs text-muted-foreground">{new Date(v.timestamp).toLocaleString()}</p>
                </div>
                <span className="text-primary font-mono font-semibold text-sm">#{v.shortId}</span>
              </Link>
            ))}
          </div>
        </div>
      </div>
    </AppLayout>
  );
}

function StatCard({ icon, value, label }: { icon: React.ReactNode; value: string; label: string }) {
  return (
    <div className="rounded-2xl bg-card border border-border p-4 shadow-[var(--shadow-card)]">
      <div className="mb-2">{icon}</div>
      <p className="text-2xl md:text-3xl font-bold tracking-tight">{value}</p>
      <p className="text-xs text-muted-foreground mt-0.5">{label}</p>
    </div>
  );
}

function StatusRow({ icon, label, status }: { icon: React.ReactNode; label: string; status: string }) {
  return (
    <div className="flex items-center justify-between">
      <div className="flex items-center gap-3">
        <span className="text-foreground/70">{icon}</span>
        <span className="font-medium">{label}</span>
      </div>
      <span className="font-semibold text-success">{status}</span>
    </div>
  );
}