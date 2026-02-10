import pool from "@/lib/db";
import { verifyToken1 } from "@/lib/jwt"; // your token verification function

function parseIntOrDefault(v, d) {
  const n = parseInt(v, 10);
  return Number.isNaN(n) ? d : n;
}

const ALLOWED_SORT_FIELDS = [
  "recharge_id",
  "receiver_id",
  "method",
  "amount",
  "timestamp",
];

export async function GET(req) {

  try {
    const token = req.cookies.get("token")?.value;
    if (!token) {
      return NextResponse.json(
        { error: "Not authenticated" },
        { status: 401 }
      );
    }

    const payload = verifyToken1(token);
    if (!payload) {
      return NextResponse.json(
        { error: "Session expired. Please log in again." },
        { status: 401 }
      );
    }
    const url = new URL(req.url);
    const params = url.searchParams;

    // filters
    const q = (params.get("q") || "").trim();
    const filterReceiver = (params.get("receiver_id") || "").trim();
    const method = (params.get("method") || "").trim();
    const dateFrom = params.get("date_from");
    const dateTo = params.get("date_to");

    // pagination
    const page = Math.max(1, parseIntOrDefault(params.get("page"), 1));
    const pageSize = Math.max(1, parseIntOrDefault(params.get("pageSize"), 20));
    const offset = (page - 1) * pageSize;

    // sorting
    const sortParam = params.get("sort") || "timestamp:desc";
    const [sortFieldRaw, sortDirRaw] = sortParam.split(":");
    const sortField = ALLOWED_SORT_FIELDS.includes(sortFieldRaw)
      ? sortFieldRaw
      : "timestamp";
    const sortDir = sortDirRaw === "asc" ? "ASC" : "DESC";

    const whereParts = [];
    const values = [];

    // search
    if (q) {
      const like = `%${q}%`;
      whereParts.push(
        `(CAST(recharge_id AS CHAR) LIKE ?
          OR CAST(receiver_id AS CHAR) LIKE ?
          OR method LIKE ?
          OR CAST(amount AS CHAR) LIKE ?)`
      );
      values.push(like, like, like, like);
    }

    if (filterReceiver) {
      whereParts.push("CAST(receiver_id AS CHAR) LIKE ?");
      values.push(`%${filterReceiver}%`);
    }

    if (method) {
      whereParts.push("method = ?");
      values.push(method);
    }

    // 🔥 TIME FILTER (expects UTC ISO from frontend)
    // DB is IST → convert filter UTC → IST for comparison
    if (dateFrom) {
      whereParts.push(
        "timestamp >= CONVERT_TZ(?, '+00:00', '+05:30')"
      );
      values.push(dateFrom);
    }

    if (dateTo) {
      whereParts.push(
        "timestamp <= CONVERT_TZ(?, '+00:00', '+05:30')"
      );
      values.push(dateTo);
    }

    const whereSql = whereParts.length
      ? `WHERE ${whereParts.join(" AND ")}`
      : "";

    // total count
    const countSql = `
      SELECT COUNT(*) AS total
      FROM recharge_log
      ${whereSql}
    `;
    const [countRows] = await pool.execute(countSql, values);
    const total = countRows[0]?.total || 0;

    // 🔥 MAIN QUERY
    // Convert IST → UTC before sending to frontend
    const dataSql = `
      SELECT
        recharge_id,
        receiver_id,
        receiver_name,
        receiver_email,
        method,
        amount,
        timestamp,
      FROM recharge_log
      ${whereSql}
      ORDER BY ${sortField} ${sortDir}
      LIMIT ${pageSize} OFFSET ${offset}
    `;
    const [rows] = await pool.execute(dataSql, values);

    // methods dropdown
    const [methodRows] = await pool.execute(
      "SELECT DISTINCT method FROM recharge_log ORDER BY method ASC"
    );

    return new Response(
      JSON.stringify({
        ok: true,
        total,
        rows,
        methods: methodRows.map((r) => r.method).filter(Boolean),
      }),
      { status: 200 }
    );
  } catch (err) {
    console.error("GET /api/admin/logs error:", err);
    return new Response(
      JSON.stringify({ error: "Server error" }),
      { status: 500 }
    );
  }
}
