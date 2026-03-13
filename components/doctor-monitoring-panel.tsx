"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Video, MessageSquare, FileText, Clock, CheckCircle, AlertCircle } from "lucide-react"

interface Doctor {
  name: string
  specialty: string
  avatar?: string
  status: "available" | "busy" | "offline"
}

interface Appointment {
  id: string
  date: string
  time: string
  type: string
  status: "upcoming" | "completed" | "cancelled"
}

interface Alert {
  id: string
  message: string
  severity: "warning" | "critical" | "info"
  timestamp: string
}

interface DoctorMonitoringPanelProps {
  doctor: Doctor
  appointments: Appointment[]
  alerts: Alert[]
}

export function DoctorMonitoringPanel({ doctor, appointments, alerts }: DoctorMonitoringPanelProps) {
  const initials = doctor.name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()

  const getStatusColor = (status: Doctor["status"]) => {
    switch (status) {
      case "available":
        return "bg-primary"
      case "busy":
        return "bg-chart-3"
      case "offline":
        return "bg-muted-foreground"
      default:
        return "bg-muted-foreground"
    }
  }

  const getSeverityStyles = (severity: Alert["severity"]) => {
    switch (severity) {
      case "critical":
        return "border-destructive/50 bg-destructive/10 text-destructive"
      case "warning":
        return "border-chart-3/50 bg-chart-3/10 text-chart-3"
      case "info":
        return "border-chart-2/50 bg-chart-2/10 text-chart-2"
      default:
        return "border-border bg-secondary text-muted-foreground"
    }
  }

  const getAppointmentStatus = (status: Appointment["status"]) => {
    switch (status) {
      case "upcoming":
        return { icon: Clock, color: "text-chart-2" }
      case "completed":
        return { icon: CheckCircle, color: "text-primary" }
      case "cancelled":
        return { icon: AlertCircle, color: "text-destructive" }
      default:
        return { icon: Clock, color: "text-muted-foreground" }
    }
  }

  return (
    <Card className="border-border/50">
      <CardHeader className="pb-4">
        <CardTitle className="text-sm font-medium text-muted-foreground">
          Doctor Monitoring
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Doctor Info */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="relative">
              <Avatar className="size-12 border-2 border-border">
                <AvatarImage src={doctor.avatar} alt={doctor.name} />
                <AvatarFallback className="bg-secondary text-foreground">
                  {initials}
                </AvatarFallback>
              </Avatar>
              <div className={`absolute -bottom-0.5 -right-0.5 size-3 rounded-full border-2 border-card ${getStatusColor(doctor.status)}`} />
            </div>
            <div>
              <h4 className="text-sm font-semibold text-foreground">{doctor.name}</h4>
              <p className="text-xs text-muted-foreground">{doctor.specialty}</p>
            </div>
          </div>
          <Badge 
            variant="secondary" 
            className={`capitalize ${doctor.status === "available" ? "bg-primary/10 text-primary" : doctor.status === "busy" ? "bg-chart-3/10 text-chart-3" : "bg-muted text-muted-foreground"}`}
          >
            {doctor.status}
          </Badge>
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-3 gap-2">
          <Button variant="secondary" size="sm" className="flex-col gap-1 h-auto py-3">
            <Video className="size-4" />
            <span className="text-xs">Video Call</span>
          </Button>
          <Button variant="secondary" size="sm" className="flex-col gap-1 h-auto py-3">
            <MessageSquare className="size-4" />
            <span className="text-xs">Message</span>
          </Button>
          <Button variant="secondary" size="sm" className="flex-col gap-1 h-auto py-3">
            <FileText className="size-4" />
            <span className="text-xs">Records</span>
          </Button>
        </div>

        {/* Appointments */}
        <div>
          <h5 className="mb-3 text-xs font-medium uppercase text-muted-foreground">
            Upcoming Appointments
          </h5>
          <div className="space-y-2">
            {appointments.slice(0, 3).map((appointment) => {
              const StatusIcon = getAppointmentStatus(appointment.status).icon
              const statusColor = getAppointmentStatus(appointment.status).color
              return (
                <div
                  key={appointment.id}
                  className="flex items-center justify-between rounded-lg bg-secondary p-3"
                >
                  <div className="flex items-center gap-3">
                    <StatusIcon className={`size-4 ${statusColor}`} />
                    <div>
                      <p className="text-sm font-medium text-foreground">{appointment.type}</p>
                      <p className="text-xs text-muted-foreground">
                        {appointment.date} at {appointment.time}
                      </p>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        </div>

        {/* Alerts */}
        {alerts.length > 0 && (
          <div>
            <h5 className="mb-3 text-xs font-medium uppercase text-muted-foreground">
              Health Alerts
            </h5>
            <div className="space-y-2">
              {alerts.map((alert) => (
                <div
                  key={alert.id}
                  className={`rounded-lg border p-3 ${getSeverityStyles(alert.severity)}`}
                >
                  <p className="text-sm font-medium">{alert.message}</p>
                  <p className="mt-1 text-xs opacity-70">{alert.timestamp}</p>
                </div>
              ))}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
