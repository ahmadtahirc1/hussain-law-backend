"use client"

import { useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { ScheduleAppointmentDialog } from "@/components/schedule-appointment-dialog"
import { createBrowserClient } from "@supabase/ssr"
import { useRouter } from "next/navigation"

export default function Dashboard() {
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const [user, setUser] = useState<any>(null)
  const [profile, setProfile] = useState<any>(null)
  const [cases, setCases] = useState<any[]>([])
  const [appointments, setAppointments] = useState<any[]>([])
  const [clients, setClients] = useState<any[]>([])
  const [scheduleDialogOpen, setScheduleDialogOpen] = useState(false)

  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
  )

  useEffect(() => {
    const loadData = async () => {
      try {
        const {
          data: { user },
        } = await supabase.auth.getUser()

        if (!user) {
          router.push("/auth/login")
          return
        }

        setUser(user)

        // Get user profile
        const { data: profileData } = await supabase.from("profiles").select("*").eq("id", user.id).single()

        setProfile(profileData)

        // Get cases
        let casesQuery = supabase.from("cases").select("*")
        if (profileData?.role === "client") {
          casesQuery = casesQuery.eq("client_id", user.id)
        }
        const { data: casesData } = await casesQuery
        setCases(casesData || [])

        // Get appointments
        let appointmentsQuery = supabase.from("appointments").select("*")
        if (profileData?.role === "client") {
          appointmentsQuery = appointmentsQuery.eq("client_id", user.id)
        } else {
          appointmentsQuery = appointmentsQuery.eq("lawyer_id", user.id)
        }
        const { data: appointmentsData } = await appointmentsQuery.order("appointment_date", { ascending: true })
        setAppointments(appointmentsData || [])

        // Get clients (only for lawyers/staff)
        if (profileData?.role === "lawyer" || profileData?.role === "staff") {
          const { data: clientsData } = await supabase.from("profiles").select("*").eq("role", "client")
          setClients(clientsData || [])
        }
      } catch (error) {
        console.error("[v0] Error loading dashboard:", error)
      } finally {
        setLoading(false)
      }
    }

    loadData()
  }, [])

  const handleLogout = async () => {
    await supabase.auth.signOut()
    router.push("/")
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <p>Loading...</p>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      <nav className="border-b bg-white">
        <div className="max-w-7xl mx-auto px-4 py-4 flex justify-between items-center">
          <h1 className="text-2xl font-bold">Hussain Law Chamber</h1>
          <div className="flex gap-3 items-center">
            {(profile?.role === "lawyer" || profile?.role === "staff") && (
              <Button onClick={() => setScheduleDialogOpen(true)}>Schedule Meeting</Button>
            )}
            <Button variant="outline" onClick={handleLogout}>
              Logout
            </Button>
          </div>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto px-4 py-8">
        <div className="mb-8">
          <h2 className="text-3xl font-bold mb-2">Welcome, {profile?.full_name || user?.email}</h2>
          <p className="text-muted-foreground capitalize">Role: {profile?.role}</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card className="p-6">
            <h3 className="text-xl font-semibold mb-4">Cases ({cases.length})</h3>
            <div className="space-y-3">
              {cases.length > 0 ? (
                cases.slice(0, 5).map((c: any) => (
                  <div key={c.id} className="p-3 bg-gray-50 rounded">
                    <p className="font-medium">{c.case_title}</p>
                    <p className="text-sm text-muted-foreground">Status: {c.status}</p>
                  </div>
                ))
              ) : (
                <p className="text-muted-foreground">No cases</p>
              )}
            </div>
          </Card>

          <Card className="p-6">
            <h3 className="text-xl font-semibold mb-4">Appointments ({appointments.length})</h3>
            <div className="space-y-3">
              {appointments.length > 0 ? (
                appointments.slice(0, 5).map((a: any) => (
                  <div key={a.id} className="p-3 bg-gray-50 rounded">
                    <p className="font-medium text-sm">{new Date(a.appointment_date).toLocaleDateString()}</p>
                    <p className="text-sm text-muted-foreground">{a.title || a.status}</p>
                  </div>
                ))
              ) : (
                <p className="text-muted-foreground">No appointments</p>
              )}
            </div>
          </Card>
        </div>
      </main>

      {/* Schedule Appointment Dialog */}
      <ScheduleAppointmentDialog
        open={scheduleDialogOpen}
        onOpenChange={setScheduleDialogOpen}
        cases={cases}
        clients={clients}
        onAppointmentCreated={() => {
          // Refresh appointments
          window.location.reload()
        }}
      />
    </div>
  )
}
