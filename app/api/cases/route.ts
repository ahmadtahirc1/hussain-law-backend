import { createClient } from "@/lib/supabase/server"
import { type NextRequest, NextResponse } from "next/server"

// GET all cases (filtered by user role)
export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient()

    // Get current user
    const {
      data: { user },
    } = await supabase.auth.getUser()
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    // Get user profile to check role
    const { data: profile } = await supabase.from("profiles").select("role").eq("id", user.id).single()

    let query = supabase.from("cases").select("*")

    // Lawyers/staff see all cases, clients see only their cases
    if (profile?.role === "client") {
      query = query.eq("client_id", user.id)
    }

    const { data, error } = await query.order("created_at", { ascending: false })

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 400 })
    }

    return NextResponse.json(data)
  } catch (error) {
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

// POST create a new case
export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient()

    const {
      data: { user },
    } = await supabase.auth.getUser()
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    // Check if user is lawyer or staff
    const { data: profile } = await supabase.from("profiles").select("role").eq("id", user.id).single()

    if (!profile || !["lawyer", "staff"].includes(profile.role)) {
      return NextResponse.json({ error: "Only lawyers/staff can create cases" }, { status: 403 })
    }

    const body = await request.json()
    const { case_number, title, description, client_id, case_type, filing_date } = body

    const { data, error } = await supabase
      .from("cases")
      .insert({
        case_number,
        title,
        description,
        client_id,
        lawyer_id: user.id,
        case_type,
        filing_date,
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
