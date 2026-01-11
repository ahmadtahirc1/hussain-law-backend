import { createServerClient } from "@supabase/ssr"
import { cookies } from "next/headers"
import { type NextRequest, NextResponse } from "next/server"

/**
 * POST /api/seed
 * This endpoint is for development only. It initializes the database with mock data.
 * WARNING: Only use in development/testing environments!
 */
export async function POST(request: NextRequest) {
  // Security check - only allow in development or with secret key
  const authHeader = request.headers.get("authorization")
  const secretKey = process.env.SEED_SECRET_KEY

  if (process.env.NODE_ENV === "production" && !secretKey) {
    return NextResponse.json({ error: "Not available in production" }, { status: 403 })
  }

  if (secretKey && authHeader !== `Bearer ${secretKey}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  try {
    const cookieStore = await cookies()
    const supabase = createServerClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!, {
      cookies: {
        getAll() {
          return cookieStore.getAll()
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value, options }) => cookieStore.set(name, value, options))
        },
      },
    })

    // Mock user data
    const mockUsers = [
      {
        email: "lawyer@example.com",
        password: "Password123!",
        profile: {
          first_name: "Ahmed",
          last_name: "Hussain",
          role: "lawyer",
          phone_number: "+92-300-1234567",
        },
      },
      {
        email: "client@example.com",
        password: "Password123!",
        profile: {
          first_name: "Ali",
          last_name: "Khan",
          role: "client",
          phone_number: "+92-300-2345678",
        },
      },
      {
        email: "staff@example.com",
        password: "Password123!",
        profile: {
          first_name: "Sarah",
          last_name: "Ahmed",
          role: "staff",
          phone_number: "+92-300-3456789",
        },
      },
    ]

    // Create users
    const users = []
    for (const mockUser of mockUsers) {
      const { data, error } = await supabase.auth.admin.createUser({
        email: mockUser.email,
        password: mockUser.profile.role === "lawyer" ? "LawyerPass123!" : "ClientPass123!",
        email_confirm: true,
        user_metadata: mockUser.profile,
      })

      if (error) {
        console.error(`Error creating user ${mockUser.email}:`, error)
        continue
      }

      if (data.user) {
        users.push({ id: data.user.id, ...mockUser })
      }
    }

    if (users.length < 2) {
      return NextResponse.json({ error: "Failed to create sufficient users" }, { status: 500 })
    }

    // Get user IDs
    const lawyerId = users.find((u) => u.profile.role === "lawyer")?.id
    const clientId = users.find((u) => u.profile.role === "client")?.id

    if (!lawyerId || !clientId) {
      return NextResponse.json({ error: "Failed to find created users" }, { status: 500 })
    }

    // Create sample case
    const { data: caseData, error: caseError } = await supabase
      .from("cases")
      .insert([
        {
          case_number: "CASE-2024-001",
          title: "Property Dispute - Karachi",
          description: "Property ownership dispute between two parties regarding commercial property",
          client_id: clientId,
          lawyer_id: lawyerId,
          status: "open",
          case_type: "Property",
          filing_date: new Date("2024-01-15"),
          next_hearing_date: new Date("2024-02-28"),
          notes: "Initial consultation completed. Documentation review in progress.",
        },
      ])
      .select()

    if (caseError) {
      console.error("Error creating case:", caseError)
      return NextResponse.json({ error: "Failed to create case", details: caseError }, { status: 500 })
    }

    const caseId = caseData?.[0]?.id

    // Create sample appointment
    if (caseId) {
      const { error: appointmentError } = await supabase.from("appointments").insert([
        {
          case_id: caseId,
          client_id: clientId,
          lawyer_id: lawyerId,
          title: "Case Review Meeting",
          description: "Detailed review of property documents and legal strategy",
          appointment_date: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
          duration_minutes: 90,
          status: "scheduled",
          notes: "Bring original property deeds and sale agreement",
        },
      ])

      if (appointmentError) {
        console.error("Error creating appointment:", appointmentError)
      }
    }

    // Create sample case update
    if (caseId) {
      const { error: updateError } = await supabase.from("case_updates").insert([
        {
          case_id: caseId,
          updated_by: lawyerId,
          title: "Case Opened",
          description: "Property dispute case registered and assigned",
          update_type: "status",
        },
      ])

      if (updateError) {
        console.error("Error creating case update:", updateError)
      }
    }

    return NextResponse.json({
      success: true,
      message: "Database seeded successfully with mock data",
      createdUsers: users.length,
      createdCase: caseId ? 1 : 0,
      mockCredentials: {
        lawyer: { email: "lawyer@example.com", password: "LawyerPass123!" },
        client: { email: "client@example.com", password: "ClientPass123!" },
        staff: { email: "staff@example.com", password: "Password123!" },
      },
    })
  } catch (error) {
    console.error("Seed error:", error)
    return NextResponse.json({ error: "Failed to seed database", details: String(error) }, { status: 500 })
  }
}
