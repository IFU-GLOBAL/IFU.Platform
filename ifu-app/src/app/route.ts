export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export function GET() {
  return new Response(null, {
    status: 307,
    headers: {
      location: "/discovery",
    },
  });
}
