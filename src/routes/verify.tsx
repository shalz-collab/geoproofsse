import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { AppLayout } from "@/components/AppLayout";
import { ShieldCheck, ArrowLeft } from "lucide-react";
import { useState } from "react";
import { findVerification } from "@/lib/storage";

export const Route = createFileRoute("/verify")({
  head: () => ({ meta: [{ title: "Verify — GeoProof" }] }),
  component: VerifyPage,
});

function VerifyPage() {
  const [id, setId] = useState("");
  const [err, setErr] = useState<string | null>(null);
  const nav = useNavigate();

  function submit(e: React.FormEvent) {
    e.preventDefault();
    setErr(null);
    const found = findVerification(id.trim());
    if (!found) {
      setErr("No verification found for this ID.");
      return;
    }
    nav({ to: "/v/$id", params: { id: found.id } });
  }

  return (
    <AppLayout>
      <div className="bg-primary text-primary-foreground">
        <div className="max-w-3xl mx-auto px-4 h-14 flex items-center gap-3">
          <button onClick={() => history.back()} className="p-1"><ArrowLeft className="h-5 w-5" /></button>
          <h1 className="text-lg font-bold flex-1 text-center pr-8">Verify Image</h1>
        </div>
      </div>

      <div className="max-w-md mx-auto px-6 py-10 text-center">
        <div className="mx-auto h-20 w-20 rounded-2xl bg-primary text-primary-foreground flex items-center justify-center shadow-[var(--shadow-elegant)]">
          <ShieldCheck className="h-10 w-10" />
        </div>
        <h2 className="mt-4 text-xl font-bold">Enter Verification ID to check authenticity</h2>

        <form onSubmit={submit} className="mt-6 space-y-3">
          <input
            value={id}
            onChange={(e) => setId(e.target.value)}
            placeholder="Enter Verification ID"
            className="w-full rounded-xl border border-border bg-card px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
          />
          {err && <p className="text-sm text-destructive">{err}</p>}
          <button className="w-full rounded-xl bg-primary text-primary-foreground py-3.5 font-semibold hover:opacity-95">
            Verify Now
          </button>
        </form>

        <div className="mt-10 text-left rounded-2xl border border-border bg-card p-5">
          <h3 className="font-bold">How it works?</h3>
          <ol className="mt-4 space-y-3">
            {["Enter Verification ID", "We'll check the authenticity", "View verification results"].map((s, i) => (
              <li key={s} className="flex items-center gap-3">
                <span className="h-7 w-7 rounded-full bg-primary text-primary-foreground text-sm font-bold flex items-center justify-center">{i + 1}</span>
                <span>{s}</span>
              </li>
            ))}
          </ol>
        </div>
      </div>
    </AppLayout>
  );
}