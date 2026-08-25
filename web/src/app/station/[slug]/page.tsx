import StationFlow from "@/components/StationFlow";

export const dynamic = "force-dynamic";

export default async function StationPage(props: {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{ token?: string }>;
}) {
  const { slug } = await props.params;
  const { token } = await props.searchParams;
  return <StationFlow slug={slug} token={token ?? null} />;
}
