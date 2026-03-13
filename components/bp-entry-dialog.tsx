"use client"

import { useState } from "react"
import { useHealth } from "@/lib/health-context"
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
import { Plus, Heart, Activity } from "lucide-react"

export function BPEntryDialog() {
  const { addReading } = useHealth()
  const [open, setOpen] = useState(false)
  const [formData, setFormData] = useState({
    systolic: "",
    diastolic: "",
    pulse: "",
  })
  const [errors, setErrors] = useState<Record<string, string>>({})

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

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = () => {
    if (validateForm()) {
      addReading({
        systolic: parseInt(formData.systolic),
        diastolic: parseInt(formData.diastolic),
        pulse: parseInt(formData.pulse),
      })
      setFormData({ systolic: "", diastolic: "", pulse: "" })
      setOpen(false)
    }
  }

  const updateField = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
    if (errors[field]) {
      setErrors((prev) => {
        const { [field]: _, ...rest } = prev
        return rest
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

  return (
    <Dialog open={open} onOpenChange={setOpen}>
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
            Enter your current blood pressure and pulse measurements
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 py-4">
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
          <Button onClick={handleSubmit} className="flex-1">
            Save Reading
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
