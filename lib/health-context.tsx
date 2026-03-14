"use client"

import { createContext, useContext, useState, useEffect, ReactNode } from "react"
import { isSameDay } from "date-fns"

export interface Patient {
  id: string
  name: string
  age: number
  gender: string
  bloodType: string
  height: string
  weight: string
  phone: string
  email: string
  createdAt: Date
}

export type TimeOfDay = "morning" | "afternoon" | "evening"

export interface BloodPressureReading {
  id: string
  systolic: number
  diastolic: number
  pulse: number
  timestamp: Date
  status: "normal" | "elevated" | "high" | "low"
  timeOfDay: TimeOfDay
  date: string // YYYY-MM-DD format for grouping
}

interface HealthContextType {
  patient: Patient | null
  readings: BloodPressureReading[]
  isDoctorLoggedIn: boolean
  currentDate: Date
  todayReadings: { morning: boolean; afternoon: boolean; evening: boolean }
  nextAvailableSlot: TimeOfDay | null
  registerPatient: (patient: Omit<Patient, "id" | "createdAt">) => void
  addReading: (reading: Omit<BloodPressureReading, "id" | "timestamp" | "status">) => void
  deleteReading: (id: string) => void
  loginDoctor: (username: string, password: string) => boolean
  logoutDoctor: () => void
  clearPatientData: () => void
  getReadingsForDate: (dateStr: string) => { morning: boolean; afternoon: boolean; evening: boolean }
  getNextAvailableSlotForDate: (dateStr: string) => TimeOfDay | null
}

const HealthContext = createContext<HealthContextType | undefined>(undefined)

const DOCTOR_CREDENTIALS = {
  username: "doctor",
  password: "health123",
}

function calculateBPStatus(systolic: number, diastolic: number): BloodPressureReading["status"] {
  if (systolic < 90 || diastolic < 60) return "low"
  if (systolic >= 130 || diastolic >= 80) return "high"
  if (systolic >= 120 && diastolic < 80) return "elevated"
  return "normal"
}

function getDateString(date: Date): string {
  return date.toISOString().split("T")[0]
}

export function HealthProvider({ children }: { children: ReactNode }) {
  const [patient, setPatient] = useState<Patient | null>(() => {
    if (typeof window === "undefined") {
      return null
    }

    const storedPatient = localStorage.getItem("healthpulse_patient")
    if (!storedPatient) {
      return null
    }

    try {
      const parsed = JSON.parse(storedPatient) as Omit<Patient, "createdAt"> & { createdAt: string }
      return {
        ...parsed,
        createdAt: new Date(parsed.createdAt),
      }
    } catch {
      return null
    }
  })
  const [readings, setReadings] = useState<BloodPressureReading[]>(() => {
    if (typeof window === "undefined") {
      return []
    }

    const storedReadings = localStorage.getItem("healthpulse_readings")
    if (!storedReadings) {
      return []
    }

    try {
      const parsed = JSON.parse(storedReadings) as Array<Omit<BloodPressureReading, "timestamp"> & { timestamp: string }>
      return parsed.map((reading) => ({
        ...reading,
        timestamp: new Date(reading.timestamp),
      }))
    } catch {
      return []
    }
  })
  const [isDoctorLoggedIn, setIsDoctorLoggedIn] = useState(false)
  const [currentDate, setCurrentDate] = useState(() => new Date())

  // Persist patient to localStorage
  useEffect(() => {
    if (patient) {
      localStorage.setItem("healthpulse_patient", JSON.stringify(patient))
    }
  }, [patient])

  // Persist readings to localStorage
  useEffect(() => {
    localStorage.setItem("healthpulse_readings", JSON.stringify(readings))
  }, [readings])

  // Get readings status for a specific date
  const getReadingsForDate = (dateStr: string) => {
    return {
      morning: readings.some((r) => r.date === dateStr && r.timeOfDay === "morning"),
      afternoon: readings.some((r) => r.date === dateStr && r.timeOfDay === "afternoon"),
      evening: readings.some((r) => r.date === dateStr && r.timeOfDay === "evening"),
    }
  }

  // Get next available slot for a specific date
  const getNextAvailableSlotForDate = (dateStr: string): TimeOfDay | null => {
    const dateReadings = getReadingsForDate(dateStr)
    if (!dateReadings.morning) return "morning"
    if (!dateReadings.afternoon) return "afternoon"
    if (!dateReadings.evening) return "evening"
    return null
  }

  // Check which readings have been taken today
  const todayReadings = getReadingsForDate(getDateString(currentDate))

  // Determine the next available time slot for today
  const nextAvailableSlot = getNextAvailableSlotForDate(getDateString(currentDate))

  // Auto-advance to next day when all slots are filled
  useEffect(() => {
    if (todayReadings.morning && todayReadings.afternoon && todayReadings.evening) {
      // Check if we need to advance to next day
      const now = new Date()
      if (!isSameDay(currentDate, now)) {
        const timeoutId = window.setTimeout(() => {
          setCurrentDate(now)
        }, 0)

        return () => window.clearTimeout(timeoutId)
      }
    }
  }, [todayReadings, currentDate])

  // Also update current date at midnight
  useEffect(() => {
    const checkDate = () => {
      const now = new Date()
      if (!isSameDay(currentDate, now)) {
        setCurrentDate(now)
      }
    }

    const interval = setInterval(checkDate, 60000) // Check every minute
    return () => clearInterval(interval)
  }, [currentDate])

  const registerPatient = (patientData: Omit<Patient, "id" | "createdAt">) => {
    const newPatient: Patient = {
      ...patientData,
      id: crypto.randomUUID(),
      createdAt: new Date(),
    }
    setPatient(newPatient)
  }

  const addReading = (readingData: Omit<BloodPressureReading, "id" | "timestamp" | "status">) => {
    const now = new Date()
    const newReading: BloodPressureReading = {
      ...readingData,
      id: crypto.randomUUID(),
      timestamp: now,
      status: calculateBPStatus(readingData.systolic, readingData.diastolic),
    }
    setReadings((prev) => [...prev, newReading].sort((a, b) => 
      new Date(b.date).getTime() - new Date(a.date).getTime()
    ))

    // Check if all readings for today are complete - if so, advance to next day
    const todayStr = getDateString(currentDate)
    if (readingData.date === todayStr) {
      const updatedTodayReadings = {
        morning: newReading.timeOfDay === "morning" || todayReadings.morning,
        afternoon: newReading.timeOfDay === "afternoon" || todayReadings.afternoon,
        evening: newReading.timeOfDay === "evening" || todayReadings.evening,
      }

      if (updatedTodayReadings.morning && updatedTodayReadings.afternoon && updatedTodayReadings.evening) {
        // All slots filled, advance to next day
        const nextDay = new Date(currentDate)
        nextDay.setDate(nextDay.getDate() + 1)
        setCurrentDate(nextDay)
      }
    }
  }

  const deleteReading = (id: string) => {
    setReadings((prev) => prev.filter((r) => r.id !== id))
  }

  const loginDoctor = (username: string, password: string): boolean => {
    if (username === DOCTOR_CREDENTIALS.username && password === DOCTOR_CREDENTIALS.password) {
      setIsDoctorLoggedIn(true)
      return true
    }
    return false
  }

  const logoutDoctor = () => {
    setIsDoctorLoggedIn(false)
  }

  const clearPatientData = () => {
    setPatient(null)
    setReadings([])
    localStorage.removeItem("healthpulse_patient")
    localStorage.removeItem("healthpulse_readings")
  }

  if (typeof window === "undefined") {
    return null
  }

  return (
    <HealthContext.Provider
      value={{
        patient,
        readings,
        isDoctorLoggedIn,
        currentDate,
        todayReadings,
        nextAvailableSlot,
        registerPatient,
        addReading,
        deleteReading,
        loginDoctor,
        logoutDoctor,
        clearPatientData,
        getReadingsForDate,
        getNextAvailableSlotForDate,
      }}
    >
      {children}
    </HealthContext.Provider>
  )
}

export function useHealth() {
  const context = useContext(HealthContext)
  if (context === undefined) {
    throw new Error("useHealth must be used within a HealthProvider")
  }
  return context
}
