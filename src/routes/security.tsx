import { createFileRoute } from "@tanstack/react-router";
import { AppLayout } from "@/components/AppLayout";
import { Shield, Lock, MapPin, QrCode, Cloud, Activity } from "lucide-react";

export const Route = createFileRoute("/security")({
  head: () => ({ meta: [{ title: "Security — GeoProof" }] }),
  component: SecurityPage,
});

const items = [
  { icon: Shield, label: "Anti-Tamper Protection", status: "Enabled" },
  { icon: MapPin, label: "GPS Security", status: "Active" },
  { icon: QrCode, label: "Digital Signature", status: "Secure" },
  { icon: Lock, label: "AES-256 Encryption", status: "Enabled" },
  { icon: Activity, label: "Hash Validation (SHA-256)", status: "Active" },
  { icon: Cloud, label: "Cloud Sync", status: "Active" },
];

function SecurityPage() {
  return (
    <AppLayout>
      <section className="text-primary-foreground" style={{ background: "var(--gradient-hero)" }}>
        <div className="max-w-5xl mx-auto px-6 py-10">
          <p className="text-sm opacity-80 font-medium">System integrity</p>
          <h1 className="text-3xl md:text-4xl font-bold">SECURITY CENTER</h1>
          <div className="mt-6 grid grid-cols-2 gap-3 max-w-md">
            <div className="rounded-2xl bg-white/15 backdrop-blur p-4">
              <p className="text-xs opacity-80">Security Score</p>
              <p className="text-3xl font-bold">98<span className="text-base">/100</span></p>
            </div>
            <div className="rounded-2xl bg-white/15 backdrop-blur p-4">
              <p className="text-xs opacity-80">Risk Level</p>
              <p className="text-3xl font-bold">Low</p>
            </div>
          </div>
        </div>
      </section>

      <div className="max-w-5xl mx-auto px-4 py-6 grid md:grid-cols-2 gap-3">
        {items.map(({ icon: Icon, label, status }) => (
          <div key={label} className="flex items-center justify-between rounded-2xl border border-border bg-card p-4">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary">
                <Icon className="h-5 w-5" />
              </div>
              <span className="font-medium">{label}</span>
            </div>
            <span className="font-semibold text-success">{status}</span>
          </div>
        ))}
      </div>
    </AppLayout>
  );
}