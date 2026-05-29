const API_BASE_URL = import.meta.env.VITE_API_BASE_URL ?? "http://127.0.0.1:8000"

type ApiErrorDetail = string | Array<{ msg?: string; loc?: Array<string | number> }>
type AccountTypeResponse = {
  role?: string
  user?: {
    role?: string
  }
}

export class ApiError extends Error {
  status: number

  constructor(message: string, status: number) {
    super(message)
    this.name = "ApiError"
    this.status = status
  }
}

function getErrorMessage(detail: ApiErrorDetail | undefined): string {
  if (typeof detail === "string") {
    return detail
  }

  if (Array.isArray(detail)) {
    return detail
      .map((item) => {
        const field = item.loc?.filter((part) => part !== "body").join(".")
        return field ? `${field}: ${item.msg}` : item.msg
      })
      .filter(Boolean)
      .join(", ")
  }

  return "ไม่สามารถทำรายการได้ กรุณาลองใหม่อีกครั้ง"
}

export async function apiPost<TResponse, TBody>(path: string, body: TBody): Promise<TResponse> {
  const response = await fetch(`${API_BASE_URL}${path}`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(body),
  })

  const data = await response.json().catch(() => null)

  if (!response.ok) {
    throw new ApiError(getErrorMessage(data?.detail), response.status)
  }

  const accountType = (data as AccountTypeResponse | null)?.role ?? data?.user?.role
  if (accountType) {
    console.info(`[OT@HOME] Successful POST ${path}. Account type: ${accountType}`)
  }

  return data as TResponse
}
