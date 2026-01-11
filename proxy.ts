import { createServerClient } from "@supabase/ssr"
import { type NextRequest, NextResponse } from "next/server"

export async function proxy(request: NextRequest) {
  const requestUrl = new URL(request.url)
  const cookieStore = await request.cookies

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll()
        },
        setAll(cookiesToSet) {
          const response = NextResponse.next()
          cookiesToSet.forEach(({ name, value, options }) => response.cookies.set(name, value, options))
          return response
        },
      },
    },
  )

  // Refresh token if needed
  await supabase.auth.getUser()

  return NextResponse.next()
}
