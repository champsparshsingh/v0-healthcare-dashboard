"use client"

import { useHealth, BloodPressureReading } from "@/lib/health-context"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import {
  LogOut,
  User,
  Heart,
  Activity,
  TrendingUp,
  TrendingDown,
  Minus,
  AlertTriangle,
  CheckCircle,
  Calendar,
  Droplets,
  Ruler,
  Scale,
  Phone,
  Mail,
} from "lucide-react"
import { format } from "date-fns"

function getStatusColor(status: BloodPressureReading["status"]) {
  switch (status) {
    case "normal":
      return "bg-emerald-500/20 text-emerald-400 border-emerald-500/30"
    case "elevated":
      return "bg-yellow-500/20 text-yellow-400 border-yellow-500/30"
    case "high":
      return "bg-red-500/20 text-red-400 border-red-500/30"
    case "low":
      return "bg-blue-500/20 text-blue-400 border-blue-500/30"
  }
}

function calculateTrend(readings: BloodPressureReading[]): "improving" | "worsening" | "stable" {
  if (readings.length < 3) return "stable"

  const recent = readings.slice(0, 3)
  const avgSystolic = recent.reduce((sum, r) => sum + r.systolic, 0) / recent.length
  const avgDiastolic = recent.reduce((sum, r) => sum + r.diastolic, 0) / recent.length

  const older = readings.slice(3, 6)
  if (older.length === 0) return "stable"

  const oldAvgSystolic = older.reduce((sum, r) => sum + r.systolic, 0) / older.length
  const oldAvgDiastolic = older.reduce((sum, r) => sum + r.diastolic, 0) / older.length

  const systolicDiff = avgSystolic - oldAvgSystolic
  const diastolicDiff = avgDiastolic - oldAvgDiastolic

  // If BP is decreasing towards normal range, it's improving
  if (systolicDiff < -5 || diastolicDiff < -3) return "improving"
  if (systolicDiff > 5 || diastolicDiff > 3) return "worsening"
  return "stable"
}

function getOverallCondition(readings: BloodPressureReading[]): {
  label: string
  color: string
  icon: typeof CheckCircle
} {
  if (readings.length === 0) {
    return { label: "No Data", color: "text-muted-foreground", icon: Minus }
  }

  const recentReadings = readings.slice(0, 5)
  const highCount = recentReadings.filter((r) => r.status === "high").length
  const lowCount = recentReadings.filter((r) => r.status === "low").length
  const elevatedCount = recentReadings.filter((r) => r.status === "elevated").length

  if (highCount >= 3 || lowCount >= 3) {
    return { label: "Needs Attention", color: "text-red-400", icon: AlertTriangle }
  }
  if (highCount >= 1 || lowCount >= 1 || elevatedCount >= 2) {
    return { label: "Monitor Closely", color: "text-yellow-400", icon: Activity }
  }
  return { label: "Healthy", color: "text-emerald-400", icon: CheckCircle }
}

export function DoctorDashboard() {
  const { patient, readings, logoutDoctor } = useHealth()

  if (!patient) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] text-center p-4">
        <User className="h-16 w-16 text-muted-foreground mb-4" />
        <h2 className="text-xl font-semibold text-foreground mb-2">No Patient Registered</h2>
        <p className="text-muted-foreground mb-6">
          There is no patient data available to view at this time.
        </p>
        <Button variant="outline" onClick={logoutDoctor}>
          <LogOut className="h-4 w-4 mr-2" />
          Sign Out
        </Button>
      </div>
    )
  }

  const trend = calculateTrend(readings)
  const condition = getOverallCondition(readings)
  const ConditionIcon = condition.icon

  const avgSystolic = readings.length > 0
    ? Math.round(readings.slice(0, 10).reduce((sum, r) => sum + r.systolic, 0) / Math.min(readings.length, 10))
    : 0
  const avgDiastolic = readings.length > 0
    ? Math.round(readings.slice(0, 10).reduce((sum, r) => sum + r.diastolic, 0) / Math.min(readings.length, 10))
    : 0

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Patient Monitoring</h1>
          <p className="text-muted-foreground">Viewing health data for {patient.name}</p>
        </div>
        <Button variant="outline" onClick={logoutDoctor} className="gap-2">
          <LogOut className="h-4 w-4" />
          Sign Out
        </Button>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Patient Profile Card */}
        <Card className="border-border">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-foreground">
              <User className="h-5 w-5 text-primary" />
              Patient Profile
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center gap-4">
              <Avatar className="h-16 w-16">
                <AvatarFallback className="bg-primary/20 text-primary text-xl">
                  {patient.name.split(" ").map((n) => n[0]).join("").slice(0, 2)}
                </AvatarFallback>
              </Avatar>
              <div>
                <h3 className="font-semibold text-lg text-foreground">{patient.name}</h3>
                <p className="text-sm text-muted-foreground capitalize">
                  {patient.age} years old, {patient.gender}
                </p>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3 pt-2">
              <div className="flex items-center gap-2 text-sm">
                <Droplets className="h-4 w-4 text-red-400" />
                <span className="text-muted-foreground">Blood:</span>
                <span className="text-foreground font-medium">{patient.bloodType}</span>
              </div>
              <div className="flex items-center gap-2 text-sm">
                <Ruler className="h-4 w-4 text-blue-400" />
                <span className="text-muted-foreground">Height:</span>
                <span className="text-foreground font-medium">{patient.height} cm</span>
              </div>
              <div className="flex items-center gap-2 text-sm">
                <Scale className="h-4 w-4 text-emerald-400" />
                <span className="text-muted-foreground">Weight:</span>
                <span className="text-foreground font-medium">{patient.weight} kg</span>
              </div>
              <div className="flex items-center gap-2 text-sm">
                <Calendar className="h-4 w-4 text-yellow-400" />
                <span className="text-muted-foreground">Since:</span>
                <span className="text-foreground font-medium">
                  {format(new Date(patient.createdAt), "MMM d")}
                </span>
              </div>
            </div>

            <div className="border-t border-border pt-3 space-y-2">
              <div className="flex items-center gap-2 text-sm">
                <Phone className="h-4 w-4 text-muted-foreground" />
                <span className="text-foreground">{patient.phone}</span>
              </div>
              <div className="flex items-center gap-2 text-sm">
                <Mail className="h-4 w-4 text-muted-foreground" />
                <span className="text-foreground">{patient.email}</span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Health Status Card */}
        <Card className="border-border">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-foreground">
              <Heart className="h-5 w-5 text-primary" />
              Health Status
            </CardTitle>
            <CardDescription>Overall assessment based on recent readings</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="flex items-center justify-center">
              <div className={`flex items-center gap-3 p-4 rounded-xl ${
                condition.label === "Healthy" ? "bg-emerald-500/10" :
                condition.label === "Monitor Closely" ? "bg-yellow-500/10" :
                condition.label === "Needs Attention" ? "bg-red-500/10" :
                "bg-secondary"
              }`}>
                <ConditionIcon className={`h-8 w-8 ${condition.color}`} />
                <div>
                  <p className={`text-xl font-bold ${condition.color}`}>{condition.label}</p>
                  <p className="text-sm text-muted-foreground">Current condition</p>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="bg-secondary/50 rounded-lg p-3 text-center">
                <p className="text-2xl font-bold text-foreground">{avgSystolic}/{avgDiastolic}</p>
                <p className="text-xs text-muted-foreground">Avg BP (last 10)</p>
              </div>
              <div className="bg-secondary/50 rounded-lg p-3 text-center">
                <div className="flex items-center justify-center gap-1">
                  {trend === "improving" && <TrendingDown className="h-5 w-5 text-emerald-400" />}
                  {trend === "worsening" && <TrendingUp className="h-5 w-5 text-red-400" />}
                  {trend === "stable" && <Minus className="h-5 w-5 text-yellow-400" />}
                  <span className={`text-lg font-bold capitalize ${
                    trend === "improving" ? "text-emerald-400" :
                    trend === "worsening" ? "text-red-400" :
                    "text-yellow-400"
                  }`}>
                    {trend}
                  </span>
                </div>
                <p className="text-xs text-muted-foreground">Trend</p>
              </div>
            </div>

            <div className="text-center text-sm text-muted-foreground">
              {readings.length} total readings recorded
            </div>
          </CardContent>
        </Card>

        {/* Alerts Card */}
        <Card className="border-border">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-foreground">
              <AlertTriangle className="h-5 w-5 text-primary" />
              Health Alerts
            </CardTitle>
            <CardDescription>Recent abnormal readings</CardDescription>
          </CardHeader>
          <CardContent>
            {readings.length === 0 ? (
              <p className="text-center text-muted-foreground py-8">
                No readings available yet
              </p>
            ) : (
              <div className="space-y-3 max-h-64 overflow-y-auto">
                {readings
                  .filter((r) => r.status !== "normal")
                  .slice(0, 5)
                  .map((reading) => (
                    <div
                      key={reading.id}
                      className="flex items-center justify-between p-3 rounded-lg bg-secondary/50"
                    >
                      <div className="flex items-center gap-3">
                        <Heart className={`h-4 w-4 ${
                          reading.status === "high" ? "text-red-400" :
                          reading.status === "low" ? "text-blue-400" :
                          "text-yellow-400"
                        }`} />
                        <div>
                          <p className="font-medium text-foreground">
                            {reading.systolic}/{reading.diastolic} mmHg
                          </p>
                          <p className="text-xs text-muted-foreground">
                            {format(new Date(reading.timestamp), "MMM d, h:mm a")}
                          </p>
                        </div>
                      </div>
                      <Badge variant="outline" className={getStatusColor(reading.status)}>
                        {reading.status}
                      </Badge>
                    </div>
                  ))}
                {readings.filter((r) => r.status !== "normal").length === 0 && (
                  <div className="text-center py-8">
                    <CheckCircle className="h-8 w-8 text-emerald-400 mx-auto mb-2" />
                    <p className="text-muted-foreground">All readings are normal</p>
                  </div>
                )}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* All Readings Table */}
      <Card className="border-border">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-foreground">
            <Activity className="h-5 w-5 text-primary" />
            Complete Reading History
          </CardTitle>
          <CardDescription>All blood pressure readings recorded by the patient</CardDescription>
        </CardHeader>
        <CardContent>
          {readings.length === 0 ? (
            <p className="text-center text-muted-foreground py-8">
              No readings have been recorded yet
            </p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-border">
                    <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">Date & Time</th>
                    <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">Systolic</th>
                    <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">Diastolic</th>
                    <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">Pulse</th>
                    <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {readings.map((reading) => (
                    <tr key={reading.id} className="border-b border-border/50 hover:bg-secondary/30">
                      <td className="py-3 px-4 text-sm text-foreground">
                        {format(new Date(reading.timestamp), "MMM d, yyyy h:mm a")}
                      </td>
                      <td className="py-3 px-4 text-sm font-medium text-foreground">
                        {reading.systolic} mmHg
                      </td>
                      <td className="py-3 px-4 text-sm font-medium text-foreground">
                        {reading.diastolic} mmHg
                      </td>
                      <td className="py-3 px-4 text-sm text-foreground">
                        {reading.pulse} bpm
                      </td>
                      <td className="py-3 px-4">
                        <Badge variant="outline" className={getStatusColor(reading.status)}>
                          {reading.status}
                        </Badge>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
