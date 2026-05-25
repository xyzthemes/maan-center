// Validation for the dashboard staff create + edit payloads. Mirrors
// the form-payload helper: hand-rolled (no zod), tolerant where it
// matters, strict where it doesn't. 400 on any malformed input.
//
// `email` is only validated on create — once a user exists, the admin
// can update name/role/permissions but the email is locked (changing
// it is a separate Better Auth flow with re-verification).

import { createError } from 'h3'
import { sanitizePermissions } from '~~/app/utils/permissions'
import type { PermissionScope } from '~~/app/utils/permissions'

const bad = (msg: string): never => {
  throw createError({ statusCode: 400, statusMessage: msg })
}

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
const NAME_MAX = 120
const REASON_MAX = 500

type RawBody = Record<string, unknown>

const parseName = (raw: unknown): string => {
  if (typeof raw !== 'string') return bad('Name is required.')
  const v = raw.trim()
  if (!v) return bad('Name cannot be empty.')
  if (v.length > NAME_MAX) return bad(`Name exceeds ${NAME_MAX} characters.`)
  return v
}

const parseEmail = (raw: unknown): string => {
  if (typeof raw !== 'string') return bad('Email is required.')
  const v = raw.trim().toLowerCase()
  if (!EMAIL_RE.test(v)) return bad(`"${v}" is not a valid email address.`)
  return v
}

const parseRole = (raw: unknown): 'admin' | 'staff' => {
  if (raw === 'admin' || raw === 'staff') return raw
  return bad('Role must be "admin" or "staff".')
}

export type StaffCreatePayload = {
  name: string
  email: string
  role: 'admin' | 'staff'
  permissions: PermissionScope[]
}

export const parseStaffCreatePayload = (raw: unknown): StaffCreatePayload => {
  if (!raw || typeof raw !== 'object') return bad('Body is required.')
  const r = raw as RawBody
  const role = parseRole(r.role)
  return {
    name: parseName(r.name),
    email: parseEmail(r.email),
    role,
    // Admins don't need a permissions array — they bypass — but
    // accept whatever was sent and persist as-is so a later demotion
    // to staff keeps any ticked scopes.
    permissions: sanitizePermissions(r.permissions)
  }
}

export type StaffUpdatePayload = {
  name?: string
  role?: 'admin' | 'staff'
  permissions?: PermissionScope[]
}

export const parseStaffUpdatePayload = (raw: unknown): StaffUpdatePayload => {
  if (!raw || typeof raw !== 'object') return bad('Body is required.')
  const r = raw as RawBody
  const result: StaffUpdatePayload = {}
  if (r.name !== undefined) result.name = parseName(r.name)
  if (r.role !== undefined) result.role = parseRole(r.role)
  if (r.permissions !== undefined) result.permissions = sanitizePermissions(r.permissions)
  return result
}

export type StaffBanPayload = {
  reason?: string
  expiresAt?: Date
}

export const parseStaffBanPayload = (raw: unknown): StaffBanPayload => {
  const r = (raw ?? {}) as RawBody
  const result: StaffBanPayload = {}
  if (typeof r.reason === 'string' && r.reason.trim()) {
    const reason = r.reason.trim()
    if (reason.length > REASON_MAX) return bad(`Reason exceeds ${REASON_MAX} characters.`)
    result.reason = reason
  }
  if (typeof r.expiresAt === 'string' && r.expiresAt) {
    const d = new Date(r.expiresAt)
    if (Number.isNaN(d.getTime())) return bad('expiresAt must be a valid date.')
    result.expiresAt = d
  }
  return result
}
