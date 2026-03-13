"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Calendar, MapPin, Phone, Mail, Droplets, Scale, Ruler } from "lucide-react"

interface PatientInfo {
  name: string
  avatar?: string
  age: number
  gender: string
  bloodType: string
  height: string
  weight: string
  phone: string
  email: string
  address: string
  lastVisit: string
  conditions: string[]
}

interface PatientProfileProps {
  patient: PatientInfo
}

export function PatientProfile({ patient }: PatientProfileProps) {
  const initials = patient.name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()

  return (
    <Card className="border-border/50">
      <CardHeader className="pb-4">
        <CardTitle className="text-sm font-medium text-muted-foreground">
          Patient Profile
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="flex items-center gap-4">
          <Avatar className="size-16 border-2 border-primary/20">
            <AvatarImage src={patient.avatar} alt={patient.name} />
            <AvatarFallback className="bg-primary/10 text-primary text-lg font-semibold">
              {initials}
            </AvatarFallback>
          </Avatar>
          <div>
            <h3 className="text-lg font-semibold text-foreground">{patient.name}</h3>
            <p className="text-sm text-muted-foreground">
              {patient.age} years old • {patient.gender}
            </p>
          </div>
        </div>

        <div className="grid grid-cols-3 gap-3">
          <div className="flex flex-col items-center rounded-lg bg-secondary p-3">
            <Droplets className="mb-1 size-4 text-destructive" />
            <span className="text-xs text-muted-foreground">Blood Type</span>
            <span className="text-sm font-semibold text-foreground">{patient.bloodType}</span>
          </div>
          <div className="flex flex-col items-center rounded-lg bg-secondary p-3">
            <Ruler className="mb-1 size-4 text-chart-2" />
            <span className="text-xs text-muted-foreground">Height</span>
            <span className="text-sm font-semibold text-foreground">{patient.height}</span>
          </div>
          <div className="flex flex-col items-center rounded-lg bg-secondary p-3">
            <Scale className="mb-1 size-4 text-chart-3" />
            <span className="text-xs text-muted-foreground">Weight</span>
            <span className="text-sm font-semibold text-foreground">{patient.weight}</span>
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
          <div className="flex items-center gap-3 text-sm">
            <MapPin className="size-4 text-muted-foreground" />
            <span className="text-foreground">{patient.address}</span>
          </div>
          <div className="flex items-center gap-3 text-sm">
            <Calendar className="size-4 text-muted-foreground" />
            <span className="text-muted-foreground">Last Visit:</span>
            <span className="text-foreground">{patient.lastVisit}</span>
          </div>
        </div>

        <div>
          <p className="mb-2 text-xs font-medium text-muted-foreground">CONDITIONS</p>
          <div className="flex flex-wrap gap-2">
            {patient.conditions.map((condition) => (
              <Badge 
                key={condition} 
                variant="secondary"
                className="bg-primary/10 text-primary border-primary/20 hover:bg-primary/20"
              >
                {condition}
              </Badge>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
