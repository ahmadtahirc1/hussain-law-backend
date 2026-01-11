"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Calendar } from "@/components/ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { format } from "date-fns"

interface ScheduleAppointmentDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  cases: any[]
  clients: any[]
  onAppointmentCreated?: () => void
}

export function ScheduleAppointmentDialog({
  open,
  onOpenChange,
  cases,
  clients,
  onAppointmentCreated,
}: ScheduleAppointmentDialogProps) {
  const [loading, setLoading] = useState(false)
  const [date, setDate] = useState<Date | undefined>(undefined)
  const [formData, setFormData] = useState({
    case_id: "",
    client_id: "",
    title: "",
    description: "",
    duration_minutes: "60",
    time: "10:00",
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!date || !formData.case_id || !formData.client_id || !formData.title || !formData.time) {
      alert("Please fill in all required fields")
      return
    }

    setLoading(true)
    try {
      // Combine date and time
      const appointmentDateTime = new Date(date)
      const [hours, minutes] = formData.time.split(":").map(Number)
      appointmentDateTime.setHours(hours, minutes, 0)

      const response = await fetch("/api/appointments", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          case_id: formData.case_id,
          client_id: formData.client_id,
          title: formData.title,
          description: formData.description,
          appointment_date: appointmentDateTime.toISOString(),
          duration_minutes: Number.parseInt(formData.duration_minutes),
        }),
      })

      if (!response.ok) {
        throw new Error("Failed to create appointment")
      }

      console.log("[v0] Appointment created successfully")

      // Reset form
      setFormData({
        case_id: "",
        client_id: "",
        title: "",
        description: "",
        duration_minutes: "60",
        time: "10:00",
      })
      setDate(undefined)
      onOpenChange(false)

      // Refresh data
      onAppointmentCreated?.()
    } catch (error) {
      console.error("[v0] Error creating appointment:", error)
      alert("Error creating appointment. Please try again.")
    } finally {
      setLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Schedule an Appointment</DialogTitle>
          <DialogDescription>Create a new consultation appointment with a client</DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Case Selection */}
          <div className="space-y-2">
            <Label htmlFor="case">Select Case *</Label>
            <Select value={formData.case_id} onValueChange={(value) => setFormData({ ...formData, case_id: value })}>
              <SelectTrigger id="case">
                <SelectValue placeholder="Choose a case" />
              </SelectTrigger>
              <SelectContent>
                {cases.map((c) => (
                  <SelectItem key={c.id} value={c.id}>
                    {c.case_title}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Client Selection */}
          <div className="space-y-2">
            <Label htmlFor="client">Select Client *</Label>
            <Select
              value={formData.client_id}
              onValueChange={(value) => setFormData({ ...formData, client_id: value })}
            >
              <SelectTrigger id="client">
                <SelectValue placeholder="Choose a client" />
              </SelectTrigger>
              <SelectContent>
                {clients.map((client) => (
                  <SelectItem key={client.id} value={client.id}>
                    {client.full_name || client.email}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Title */}
          <div className="space-y-2">
            <Label htmlFor="title">Appointment Title *</Label>
            <Input
              id="title"
              placeholder="e.g., Case discussion, Legal advice session"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              required
            />
          </div>

          {/* Description */}
          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              placeholder="Add any additional details about this appointment"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              rows={3}
            />
          </div>

          {/* Date and Time */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Date *</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button variant="outline" className="w-full justify-start text-left bg-transparent">
                    {date ? format(date, "PPP") : "Pick a date"}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar mode="single" selected={date} onSelect={setDate} disabled={(date) => date < new Date()} />
                </PopoverContent>
              </Popover>
            </div>

            <div className="space-y-2">
              <Label htmlFor="time">Time *</Label>
              <Input
                id="time"
                type="time"
                value={formData.time}
                onChange={(e) => setFormData({ ...formData, time: e.target.value })}
                required
              />
            </div>
          </div>

          {/* Duration */}
          <div className="space-y-2">
            <Label htmlFor="duration">Duration (minutes)</Label>
            <Select
              value={formData.duration_minutes}
              onValueChange={(value) => setFormData({ ...formData, duration_minutes: value })}
            >
              <SelectTrigger id="duration">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="30">30 minutes</SelectItem>
                <SelectItem value="60">1 hour</SelectItem>
                <SelectItem value="90">1.5 hours</SelectItem>
                <SelectItem value="120">2 hours</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Actions */}
          <div className="flex gap-3 justify-end">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)} disabled={loading}>
              Cancel
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? "Creating..." : "Schedule Appointment"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
