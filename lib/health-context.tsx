"use client"

import { createContext, useContext, useState, useEffect, ReactNode } from "react"
import { startOfDay, isSameDay } from "date-fns"

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
  addReading: (reading: Omit<BloodPressureReading, "id" | "timestamp" | "status" | "date">) => void
  deleteReading: (id: string) => void
  loginDoctor: (username: string, password: string) => boolean
  logoutDoctor: () => void
  clearPatientData: () => void
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
  const [patient, setPatient] = useState<Patient | null>(null)
  const [readings, setReadings] = useState<BloodPressureReading[]>([])
  const [isDoctorLoggedIn, setIsDoctorLoggedIn] = useState(false)
  const [isLoaded, setIsLoaded] = useState(false)
  const [currentDate, setCurrentDate] = useState(new Date())

  // Load data from localStorage on mount
  useEffect(() => {
    const storedPatient = localStorage.getItem("healthpulse_patient")
    const storedReadings = localStorage.getItem("healthpulse_readings")

    if (storedPatient) {
      const parsed = JSON.parse(storedPatient)
      parsed.createdAt = new Date(parsed.createdAt)
      setPatient(parsed)
    }

    if (storedReadings) {
      const parsed = JSON.parse(storedReadings)
      const readingsWithDates = parsed.map((r: BloodPressureReading) => ({
        ...r,
        timestamp: new Date(r.timestamp),
      }))
      setReadings(readingsWithDates)
    }

    setIsLoaded(true)
  }, [])

  // Persist patient to localStorage
  useEffect(() => {
    if (isLoaded && patient) {
      localStorage.setItem("healthpulse_patient", JSON.stringify(patient))
    }
  }, [patient, isLoaded])

  // Persist readings to localStorage
  useEffect(() => {
    if (isLoaded) {
      localStorage.setItem("healthpulse_readings", JSON.stringify(readings))
    }
  }, [readings, isLoaded])

  // Check which readings have been taken today
  const todayReadings = {
    morning: readings.some(
      (r) => r.date === getDateString(currentDate) && r.timeOfDay === "morning"
    ),
    afternoon: readings.some(
      (r) => r.date === getDateString(currentDate) && r.timeOfDay === "afternoon"
    ),
    evening: readings.some(
      (r) => r.date === getDateString(currentDate) && r.timeOfDay === "evening"
    ),
  }

  // Determine the next available time slot
  const getNextAvailableSlot = (): TimeOfDay | null => {
    if (!todayReadings.morning) return "morning"
    if (!todayReadings.afternoon) return "afternoon"
    if (!todayReadings.evening) return "evening"
    return null // All slots filled for today
  }

  const nextAvailableSlot = getNextAvailableSlot()

  // Auto-advance to next day when all slots are filled
  useEffect(() => {
    if (isLoaded && todayReadings.morning && todayReadings.afternoon && todayReadings.evening) {
      // Check if we need to advance to next day
      const now = new Date()
      if (!isSameDay(currentDate, now)) {
        setCurrentDate(now)
      }
    }
  }, [readings, isLoaded, todayReadings, currentDate])

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

  const addReading = (readingData: Omit<BloodPressureReading, "id" | "timestamp" | "status" | "date">) => {
    const now = new Date()
    const newReading: BloodPressureReading = {
      ...readingData,
      id: crypto.randomUUID(),
      timestamp: now,
      date: getDateString(currentDate),
      status: calculateBPStatus(readingData.systolic, readingData.diastolic),
    }
    setReadings((prev) => [newReading, ...prev])

    // Check if all readings for the day are complete - if so, advance to next day
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

  if (!isLoaded) {
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
