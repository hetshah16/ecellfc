import pool from "@/lib/db"

export async function GET() {
  try {
    const [rows] = await pool.query(`
      SELECT 
        page_key,
        page_name,
        is_enabled,
        down_message,
        opens_at,
        closes_at,
        updated_at
      FROM page_settings
      ORDER BY page_name
    `)

    return new Response(JSON.stringify(rows), {
      status: 200,
      headers: { "Content-Type": "application/json" }
    })
  } catch (err) {
    console.error("page-settings fetch error", err)
    return new Response(
      JSON.stringify({ error: "Server error" }),
      { status: 500 }
    )
  }
}
