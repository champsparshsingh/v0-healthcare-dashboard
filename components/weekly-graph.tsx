"use client"

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart"
import { Area, AreaChart, CartesianGrid, XAxis, YAxis } from "recharts"
import { useHealth, BloodPressureReading } from "@/lib/health-context"
import { format, subDays, parseISO } from "date-fns"
import { useMemo } from "react"

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

interface DayData {
  day: string
  fullDate: string
  systolic: number | null
  diastolic: number | null
  readingCount: number
  morning?: { systolic: number; diastolic: number }
  afternoon?: { systolic: number; diastolic: number }
  evening?: { systolic: number; diastolic: number }
}

export function WeeklyGraph() {
  const { readings, currentDate } = useHealth()

  const weeklyData = useMemo(() => {
    const data: DayData[] = []
    
    // Get last 7 days including current date
    for (let i = 6; i >= 0; i--) {
      const date = subDays(currentDate, i)
      const dateString = format(date, "yyyy-MM-dd")
      const dayName = format(date, "EEE")
      
      // Find all readings for this day
      const dayReadings = readings.filter((r) => r.date === dateString)
      
      // Get readings by time of day
      const morning = dayReadings.find((r) => r.timeOfDay === "morning")
      const afternoon = dayReadings.find((r) => r.timeOfDay === "afternoon")
      const evening = dayReadings.find((r) => r.timeOfDay === "evening")
      
      // Calculate average if there are readings
      let avgSystolic: number | null = null
      let avgDiastolic: number | null = null
      
      if (dayReadings.length > 0) {
        avgSystolic = Math.round(
          dayReadings.reduce((sum, r) => sum + r.systolic, 0) / dayReadings.length
        )
        avgDiastolic = Math.round(
          dayReadings.reduce((sum, r) => sum + r.diastolic, 0) / dayReadings.length
        )
      }
      
      data.push({
        day: dayName,
        fullDate: dateString,
        systolic: avgSystolic,
        diastolic: avgDiastolic,
        readingCount: dayReadings.length,
        morning: morning ? { systolic: morning.systolic, diastolic: morning.diastolic } : undefined,
        afternoon: afternoon ? { systolic: afternoon.systolic, diastolic: afternoon.diastolic } : undefined,
        evening: evening ? { systolic: evening.systolic, diastolic: evening.diastolic } : undefined,
      })
    }
    
    return data
  }, [readings, currentDate])

  // Check if we have any data to display
  const hasData = weeklyData.some((d) => d.systolic !== null)

  return (
    <Card className="border-border/50">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-base font-semibold text-foreground">Weekly Overview</CardTitle>
            <CardDescription className="text-sm text-muted-foreground">
              Blood pressure trends over the past 7 days (daily averages)
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
        {!hasData ? (
          <div className="flex h-[250px] items-center justify-center">
            <p className="text-sm text-muted-foreground">
              No readings yet. Add your first blood pressure reading to see the graph.
            </p>
          </div>
        ) : (
          <ChartContainer config={chartConfig} className="h-[250px] w-full">
            <AreaChart
              data={weeklyData}
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
              <ChartTooltip 
                content={({ active, payload, label }) => {
                  if (!active || !payload || !payload.length) return null
                  
                  const data = payload[0]?.payload as DayData
                  if (!data || data.systolic === null) return null
                  
                  return (
                    <div className="rounded-lg border border-border/50 bg-card p-3 shadow-lg">
                      <p className="mb-2 font-medium text-foreground">{data.day} ({format(parseISO(data.fullDate), "MMM d")})</p>
                      <div className="space-y-1 text-sm">
                        <div className="flex items-center justify-between gap-4">
                          <span className="text-muted-foreground">Daily Average:</span>
                          <span className="font-medium text-foreground">{data.systolic}/{data.diastolic} mmHg</span>
                        </div>
                        <div className="my-2 border-t border-border/30" />
                        {data.morning && (
                          <div className="flex items-center justify-between gap-4">
                            <span className="text-muted-foreground">Morning:</span>
                            <span className="text-foreground">{data.morning.systolic}/{data.morning.diastolic}</span>
                          </div>
                        )}
                        {data.afternoon && (
                          <div className="flex items-center justify-between gap-4">
                            <span className="text-muted-foreground">Afternoon:</span>
                            <span className="text-foreground">{data.afternoon.systolic}/{data.afternoon.diastolic}</span>
                          </div>
                        )}
                        {data.evening && (
                          <div className="flex items-center justify-between gap-4">
                            <span className="text-muted-foreground">Evening:</span>
                            <span className="text-foreground">{data.evening.systolic}/{data.evening.diastolic}</span>
                          </div>
                        )}
                        <div className="mt-1 text-xs text-muted-foreground">
                          {data.readingCount}/3 readings
                        </div>
                      </div>
                    </div>
                  )
                }}
              />
              <Area
                type="monotone"
                dataKey="systolic"
                stroke="var(--chart-1)"
                strokeWidth={2}
                fill="url(#systolicGradient)"
                connectNulls
              />
              <Area
                type="monotone"
                dataKey="diastolic"
                stroke="var(--chart-2)"
                strokeWidth={2}
                fill="url(#diastolicGradient)"
                connectNulls
              />
            </AreaChart>
          </ChartContainer>
        )}
        
        {/* Daily breakdown legend */}
        {hasData && (
          <div className="mt-4 grid grid-cols-7 gap-2">
            {weeklyData.map((day) => (
              <div key={day.fullDate} className="text-center">
                <div className="text-xs font-medium text-muted-foreground">{day.day}</div>
                <div className="mt-1 flex justify-center gap-0.5">
                  <div 
                    className={`size-2 rounded-full ${day.morning ? 'bg-chart-1' : 'bg-muted'}`}
                    title="Morning"
                  />
                  <div 
                    className={`size-2 rounded-full ${day.afternoon ? 'bg-chart-1' : 'bg-muted'}`}
                    title="Afternoon"
                  />
                  <div 
                    className={`size-2 rounded-full ${day.evening ? 'bg-chart-1' : 'bg-muted'}`}
                    title="Evening"
                  />
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  )
}
