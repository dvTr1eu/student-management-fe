import { AxiosError } from 'axios'

export function getApiErrorMessage(error: unknown, fallback: string): string {
  if (error instanceof AxiosError) {
    const message = error.response?.data?.message
    if (typeof message === 'string' && message.length > 0) return message
  }
  if (error instanceof Error && error.message.length > 0) {
    return error.message
  }
  return fallback
}
