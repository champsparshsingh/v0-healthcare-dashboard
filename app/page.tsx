"use client"

import { useMemo } from "react"
import { useHealth } from "@/lib/health-context"
import { PatientRegistrationForm } from "@/components/patient-registration-form"
import { PatientProfile } from "@/components/patient-profile"
import { BloodPressureCard } from "@/components/blood-pressure-card"
import { WeeklyGraph } from "@/components/weekly-graph"
import { ReadingsHistory } from "@/components/readings-history"
import { BPEntryDialog } from "@/components/bp-entry-dialog"
import { DoctorLogin } from "@/components/doctor-login"
import { DoctorDashboard } from "@/components/doctor-dashboard"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Activity, User, Stethoscope } from "lucide-react"
import { format, subDays, isSameDay } from "date-fns"

export default function Home() {
  const { patient, readings, isDoctorLoggedIn } = useHealth()

  // Transform readings for the blood pressure card
  const latestReading = readings[0]
  const previousReading = readings[1]

  const formattedLatestReading = latestReading
    ? {
        systolic: latestReading.systolic,
        diastolic: latestReading.diastolic,
        pulse: latestReading.pulse,
        timestamp: format(new Date(latestReading.timestamp), "MMM d, h:mm a"),
        status: latestReading.status,
      }
    : null

  const formattedPreviousReading = previousReading
    ? {
        systolic: previousReading.systolic,
        diastolic: previousReading.diastolic,
        pulse: previousReading.pulse,
        timestamp: format(new Date(previousReading.timestamp), "MMM d, h:mm a"),
        status: previousReading.status,
      }
    : undefined

  // Transform readings for the weekly graph
  const weeklyData = useMemo(() => {
    const days = []
    for (let i = 6; i >= 0; i--) {
      const date = subDays(new Date(), i)
      const dayReadings = readings.filter((r) =>
        isSameDay(new Date(r.timestamp), date)
      )

      if (dayReadings.length > 0) {
        const avgSystolic = Math.round(
          dayReadings.reduce((sum, r) => sum + r.systolic, 0) / dayReadings.length
        )
        const avgDiastolic = Math.round(
          dayReadings.reduce((sum, r) => sum + r.diastolic, 0) / dayReadings.length
        )
        days.push({
          day: format(date, "EEE"),
          systolic: avgSystolic,
          diastolic: avgDiastolic,
        })
      } else {
        days.push({
          day: format(date, "EEE"),
          systolic: 0,
          diastolic: 0,
        })
      }
    }
    return days
  }, [readings])

  // Transform readings for history component
  const historyReadings = readings.slice(0, 10).map((r) => ({
    id: r.id,
    systolic: r.systolic,
    diastolic: r.diastolic,
    pulse: r.pulse,
    timestamp: format(new Date(r.timestamp), "MMM d, h:mm a"),
    status: r.status,
  }))

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-50 border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container mx-auto flex h-16 items-center justify-between px-4">
          <div className="flex items-center gap-2">
            <Activity className="h-6 w-6 text-primary" />
            <span className="text-xl font-bold text-foreground">HealthPulse</span>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        <Tabs defaultValue="patient" className="space-y-6">
          <TabsList className="grid w-full max-w-md mx-auto grid-cols-2">
            <TabsTrigger value="patient" className="gap-2">
              <User className="h-4 w-4" />
              Patient
            </TabsTrigger>
            <TabsTrigger value="doctor" className="gap-2">
              <Stethoscope className="h-4 w-4" />
              Doctor
            </TabsTrigger>
          </TabsList>

          {/* Patient View */}
          <TabsContent value="patient">
            {!patient ? (
              <PatientRegistrationForm />
            ) : (
              <div className="space-y-6">
                {/* Patient Dashboard Header */}
                <div className="flex items-center justify-between">
                  <div>
                    <h1 className="text-2xl font-bold text-foreground">
                      Welcome, {patient.name.split(" ")[0]}
                    </h1>
                    <p className="text-muted-foreground">
                      Track and manage your blood pressure readings
                    </p>
                  </div>
                  <BPEntryDialog />
                </div>

                {/* Dashboard Grid */}
                <div className="grid gap-6 lg:grid-cols-3">
                  {/* Left Column - Profile */}
                  <div className="space-y-6">
                    <PatientProfile />
                  </div>

                  {/* Right Column - Readings */}
                  <div className="lg:col-span-2 space-y-6">
                    {/* Current Reading */}
                    {formattedLatestReading ? (
                      <BloodPressureCard
                        reading={formattedLatestReading}
                        previousReading={formattedPreviousReading}
                      />
                    ) : (
                      <div className="rounded-lg border border-border bg-card p-8 text-center">
                        <Activity className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                        <h3 className="text-lg font-semibold text-foreground mb-2">
                          No Readings Yet
                        </h3>
                        <p className="text-muted-foreground mb-4">
                          Add your first blood pressure reading to start tracking
                        </p>
                        <BPEntryDialog />
                      </div>
                    )}

                    {/* Weekly Graph */}
                    {readings.length > 0 && (
                      <WeeklyGraph data={weeklyData} />
                    )}

                    {/* Reading History */}
                    {historyReadings.length > 0 && (
                      <ReadingsHistory readings={historyReadings} />
                    )}
                  </div>
                </div>
              </div>
            )}
          </TabsContent>

          {/* Doctor View */}
          <TabsContent value="doctor">
            {!isDoctorLoggedIn ? (
              <DoctorLogin />
            ) : (
              <DoctorDashboard />
            )}
          </TabsContent>
        </Tabs>
      </main>
    </div>
  )
}
