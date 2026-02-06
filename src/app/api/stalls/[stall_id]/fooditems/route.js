import pool from "@/lib/db";

export async function GET(req, context) {
  
  const { stall_id } = await context.params
  try {
    // Fetch stall info
    const [stalls] = await pool.execute(
      "SELECT stall_id, stall_name FROM food_stall WHERE stall_id = ?",
      [stall_id]
    );

    if (stalls.length === 0) {
      return new Response(
        JSON.stringify({ error: "Stall not found" }),
        { status: 404, headers: { "Content-Type": "application/json" } }
      );
    }

    const stall = stalls[0];

    // Fetch menu items for this stall
    const [items] = await pool.execute(
      "SELECT item_id, item_name, price FROM food_item WHERE stall_id = ?",
      [stall_id]
    );

    // Combine stall + items in one response
    const response = {
      stall_id: stall.stall_id,
      stall_name: stall.stall_name,
      items: items,
    };

    return new Response(JSON.stringify(response), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });

  } catch (err) {
    console.error("GET /api/stalls/[stall_id] error:", err);
    
    return new Response(
      JSON.stringify({ error: "Server error" }),
      { status: 500, headers: { "Content-Type": "application/json" } }
    );
  }
}
