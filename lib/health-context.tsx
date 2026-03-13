"use client"

import { createContext, useContext, useState, useEffect, ReactNode } from "react"

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

export interface BloodPressureReading {
  id: string
  systolic: number
  diastolic: number
  pulse: number
  timestamp: Date
  status: "normal" | "elevated" | "high" | "low"
}

interface HealthContextType {
  patient: Patient | null
  readings: BloodPressureReading[]
  isDoctorLoggedIn: boolean
  registerPatient: (patient: Omit<Patient, "id" | "createdAt">) => void
  addReading: (reading: Omit<BloodPressureReading, "id" | "timestamp" | "status">) => void
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

export function HealthProvider({ children }: { children: ReactNode }) {
  const [patient, setPatient] = useState<Patient | null>(null)
  const [readings, setReadings] = useState<BloodPressureReading[]>([])
  const [isDoctorLoggedIn, setIsDoctorLoggedIn] = useState(false)
  const [isLoaded, setIsLoaded] = useState(false)

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

  const registerPatient = (patientData: Omit<Patient, "id" | "createdAt">) => {
    const newPatient: Patient = {
      ...patientData,
      id: crypto.randomUUID(),
      createdAt: new Date(),
    }
    setPatient(newPatient)
  }

  const addReading = (readingData: Omit<BloodPressureReading, "id" | "timestamp" | "status">) => {
    const newReading: BloodPressureReading = {
      ...readingData,
      id: crypto.randomUUID(),
      timestamp: new Date(),
      status: calculateBPStatus(readingData.systolic, readingData.diastolic),
    }
    setReadings((prev) => [newReading, ...prev])
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
