"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Activity, Clock } from "lucide-react"

interface Reading {
  id: string
  systolic: number
  diastolic: number
  pulse: number
  timestamp: string
  status: "normal" | "elevated" | "high" | "low"
}

interface ReadingsHistoryProps {
  readings: Reading[]
}

export function ReadingsHistory({ readings }: ReadingsHistoryProps) {
  const getStatusColor = (status: Reading["status"]) => {
    switch (status) {
      case "normal":
        return "bg-primary"
      case "elevated":
        return "bg-chart-3"
      case "high":
        return "bg-destructive"
      case "low":
        return "bg-chart-2"
      default:
        return "bg-muted-foreground"
    }
  }

  return (
    <Card className="border-border/50">
      <CardHeader>
        <CardTitle className="text-sm font-medium text-muted-foreground">
          Recent Readings
        </CardTitle>
      </CardHeader>
      <CardContent className="p-0">
        <ScrollArea className="h-[280px] px-6 pb-6">
          <div className="space-y-3">
            {readings.map((reading, index) => (
              <div
                key={reading.id}
                className="flex items-center justify-between rounded-lg bg-secondary p-3"
              >
                <div className="flex items-center gap-3">
                  <div className={`size-2 rounded-full ${getStatusColor(reading.status)}`} />
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-semibold text-foreground">
                        {reading.systolic}/{reading.diastolic}
                      </span>
                      <span className="text-xs text-muted-foreground">mmHg</span>
                    </div>
                    <div className="flex items-center gap-1 text-xs text-muted-foreground">
                      <Clock className="size-3" />
                      {reading.timestamp}
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Activity className="size-4 text-muted-foreground" />
                  <span className="text-sm text-foreground">{reading.pulse} bpm</span>
                </div>
              </div>
            ))}
          </div>
        </ScrollArea>
      </CardContent>
    </Card>
  )
}
