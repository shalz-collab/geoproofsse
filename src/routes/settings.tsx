import { createFileRoute } from "@tanstack/react-router";
import { AppLayout } from "@/components/AppLayout";
import { useEffect, useState } from "react";
import { Moon, Sun, Bell, Globe, Trash2 } from "lucide-react";
import { saveAll } from "@/lib/storage";

export const Route = createFileRoute("/settings")({
  head: () => ({ meta: [{ title: "Settings — GeoProof" }] }),
  component: SettingsPage,
});

function SettingsPage() {
  const [dark, setDark] = useState(false);
  const [notif, setNotif] = useState(true);

  useEffect(() => {
    const d = localStorage.getItem("geoproof.dark") === "1";
    setDark(d);
    document.documentElement.classList.toggle("dark", d);
  }, []);

  function toggleDark() {
    const v = !dark;
    setDark(v);
    localStorage.setItem("geoproof.dark", v ? "1" : "0");
    document.documentElement.classList.toggle("dark", v);
  }

  function clearAll() {
    if (confirm("Delete all captures from this device?")) {
      saveAll([]);
    }
  }

  return (
    <AppLayout>
      <div className="max-w-2xl mx-auto px-4 py-6 space-y-4">
        <h1 className="text-2xl font-bold">Settings</h1>

        <Row icon={dark ? <Moon className="h-5 w-5" /> : <Sun className="h-5 w-5" />} label="Dark Mode" desc="Toggle theme">
          <Switch checked={dark} onChange={toggleDark} />
        </Row>
        <Row icon={<Bell className="h-5 w-5" />} label="Notifications" desc="Verification alerts">
          <Switch checked={notif} onChange={() => setNotif((v) => !v)} />
        </Row>
        <Row icon={<Globe className="h-5 w-5" />} label="Language" desc="English (US)">
          <span className="text-sm text-muted-foreground">EN</span>
        </Row>

        <button
          onClick={clearAll}
          className="w-full mt-4 rounded-2xl border border-destructive/30 bg-destructive/5 text-destructive p-4 flex items-center justify-center gap-2 font-semibold hover:bg-destructive/10"
        >
          <Trash2 className="h-5 w-5" /> Clear All Local Captures
        </button>

        <p className="text-center text-xs text-muted-foreground pt-6">
          2026 © SIMATS ENGINEERING
        </p>
      </div>
    </AppLayout>
  );
}

function Row({ icon, label, desc, children }: { icon: React.ReactNode; label: string; desc: string; children: React.ReactNode }) {
  return (
    <div className="flex items-center justify-between rounded-2xl border border-border bg-card p-4">
      <div className="flex items-center gap-3">
        <div className="h-10 w-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary">{icon}</div>
        <div>
          <p className="font-semibold">{label}</p>
          <p className="text-xs text-muted-foreground">{desc}</p>
        </div>
      </div>
      {children}
    </div>
  );
}

function Switch({ checked, onChange }: { checked: boolean; onChange: () => void }) {
  return (
    <button
      onClick={onChange}
      className={`relative h-6 w-11 rounded-full transition ${checked ? "bg-primary" : "bg-muted"}`}
      aria-pressed={checked}
    >
      <span className={`absolute top-0.5 h-5 w-5 rounded-full bg-white shadow transition ${checked ? "left-[22px]" : "left-0.5"}`} />
    </button>
  );
}