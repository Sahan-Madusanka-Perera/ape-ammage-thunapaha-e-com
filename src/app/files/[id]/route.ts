import { connection, type NextRequest } from "next/server";
import { db } from "@/lib/server/db";
import { getAdmin } from "@/lib/server/auth";

/**
 * Serves uploads stored in Postgres. Product photos and the portrait are public and immutable;
 * bank slips are visible only to the admin, or to the customer holding the order link.
 */
export async function GET(request: NextRequest, { params }: RouteContext<"/files/[id]">) {
  await connection();
  const { id } = await params;

  const upload = await db.upload.findUnique({
    where: { id },
    select: { kind: true, mime: true, data: true, order: { select: { publicToken: true } } },
  });
  if (!upload) return new Response("Not found", { status: 404 });

  if (upload.kind === "SLIP") {
    const admin = await getAdmin();
    const token = request.nextUrl.searchParams.get("t");
    if (!admin && (!token || token !== upload.order?.publicToken)) {
      return new Response("Not found", { status: 404 });
    }
    return new Response(upload.data, {
      headers: { "Content-Type": upload.mime, "Cache-Control": "private, no-store" },
    });
  }

  return new Response(upload.data, {
    headers: { "Content-Type": upload.mime, "Cache-Control": "public, max-age=31536000, immutable" },
  });
}
