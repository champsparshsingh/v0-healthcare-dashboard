"use client"

import { BloodPressureCard } from "@/components/blood-pressure-card"
import { WeeklyGraph } from "@/components/weekly-graph"
import { PatientProfile } from "@/components/patient-profile"
import { DoctorMonitoringPanel } from "@/components/doctor-monitoring-panel"
import { VitalStats, defaultVitalStats } from "@/components/vital-stats"
import { ReadingsHistory } from "@/components/readings-history"
import { Activity, Bell, Search, Settings } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"

// Sample data
const currentReading = {
  systolic: 128,
  diastolic: 82,
  pulse: 72,
  timestamp: "Today, 2:45 PM",
  status: "normal" as const,
}

const previousReading = {
  systolic: 132,
  diastolic: 84,
  pulse: 75,
  timestamp: "Today, 8:30 AM",
  status: "elevated" as const,
}

const weeklyData = [
  { day: "Mon", systolic: 125, diastolic: 80 },
  { day: "Tue", systolic: 130, diastolic: 85 },
  { day: "Wed", systolic: 128, diastolic: 82 },
  { day: "Thu", systolic: 135, diastolic: 88 },
  { day: "Fri", systolic: 127, diastolic: 81 },
  { day: "Sat", systolic: 122, diastolic: 78 },
  { day: "Sun", systolic: 128, diastolic: 82 },
]

const patientInfo = {
  name: "Sarah Johnson",
  age: 45,
  gender: "Female",
  bloodType: "A+",
  height: "5'6\"",
  weight: "145 lbs",
  phone: "+1 (555) 123-4567",
  email: "sarah.johnson@email.com",
  address: "123 Healthcare Ave, Medical City",
  lastVisit: "March 1, 2026",
  conditions: ["Hypertension", "Pre-diabetes", "Anxiety"],
}

const doctorInfo = {
  name: "Dr. Michael Chen",
  specialty: "Cardiologist",
  status: "available" as const,
}

const appointments = [
  { id: "1", date: "Mar 15", time: "10:00 AM", type: "Follow-up Check", status: "upcoming" as const },
  { id: "2", date: "Mar 22", time: "2:30 PM", type: "Lab Results Review", status: "upcoming" as const },
  { id: "3", date: "Feb 28", time: "11:00 AM", type: "Annual Physical", status: "completed" as const },
]

const alerts = [
  { id: "1", message: "Blood pressure elevated in morning readings", severity: "warning" as const, timestamp: "2 hours ago" },
  { id: "2", message: "Medication reminder: Lisinopril 10mg", severity: "info" as const, timestamp: "5 hours ago" },
]

const recentReadings = [
  { id: "1", systolic: 128, diastolic: 82, pulse: 72, timestamp: "Today, 2:45 PM", status: "normal" as const },
  { id: "2", systolic: 132, diastolic: 84, pulse: 75, timestamp: "Today, 8:30 AM", status: "elevated" as const },
  { id: "3", systolic: 125, diastolic: 80, pulse: 70, timestamp: "Yesterday, 9:15 PM", status: "normal" as const },
  { id: "4", systolic: 138, diastolic: 88, pulse: 78, timestamp: "Yesterday, 2:00 PM", status: "high" as const },
  { id: "5", systolic: 124, diastolic: 79, pulse: 68, timestamp: "Yesterday, 7:45 AM", status: "normal" as const },
  { id: "6", systolic: 130, diastolic: 85, pulse: 74, timestamp: "2 days ago, 8:00 PM", status: "elevated" as const },
]

export default function Dashboard() {
  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-50 border-b border-border/50 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="flex h-16 items-center justify-between px-6">
          <div className="flex items-center gap-3">
            <div className="flex size-9 items-center justify-center rounded-lg bg-primary">
              <Activity className="size-5 text-primary-foreground" />
            </div>
            <span className="text-lg font-semibold text-foreground">HealthPulse</span>
          </div>
          
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="icon" className="text-muted-foreground hover:text-foreground">
              <Search className="size-5" />
              <span className="sr-only">Search</span>
            </Button>
            <Button variant="ghost" size="icon" className="relative text-muted-foreground hover:text-foreground">
              <Bell className="size-5" />
              <span className="absolute -right-0.5 -top-0.5 flex size-4 items-center justify-center rounded-full bg-destructive text-[10px] font-medium text-destructive-foreground">
                2
              </span>
              <span className="sr-only">Notifications</span>
            </Button>
            <Button variant="ghost" size="icon" className="text-muted-foreground hover:text-foreground">
              <Settings className="size-5" />
              <span className="sr-only">Settings</span>
            </Button>
            <div className="ml-2 flex items-center gap-3 border-l border-border pl-4">
              <Avatar className="size-8">
                <AvatarImage src="" alt="User" />
                <AvatarFallback className="bg-primary/10 text-primary text-sm">SJ</AvatarFallback>
              </Avatar>
              <div className="hidden md:block">
                <p className="text-sm font-medium text-foreground">Sarah Johnson</p>
                <p className="text-xs text-muted-foreground">Patient</p>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="p-6">
        <div className="mx-auto max-w-7xl space-y-6">
          {/* Page Title */}
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-foreground">Health Dashboard</h1>
              <p className="text-sm text-muted-foreground">Monitor your vital signs and health metrics</p>
            </div>
            <Button className="bg-primary text-primary-foreground hover:bg-primary/90">
              <Activity className="mr-2 size-4" />
              New Reading
            </Button>
          </div>

          {/* Vital Stats */}
          <VitalStats stats={defaultVitalStats} />

          {/* Main Grid */}
          <div className="grid gap-6 lg:grid-cols-3">
            {/* Left Column - Charts and Readings */}
            <div className="space-y-6 lg:col-span-2">
              {/* Blood Pressure and Weekly Graph */}
              <div className="grid gap-6 md:grid-cols-2">
                <BloodPressureCard reading={currentReading} previousReading={previousReading} />
                <ReadingsHistory readings={recentReadings} />
              </div>
              
              {/* Weekly Graph */}
              <WeeklyGraph data={weeklyData} />
            </div>

            {/* Right Column - Profile and Doctor Panel */}
            <div className="space-y-6">
              <PatientProfile patient={patientInfo} />
              <DoctorMonitoringPanel 
                doctor={doctorInfo} 
                appointments={appointments} 
                alerts={alerts} 
              />
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}
