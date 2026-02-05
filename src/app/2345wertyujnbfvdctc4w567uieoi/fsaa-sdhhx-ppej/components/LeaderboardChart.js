"use client"

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer
} from "recharts"

export default function LeaderboardChart({ data }) {
  const chartHeight = Math.max(300, data.length * 40)

  return (
    <div className="bg-card border rounded-2xl p-6">
      <h2 className="text-lg font-semibold mb-4">Top Stalls by E-Coins</h2>

      <div style={{ height: chartHeight }}>
        <ResponsiveContainer width="100%" height="100%">
          <BarChart
            data={data}
            layout="vertical"
            margin={{ top: 10, right: 30, left: 40, bottom: 10 }}
          >
            <XAxis type="number" />
            <YAxis
              dataKey="name"
              type="category"
              width={150}
            />
            <Tooltip />
            <Bar dataKey="coins" radius={[0, 6, 6, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  )
}

