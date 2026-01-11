import { createClient } from "@/lib/supabase/server"
import { type NextRequest, NextResponse } from "next/server"

// GET a specific case
export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const supabase = await createClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { id } = await params

    const { data, error } = await supabase.from("cases").select("*").eq("id", id).single()

    if (error || !data) {
      return NextResponse.json({ error: "Case not found" }, { status: 404 })
    }

    // Check access: user is client or lawyer assigned to case
    if (data.client_id !== user.id && data.lawyer_id !== user.id) {
      return NextResponse.json({ error: "Access denied" }, { status: 403 })
    }

    return NextResponse.json(data)
  } catch (error) {
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

// UPDATE a case
export async function PUT(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const supabase = await createClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { id } = await params
    const body = await request.json()

    // Get case to verify access
    const { data: caseData } = await supabase.from("cases").select("*").eq("id", id).single()

    if (!caseData) {
      return NextResponse.json({ error: "Case not found" }, { status: 404 })
    }

    // Only assigned lawyer can update
    if (caseData.lawyer_id !== user.id) {
      return NextResponse.json({ error: "Access denied" }, { status: 403 })
    }

    const { data, error } = await supabase
      .from("cases")
      .update({ ...body, updated_at: new Date() })
      .eq("id", id)
      .select()
      .single()

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 400 })
    }

    return NextResponse.json(data)
  } catch (error) {
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
