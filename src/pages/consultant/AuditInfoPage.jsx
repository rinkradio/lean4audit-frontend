import { useEffect, useMemo, useState } from 'react'
import { useLocation, useNavigate, useSearchParams } from 'react-router-dom'

import FormField from '../../components/FormField'
import { useAuth } from '../../hooks/useAuth'
import { useToast } from '../../hooks/useToast'
import { createAudit } from '../../services/auditService'
import { fetchZones } from '../../services/zoneService'

function todayIso() {
  return new Date().toISOString().slice(0, 10)
}

export default function AuditInfoPage() {
  const navigate = useNavigate()
  const location = useLocation()
  const [searchParams] = useSearchParams()

  const { user } = useAuth()
  const { showToast } = useToast()

  const state = location.state || {}
  const stateZoneId = state.zoneId
  const queryZoneId = searchParams.get('zone')
  const zoneId = stateZoneId || queryZoneId

  const [zone, setZone] = useState(state.zone || null)
  const [plant, setPlant] = useState(state.plant || null)
  const [isLoadingZone, setIsLoadingZone] = useState(!state.zone)

  const [auditDate, setAuditDate] = useState(todayIso())
  const [hod, setHod] = useState('')
  const [errors, setErrors] = useState({})
  const [isSubmitting, setIsSubmitting] = useState(false)

  useEffect(() => {
    if (!zoneId) {
      navigate('/consultant/audits/new', {
        replace: true,
      })
    }
  }, [zoneId, navigate])

  useEffect(() => {
    if (!zoneId || zone) return

    let mounted = true

    async function loadZone() {
      try {
        setIsLoadingZone(true)

        const zones = await fetchZones()
        const found = zones.find(
          (item) => String(item.id) === String(zoneId)
        )

        if (!found) {
          throw new Error('Zone not found')
        }

        if (mounted) {
          setZone(found)
          setPlant(found.plant || null)
        }
      } catch (err) {
        if (mounted) {
          showToast(
            err?.response?.data?.detail ||
              'Unable to load the selected Zone.',
            'error'
          )
          navigate('/consultant/audits/new', {
            replace: true,
          })
        }
      } finally {
        if (mounted) {
          setIsLoadingZone(false)
        }
      }
    }

    loadZone()

    return () => {
      mounted = false
    }
  }, [zoneId, zone, navigate, showToast])

  const zoneLeader = useMemo(
    () => zone?.zone_leader?.trim() || '',
    [zone]
  )

  async function handleSubmit(event) {
    event.preventDefault()

    const nextErrors = {}

    if (!zoneId) {
      nextErrors.zone = 'Please select a Zone first.'
    }

    if (!zoneLeader) {
      nextErrors.zoneLeader =
        'This Zone does not have a Zone Leader assigned.'
    }

    if (!auditDate) {
      nextErrors.auditDate = 'Audit date is required.'
    }

    if (!hod.trim()) {
      nextErrors.hod = 'HOD is required.'
    }

    setErrors(nextErrors)

    if (Object.keys(nextErrors).length > 0) return

    setIsSubmitting(true)

    try {
      const audit = await createAudit({
        zone_id: zoneId,
        audit_date: auditDate,
        hod: hod.trim(),
      })

      showToast('Audit created successfully.')

      navigate(`/consultant/audits/${audit.id}`, {
        replace: true,
      })
    } catch (err) {
      showToast(
        err?.response?.data?.detail ||
          'Unable to create audit. Please try again.',
        'error'
      )
    } finally {
      setIsSubmitting(false)
    }
  }

  if (!zoneId) return null

  if (isLoadingZone) {
    return (
      <div className="mx-auto max-w-2xl py-16 text-center text-sm text-ink2-muted">
        Loading Zone information...
      </div>
    )
  }

  return (
    <div className="mx-auto max-w-2xl animate-fade-in">
      <button
        type="button"
        onClick={() => navigate('/consultant/audits/new')}
        className="text-sm font-medium text-ink2-secondary hover:text-ink2"
      >
        ← Back
      </button>

      <h1 className="mt-3 text-xl font-bold text-ink2 sm:text-2xl">
        Audit Information
      </h1>

      <p className="mt-1.5 text-sm text-ink2-secondary">
        Confirm the audit details. The Zone Leader is automatically taken from the selected Zone.
      </p>

      <div className="mt-6 rounded-xl border border-line bg-surface p-6 shadow-xs">
        <div className="grid gap-3 sm:grid-cols-2">
          <div className="rounded-lg bg-canvas px-4 py-3">
            <div className="text-[11px] font-semibold uppercase tracking-wide text-ink2-muted">
              Plant
            </div>
            <div className="mt-1 text-sm font-semibold text-ink2">
              {plant?.name || '—'}
            </div>
          </div>

          <div className="rounded-lg bg-canvas px-4 py-3">
            <div className="text-[11px] font-semibold uppercase tracking-wide text-ink2-muted">
              Zone
            </div>
            <div className="mt-1 text-sm font-semibold text-ink2">
              {zone?.name || '—'}
            </div>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="mt-5">
          <div className="mb-4">
            <label className="mb-1.5 block text-sm font-medium text-ink2-secondary">
              Auditor
            </label>
            <div className="rounded-md border border-line bg-canvas px-3.5 py-2.5 text-sm text-ink2">
              {user?.full_name || 'Current Consultant'}{' '}
              <span className="text-ink2-muted">(you)</span>
            </div>
          </div>

          <div className="mb-4">
            <label className="mb-1.5 block text-sm font-medium text-ink2-secondary">
              Zone Leader
            </label>
            <div className="flex items-center gap-3 rounded-md border border-line bg-canvas px-3.5 py-2.5">
              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-brand-soft text-sm font-bold text-brand">
                {zoneLeader.charAt(0).toUpperCase() || 'Z'}
              </div>
              <div>
                <div className="text-sm font-semibold text-ink2">
                  {zoneLeader || 'Not assigned'}
                </div>
              </div>
            </div>
            {errors.zoneLeader && (
              <p className="mt-1 text-xs text-danger">
                {errors.zoneLeader}
              </p>
            )}
          </div>

          <FormField
            id="audit-date"
            label="Audit Date"
            type="date"
            value={auditDate}
            onChange={(event) => {
              setAuditDate(event.target.value)
              setErrors((current) => ({
                ...current,
                auditDate: undefined,
              }))
            }}
            error={errors.auditDate}
          />

          <FormField
            id="hod"
            label="HOD"
            value={hod}
            onChange={(event) => {
              setHod(event.target.value)
              setErrors((current) => ({
                ...current,
                hod: undefined,
              }))
            }}
            placeholder="e.g. Suresh Kumar"
            error={errors.hod}
          />

          {errors.zone && (
            <div className="mb-4 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600">
              {errors.zone}
            </div>
          )}

          <button
            type="submit"
            disabled={isSubmitting || !zoneLeader}
            className="mt-2 w-full rounded-md bg-brand px-4 py-3 text-sm font-semibold text-white shadow-xs transition-colors hover:bg-brand-hover disabled:cursor-not-allowed disabled:opacity-60 sm:w-auto"
          >
            {isSubmitting ? 'Creating…' : 'Create Audit'}
          </button>
        </form>
      </div>
    </div>
  )
}
