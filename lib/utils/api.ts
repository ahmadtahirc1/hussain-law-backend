// Client-side API utility functions

export async function fetchAPI<T>(endpoint: string, options?: RequestInit): Promise<T> {
  const response = await fetch(endpoint, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...options?.headers,
    },
  })

  if (!response.ok) {
    const error = await response.json()
    throw new Error(error.error || "API request failed")
  }

  return response.json()
}

// Cases API
export const casesAPI = {
  getAll: () => fetchAPI("/api/cases"),
  getOne: (id: string) => fetchAPI(`/api/cases/${id}`),
  create: (data: any) =>
    fetchAPI("/api/cases", {
      method: "POST",
      body: JSON.stringify(data),
    }),
  update: (id: string, data: any) =>
    fetchAPI(`/api/cases/${id}`, {
      method: "PUT",
      body: JSON.stringify(data),
    }),
}

// Appointments API
export const appointmentsAPI = {
  getAll: () => fetchAPI("/api/appointments"),
  getOne: (id: string) => fetchAPI(`/api/appointments/${id}`),
  create: (data: any) =>
    fetchAPI("/api/appointments", {
      method: "POST",
      body: JSON.stringify(data),
    }),
  update: (id: string, data: any) =>
    fetchAPI(`/api/appointments/${id}`, {
      method: "PUT",
      body: JSON.stringify(data),
    }),
}

// Documents API
export const documentsAPI = {
  getByCase: (caseId: string) => fetchAPI(`/api/documents?case_id=${caseId}`),
  create: (data: any) =>
    fetchAPI("/api/documents", {
      method: "POST",
      body: JSON.stringify(data),
    }),
}

// Case Updates API
export const caseUpdatesAPI = {
  getByCase: (caseId: string) => fetchAPI(`/api/case-updates?case_id=${caseId}`),
  create: (data: any) =>
    fetchAPI("/api/case-updates", {
      method: "POST",
      body: JSON.stringify(data),
    }),
}
