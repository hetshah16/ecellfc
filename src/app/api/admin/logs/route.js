// src/app/api/admin/logs/route.js
import pool from "@/lib/db";


function parseIntOrDefault(v, d) {
  const n = parseInt(v, 10);
  return Number.isNaN(n) ? d : n;
}

const ALLOWED_SORT_FIELDS = ["recharge_id", "receiver_id", "method", "amount", "timestamp"];

export async function GET(req) {
  try {
    const url = new URL(req.url);
    const params = url.searchParams;

    // Query params
    const q = (params.get("q") || "").trim(); // general search (we'll use for receiver_id or method/amount)
    const filterReceiver = (params.get("receiver_id") || "").trim(); // exact or partial receiver id search
    const method = (params.get("method") || "").trim(); // method filter
    const dateFrom = params.get("date_from") || null;
    const dateTo = params.get("date_to") || null;
    const page = Math.max(1, parseIntOrDefault(params.get("page"), 1));
    const pageSize = Math.max(1, parseIntOrDefault(params.get("pageSize"), 20));

    const sortParam = params.get("sort") || "timestamp:desc";
    const [sortFieldRaw, sortDirRaw] = sortParam.split(":");
    const sortField = ALLOWED_SORT_FIELDS.includes(sortFieldRaw) ? sortFieldRaw : "timestamp";
    const sortDir = (sortDirRaw && sortDirRaw.toLowerCase() === "asc") ? "ASC" : "DESC";

    const offset = Math.max(0, (page - 1) * pageSize);

    // Build WHERE clause
    const whereParts = [];
    const values = [];

    // q: let it match receiver_id or method or amount or id text
    if (q) {
      const maybeNum = Number(q);
      if (!Number.isNaN(maybeNum)) {
        // search numeric parts as exact or partial
        whereParts.push("(CAST(recharge_id AS CHAR) LIKE ? OR CAST(receiver_id AS CHAR) LIKE ? OR method LIKE ? OR CAST(amount AS CHAR) LIKE ?)");
        const like = `%${q}%`;
        values.push(like, like, like, like);
      } else {
        whereParts.push("(method LIKE ? OR CAST(recharge_id AS CHAR) LIKE ? OR CAST(receiver_id AS CHAR) LIKE ?)");
        const like = `%${q}%`;
        values.push(like, like, like);
      }
    }

    // explicit receiver_id filter (exact or partial)
    if (filterReceiver) {
      // allow partial match: treat input as substring
      whereParts.push("CAST(receiver_id AS CHAR) LIKE ?");
      values.push(`%${filterReceiver}%`);
    }

    if (method) {
      whereParts.push("method = ?");
      values.push(method);
    }

    if (dateFrom) {
      whereParts.push("timestamp >= ?");
      values.push(`${dateFrom} 00:00:00`);
    }
    if (dateTo) {
      whereParts.push("timestamp <= ?");
      values.push(`${dateTo} 23:59:59`);
    }

    const whereSql = whereParts.length ? `WHERE ${whereParts.join(" AND ")}` : "";

    // total count
    const countSql = `SELECT COUNT(1) AS total FROM recharge_log ${whereSql}`;
    const [countRows] = await pool.execute(countSql, values);
    const total = countRows?.[0]?.total || 0;

    // get distinct methods for dropdown
    const [methodRows] = await pool.execute("SELECT DISTINCT method FROM recharge_log ORDER BY method ASC");

    // main query: embed validated LIMIT/OFFSET numbers directly
    const sql = `SELECT * FROM recharge_log ${whereSql} ORDER BY ${sortField} ${sortDir} `;
    const [rows] = await pool.execute(sql, values);

    return new Response(JSON.stringify({
      ok: true,
      total,
      rows,
      methods: methodRows.map(r => r.method).filter(Boolean)
    }), { status: 200 });
  } catch (err) {
    console.error("GET /api/admin/logs error:", err);
    return new Response(JSON.stringify({ error: "Server error" }), { status: 500 });
  }
}
