'use client'

import {
  Area,
  AreaChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts'
import { DASHBOARD } from '@/lib/site-data'

export function TrendChart() {
  return (
    <div className="h-44 w-full">
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={DASHBOARD.trend} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
          <defs>
            <linearGradient id="trendFill" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="var(--primary)" stopOpacity={0.5} />
              <stop offset="100%" stopColor="var(--cyan)" stopOpacity={0.02} />
            </linearGradient>
            <linearGradient id="trendStroke" x1="0" y1="0" x2="1" y2="0">
              <stop offset="0%" stopColor="var(--primary)" />
              <stop offset="100%" stopColor="var(--cyan)" />
            </linearGradient>
          </defs>
          <XAxis
            dataKey="session"
            tickLine={false}
            axisLine={false}
            tick={{ fill: 'var(--muted-foreground)', fontSize: 11 }}
          />
          <YAxis
            domain={[50, 90]}
            tickLine={false}
            axisLine={false}
            tick={{ fill: 'var(--muted-foreground)', fontSize: 11 }}
            width={40}
          />
          <Tooltip
            cursor={{ stroke: 'var(--border)', strokeWidth: 1 }}
            contentStyle={{
              background: 'var(--popover)',
              border: '1px solid var(--border)',
              borderRadius: 12,
              color: 'var(--foreground)',
              fontSize: 12,
              boxShadow: '0 10px 30px -10px rgba(0,0,0,0.5)',
            }}
            labelStyle={{ color: 'var(--muted-foreground)' }}
            formatter={(value) => [`${value} / 100`, 'Score'] as [string, string]}
          />
          <Area
            type="monotone"
            dataKey="score"
            stroke="url(#trendStroke)"
            strokeWidth={2.5}
            fill="url(#trendFill)"
            dot={{ fill: 'var(--primary)', r: 3, strokeWidth: 0 }}
            activeDot={{ r: 5, fill: 'var(--cyan)' }}
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  )
}
