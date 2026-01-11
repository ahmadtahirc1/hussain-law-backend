"use client"

import { useEffect, useState } from "react"
import type { Case } from "@/lib/types"
import { casesAPI } from "@/lib/utils/api"

export function useCases() {
  const [cases, setCases] = useState<Case[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchCases = async () => {
      try {
        setLoading(true)
        const data = await casesAPI.getAll()
        setCases(data)
        setError(null)
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to fetch cases")
      } finally {
        setLoading(false)
      }
    }

    fetchCases()
  }, [])

  return { cases, loading, error, refetch: () => {} }
}
