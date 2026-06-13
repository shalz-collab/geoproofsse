import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { AppLayout } from "@/components/AppLayout";
import { useEffect, useRef, useState } from "react";
import { Html5Qrcode } from "html5-qrcode";
import { ArrowLeft, Image as ImageIcon } from "lucide-react";
import { findVerification } from "@/lib/storage";

export const Route = createFileRoute("/scan")({
  head: () => ({ meta: [{ title: "QR Scan — GeoProof" }] }),
  component: ScanPage,
});

function ScanPage() {
  const containerId = "qr-reader";
  const [error, setError] = useState<string | null>(null);
  const scannerRef = useRef<Html5Qrcode | null>(null);
  const nav = useNavigate();

  function handleDecoded(text: string) {
    let id = text.trim();
    try {
      const parsed = JSON.parse(text);
      if (parsed?.id) id = parsed.id;
    } catch {}
    const found = findVerification(id);
    if (found) {
      nav({ to: "/v/$id", params: { id: found.id } });
    } else {
      setError(`Decoded "${id}" but no record found locally.`);
    }
  }

  useEffect(() => {
    const scanner = new Html5Qrcode(containerId, { verbose: false });
    scannerRef.current = scanner;
    scanner
      .start(
        { facingMode: "environment" },
        { fps: 10, qrbox: { width: 250, height: 250 } },
        (decoded) => {
          scanner.stop().catch(() => {});
          handleDecoded(decoded);
        },
        () => {},
      )
      .catch(() => setError("Camera unavailable. Use upload below."));
    return () => {
      scanner.stop().catch(() => {});
      scanner.clear();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function onUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file || !scannerRef.current) return;
    try {
      await scannerRef.current.stop().catch(() => {});
      const res = await scannerRef.current.scanFile(file, false);
      handleDecoded(res);
    } catch {
      setError("Could not read QR from this image.");
    }
  }

  return (
    <AppLayout>
      <div className="bg-primary text-primary-foreground">
        <div className="max-w-3xl mx-auto px-4 h-14 flex items-center gap-3">
          <button onClick={() => history.back()} className="p-1"><ArrowLeft className="h-5 w-5" /></button>
          <h1 className="text-lg font-bold flex-1 text-center pr-8">QR Verification Scan</h1>
        </div>
      </div>

      <div className="max-w-2xl mx-auto px-4 py-4 space-y-4">
        <div id={containerId} className="w-full rounded-2xl overflow-hidden bg-black aspect-[3/4] md:aspect-video" />
        <p className="text-center text-sm text-muted-foreground">Align the QR code within the frame</p>

        <label className="block">
          <div className="rounded-xl bg-success text-success-foreground py-3 px-4 flex items-center justify-center gap-2 font-semibold cursor-pointer hover:opacity-95">
            <ImageIcon className="h-5 w-5" /> Select from Gallery
          </div>
          <input type="file" accept="image/*" className="hidden" onChange={onUpload} />
        </label>

        {error && <p className="text-center text-sm text-destructive">{error}</p>}
      </div>
    </AppLayout>
  );
}