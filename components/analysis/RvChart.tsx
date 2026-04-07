'use client'
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ReferenceLine,
  ResponsiveContainer,
  Cell
} from 'recharts'

interface RvChartProps {
  comparables: Array<{ rv_per_m2: number }>
  userRvPerM2: number
}

export function RvChart({ comparables, userRvPerM2 }: RvChartProps) {
  if (!comparables.length) {
    return (
      <div className="h-64 flex items-center justify-center border rounded-lg bg-[hsl(var(--secondary))]/30">
        <p className="text-sm text-[hsl(var(--muted-foreground))]">
          Not enough data to display chart
        </p>
      </div>
    )
  }

  const values = comparables.map(c => c.rv_per_m2)
  const min = Math.min(...values, userRvPerM2)
  const max = Math.max(...values, userRvPerM2)
  const bucketSize = (max - min) / 10
  
  const buckets = Array.from({ length: 10 }, (_, i) => {
    const bucketMin = min + (i * bucketSize)
    const bucketMax = bucketMin + bucketSize
    const count = values.filter(v => v >= bucketMin && v < bucketMax).length
    const isUserBucket = userRvPerM2 >= bucketMin && userRvPerM2 < bucketMax
    
    return {
      range: `£${Math.round(bucketMin)}–${Math.round(bucketMax)}`,
      count,
      isUserBucket
    }
  })

  return (
    <div className="w-full h-80">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={buckets} margin={{ top: 20, right: 30, left: 20, bottom: 40 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
          <XAxis 
            dataKey="range" 
            angle={-45} 
            textAnchor="end" 
            height={70}
            tick={{ fontSize: 11, fill: 'hsl(var(--muted-foreground))' }}
          />
          <YAxis 
            label={{ value: 'Number of properties', angle: -90, position: 'insideLeft', style: { fontSize: 12, fill: 'hsl(var(--muted-foreground))' } }}
            tick={{ fontSize: 11, fill: 'hsl(var(--muted-foreground))' }}
          />
          <Tooltip 
            contentStyle={{ 
              backgroundColor: 'hsl(var(--background))', 
              border: '1px solid hsl(var(--border))',
              borderRadius: '6px',
              fontSize: '12px'
            }}
          />
          <Bar dataKey="count" radius={[4, 4, 0, 0]}>
            {buckets.map((entry, index) => (
              <Cell 
                key={`cell-${index}`} 
                fill={entry.isUserBucket ? 'hsl(221, 83%, 53%)' : 'hsl(221, 83%, 53%, 0.3)'}
              />
            ))}
          </Bar>
          <ReferenceLine 
            x={buckets.findIndex(b => b.isUserBucket)} 
            stroke="hsl(221, 83%, 53%)" 
            strokeDasharray="3 3"
            label={{ 
              value: 'Your property', 
              position: 'top',
              fill: 'hsl(221, 83%, 53%)',
              fontSize: 11
            }}
          />
        </BarChart>
      </ResponsiveContainer>
    </div>
  )
}