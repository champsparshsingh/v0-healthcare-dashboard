"use client"

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart"
import { Area, AreaChart, CartesianGrid, XAxis, YAxis, ResponsiveContainer } from "recharts"

interface WeeklyData {
  day: string
  systolic: number
  diastolic: number
}

interface WeeklyGraphProps {
  data: WeeklyData[]
}

const chartConfig = {
  systolic: {
    label: "Systolic",
    color: "var(--chart-1)",
  },
  diastolic: {
    label: "Diastolic",
    color: "var(--chart-2)",
  },
}

export function WeeklyGraph({ data }: WeeklyGraphProps) {
  return (
    <Card className="border-border/50">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-base font-semibold text-foreground">Weekly Overview</CardTitle>
            <CardDescription className="text-sm text-muted-foreground">
              Blood pressure trends over the past 7 days
            </CardDescription>
          </div>
          <div className="flex items-center gap-4 text-xs">
            <div className="flex items-center gap-1.5">
              <div className="size-2 rounded-full bg-chart-1" />
              <span className="text-muted-foreground">Systolic</span>
            </div>
            <div className="flex items-center gap-1.5">
              <div className="size-2 rounded-full bg-chart-2" />
              <span className="text-muted-foreground">Diastolic</span>
            </div>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <ChartContainer config={chartConfig} className="h-[250px] w-full">
          <AreaChart
            data={data}
            margin={{ top: 10, right: 10, left: 0, bottom: 0 }}
          >
            <defs>
              <linearGradient id="systolicGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="var(--chart-1)" stopOpacity={0.3} />
                <stop offset="95%" stopColor="var(--chart-1)" stopOpacity={0} />
              </linearGradient>
              <linearGradient id="diastolicGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="var(--chart-2)" stopOpacity={0.3} />
                <stop offset="95%" stopColor="var(--chart-2)" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" className="stroke-border/30" vertical={false} />
            <XAxis 
              dataKey="day" 
              axisLine={false}
              tickLine={false}
              tick={{ fill: 'var(--muted-foreground)', fontSize: 12 }}
              dy={10}
            />
            <YAxis 
              domain={[60, 160]}
              axisLine={false}
              tickLine={false}
              tick={{ fill: 'var(--muted-foreground)', fontSize: 12 }}
              dx={-10}
            />
            <ChartTooltip content={<ChartTooltipContent />} />
            <Area
              type="monotone"
              dataKey="systolic"
              stroke="var(--chart-1)"
              strokeWidth={2}
              fill="url(#systolicGradient)"
            />
            <Area
              type="monotone"
              dataKey="diastolic"
              stroke="var(--chart-2)"
              strokeWidth={2}
              fill="url(#diastolicGradient)"
            />
          </AreaChart>
        </ChartContainer>
      </CardContent>
    </Card>
  )
}
