import type { AppRole } from '@/features/auth/lib/roles'
import type { AuthUser } from '@/stores/auth-store'

const ROLE_CLAIM =
  'http://schemas.microsoft.com/ws/2008/06/identity/claims/role'
const NAME_CLAIM =
  'http://schemas.xmlsoap.org/ws/2005/05/identity/claims/name'
const EMAIL_CLAIM =
  'http://schemas.xmlsoap.org/ws/2005/05/identity/claims/emailaddress'

/** Decode base64url JWT segment as UTF-8 (atob alone breaks Vietnamese names). */
function decodeJwtSegment(segment: string): string {
  const base64 = segment.replace(/-/g, '+').replace(/_/g, '/')
  const padded = base64.padEnd(
    base64.length + ((4 - (base64.length % 4)) % 4),
    '=',
  )
  const binary = atob(padded)
  const bytes = Uint8Array.from(binary, (char) => char.charCodeAt(0))
  return new TextDecoder('utf-8').decode(bytes)
}

function parseJwtPayload(token: string): Record<string, unknown> | null {
  try {
    const parts = token.split('.')
    const payloadPart = parts[1]
    if (!payloadPart) return null

    const json = decodeJwtSegment(payloadPart)
    return JSON.parse(json) as Record<string, unknown>
  } catch {
    return null
  }
}

function mapIdentityRole(role: string): AppRole | null {
  const normalized = role.trim().toLowerCase()
  if (normalized === 'admin') return 'admin'
  if (normalized === 'teacher') return 'teacher'
  return null
}

function readRoles(payload: Record<string, unknown>): AppRole[] {
  const roleClaim = payload[ROLE_CLAIM] ?? payload['role']
  const rawRoles: string[] = []

  if (typeof roleClaim === 'string') rawRoles.push(roleClaim)
  else if (Array.isArray(roleClaim)) {
    rawRoles.push(
      ...roleClaim.filter((role): role is string => typeof role === 'string'),
    )
  }

  return rawRoles
    .map(mapIdentityRole)
    .filter((role): role is AppRole => role !== null)
}

export function authUserFromAccessToken(token: string): AuthUser | null {
  const payload = parseJwtPayload(token)
  if (!payload) return null

  const expMs =
    typeof payload['exp'] === 'number' ? payload['exp'] * 1000 : Date.now()
  if (expMs < Date.now()) return null

  const accountNo = typeof payload['sub'] === 'string' ? payload['sub'] : ''
  const email =
    (typeof payload['email'] === 'string' ? payload['email'] : '') ||
    (typeof payload[EMAIL_CLAIM] === 'string' ? payload[EMAIL_CLAIM] : '')

  if (!accountNo || !email) return null

  const role = readRoles(payload)
  if (role.length === 0) return null

  const name =
    typeof payload[NAME_CLAIM] === 'string'
      ? payload[NAME_CLAIM]
      : typeof payload['name'] === 'string'
        ? payload['name']
        : undefined

  return {
    accountNo,
    email,
    name,
    role,
    exp: expMs,
  }
}
