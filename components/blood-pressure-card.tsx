"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Activity, TrendingUp, TrendingDown } from "lucide-react"

interface BloodPressureReading {
  systolic: number
  diastolic: number
  pulse: number
  timestamp: string
  status: "normal" | "elevated" | "high" | "low"
}

interface BloodPressureCardProps {
  reading: BloodPressureReading
  previousReading?: BloodPressureReading
}

export function BloodPressureCard({ reading, previousReading }: BloodPressureCardProps) {
  const getStatusColor = (status: BloodPressureReading["status"]) => {
    switch (status) {
      case "normal":
        return "text-primary"
      case "elevated":
        return "text-chart-3"
      case "high":
        return "text-destructive"
      case "low":
        return "text-chart-2"
      default:
        return "text-muted-foreground"
    }
  }

  const getStatusBg = (status: BloodPressureReading["status"]) => {
    switch (status) {
      case "normal":
        return "bg-primary/10"
      case "elevated":
        return "bg-chart-3/10"
      case "high":
        return "bg-destructive/10"
      case "low":
        return "bg-chart-2/10"
      default:
        return "bg-muted"
    }
  }

  const systolicChange = previousReading 
    ? reading.systolic - previousReading.systolic 
    : 0

  return (
    <Card className="border-border/50">
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <CardTitle className="text-sm font-medium text-muted-foreground">
            Blood Pressure
          </CardTitle>
          <div className={`flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-medium ${getStatusBg(reading.status)} ${getStatusColor(reading.status)}`}>
            <Activity className="size-3" />
            {reading.status.charAt(0).toUpperCase() + reading.status.slice(1)}
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="flex items-baseline gap-2">
          <span className="text-4xl font-bold tracking-tight text-foreground">
            {reading.systolic}/{reading.diastolic}
          </span>
          <span className="text-sm text-muted-foreground">mmHg</span>
        </div>
        
        <div className="mt-4 flex items-center gap-4">
          <div className="flex items-center gap-2">
            <div className="flex size-8 items-center justify-center rounded-lg bg-secondary">
              <Activity className="size-4 text-primary" />
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Pulse</p>
              <p className="text-sm font-semibold text-foreground">{reading.pulse} bpm</p>
            </div>
          </div>
          
          {previousReading && (
            <div className="flex items-center gap-1 text-xs">
              {systolicChange > 0 ? (
                <TrendingUp className="size-3 text-destructive" />
              ) : systolicChange < 0 ? (
                <TrendingDown className="size-3 text-primary" />
              ) : null}
              <span className={systolicChange > 0 ? "text-destructive" : systolicChange < 0 ? "text-primary" : "text-muted-foreground"}>
                {systolicChange > 0 ? "+" : ""}{systolicChange} from last
              </span>
            </div>
          )}
        </div>
        
        <p className="mt-3 text-xs text-muted-foreground">
          Last updated: {reading.timestamp}
        </p>
      </CardContent>
    </Card>
  )
}
