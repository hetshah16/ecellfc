import pool from "@/lib/db"

export async function POST(req) {
  try {
    const {
      page_key,
      is_enabled,
      down_message,
      opens_at,
      closes_at,
      updated_by
    } = await req.json()

    await pool.query(
      `
      UPDATE page_settings
      SET
        is_enabled = ?,
        down_message = ?,
        opens_at = ?,
        closes_at = ?,
        updated_by = ?
      WHERE page_key = ?
      `,
      [
        is_enabled,
        down_message || null,
        opens_at || null,
        closes_at || null,
        updated_by,
        page_key
      ]
    )

    return new Response(
      JSON.stringify({ success: true }),
      { status: 200 }
    )
  } catch (err) {
    console.error("page-settings update error", err)
    return new Response(
      JSON.stringify({ error: "Server error" }),
      { status: 500 }
    )
  }
}
