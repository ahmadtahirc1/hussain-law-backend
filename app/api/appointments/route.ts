import { createClient } from "@/lib/supabase/server"
import { type NextRequest, NextResponse } from "next/server"

// GET all appointments for user
export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient()

    const {
      data: { user },
    } = await supabase.auth.getUser()
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    // Get user profile
    const { data: profile } = await supabase.from("profiles").select("role").eq("id", user.id).single()

    let query = supabase.from("appointments").select("*")

    // Clients see only their appointments, lawyers see all their appointments
    if (profile?.role === "client") {
      query = query.eq("client_id", user.id)
    } else {
      query = query.eq("lawyer_id", user.id)
    }

    const { data, error } = await query.order("appointment_date", { ascending: true })

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 400 })
    }

    return NextResponse.json(data)
  } catch (error) {
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

// POST create a new appointment
export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient()

    const {
      data: { user },
    } = await supabase.auth.getUser()
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    // Only lawyers/staff can create appointments
    const { data: profile } = await supabase.from("profiles").select("role").eq("id", user.id).single()

    if (!profile || !["lawyer", "staff"].includes(profile.role)) {
      return NextResponse.json({ error: "Only lawyers/staff can create appointments" }, { status: 403 })
    }

    const body = await request.json()
    const { case_id, client_id, title, description, appointment_date, duration_minutes } = body

    const { data, error } = await supabase
      .from("appointments")
      .insert({
        case_id,
        client_id,
        lawyer_id: user.id,
        title,
        description,
        appointment_date,
        duration_minutes: duration_minutes || 60,
      })
      .select()

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 400 })
    }

    return NextResponse.json(data[0], { status: 201 })
  } catch (error) {
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
