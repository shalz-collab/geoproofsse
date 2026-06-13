import { createFileRoute, Link } from "@tanstack/react-router";
import { AppLayout } from "@/components/AppLayout";
import { useEffect, useState } from "react";
import { loadAll, type Verification } from "@/lib/storage";
import { ArrowRight, MapPin, Share2 } from "lucide-react";

export const Route = createFileRoute("/history")({
  head: () => ({ meta: [{ title: "History — GeoProof" }] }),
  component: HistoryPage,
});

function HistoryPage() {
  const [list, setList] = useState<Verification[]>([]);
  const [q, setQ] = useState("");
  useEffect(() => {
    const refresh = () => setList(loadAll());
    refresh();
    window.addEventListener("geoproof:updated", refresh);
    return () => window.removeEventListener("geoproof:updated", refresh);
  }, []);

  const filtered = list.filter((v) =>
    !q ? true : (v.address + v.id + v.shortId).toLowerCase().includes(q.toLowerCase()),
  );

  async function share(v: Verification) {
    const url = `${location.origin}/v/${v.id}`;
    if (navigator.share) {
      try { await navigator.share({ title: "GeoProof", text: `Verification ${v.shortId}`, url }); return; } catch {}
    }
    await navigator.clipboard.writeText(url);
    alert("Link copied!");
  }

  return (
    <AppLayout>
      <div className="max-w-4xl mx-auto px-4 py-6">
        <h1 className="text-3xl md:text-4xl font-extrabold tracking-tight">VERIFIED CAPTURES</h1>
        <p className="text-muted-foreground">Historical logs stored on device</p>

        <input
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="Search by location or ID…"
          className="mt-4 w-full rounded-xl border border-border bg-card px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
        />

        <div className="mt-4 space-y-3">
          {filtered.length === 0 && (
            <p className="text-center text-muted-foreground py-12">No captures yet.</p>
          )}
          {filtered.map((v) => (
            <div key={v.id} className="rounded-2xl border border-border bg-card p-3 flex items-center gap-3">
              <img src={v.imageDataUrl} alt="" className="h-16 w-16 rounded-lg object-cover" />
              <div className="flex-1 min-w-0">
                <p className="font-bold font-mono text-sm truncate">{v.id}</p>
                <p className="text-xs text-muted-foreground">{new Date(v.timestamp).toLocaleString()}</p>
                <p className="text-xs text-warning flex items-center gap-1 mt-1 truncate"><MapPin className="h-3 w-3" /> {v.address}</p>
              </div>
              <button onClick={() => share(v)} className="p-2 text-primary"><Share2 className="h-5 w-5" /></button>
              <Link to="/v/$id" params={{ id: v.id }} className="p-2"><ArrowRight className="h-5 w-5" /></Link>
            </div>
          ))}
        </div>
      </div>
    </AppLayout>
  );
}