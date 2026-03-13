"use client"

import { useHealth } from "@/lib/health-context"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Phone, Mail, Droplets, Scale, Ruler, LogOut } from "lucide-react"

export function PatientProfile() {
  const { patient, clearPatientData } = useHealth()

  if (!patient) return null

  const initials = patient.name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2)

  return (
    <Card className="border-border/50">
      <CardHeader className="pb-4">
        <div className="flex items-center justify-between">
          <CardTitle className="text-sm font-medium text-muted-foreground">
            Patient Profile
          </CardTitle>
          <Button
            variant="ghost"
            size="sm"
            onClick={clearPatientData}
            className="text-muted-foreground hover:text-destructive h-8 px-2"
          >
            <LogOut className="h-4 w-4" />
          </Button>
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="flex items-center gap-4">
          <Avatar className="size-16 border-2 border-primary/20">
            <AvatarFallback className="bg-primary/10 text-primary text-lg font-semibold">
              {initials}
            </AvatarFallback>
          </Avatar>
          <div>
            <h3 className="text-lg font-semibold text-foreground">{patient.name}</h3>
            <p className="text-sm text-muted-foreground capitalize">
              {patient.age} years old | {patient.gender}
            </p>
          </div>
        </div>

        <div className="grid grid-cols-3 gap-3">
          <div className="flex flex-col items-center rounded-lg bg-secondary p-3">
            <Droplets className="mb-1 size-4 text-red-400" />
            <span className="text-xs text-muted-foreground">Blood Type</span>
            <span className="text-sm font-semibold text-foreground">{patient.bloodType}</span>
          </div>
          <div className="flex flex-col items-center rounded-lg bg-secondary p-3">
            <Ruler className="mb-1 size-4 text-blue-400" />
            <span className="text-xs text-muted-foreground">Height</span>
            <span className="text-sm font-semibold text-foreground">{patient.height} cm</span>
          </div>
          <div className="flex flex-col items-center rounded-lg bg-secondary p-3">
            <Scale className="mb-1 size-4 text-emerald-400" />
            <span className="text-xs text-muted-foreground">Weight</span>
            <span className="text-sm font-semibold text-foreground">{patient.weight} kg</span>
          </div>
        </div>

        <div className="space-y-3">
          <div className="flex items-center gap-3 text-sm">
            <Phone className="size-4 text-muted-foreground" />
            <span className="text-foreground">{patient.phone}</span>
          </div>
          <div className="flex items-center gap-3 text-sm">
            <Mail className="size-4 text-muted-foreground" />
            <span className="text-foreground">{patient.email}</span>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
