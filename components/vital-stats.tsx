"use client"

import { Card, CardContent } from "@/components/ui/card"
import { Heart, Thermometer, Wind, Droplet } from "lucide-react"

interface VitalStat {
  label: string
  value: string
  unit: string
  icon: React.ElementType
  status: "normal" | "warning" | "critical"
  trend?: "up" | "down" | "stable"
}

interface VitalStatsProps {
  stats: VitalStat[]
}

export function VitalStats({ stats }: VitalStatsProps) {
  const getStatusStyles = (status: VitalStat["status"]) => {
    switch (status) {
      case "normal":
        return "text-primary border-primary/20 bg-primary/5"
      case "warning":
        return "text-chart-3 border-chart-3/20 bg-chart-3/5"
      case "critical":
        return "text-destructive border-destructive/20 bg-destructive/5"
      default:
        return "text-muted-foreground border-border bg-secondary"
    }
  }

  const getIconBg = (status: VitalStat["status"]) => {
    switch (status) {
      case "normal":
        return "bg-primary/10 text-primary"
      case "warning":
        return "bg-chart-3/10 text-chart-3"
      case "critical":
        return "bg-destructive/10 text-destructive"
      default:
        return "bg-muted text-muted-foreground"
    }
  }

  return (
    <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
      {stats.map((stat, index) => {
        const Icon = stat.icon
        return (
          <Card key={index} className={`border ${getStatusStyles(stat.status)}`}>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className={`flex size-10 items-center justify-center rounded-lg ${getIconBg(stat.status)}`}>
                  <Icon className="size-5" />
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">{stat.label}</p>
                  <div className="flex items-baseline gap-1">
                    <span className="text-xl font-bold text-foreground">{stat.value}</span>
                    <span className="text-xs text-muted-foreground">{stat.unit}</span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        )
      })}
    </div>
  )
}

export const defaultVitalStats: VitalStat[] = [
  {
    label: "Heart Rate",
    value: "72",
    unit: "bpm",
    icon: Heart,
    status: "normal",
    trend: "stable",
  },
  {
    label: "Temperature",
    value: "98.6",
    unit: "°F",
    icon: Thermometer,
    status: "normal",
    trend: "stable",
  },
  {
    label: "Oxygen Level",
    value: "98",
    unit: "%",
    icon: Wind,
    status: "normal",
    trend: "up",
  },
  {
    label: "Glucose",
    value: "110",
    unit: "mg/dL",
    icon: Droplet,
    status: "warning",
    trend: "up",
  },
]
