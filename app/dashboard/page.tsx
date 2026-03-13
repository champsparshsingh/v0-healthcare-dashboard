"use client"

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
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Activity, User, Stethoscope, Sun, Sunset, Moon, Calendar, CheckCircle } from "lucide-react"
import { format } from "date-fns"

export default function Home() {
  const { patient, readings, isDoctorLoggedIn, currentDate, todayReadings, nextAvailableSlot } = useHealth()

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

  // Transform readings for history component
  const historyReadings = readings.slice(0, 10).map((r) => ({
    id: r.id,
    systolic: r.systolic,
    diastolic: r.diastolic,
    pulse: r.pulse,
    timestamp: format(new Date(r.timestamp), "MMM d, h:mm a"),
    status: r.status,
  }))

  const completedCount = Object.values(todayReadings).filter(Boolean).length
  const allComplete = completedCount === 3

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

                {/* Today's Schedule Card */}
                <Card className="border-border">
                  <CardHeader className="pb-3">
                    <div className="flex items-center justify-between">
                      <CardTitle className="flex items-center gap-2 text-foreground">
                        <Calendar className="h-5 w-5 text-primary" />
                        Today&apos;s Readings
                      </CardTitle>
                      <span className="text-sm text-muted-foreground">
                        {format(currentDate, "EEEE, MMMM d, yyyy")}
                      </span>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-3 gap-4">
                      {/* Morning */}
                      <div className={`relative flex flex-col items-center p-4 rounded-lg border transition-all ${
                        todayReadings.morning 
                          ? "bg-primary/10 border-primary/30" 
                          : nextAvailableSlot === "morning"
                          ? "bg-secondary border-primary/50"
                          : "bg-secondary/50 border-border"
                      }`}>
                        {todayReadings.morning && (
                          <CheckCircle className="absolute top-2 right-2 h-4 w-4 text-primary" />
                        )}
                        <Sun className={`h-8 w-8 mb-2 ${todayReadings.morning ? "text-primary" : "text-yellow-400"}`} />
                        <span className="font-semibold text-foreground">Morning</span>
                        <span className="text-xs text-muted-foreground">6AM - 12PM</span>
                        <span className={`mt-2 text-xs font-medium ${
                          todayReadings.morning ? "text-primary" : "text-muted-foreground"
                        }`}>
                          {todayReadings.morning ? "Completed" : nextAvailableSlot === "morning" ? "Next" : "Pending"}
                        </span>
                      </div>

                      {/* Afternoon */}
                      <div className={`relative flex flex-col items-center p-4 rounded-lg border transition-all ${
                        todayReadings.afternoon 
                          ? "bg-primary/10 border-primary/30" 
                          : nextAvailableSlot === "afternoon"
                          ? "bg-secondary border-primary/50"
                          : "bg-secondary/50 border-border"
                      }`}>
                        {todayReadings.afternoon && (
                          <CheckCircle className="absolute top-2 right-2 h-4 w-4 text-primary" />
                        )}
                        <Sunset className={`h-8 w-8 mb-2 ${todayReadings.afternoon ? "text-primary" : "text-orange-400"}`} />
                        <span className="font-semibold text-foreground">Afternoon</span>
                        <span className="text-xs text-muted-foreground">12PM - 6PM</span>
                        <span className={`mt-2 text-xs font-medium ${
                          todayReadings.afternoon ? "text-primary" : "text-muted-foreground"
                        }`}>
                          {todayReadings.afternoon ? "Completed" : nextAvailableSlot === "afternoon" ? "Next" : "Pending"}
                        </span>
                      </div>

                      {/* Evening */}
                      <div className={`relative flex flex-col items-center p-4 rounded-lg border transition-all ${
                        todayReadings.evening 
                          ? "bg-primary/10 border-primary/30" 
                          : nextAvailableSlot === "evening"
                          ? "bg-secondary border-primary/50"
                          : "bg-secondary/50 border-border"
                      }`}>
                        {todayReadings.evening && (
                          <CheckCircle className="absolute top-2 right-2 h-4 w-4 text-primary" />
                        )}
                        <Moon className={`h-8 w-8 mb-2 ${todayReadings.evening ? "text-primary" : "text-blue-400"}`} />
                        <span className="font-semibold text-foreground">Evening</span>
                        <span className="text-xs text-muted-foreground">6PM - 12AM</span>
                        <span className={`mt-2 text-xs font-medium ${
                          todayReadings.evening ? "text-primary" : "text-muted-foreground"
                        }`}>
                          {todayReadings.evening ? "Completed" : nextAvailableSlot === "evening" ? "Next" : "Pending"}
                        </span>
                      </div>
                    </div>

                    {/* Progress Bar */}
                    <div className="mt-4 pt-4 border-t border-border">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm font-medium text-foreground">Daily Progress</span>
                        <span className="text-sm text-muted-foreground">{completedCount}/3 readings</span>
                      </div>
                      <div className="flex gap-2">
                        {[1, 2, 3].map((i) => (
                          <div
                            key={i}
                            className={`h-2 flex-1 rounded-full transition-all ${
                              i <= completedCount ? "bg-primary" : "bg-border"
                            }`}
                          />
                        ))}
                      </div>
                      {allComplete && (
                        <p className="mt-3 text-center text-sm text-primary font-medium">
                          All readings complete for today! Next readings start tomorrow.
                        </p>
                      )}
                    </div>
                  </CardContent>
                </Card>

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
                    <WeeklyGraph />

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
