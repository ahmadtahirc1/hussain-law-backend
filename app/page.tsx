import { createClient } from "@/lib/supabase/server"
import { Button } from "@/components/ui/button"
import { redirect } from "next/navigation"

export default async function Home() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (user) {
    redirect("/dashboard")
  }

  return (
    <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="text-center">
        <h1 className="text-4xl font-bold text-gray-900 mb-4">Hussain Law Chamber</h1>
        <p className="text-xl text-gray-600 mb-8">Professional Legal Services</p>
        <div className="space-x-4">
          <Button asChild className="px-8 py-3 text-lg">
            <a href="/auth/login">Sign In</a>
          </Button>
          <Button asChild variant="outline" className="px-8 py-3 text-lg bg-transparent">
            <a href="/auth/sign-up">Sign Up</a>
          </Button>
        </div>
      </div>
    </div>
  )
}
