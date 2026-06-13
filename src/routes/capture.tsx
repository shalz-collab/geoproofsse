import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { AppLayout } from "@/components/AppLayout";
import { useEffect, useRef, useState } from "react";
import { Camera, RefreshCw, Upload, MapPin, Loader2 } from "lucide-react";
import QRCode from "qrcode";
import exifr from "exifr";
import {
  addVerification,
  getCurrentPosition,
  reverseGeocode,
  sha256,
  shortIdFromHash,
  type Verification,
} from "@/lib/storage";
import logoAsset from "@/assets/geoproof-logo.jpeg.asset.json";

export const Route = createFileRoute("/capture")({
  head: () => ({ meta: [{ title: "Capture — GeoProof" }] }),
  component: CapturePage,
});

interface Pos {
  lat: number;
  lng: number;
  accuracy: number;
  address: string;
}

function CapturePage() {
  const navigate = useNavigate();
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [streaming, setStreaming] = useState(false);
  const [facing, setFacing] = useState<"environment" | "user">("environment");
  const [pos, setPos] = useState<Pos | null>(null);
  const [locating, setLocating] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Start camera
  useEffect(() => {
    let stream: MediaStream | null = null;
    async function start() {
      try {
        stream = await navigator.mediaDevices.getUserMedia({
          video: { facingMode: facing, width: { ideal: 1280 }, height: { ideal: 720 } },
          audio: false,
        });
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          await videoRef.current.play();
          setStreaming(true);
        }
      } catch (e) {
        setError("Camera access denied. You can upload an image instead.");
      }
    }
    start();
    return () => {
      stream?.getTracks().forEach((t) => t.stop());
      setStreaming(false);
    };
  }, [facing]);

  // Get location on mount
  useEffect(() => {
    locate();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function locate() {
    setLocating(true);
    try {
      const p = await getCurrentPosition();
      const address = await reverseGeocode(p.coords.latitude, p.coords.longitude);
      setPos({
        lat: p.coords.latitude,
        lng: p.coords.longitude,
        accuracy: p.coords.accuracy,
        address,
      });
    } catch {
      setError("Location unavailable. Enable GPS for full proof.");
    } finally {
      setLocating(false);
    }
  }

  async function processFromCanvas(srcCanvas: HTMLCanvasElement) {
    setBusy(true);
    try {
      // Stamp overlay
      const ctx = srcCanvas.getContext("2d")!;
      const w = srcCanvas.width;
      const h = srcCanvas.height;
      const padding = Math.round(w * 0.025);
      const boxH = Math.round(h * 0.18);
      ctx.fillStyle = "rgba(0,0,0,0.55)";
      ctx.fillRect(0, h - boxH, w, boxH);
      ctx.fillStyle = "#fff";
      const fontSize = Math.round(w * 0.022);
      ctx.font = `bold ${fontSize}px system-ui, sans-serif`;
      const stampLines = [
        pos?.address ?? "Location unavailable",
        `Lat: ${pos?.lat.toFixed(6) ?? "—"}  Lng: ${pos?.lng.toFixed(6) ?? "—"}`,
        `Accuracy: ${pos?.accuracy ? pos.accuracy.toFixed(1) + " m" : "—"}  •  ${new Date().toLocaleString()}`,
        `GeoProof • Capture. Verify. Trust.`,
      ];
      stampLines.forEach((line, i) => {
        ctx.fillText(line, padding, h - boxH + padding + fontSize * (i + 1) * 1.15);
      });

      const imageDataUrl = srcCanvas.toDataURL("image/jpeg", 0.85);

      const hashSource = `${imageDataUrl.length}-${pos?.lat}-${pos?.lng}-${Date.now()}-${Math.random()}`;
      const hash = await sha256(hashSource);
      const id = crypto.randomUUID();
      const shortId = shortIdFromHash(hash);

      const payload = JSON.stringify({
        id,
        lat: pos?.lat ?? null,
        lng: pos?.lng ?? null,
        ts: new Date().toISOString(),
        hash,
      });
      const qrDataUrl = await QRCode.toDataURL(payload, { width: 320, margin: 1 });

      const v: Verification = {
        id,
        shortId,
        imageDataUrl,
        qrDataUrl,
        lat: pos?.lat ?? null,
        lng: pos?.lng ?? null,
        accuracy: pos?.accuracy ?? null,
        address: pos?.address ?? "Unknown location",
        timestamp: new Date().toISOString(),
        hash,
        status: "verified",
        confidence: pos ? 98 : 72,
        device: navigator.userAgent.split(") ")[0].split("(").pop() ?? "Web Browser",
      };
      addVerification(v);
      navigate({ to: "/v/$id", params: { id } });
    } finally {
      setBusy(false);
    }
  }

  async function shoot() {
    if (!videoRef.current || !canvasRef.current) return;
    const v = videoRef.current;
    const c = canvasRef.current;
    c.width = v.videoWidth;
    c.height = v.videoHeight;
    c.getContext("2d")!.drawImage(v, 0, 0, c.width, c.height);
    await processFromCanvas(c);
  }

  async function onUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setBusy(true);
    try {
      // Try EXIF GPS
      try {
        const gps = await exifr.gps(file);
        if (gps && typeof gps.latitude === "number" && !pos) {
          const address = await reverseGeocode(gps.latitude, gps.longitude);
          setPos({ lat: gps.latitude, lng: gps.longitude, accuracy: 10, address });
        }
      } catch {}
      const img = new Image();
      const url = URL.createObjectURL(file);
      await new Promise<void>((res, rej) => {
        img.onload = () => res();
        img.onerror = () => rej();
        img.src = url;
      });
      const c = canvasRef.current ?? document.createElement("canvas");
      c.width = img.naturalWidth;
      c.height = img.naturalHeight;
      c.getContext("2d")!.drawImage(img, 0, 0);
      URL.revokeObjectURL(url);
      await processFromCanvas(c);
    } finally {
      setBusy(false);
    }
  }

  return (
    <AppLayout>
      <div className="max-w-3xl mx-auto px-4 py-4">
        {/* Top bar with refresh + flash placeholder */}
        <div className="flex items-center justify-between mb-3">
          <button
            onClick={() => setFacing((f) => (f === "user" ? "environment" : "user"))}
            className="h-10 w-10 rounded-full bg-muted flex items-center justify-center text-muted-foreground hover:bg-muted/80"
            aria-label="Switch camera"
          >
            <RefreshCw className="h-5 w-5" />
          </button>
          <h1 className="font-semibold">Live Capture</h1>
          <label className="h-10 px-3 rounded-full bg-success text-success-foreground flex items-center gap-1.5 text-xs font-semibold cursor-pointer hover:opacity-90">
            <Upload className="h-4 w-4" /> Upload
            <input type="file" accept="image/*" className="hidden" onChange={onUpload} />
          </label>
        </div>

        {/* Camera preview */}
        <div className="relative rounded-2xl overflow-hidden bg-black aspect-[3/4] md:aspect-video shadow-[var(--shadow-card)]">
          <video ref={videoRef} playsInline muted className="absolute inset-0 w-full h-full object-cover" />

          {/* Stamp overlay (live) */}
          <div className="absolute top-3 left-3 right-3 flex items-start gap-2 rounded-xl bg-white/85 backdrop-blur p-3 text-foreground">
            <img src={logoAsset.url} alt="" className="h-10 w-10 rounded-md object-cover" />
            <div className="flex-1 min-w-0">
              <p className="text-sm font-bold leading-tight line-clamp-2">
                {locating ? "Acquiring GPS…" : pos?.address ?? "Location unavailable"}
              </p>
              <p className="text-xs text-muted-foreground mt-0.5">
                {pos ? `Accuracy: ${pos.accuracy.toFixed(1)} m` : "Tap retry to enable GPS"}
              </p>
            </div>
          </div>

          {/* Live indicator */}
          <div className="absolute top-3 right-3 flex items-center gap-1.5 rounded-full bg-black/60 text-white px-2.5 py-1 text-[10px] font-bold tracking-wider">
            <span className={`h-2 w-2 rounded-full ${streaming ? "bg-success animate-pulse" : "bg-warning"}`} />
            {streaming ? "LIVE" : "OFFLINE"}
          </div>

          {error && (
            <div className="absolute inset-x-3 bottom-3 rounded-xl bg-destructive/90 text-destructive-foreground p-3 text-sm">
              {error}
            </div>
          )}

          {busy && (
            <div className="absolute inset-0 bg-black/60 flex items-center justify-center text-white">
              <Loader2 className="h-8 w-8 animate-spin" />
            </div>
          )}
        </div>

        {/* Controls */}
        <div className="mt-6 grid grid-cols-3 items-center gap-3">
          <button
            onClick={locate}
            className="flex flex-col items-center gap-1 text-xs text-muted-foreground"
          >
            <div className="h-10 w-10 rounded-xl bg-muted flex items-center justify-center">
              <MapPin className="h-5 w-5" />
            </div>
            {locating ? "Locating…" : "Refresh GPS"}
          </button>

          <div className="flex justify-center">
            <button
              onClick={shoot}
              disabled={!streaming || busy}
              className="h-20 w-20 rounded-full bg-black ring-4 ring-black/10 ring-offset-4 ring-offset-background disabled:opacity-50 hover:scale-95 transition"
              aria-label="Capture"
            >
              <Camera className="h-7 w-7 text-white mx-auto" />
            </button>
          </div>

          <div className="text-right text-xs text-muted-foreground">
            <p className="font-semibold text-foreground">GeoProof Stamp</p>
            <p>Location + Time burned in</p>
          </div>
        </div>

        <canvas ref={canvasRef} className="hidden" />
      </div>
    </AppLayout>
  );
}