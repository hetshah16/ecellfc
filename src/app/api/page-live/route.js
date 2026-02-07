import pool from "@/lib/db";

export async function GET(req) {
  try {
    const { searchParams } = new URL(req.url);
    const pageKey = searchParams.get("key");

    if (!pageKey) {
      return new Response(
        JSON.stringify({ error: "page key required" }),
        { status: 400 }
      );
    }

    const [rows] = await pool.execute(
      `
      SELECT
        is_enabled,
        down_message,
        (
          is_enabled = 1
          AND (opens_at IS NULL OR opens_at <= NOW())
          AND (closes_at IS NULL OR closes_at > NOW())
        ) AS is_live
      FROM page_settings
      WHERE page_key = ?
      LIMIT 1
      `,
      [pageKey]
    );

    if (rows.length === 0) {
      return new Response(
        JSON.stringify({
          is_live: false,
          down_message: "Page not available"
        }),
        { status: 200 }
      );
    }

    return new Response(
      JSON.stringify(rows[0]),
      { status: 200, headers: { "Content-Type": "application/json" } }
    );
  } catch (err) {
    console.error("page-live error", err);
    return new Response(
      JSON.stringify({ error: "Server error" }),
      { status: 500 }
    );
  }
}
