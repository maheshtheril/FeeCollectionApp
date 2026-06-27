"use client"

import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer
} from "recharts"

export function RevenueChart({ data }: { data: any[] }) {
  if (!data || data.length === 0) {
    return (
      <div className="h-[300px] flex items-center justify-center text-zinc-500 border border-zinc-800 rounded-xl bg-zinc-900/50">
        No revenue data available yet.
      </div>
    )
  }

  return (
    <div className="h-[300px] w-full bg-zinc-900 border border-zinc-800 rounded-xl p-4">
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={data} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
          <defs>
            <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#22c55e" stopOpacity={0.3}/>
              <stop offset="95%" stopColor="#22c55e" stopOpacity={0}/>
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke="#27272a" vertical={false} />
          <XAxis 
            dataKey="month" 
            stroke="#52525b" 
            fontSize={12} 
            tickLine={false} 
            axisLine={false} 
          />
          <YAxis 
            stroke="#52525b" 
            fontSize={12} 
            tickLine={false} 
            axisLine={false} 
            tickFormatter={(value) => `₹${value}`}
          />
          <Tooltip 
            contentStyle={{ backgroundColor: '#18181b', borderColor: '#27272a', borderRadius: '8px', color: '#fff' }}
            itemStyle={{ color: '#22c55e' }}
          />
          <Area 
            type="monotone" 
            dataKey="revenue" 
            stroke="#22c55e" 
            strokeWidth={2}
            fillOpacity={1} 
            fill="url(#colorRevenue)" 
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  )
}
