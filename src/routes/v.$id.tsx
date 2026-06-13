import { createFileRoute, Link } from "@tanstack/react-router";
import { AppLayout } from "@/components/AppLayout";
import { useEffect, useState } from "react";
import { findVerification, type Verification } from "@/lib/storage";
import { ArrowLeft, MapPin, Calendar, Hash, ShieldCheck, Download, Share2 } from "lucide-react";

export const Route = createFileRoute("/v/$id")({
  head: () => ({ meta: [{ title: "Verification Details — GeoProof" }] }),
  component: DetailPage,
  notFoundComponent: () => (
    <AppLayout>
      <div className="p-10 text-center text-muted-foreground">Verification not found.</div>
    </AppLayout>
  ),
});

function DetailPage() {
  const { id } = Route.useParams();
  const [v, setV] = useState<Verification | null>(null);

  useEffect(() => {
    setV(findVerification(id) ?? null);
  }, [id]);

  if (!v) {
    return (
      <AppLayout>
        <div className="p-10 text-center text-muted-foreground">
          Verification not found on this device.
          <div className="mt-4"><Link to="/history" className="text-primary font-medium">Back to history →</Link></div>
        </div>
      </AppLayout>
    );
  }

  const mapEmbed = v.lat != null && v.lng != null
    ? `https://www.openstreetmap.org/export/embed.html?bbox=${v.lng - 0.005},${v.lat - 0.003},${v.lng + 0.005},${v.lat + 0.003}&layer=mapnik&marker=${v.lat},${v.lng}`
    : null;

  async function share() {
    const url = location.href;
    if (navigator.share) {
      try { await navigator.share({ title: "GeoProof", text: `Verification ${v!.shortId}`, url }); return; } catch {}
    }
    await navigator.clipboard.writeText(url);
    alert("Link copied!");
  }

  async function downloadQrWithDetails() {
    if (!v) return;
    const W = 900;
    const H = 1280;
    const c = document.createElement("canvas");
    c.width = W;
    c.height = H;
    const ctx = c.getContext("2d")!;
    // Background
    ctx.fillStyle = "#0f1b2d";
    ctx.fillRect(0, 0, W, H);
    ctx.fillStyle = "#ffffff";
    ctx.fillRect(30, 30, W - 60, H - 60);

    // Header band
    ctx.fillStyle = "#0f1b2d";
    ctx.fillRect(30, 30, W - 60, 110);
    ctx.fillStyle = "#34d399";
    ctx.font = "bold 42px system-ui, sans-serif";
    ctx.fillText("GeoProof", 60, 95);
    ctx.fillStyle = "#ffffff";
    ctx.font = "600 18px system-ui, sans-serif";
    ctx.fillText(`Verification #${v.shortId}`, 60, 122);
    ctx.textAlign = "right";
    ctx.font = "500 16px system-ui, sans-serif";
    ctx.fillText("CAPTURE. VERIFY. TRUST.", W - 60, 110);
    ctx.textAlign = "left";

    // Captured photo
    const img = new Image();
    img.crossOrigin = "anonymous";
    await new Promise<void>((res, rej) => {
      img.onload = () => res();
      img.onerror = () => rej();
      img.src = v.imageDataUrl;
    });
    const photoW = W - 120;
    const photoH = 420;
    const ratio = Math.min(photoW / img.width, photoH / img.height);
    const pw = img.width * ratio;
    const ph = img.height * ratio;
    const px = 60 + (photoW - pw) / 2;
    const py = 170;
    ctx.fillStyle = "#e5e7eb";
    ctx.fillRect(60, py, photoW, photoH);
    ctx.drawImage(img, px, py, pw, ph);

    // Details
    const detailsTop = py + photoH + 30;
    ctx.fillStyle = "#0f1b2d";
    ctx.font = "bold 22px system-ui, sans-serif";
    ctx.fillText("Verification Details", 60, detailsTop);

    const lines: [string, string][] = [
      ["Status", `${v.status.toUpperCase()} • ${v.confidence}% confidence`],
      ["Location", v.address],
      ["GPS", v.lat != null ? `${v.lat.toFixed(6)}, ${v.lng?.toFixed(6)} (±${v.accuracy?.toFixed(1) ?? "?"} m)` : "Unavailable"],
      ["Captured", new Date(v.timestamp).toLocaleString()],
      ["Device", v.device],
      ["SHA-256", v.hash],
      ["ID", v.id],
    ];
    let y = detailsTop + 30;
    ctx.font = "600 14px system-ui, sans-serif";
    const wrap = (text: string, max: number) => {
      const words = text.split(" ");
      const out: string[] = [];
      let cur = "";
      for (const w of words) {
        const t = cur ? cur + " " + w : w;
        if (ctx.measureText(t).width > max) {
          if (cur) out.push(cur);
          cur = w;
        } else cur = t;
      }
      if (cur) out.push(cur);
      return out;
    };
    for (const [label, value] of lines) {
      ctx.fillStyle = "#64748b";
      ctx.font = "600 12px system-ui, sans-serif";
      ctx.fillText(label.toUpperCase(), 60, y);
      ctx.fillStyle = "#0f1b2d";
      ctx.font = label === "SHA-256" || label === "ID" ? "500 11px ui-monospace, monospace" : "500 14px system-ui, sans-serif";
      const parts = wrap(value, W - 120 - 230);
      parts.forEach((p, i) => ctx.fillText(p, 60, y + 18 + i * 16));
      y += 22 + parts.length * 16;
    }

    // QR code (right side)
    if (v.qrDataUrl) {
      const qr = new Image();
      await new Promise<void>((res, rej) => {
        qr.onload = () => res();
        qr.onerror = () => rej();
        qr.src = v.qrDataUrl!;
      });
      const qrSize = 210;
      ctx.drawImage(qr, W - 60 - qrSize, detailsTop + 10, qrSize, qrSize);
      ctx.fillStyle = "#64748b";
      ctx.font = "500 11px system-ui, sans-serif";
      ctx.textAlign = "center";
      ctx.fillText("Scan to verify", W - 60 - qrSize / 2, detailsTop + 10 + qrSize + 16);
      ctx.textAlign = "left";
    }

    // Footer
    ctx.fillStyle = "#0f1b2d";
    ctx.fillRect(30, H - 80, W - 60, 50);
    ctx.fillStyle = "#ffffff";
    ctx.font = "500 12px system-ui, sans-serif";
    ctx.fillText("© 2026 SIMATS ENGINEERING • GeoProof Verification Certificate", 60, H - 50);

    const url = c.toDataURL("image/png");
    const a = document.createElement("a");
    a.href = url;
    a.download = `geoproof-qr-${v.shortId}.png`;
    a.click();
  }

  return (
    <AppLayout>
      <div className="bg-primary text-primary-foreground">
        <div className="max-w-4xl mx-auto px-4 h-14 flex items-center gap-3">
          <Link to="/history" className="p-1"><ArrowLeft className="h-5 w-5" /></Link>
          <h1 className="text-lg font-bold flex-1">Verification #{v.shortId}</h1>
          <button onClick={share} className="p-1"><Share2 className="h-5 w-5" /></button>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 py-6 grid md:grid-cols-2 gap-6">
        <div>
          <img src={v.imageDataUrl} alt="Captured" className="w-full rounded-2xl shadow-[var(--shadow-card)]" />
          <a
            href={v.imageDataUrl}
            download={`geoproof-${v.shortId}.jpg`}
            className="mt-3 w-full inline-flex items-center justify-center gap-2 rounded-xl border border-border bg-card py-2.5 font-medium hover:bg-muted"
          >
            <Download className="h-4 w-4" /> Download Image
          </a>
        </div>

        <div className="space-y-4">
          <div className="rounded-2xl bg-success/10 border border-success/30 p-4 flex items-center gap-3">
            <ShieldCheck className="h-6 w-6 text-success" />
            <div>
              <p className="font-bold text-success uppercase tracking-wide text-sm">{v.status}</p>
              <p className="text-xs text-muted-foreground">Confidence {v.confidence}%</p>
            </div>
          </div>

          <Detail icon={<MapPin className="h-4 w-4" />} label="Location" value={v.address} />
          <Detail icon={<Calendar className="h-4 w-4" />} label="Captured" value={new Date(v.timestamp).toLocaleString()} />
          {v.lat != null && (
            <Detail icon={<MapPin className="h-4 w-4" />} label="GPS" value={`${v.lat.toFixed(6)}, ${v.lng?.toFixed(6)} (±${v.accuracy?.toFixed(1)} m)`} />
          )}
          <Detail icon={<Hash className="h-4 w-4" />} label="SHA-256" value={v.hash} mono />
          <Detail icon={<Hash className="h-4 w-4" />} label="ID" value={v.id} mono />

          {v.qrDataUrl && (
            <div className="rounded-2xl border border-border bg-card p-4 flex gap-4 items-center">
              <img src={v.qrDataUrl} alt="QR" className="h-32 w-32" />
              <div>
                <p className="font-bold">Digital Signature</p>
                <p className="text-xs text-muted-foreground">Scan to verify on any device</p>
                <button onClick={downloadQrWithDetails} className="text-primary text-sm font-medium mt-2 inline-flex items-center gap-1 hover:underline">
                  <Download className="h-3.5 w-3.5" /> Download QR + Details
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {mapEmbed && (
        <div className="max-w-4xl mx-auto px-4 pb-10">
          <h2 className="font-bold mb-3">Location Map</h2>
          <iframe
            title="map"
            src={mapEmbed}
            className="w-full h-72 rounded-2xl border border-border"
          />
        </div>
      )}
    </AppLayout>
  );
}

function Detail({ icon, label, value, mono }: { icon: React.ReactNode; label: string; value: string; mono?: boolean }) {
  return (
    <div className="rounded-2xl border border-border bg-card p-4">
      <div className="flex items-center gap-2 text-xs text-muted-foreground uppercase tracking-wide font-semibold">{icon} {label}</div>
      <p className={`mt-1 ${mono ? "font-mono text-xs break-all" : "text-sm"}`}>{value}</p>
    </div>
  );
}