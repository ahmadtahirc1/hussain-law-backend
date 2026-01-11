import { createClient } from "@/lib/supabase/server"
import { type NextRequest, NextResponse } from "next/server"

// GET case updates
export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient()

    const {
      data: { user },
    } = await supabase.auth.getUser()
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const caseId = searchParams.get("case_id")

    if (!caseId) {
      return NextResponse.json({ error: "case_id is required" }, { status: 400 })
    }

    // Verify user has access to this case
    const { data: caseData } = await supabase.from("cases").select("client_id, lawyer_id").eq("id", caseId).single()

    if (!caseData || (caseData.client_id !== user.id && caseData.lawyer_id !== user.id)) {
      return NextResponse.json({ error: "Access denied" }, { status: 403 })
    }

    const { data, error } = await supabase
      .from("case_updates")
      .select("*, updated_by:profiles(first_name, last_name)")
      .eq("case_id", caseId)
      .order("created_at", { ascending: false })

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 400 })
    }

    return NextResponse.json(data)
  } catch (error) {
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

// POST create a case update
export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient()

    const {
      data: { user },
    } = await supabase.auth.getUser()
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    // Only lawyers/staff can create updates
    const { data: profile } = await supabase.from("profiles").select("role").eq("id", user.id).single()

    if (!profile || !["lawyer", "staff"].includes(profile.role)) {
      return NextResponse.json({ error: "Only lawyers/staff can create case updates" }, { status: 403 })
    }

    const body = await request.json()
    const { case_id, title, description, update_type } = body

    const { data, error } = await supabase
      .from("case_updates")
      .insert({
        case_id,
        updated_by: user.id,
        title,
        description,
        update_type,
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
