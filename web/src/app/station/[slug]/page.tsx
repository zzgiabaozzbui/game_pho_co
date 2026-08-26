import { Suspense } from "react";
import StationFlow from "@/components/StationFlow";

export const dynamic = "force-dynamic";

function StationFallback() {
  return (
    <main className="paper-noise flex min-h-dvh flex-col items-center justify-center gap-2 bg-paper p-8 text-center text-ink-soft">
      <span className="animate-pulse text-sm">…</span>
    </main>
  );
}

async function StationContent(props: {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{ token?: string }>;
}) {
  const { slug } = await props.params;
  const { token } = await props.searchParams;
  return <StationFlow slug={slug} token={token ?? null} />;
}

export default function StationPage(props: {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{ token?: string }>;
}) {
  return (
    <Suspense fallback={<StationFallback />}>
      <StationContent params={props.params} searchParams={props.searchParams} />
    </Suspense>
  );
}
