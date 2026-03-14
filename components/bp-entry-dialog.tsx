"use client"

import { useState } from "react"
import { useHealth, TimeOfDay } from "@/lib/health-context"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Plus, Heart, Activity, Sun, Sunset, Moon, CheckCircle, Calendar, ChevronLeft, ChevronRight } from "lucide-react"
import { format, subDays, addDays, isAfter, startOfDay } from "date-fns"

const TIME_SLOTS: { value: TimeOfDay; label: string; icon: typeof Sun; description: string }[] = [
  { value: "morning", label: "Morning", icon: Sun, description: "6:00 AM - 12:00 PM" },
  { value: "afternoon", label: "Afternoon", icon: Sunset, description: "12:00 PM - 6:00 PM" },
  { value: "evening", label: "Evening", icon: Moon, description: "6:00 PM - 12:00 AM" },
]

function getDateString(date: Date): string {
  return date.toISOString().split("T")[0]
}

export function BPEntryDialog() {
  const { addReading, getReadingsForDate, getNextAvailableSlotForDate } = useHealth()
  const [open, setOpen] = useState(false)
  const [selectedDate, setSelectedDate] = useState(new Date())
  const [selectedTime, setSelectedTime] = useState<TimeOfDay | null>(null)
  const [formData, setFormData] = useState({
    systolic: "",
    diastolic: "",
    pulse: "",
  })
  const [errors, setErrors] = useState<Record<string, string>>({})

  const selectedDateStr = getDateString(selectedDate)
  const dateReadings = getReadingsForDate(selectedDateStr)
  const nextSlotForDate = getNextAvailableSlotForDate(selectedDateStr)
  const allSlotsForDateComplete = !nextSlotForDate
  const today = startOfDay(new Date())

  const handleOpenChange = (nextOpen: boolean) => {
    setOpen(nextOpen)

    if (nextOpen) {
      const todayDate = new Date()
      const todayDateStr = getDateString(todayDate)
      setSelectedDate(todayDate)
      setSelectedTime(getNextAvailableSlotForDate(todayDateStr))
      setErrors({})
    }
  }

  const canGoForward = !isAfter(startOfDay(addDays(selectedDate, 1)), today)

  const navigateDate = (direction: "prev" | "next") => {
    let nextDate = selectedDate

    if (direction === "prev") {
      nextDate = subDays(selectedDate, 1)
    } else if (direction === "next" && canGoForward) {
      nextDate = addDays(selectedDate, 1)
    } else {
      return
    }

    const nextDateStr = getDateString(nextDate)
    setSelectedDate(nextDate)
    setSelectedTime(getNextAvailableSlotForDate(nextDateStr))
    setErrors((prev) => {
      const nextErrors = { ...prev }
      delete nextErrors.time
      return nextErrors
    })
  }

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {}
    const systolic = parseInt(formData.systolic)
    const diastolic = parseInt(formData.diastolic)
    const pulse = parseInt(formData.pulse)

    if (!formData.systolic || systolic < 70 || systolic > 200) {
      newErrors.systolic = "Systolic must be between 70-200 mmHg"
    }
    if (!formData.diastolic || diastolic < 40 || diastolic > 130) {
      newErrors.diastolic = "Diastolic must be between 40-130 mmHg"
    }
    if (!formData.pulse || pulse < 40 || pulse > 180) {
      newErrors.pulse = "Pulse must be between 40-180 bpm"
    }
    if (!selectedTime) {
      newErrors.time = "Please select a time of day"
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = () => {
    if (validateForm() && selectedTime) {
      addReading({
        systolic: parseInt(formData.systolic),
        diastolic: parseInt(formData.diastolic),
        pulse: parseInt(formData.pulse),
        timeOfDay: selectedTime,
        date: selectedDateStr,
      })
      setFormData({ systolic: "", diastolic: "", pulse: "" })
      setSelectedTime(null)
      
      // Check if there are more slots for this date
      const updatedReadings = {
        morning: selectedTime === "morning" || dateReadings.morning,
        afternoon: selectedTime === "afternoon" || dateReadings.afternoon,
        evening: selectedTime === "evening" || dateReadings.evening,
      }
      
      if (updatedReadings.morning && updatedReadings.afternoon && updatedReadings.evening) {
        // All done for this date, close dialog
        setOpen(false)
      }
    }
  }

  const updateField = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
    if (errors[field]) {
      setErrors((prev) => {
        const nextErrors = { ...prev }
        delete nextErrors[field]
        return nextErrors
      })
    }
  }

  const getPreviewStatus = () => {
    const systolic = parseInt(formData.systolic)
    const diastolic = parseInt(formData.diastolic)

    if (!systolic || !diastolic) return null

    if (systolic < 90 || diastolic < 60) {
      return { label: "Low", color: "text-blue-400", bg: "bg-blue-500/20" }
    }
    if (systolic >= 130 || diastolic >= 80) {
      return { label: "High", color: "text-red-400", bg: "bg-red-500/20" }
    }
    if (systolic >= 120 && diastolic < 80) {
      return { label: "Elevated", color: "text-yellow-400", bg: "bg-yellow-500/20" }
    }
    return { label: "Normal", color: "text-emerald-400", bg: "bg-emerald-500/20" }
  }

  const status = getPreviewStatus()

  const isSlotTaken = (slot: TimeOfDay) => {
    return dateReadings[slot]
  }

  const completedCount = Object.values(dateReadings).filter(Boolean).length
  const isToday = getDateString(selectedDate) === getDateString(new Date())

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>
        <Button className="gap-2">
          <Plus className="h-4 w-4" />
          Add Reading
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-foreground">
            <Heart className="h-5 w-5 text-primary" />
            New Blood Pressure Reading
          </DialogTitle>
          <DialogDescription>
            Record your blood pressure measurement
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {/* Date Selector */}
          <div className="space-y-2">
            <Label className="text-foreground flex items-center gap-2">
              <Calendar className="h-4 w-4 text-muted-foreground" />
              Select Date
            </Label>
            <div className="flex items-center justify-between bg-secondary/50 rounded-lg p-2">
              <Button
                variant="ghost"
                size="icon"
                onClick={() => navigateDate("prev")}
                className="h-8 w-8"
              >
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <div className="text-center">
                <div className="font-medium text-foreground">
                  {format(selectedDate, "EEEE, MMMM d")}
                </div>
                <div className="text-xs text-muted-foreground">
                  {isToday ? "Today" : format(selectedDate, "yyyy")}
                </div>
              </div>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => navigateDate("next")}
                disabled={!canGoForward}
                className="h-8 w-8"
              >
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          </div>

          {/* Daily Progress */}
          <div className="bg-secondary/50 rounded-lg p-3">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-foreground">
                {isToday ? "Today's" : format(selectedDate, "MMM d")} Progress
              </span>
              <span className="text-sm text-muted-foreground">{completedCount}/3 readings</span>
            </div>
            <div className="flex gap-2">
              {[1, 2, 3].map((i) => (
                <div
                  key={i}
                  className={`h-2 flex-1 rounded-full ${
                    i <= completedCount ? "bg-primary" : "bg-border"
                  }`}
                />
              ))}
            </div>
            {allSlotsForDateComplete && (
              <p className="text-xs text-primary mt-2 text-center">
                All readings complete for this date. Select a different date.
              </p>
            )}
          </div>

          {/* Time Slot Selection */}
          <div className="space-y-2">
            <Label className="text-foreground">Select Time of Day</Label>
            <div className="grid grid-cols-3 gap-2">
              {TIME_SLOTS.map((slot) => {
                const Icon = slot.icon
                const taken = isSlotTaken(slot.value)
                const isSelected = selectedTime === slot.value

                return (
                  <button
                    key={slot.value}
                    type="button"
                    onClick={() => !taken && setSelectedTime(slot.value)}
                    disabled={taken}
                    className={`relative flex flex-col items-center gap-1 p-3 rounded-lg border transition-all ${
                      taken
                        ? "bg-primary/10 border-primary/30 cursor-not-allowed"
                        : isSelected
                        ? "bg-primary/20 border-primary"
                        : "bg-secondary/50 border-border hover:border-primary/50"
                    }`}
                  >
                    {taken && (
                      <CheckCircle className="absolute top-1 right-1 h-4 w-4 text-primary" />
                    )}
                    <Icon className={`h-5 w-5 ${taken ? "text-primary" : isSelected ? "text-primary" : "text-muted-foreground"}`} />
                    <span className={`text-xs font-medium ${taken ? "text-primary" : isSelected ? "text-primary" : "text-foreground"}`}>
                      {slot.label}
                    </span>
                    <span className="text-[10px] text-muted-foreground">{slot.description}</span>
                  </button>
                )
              })}
            </div>
            {errors.time && (
              <p className="text-xs text-destructive">{errors.time}</p>
            )}
          </div>

          {/* Blood Pressure Inputs */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="systolic" className="text-foreground">
                Systolic (mmHg)
              </Label>
              <Input
                id="systolic"
                type="number"
                placeholder="120"
                value={formData.systolic}
                onChange={(e) => updateField("systolic", e.target.value)}
                className={`text-center text-lg ${errors.systolic ? "border-destructive" : ""}`}
              />
              {errors.systolic && (
                <p className="text-xs text-destructive">{errors.systolic}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="diastolic" className="text-foreground">
                Diastolic (mmHg)
              </Label>
              <Input
                id="diastolic"
                type="number"
                placeholder="80"
                value={formData.diastolic}
                onChange={(e) => updateField("diastolic", e.target.value)}
                className={`text-center text-lg ${errors.diastolic ? "border-destructive" : ""}`}
              />
              {errors.diastolic && (
                <p className="text-xs text-destructive">{errors.diastolic}</p>
              )}
            </div>
          </div>

          {/* Pulse Input */}
          <div className="space-y-2">
            <Label htmlFor="pulse" className="flex items-center gap-2 text-foreground">
              <Activity className="h-4 w-4 text-muted-foreground" />
              Pulse Rate (bpm)
            </Label>
            <Input
              id="pulse"
              type="number"
              placeholder="72"
              value={formData.pulse}
              onChange={(e) => updateField("pulse", e.target.value)}
              className={`text-center text-lg ${errors.pulse ? "border-destructive" : ""}`}
            />
            {errors.pulse && (
              <p className="text-xs text-destructive">{errors.pulse}</p>
            )}
          </div>

          {/* Status Preview */}
          {status && (
            <div className={`flex items-center justify-center gap-2 p-3 rounded-lg ${status.bg}`}>
              <span className="text-sm text-muted-foreground">Status:</span>
              <span className={`font-semibold ${status.color}`}>{status.label}</span>
            </div>
          )}

          {/* Reference Guide */}
          <div className="bg-secondary/50 rounded-lg p-3 space-y-1">
            <p className="text-xs font-medium text-muted-foreground">Blood Pressure Categories:</p>
            <div className="grid grid-cols-2 gap-x-4 gap-y-1 text-xs">
              <span className="text-emerald-400">Normal: &lt;120/80</span>
              <span className="text-yellow-400">Elevated: 120-129/&lt;80</span>
              <span className="text-red-400">High: &ge;130/80</span>
              <span className="text-blue-400">Low: &lt;90/60</span>
            </div>
          </div>
        </div>

        <div className="flex gap-3">
          <Button variant="outline" onClick={() => setOpen(false)} className="flex-1">
            Cancel
          </Button>
          <Button onClick={handleSubmit} className="flex-1" disabled={!selectedTime || allSlotsForDateComplete}>
            Save Reading
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
