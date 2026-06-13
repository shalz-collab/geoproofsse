import { createFileRoute } from "@tanstack/react-router";
import { Link } from "@tanstack/react-router";
import { ArrowRight, ShieldCheck, MapPin, QrCode, Camera, Sparkles, Lock } from "lucide-react";
import logoAsset from "@/assets/geoproof-logo.jpeg.asset.json";
import bgAsset from "@/assets/simats-bg.jpg.asset.json";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "GeoProof — Capture. Verify. Trust." },
      { name: "description", content: "AI-Powered Geo-Tagged Image Verification Platform by SIMATS Engineering." },
      { property: "og:title", content: "GeoProof" },
      { property: "og:description", content: "AI-Powered Geo-Tagged Image Verification." },
    ],
  }),
  component: Index,
});

function Index() {
  return (
    <div className="min-h-screen relative overflow-hidden text-white" style={{ background: "#0f1b2d" }}>
      {/* SIMATS building background */}
      <div className="absolute inset-0 -z-10">
        <img src={bgAsset.url} alt="" className="w-full h-full object-cover opacity-25" />
        <div className="absolute inset-0" style={{ background: "linear-gradient(180deg, rgba(15,27,45,0.92) 0%, rgba(15,27,45,0.78) 35%, rgba(15,27,45,0.55) 100%)" }} />
      </div>

      {/* Top nav */}
      <header className="relative z-10">
        <div className="max-w-7xl mx-auto px-6 md:px-10 h-20 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-3">
            <img src={logoAsset.url} alt="GeoProof" className="h-11 w-11 rounded-full object-cover ring-2 ring-white/20" />
            <span className="text-xl md:text-2xl font-bold tracking-tight">GeoProof</span>
          </Link>
          <nav className="hidden md:flex items-center gap-10 text-sm font-medium text-white/80">
            <a href="#features" className="hover:text-white transition">Features</a>
            <a href="#security" className="hover:text-white transition">Security</a>
            <a href="#contact" className="hover:text-white transition">Contact</a>
          </nav>
          <Link
            to="/capture"
            className="rounded-full bg-white/10 hover:bg-white/20 backdrop-blur border border-white/15 px-5 py-2 text-sm font-semibold transition"
          >
            Get started
          </Link>
        </div>
      </header>

      {/* Hero */}
      <section className="relative z-10 max-w-7xl mx-auto px-6 md:px-10 pt-10 md:pt-20 pb-24">
        <div className="inline-flex items-center gap-2 rounded-full bg-white/8 border border-white/15 backdrop-blur px-4 py-2 text-xs md:text-sm font-medium">
          <Sparkles className="h-4 w-4 text-emerald-400" />
          AI-powered evidence intelligence
        </div>

        <h1 className="mt-8 font-bold tracking-tight leading-[0.95] text-5xl md:text-7xl lg:text-8xl max-w-5xl">
          <span className="block text-white">Every image.</span>
          <span className="block text-emerald-400">Proven in place.</span>
        </h1>

        <p className="mt-8 max-w-2xl text-base md:text-lg text-white/70 leading-relaxed">
          GeoProof transforms ordinary image uploads into verifiable digital evidence—combining
          GPS, metadata, timestamps, QR signatures, hashes, and AI tamper detection.
        </p>

        <div className="mt-10 flex flex-wrap items-center gap-4">
          <Link
            to="/capture"
            className="inline-flex items-center gap-2 rounded-full bg-emerald-500 hover:bg-emerald-400 text-slate-950 px-6 py-3.5 text-sm font-bold shadow-[0_10px_40px_-10px_rgba(16,185,129,0.6)] transition"
          >
            Capture evidence <ArrowRight className="h-4 w-4" />
          </Link>
          <Link
            to="/dashboard"
            className="inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/5 backdrop-blur px-6 py-3.5 text-sm font-semibold hover:bg-white/10 transition"
          >
            View dashboard
          </Link>
        </div>

        <p className="mt-14 text-xs font-bold tracking-[0.4em] text-white/60">
          CAPTURE. VERIFY. TRUST.
        </p>
      </section>

      {/* Features */}
      <section id="features" className="relative z-10 max-w-7xl mx-auto px-6 md:px-10 pb-20">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            { icon: Camera, label: "Live Capture", desc: "Real-time GPS-stamped photos" },
            { icon: MapPin, label: "GPS Proof", desc: "Reverse-geocoded coordinates" },
            { icon: QrCode, label: "QR Signed", desc: "Tamper-evident signatures" },
            { icon: ShieldCheck, label: "AI Tamper Check", desc: "Hash + metadata integrity" },
          ].map((f) => (
            <div key={f.label} className="rounded-2xl border border-white/10 bg-white/5 backdrop-blur p-5">
              <f.icon className="h-6 w-6 text-emerald-400" />
              <p className="mt-3 font-semibold">{f.label}</p>
              <p className="text-xs text-white/60 mt-1">{f.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Security + Contact */}
      <section id="security" className="relative z-10 max-w-7xl mx-auto px-6 md:px-10 pb-20 grid md:grid-cols-2 gap-6">
        <div className="rounded-3xl border border-white/10 bg-white/5 backdrop-blur p-8">
          <Lock className="h-7 w-7 text-emerald-400" />
          <h2 className="text-2xl font-bold mt-4">Security-first architecture</h2>
          <p className="mt-3 text-sm text-white/70 leading-relaxed">
            SHA-256 fingerprints, on-device hashing, signed QR payloads and audit-ready records.
            Every capture is bound to its location, time and device signature.
          </p>
        </div>
        <div id="contact" className="rounded-3xl border border-white/10 bg-white/5 backdrop-blur p-8">
          <ShieldCheck className="h-7 w-7 text-emerald-400" />
          <h2 className="text-2xl font-bold mt-4">Built at SIMATS Engineering</h2>
          <p className="mt-3 text-sm text-white/70 leading-relaxed">
            A research initiative for verifiable geo-tagged imaging. Contact the team for pilots,
            integrations or institutional deployments.
          </p>
        </div>
      </section>

      <footer className="relative z-10 border-t border-white/10">
        <div className="max-w-7xl mx-auto px-6 md:px-10 py-6 text-xs text-white/50 flex flex-wrap items-center justify-between gap-3">
          <span>© 2026 SIMATS ENGINEERING</span>
          <span>Disclaimer · Privacy Policy</span>
        </div>
      </footer>
    </div>
  );
}
