"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { createClient } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card } from "@/components/ui/card"

export default function LoginPage() {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [seeding, setSeeding] = useState(false)
  const [seeded, setSeeded] = useState(false)
  const router = useRouter()

  useEffect(() => {
    checkIfSeeded()
  }, [])

  const checkIfSeeded = async () => {
    try {
      const response = await fetch("/api/check-seed")
      const data = await response.json()
      setSeeded(data.seeded)
    } catch (err) {
      console.log("[v0] Error checking seed status:", err)
    }
  }

  const handleSeedDatabase = async () => {
    setSeeding(true)
    setError(null)
    try {
      const response = await fetch("/api/seed", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
      })

      const data = await response.json()

      if (!response.ok) {
        setError(`Seed failed: ${data.error}`)
        return
      }

      setSeeded(true)
      setError(null)
      // Pre-fill login with test credentials
      setEmail("lawyer@example.com")
      setPassword("LawyerPass123!")
    } catch (err) {
      setError("Failed to seed database")
      console.error("[v0] Seed error:", err)
    } finally {
      setSeeding(false)
    }
  }

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)

    try {
      if (!email || !password) {
        setError("Email and password are required")
        setLoading(false)
        return
      }

      const supabase = createClient()
      console.log("[v0] Attempting login with email:", email)

      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      })

      console.log("[v0] Login response:", { data, error })

      if (error) {
        setError(error.message)
        console.error("[v0] Login error:", error)
      } else if (data?.session) {
        console.log("[v0] Login successful, redirecting to dashboard")
        router.push("/dashboard")
      } else {
        setError("Login failed - no session created")
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "An unexpected error occurred"
      setError(errorMessage)
      console.error("[v0] Login exception:", err)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="flex items-center justify-center min-h-screen bg-background">
      <Card className="w-full max-w-md p-6">
        <h1 className="text-2xl font-bold mb-6 text-foreground">Hussain Law Chamber - Sign In</h1>

        {!seeded && (
          <div className="mb-6 p-4 bg-yellow-50 border border-yellow-200 rounded">
            <p className="text-sm text-yellow-800 mb-3">
              Database needs to be seeded with test data to proceed. Click the button below to initialize:
            </p>
            <Button onClick={handleSeedDatabase} disabled={seeding} className="w-full">
              {seeding ? "Seeding Database..." : "Seed Database with Test Data"}
            </Button>
          </div>
        )}

        {seeded && (
          <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded">
            <p className="text-sm text-green-800 mb-2">Database seeded! Test credentials ready:</p>
            <div className="text-xs text-green-700 space-y-1">
              <p>
                <strong>Lawyer:</strong> lawyer@example.com / LawyerPass123!
              </p>
              <p>
                <strong>Client:</strong> client@example.com / ClientPass123!
              </p>
            </div>
          </div>
        )}

        <form onSubmit={handleLogin} className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-2">Email</label>
            <Input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              placeholder="lawyer@example.com"
              disabled={loading}
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Password</label>
            <Input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              placeholder="••••••••"
              disabled={loading}
            />
          </div>

          {error && <p className="text-destructive text-sm">{error}</p>}

          <Button type="submit" className="w-full" disabled={loading}>
            {loading ? "Signing in..." : "Sign In"}
          </Button>
        </form>

        <p className="text-center text-sm text-muted-foreground mt-4">
          Don't have an account?{" "}
          <a href="/auth/sign-up" className="text-primary hover:underline">
            Sign Up
          </a>
        </p>
      </Card>
    </div>
  )
}
