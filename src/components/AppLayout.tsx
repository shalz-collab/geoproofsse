import { Link, useRouterState } from "@tanstack/react-router";
import { Camera, LayoutDashboard, ShieldCheck, QrCode, History, Settings, Lock } from "lucide-react";
import type { ReactNode } from "react";
import logoAsset from "@/assets/geoproof-logo.jpeg.asset.json";

const nav = [
  { to: "/capture", label: "Capture", icon: Camera },
  { to: "/dashboard", label: "Stats", icon: LayoutDashboard },
  { to: "/verify", label: "Verify", icon: ShieldCheck },
  { to: "/scan", label: "Scan", icon: QrCode },
  { to: "/history", label: "History", icon: History },
  { to: "/security", label: "Security", icon: Lock },
  { to: "/settings", label: "Settings", icon: Settings },
] as const;

export function AppLayout({ children }: { children: ReactNode }) {
  const pathname = useRouterState({ select: (s) => s.location.pathname });

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <header className="sticky top-0 z-40 backdrop-blur-md bg-background/80 border-b border-border">
        <div className="max-w-7xl mx-auto px-4 h-14 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2">
            <img src={logoAsset.url} alt="GeoProof" className="h-9 w-9 rounded-full object-cover ring-2 ring-primary/20" />
            <span className="font-bold text-lg tracking-tight">
              <span className="text-primary">Geo</span>
              <span className="text-accent">Proof</span>
            </span>
          </Link>
          <nav className="hidden md:flex items-center gap-1">
            {nav.map((n) => {
              const active = pathname === n.to;
              return (
                <Link
                  key={n.to}
                  to={n.to}
                  className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                    active ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:bg-muted"
                  }`}
                >
                  {n.label}
                </Link>
              );
            })}
          </nav>
        </div>
      </header>

      <main className="flex-1 pb-24 md:pb-8">{children}</main>

      {/* Mobile bottom nav (matches Android reference) */}
      <nav className="md:hidden fixed bottom-0 inset-x-0 z-40 bg-background/95 backdrop-blur border-t border-border">
        <div className="grid grid-cols-7">
          {nav.map((n) => {
            const active = pathname === n.to;
            const Icon = n.icon;
            return (
              <Link
                key={n.to}
                to={n.to}
                className={`flex flex-col items-center justify-center gap-0.5 py-2 text-[10px] ${
                  active ? "text-primary" : "text-muted-foreground"
                }`}
              >
                <div className={`p-1.5 rounded-lg ${active ? "bg-primary/10" : ""}`}>
                  <Icon className="h-4 w-4" />
                </div>
                <span className="font-medium">{n.label}</span>
              </Link>
            );
          })}
        </div>
      </nav>
    </div>
  );
}