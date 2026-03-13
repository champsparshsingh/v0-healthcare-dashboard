"use client"

import { useState } from "react"
import { useHealth } from "@/lib/health-context"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Activity, User, Heart, Phone } from "lucide-react"

export function PatientRegistrationForm() {
  const { registerPatient } = useHealth()
  const [step, setStep] = useState(1)
  const [formData, setFormData] = useState({
    name: "",
    age: "",
    gender: "",
    bloodType: "",
    height: "",
    weight: "",
    phone: "",
    email: "",
  })
  const [errors, setErrors] = useState<Record<string, string>>({})

  const validateStep = (currentStep: number): boolean => {
    const newErrors: Record<string, string> = {}

    if (currentStep === 1) {
      if (!formData.name.trim()) newErrors.name = "Name is required"
      if (!formData.age || parseInt(formData.age) < 1 || parseInt(formData.age) > 120) {
        newErrors.age = "Valid age is required (1-120)"
      }
      if (!formData.gender) newErrors.gender = "Gender is required"
    } else if (currentStep === 2) {
      if (!formData.bloodType) newErrors.bloodType = "Blood type is required"
      if (!formData.height.trim()) newErrors.height = "Height is required"
      if (!formData.weight.trim()) newErrors.weight = "Weight is required"
    } else if (currentStep === 3) {
      if (!formData.phone.trim()) newErrors.phone = "Phone number is required"
      if (!formData.email.trim() || !formData.email.includes("@")) {
        newErrors.email = "Valid email is required"
      }
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleNext = () => {
    if (validateStep(step)) {
      setStep(step + 1)
    }
  }

  const handleBack = () => {
    setStep(step - 1)
  }

  const handleSubmit = () => {
    if (validateStep(3)) {
      registerPatient({
        name: formData.name,
        age: parseInt(formData.age),
        gender: formData.gender,
        bloodType: formData.bloodType,
        height: formData.height,
        weight: formData.weight,
        phone: formData.phone,
        email: formData.email,
      })
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

  const stepIcons = [
    <User key="user" className="h-5 w-5" />,
    <Heart key="heart" className="h-5 w-5" />,
    <Phone key="phone" className="h-5 w-5" />,
  ]

  const stepTitles = ["Personal Info", "Health Details", "Contact"]

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-background">
      <Card className="w-full max-w-lg border-border">
        <CardHeader className="text-center space-y-4">
          <div className="flex items-center justify-center gap-2">
            <Activity className="h-8 w-8 text-primary" />
            <span className="text-2xl font-bold text-foreground">HealthPulse</span>
          </div>
          <div>
            <CardTitle className="text-xl text-foreground">Patient Registration</CardTitle>
            <CardDescription className="text-muted-foreground">
              Enter your details to start monitoring your health
            </CardDescription>
          </div>

          {/* Step Indicators */}
          <div className="flex items-center justify-center gap-2 pt-2">
            {[1, 2, 3].map((s) => (
              <div key={s} className="flex items-center gap-2">
                <div
                  className={`flex items-center justify-center w-10 h-10 rounded-full transition-colors ${
                    s === step
                      ? "bg-primary text-primary-foreground"
                      : s < step
                        ? "bg-primary/20 text-primary"
                        : "bg-secondary text-muted-foreground"
                  }`}
                >
                  {stepIcons[s - 1]}
                </div>
                {s < 3 && (
                  <div className={`w-8 h-0.5 ${s < step ? "bg-primary" : "bg-secondary"}`} />
                )}
              </div>
            ))}
          </div>
          <p className="text-sm text-muted-foreground">{stepTitles[step - 1]}</p>
        </CardHeader>

        <CardContent className="space-y-6">
          {step === 1 && (
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name" className="text-foreground">Full Name</Label>
                <Input
                  id="name"
                  placeholder="Enter your full name"
                  value={formData.name}
                  onChange={(e) => updateField("name", e.target.value)}
                  className={errors.name ? "border-destructive" : ""}
                />
                {errors.name && <p className="text-sm text-destructive">{errors.name}</p>}
              </div>

              <div className="space-y-2">
                <Label htmlFor="age" className="text-foreground">Age</Label>
                <Input
                  id="age"
                  type="number"
                  placeholder="Enter your age"
                  value={formData.age}
                  onChange={(e) => updateField("age", e.target.value)}
                  className={errors.age ? "border-destructive" : ""}
                />
                {errors.age && <p className="text-sm text-destructive">{errors.age}</p>}
              </div>

              <div className="space-y-2">
                <Label className="text-foreground">Gender</Label>
                <Select value={formData.gender} onValueChange={(v) => updateField("gender", v)}>
                  <SelectTrigger className={errors.gender ? "border-destructive" : ""}>
                    <SelectValue placeholder="Select gender" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="male">Male</SelectItem>
                    <SelectItem value="female">Female</SelectItem>
                    <SelectItem value="other">Other</SelectItem>
                  </SelectContent>
                </Select>
                {errors.gender && <p className="text-sm text-destructive">{errors.gender}</p>}
              </div>
            </div>
          )}

          {step === 2 && (
            <div className="space-y-4">
              <div className="space-y-2">
                <Label className="text-foreground">Blood Type</Label>
                <Select value={formData.bloodType} onValueChange={(v) => updateField("bloodType", v)}>
                  <SelectTrigger className={errors.bloodType ? "border-destructive" : ""}>
                    <SelectValue placeholder="Select blood type" />
                  </SelectTrigger>
                  <SelectContent>
                    {["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"].map((type) => (
                      <SelectItem key={type} value={type}>
                        {type}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {errors.bloodType && <p className="text-sm text-destructive">{errors.bloodType}</p>}
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="height" className="text-foreground">Height (cm)</Label>
                  <Input
                    id="height"
                    placeholder="e.g., 175"
                    value={formData.height}
                    onChange={(e) => updateField("height", e.target.value)}
                    className={errors.height ? "border-destructive" : ""}
                  />
                  {errors.height && <p className="text-sm text-destructive">{errors.height}</p>}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="weight" className="text-foreground">Weight (kg)</Label>
                  <Input
                    id="weight"
                    placeholder="e.g., 70"
                    value={formData.weight}
                    onChange={(e) => updateField("weight", e.target.value)}
                    className={errors.weight ? "border-destructive" : ""}
                  />
                  {errors.weight && <p className="text-sm text-destructive">{errors.weight}</p>}
                </div>
              </div>
            </div>
          )}

          {step === 3 && (
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="phone" className="text-foreground">Phone Number</Label>
                <Input
                  id="phone"
                  type="tel"
                  placeholder="Enter your phone number"
                  value={formData.phone}
                  onChange={(e) => updateField("phone", e.target.value)}
                  className={errors.phone ? "border-destructive" : ""}
                />
                {errors.phone && <p className="text-sm text-destructive">{errors.phone}</p>}
              </div>

              <div className="space-y-2">
                <Label htmlFor="email" className="text-foreground">Email Address</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="Enter your email"
                  value={formData.email}
                  onChange={(e) => updateField("email", e.target.value)}
                  className={errors.email ? "border-destructive" : ""}
                />
                {errors.email && <p className="text-sm text-destructive">{errors.email}</p>}
              </div>
            </div>
          )}

          <div className="flex gap-3 pt-4">
            {step > 1 && (
              <Button variant="outline" onClick={handleBack} className="flex-1">
                Back
              </Button>
            )}
            {step < 3 ? (
              <Button onClick={handleNext} className="flex-1">
                Continue
              </Button>
            ) : (
              <Button onClick={handleSubmit} className="flex-1">
                Complete Registration
              </Button>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
