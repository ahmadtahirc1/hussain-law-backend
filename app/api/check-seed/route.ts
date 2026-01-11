import { createServerClient } from "@supabase/ssr"
import { cookies } from "next/headers"
import { NextResponse } from "next/server"

export async function GET() {
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

    // Check if any users exist (besides the default ones)
    const { data: users, error } = await supabase.auth.admin.listUsers()

    if (error || !users) {
      return NextResponse.json({ seeded: false })
    }

    // If we have more than 0 users, database is seeded
    const seeded = users.identities && users.identities.length > 0
    return NextResponse.json({ seeded })
  } catch (error) {
    console.error("[v0] Check seed error:", error)
    return NextResponse.json({ seeded: false })
  }
}
