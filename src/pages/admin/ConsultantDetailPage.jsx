
import { useCallback, useEffect, useMemo, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'

import {
  fetchConsultant,
  fetchConsultantPlants,
  fetchConsultantZones,
  updateConsultant,
  resetConsultantPassword,
} from '../../services/consultantService'

function getList(response, keys = []) {
  if (Array.isArray(response)) return response

  for (const key of keys) {
    if (Array.isArray(response?.[key])) return response[key]
  }

  return []
}

function getErrorMessage(error, fallback) {
  const detail = error?.response?.data?.detail

  if (typeof detail === 'string') return detail

  if (Array.isArray(detail)) {
    return detail
      .map((item) => item?.msg || 'Validation error')
      .join(', ')
  }

  return fallback
}

function formatDate(value, includeTime = false) {
  if (!value) return 'Never'

  const date = new Date(value)

  if (Number.isNaN(date.getTime())) return '—'

  return includeTime
    ? date.toLocaleString('en-GB')
    : date.toLocaleDateString('en-GB', {
        day: '2-digit',
        month: 'short',
        year: 'numeric',
      })
}

const cardClass =
  'rounded-xl border border-line bg-surface p-5 shadow-xs sm:p-6'

const labelClass =
  'mb-1.5 block text-xs font-semibold text-ink2-secondary'

const inputClass =
  'w-full rounded-lg border border-line-strong bg-surface px-3 py-2.5 text-sm text-ink2 outline-none transition focus:border-brand focus:ring-4 focus:ring-brand-soft disabled:cursor-not-allowed disabled:bg-canvas disabled:text-ink2-muted'

export default function ConsultantDetailPage() {
  const { id } = useParams()
  const navigate = useNavigate()

  const [consultant, setConsultant] = useState(null)
  const [plants, setPlants] = useState([])
  const [zonesByPlant, setZonesByPlant] = useState({})
  const [loadingZones, setLoadingZones] = useState({})

  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [resettingPassword, setResettingPassword] = useState(false)

  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  const [fullName, setFullName] = useState('')
  const [selectedPlantIds, setSelectedPlantIds] = useState([])
  const [selectedZoneIds, setSelectedZoneIds] = useState([])

  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')

  const clearMessages = useCallback(() => {
    setError('')
    setSuccess('')
  }, [])

  // Load consultant profile and available plants.
  useEffect(() => {
    let cancelled = false

    async function loadConsultant() {
      setLoading(true)
      setError('')

      try {
        const [consultantResponse, plantsResponse] =
          await Promise.all([
            fetchConsultant(id),
            fetchConsultantPlants(),
          ])

        if (cancelled) return

        const consultantData = consultantResponse
        const plantList = getList(plantsResponse, ['items', 'plants'])

        setConsultant(consultantData)
        setPlants(plantList)
        setFullName(consultantData?.full_name || '')

        setSelectedPlantIds(
          (consultantData?.plant_ids || []).map(String)
        )

        setSelectedZoneIds(
          (consultantData?.zone_ids || []).map(String)
        )
      } catch (err) {
        if (cancelled) return

        console.error('Failed to load consultant:', err)

        setError(
          getErrorMessage(err, 'Unable to load consultant.')
        )
      } finally {
        if (!cancelled) setLoading(false)
      }
    }

    loadConsultant()

    return () => {
      cancelled = true
    }
  }, [id])

  // Load zones for every selected plant. Mark loading complete only
  // after the corresponding zone data has been stored.
  useEffect(() => {
    let cancelled = false

    async function loadZones() {
      const plantIds = [...new Set(selectedPlantIds.map(String))]

      if (!plantIds.length) {
        setZonesByPlant({})
        setLoadingZones({})
        return
      }

      setLoadingZones(
        Object.fromEntries(plantIds.map((plantId) => [plantId, true]))
      )

      try {
        const results = await Promise.all(
          plantIds.map(async (plantId) => {
            const response = await fetchConsultantZones(plantId)

            const zones = getList(response, [
              'items',
              'zones',
              'data',
            ])

            return [plantId, zones]
          })
        )

        if (cancelled) return

        setZonesByPlant(Object.fromEntries(results))
      } catch (err) {
        if (cancelled) return

        console.error('Failed to load consultant zones:', err)

        setZonesByPlant({})
        setError(
          getErrorMessage(
            err,
            'Unable to load Zones. Refresh the page and try again.'
          )
        )
      } finally {
        if (!cancelled) {
          setLoadingZones(
            Object.fromEntries(plantIds.map((plantId) => [plantId, false]))
          )
        }
      }
    }

    loadZones()

    return () => {
      cancelled = true
    }
  }, [selectedPlantIds])

  const selectedPlantSet = useMemo(
    () => new Set(selectedPlantIds.map(String)),
    [selectedPlantIds]
  )

  const availableZoneIds = useMemo(() => {
    const ids = new Set()

    selectedPlantIds.forEach((plantId) => {
      const zones = zonesByPlant[String(plantId)] || []

      zones.forEach((zone) => {
        if (zone?.id != null) {
          ids.add(String(zone.id))
        }
      })
    })

    return ids
  }, [selectedPlantIds, zonesByPlant])

  const selectedZoneCount = useMemo(
    () =>
      new Set(
        selectedZoneIds
          .map(String)
          .filter((zoneId) => availableZoneIds.has(zoneId))
      ).size,
    [selectedZoneIds, availableZoneIds]
  )

  function togglePlant(plantId) {
    const normalizedId = String(plantId)
    const currentlySelected = selectedPlantSet.has(normalizedId)

    clearMessages()

    if (currentlySelected) {
      const removedZoneIds = new Set(
        (zonesByPlant[normalizedId] || []).map((zone) =>
          String(zone.id)
        )
      )

      setSelectedPlantIds((current) =>
        current.filter((value) => String(value) !== normalizedId)
      )

      setSelectedZoneIds((current) =>
        current.filter(
          (zoneId) => !removedZoneIds.has(String(zoneId))
        )
      )
    } else {
      setSelectedPlantIds((current) =>
        current.some((value) => String(value) === normalizedId)
          ? current
          : [...current, normalizedId]
      )
    }
  }

  function toggleZone(zoneId) {
    const normalizedId = String(zoneId)

    clearMessages()

    setSelectedZoneIds((current) => {
      const exists = current.some(
        (value) => String(value) === normalizedId
      )

      return exists
        ? current.filter((value) => String(value) !== normalizedId)
        : [...current, normalizedId]
    })
  }

  async function handleSave() {
    clearMessages()

    if (!fullName.trim()) {
      setError('Full name is required.')
      return
    }

    if (!selectedPlantIds.length) {
      setError('Please assign at least one Plant.')
      return
    }

    const isStillLoading = selectedPlantIds.some(
      (plantId) => loadingZones[String(plantId)] === true
    )

    if (isStillLoading) {
      setError('Please wait until the selected Plants’ Zones finish loading.')
      return
    }

    // Only submit zone IDs returned for the currently selected plants.
    // This avoids relying on zone.plant_id being present in the API response.
    const plantIdsToSubmit = [...new Set(selectedPlantIds.map(String))]

    const zoneIdsToSubmit = [
      ...new Set(
        selectedZoneIds
          .map(String)
          .filter((zoneId) => availableZoneIds.has(zoneId))
      ),
    ]

    if (!zoneIdsToSubmit.length) {
      setError(
        'Please assign at least one active Zone from the selected Plants.'
      )
      return
    }

    setSaving(true)

    try {
      const updated = await updateConsultant(id, {
        full_name: fullName.trim(),
        plant_ids: plantIdsToSubmit,
        zone_ids: zoneIdsToSubmit,
      })

      setConsultant((current) => ({
        ...current,
        ...updated,
      }))

      setFullName(updated?.full_name || fullName.trim())

      if (Array.isArray(updated?.plant_ids)) {
        setSelectedPlantIds(updated.plant_ids.map(String))
      } else {
        setSelectedPlantIds(plantIdsToSubmit)
      }

      if (Array.isArray(updated?.zone_ids)) {
        setSelectedZoneIds(updated.zone_ids.map(String))
      } else {
        setSelectedZoneIds(zoneIdsToSubmit)
      }

      setSuccess('Consultant access updated successfully.')
    } catch (err) {
      console.error('Failed to update consultant:', err)

      setError(
        getErrorMessage(
          err,
          'Unable to update consultant. Check the selected Plant and Zone access.'
        )
      )
    } finally {
      setSaving(false)
    }
  }

  async function handleResetPassword() {
    clearMessages()

    if (!newPassword) {
      setError('New password is required.')
      return
    }

    if (newPassword.length < 8) {
      setError('Password must be at least 8 characters.')
      return
    }

    if (newPassword !== confirmPassword) {
      setError('Passwords do not match.')
      return
    }

    setResettingPassword(true)

    try {
      await resetConsultantPassword(id, {
        new_password: newPassword,
        confirm_password: confirmPassword,
      })

      setNewPassword('')
      setConfirmPassword('')
      setSuccess('Consultant password reset successfully.')
    } catch (err) {
      console.error('Failed to reset password:', err)

      setError(
        getErrorMessage(err, 'Unable to reset consultant password.')
      )
    } finally {
      setResettingPassword(false)
    }
  }

  if (loading) {
    return (
      <div className="mx-auto w-full max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <div className={`${cardClass} py-12 text-center`}>
          <p className="text-sm text-ink2-secondary">
            Loading consultant...
          </p>
        </div>
      </div>
    )
  }

  if (!consultant) {
    return (
      <div className="mx-auto w-full max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <div className={`${cardClass} py-12 text-center`}>
          <h2 className="text-base font-semibold text-ink2">
            Consultant not found
          </h2>

          <button
            type="button"
            onClick={() => navigate('/admin/consultants')}
            className="mt-4 rounded-lg bg-brand px-4 py-2.5 text-sm font-semibold text-white hover:bg-brand-hover"
          >
            Back to Consultants
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-full bg-canvas">
      <div className="mx-auto w-full max-w-7xl px-4 py-5 sm:px-6 sm:py-7 lg:px-8">
        <header className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <button
              type="button"
              onClick={() => navigate('/admin/consultants')}
              className="mb-3 text-sm font-medium text-brand hover:underline"
            >
              ← Back to Consultants
            </button>

            <h1 className="text-2xl font-bold tracking-tight text-ink2">
              Consultant Details
            </h1>

            <p className="mt-1 text-sm text-ink2-secondary">
              Manage the consultant profile, password, and assigned access.
            </p>
          </div>

          <span className="inline-flex w-fit items-center rounded-full bg-brand-soft px-3 py-1.5 text-xs font-semibold text-brand">
            {consultant.employee_id || 'Consultant'}
          </span>
        </header>

        {error && (
          <div
            role="alert"
            className="mb-5 rounded-lg border border-danger/20 bg-danger-soft px-4 py-3 text-sm text-danger"
          >
            {error}
          </div>
        )}

        {success && (
          <div
            role="status"
            className="mb-5 rounded-lg border border-success/20 bg-success-soft px-4 py-3 text-sm text-success"
          >
            {success}
          </div>
        )}

        <div className="grid items-start gap-5 lg:grid-cols-[minmax(280px,0.85fr)_minmax(0,1.5fr)]">
          <div className="space-y-5">
            <section className={cardClass}>
              <h2 className="mb-5 text-base font-bold text-ink2">
                Consultant Profile
              </h2>

              <div className="space-y-4">
                <div>
                  <label className={labelClass}>Employee ID</label>
                  <input
                    value={consultant.employee_id || ''}
                    disabled
                    className={inputClass}
                  />
                </div>

                <div>
                  <label className={labelClass}>Full Name</label>
                  <input
                    value={fullName}
                    onChange={(event) => {
                      setFullName(event.target.value)
                      clearMessages()
                    }}
                    className={inputClass}
                    maxLength={150}
                  />
                </div>

                <div>
                  <label className={labelClass}>Status</label>
                  <span
                    className={`inline-flex rounded-full px-3 py-1.5 text-xs font-semibold ${
                      consultant.is_active
                        ? 'bg-success-soft text-success'
                        : 'bg-danger-soft text-danger'
                    }`}
                  >
                    {consultant.is_active ? 'Active' : 'Inactive'}
                  </span>
                </div>

                <div>
                  <label className={labelClass}>Created</label>
                  <p className="text-sm text-ink2">
                    {formatDate(consultant.created_at)}
                  </p>
                </div>

                <div>
                  <label className={labelClass}>Last Login</label>
                  <p className="text-sm text-ink2">
                    {formatDate(consultant.last_login, true)}
                  </p>
                </div>
              </div>
            </section>

            <section className={cardClass}>
              <h2 className="text-base font-bold text-ink2">
                Reset Password
              </h2>

              <p className="mb-5 mt-1 text-sm text-ink2-secondary">
                Set a new password for this consultant.
              </p>

              <div className="space-y-4">
                <div>
                  <label className={labelClass}>New Password</label>
                  <input
                    type="password"
                    autoComplete="new-password"
                    placeholder="Enter new password"
                    value={newPassword}
                    onChange={(event) => {
                      setNewPassword(event.target.value)
                      clearMessages()
                    }}
                    className={inputClass}
                  />
                </div>

                <div>
                  <label className={labelClass}>Confirm Password</label>
                  <input
                    type="password"
                    autoComplete="new-password"
                    placeholder="Confirm new password"
                    value={confirmPassword}
                    onChange={(event) => {
                      setConfirmPassword(event.target.value)
                      clearMessages()
                    }}
                    className={inputClass}
                  />
                </div>

                <button
                  type="button"
                  disabled={resettingPassword}
                  onClick={handleResetPassword}
                  className="w-full rounded-lg border border-line-strong px-4 py-2.5 text-sm font-semibold text-ink2 transition hover:bg-canvas disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {resettingPassword ? 'Resetting...' : 'Reset Password'}
                </button>
              </div>
            </section>
          </div>

          <section className={cardClass}>
            <div className="mb-5 flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
              <div>
                <h2 className="text-base font-bold text-ink2">
                  Plant &amp; Zone Access
                </h2>

                <p className="mt-1 text-sm text-ink2-secondary">
                  Choose the Plants this consultant can access, then select
                  the required Zones within each Plant.
                </p>
              </div>

              <div className="shrink-0 rounded-lg bg-canvas px-3 py-2 text-xs font-semibold text-ink2-secondary">
                {selectedPlantIds.length} Plants · {selectedZoneCount} Zones
              </div>
            </div>

            {plants.length === 0 ? (
              <div className="rounded-lg border border-dashed border-line-strong px-4 py-8 text-center">
                <p className="text-sm font-medium text-ink2">
                  No active Plants found
                </p>
                <p className="mt-1 text-xs text-ink2-secondary">
                  Create or activate a Plant before assigning consultant access.
                </p>
              </div>
            ) : (
              <div className="space-y-3">
                {plants.map((plant) => {
                  const plantId = String(plant.id)
                  const selected = selectedPlantSet.has(plantId)
                  const plantZones = zonesByPlant[plantId] || []
                  const isLoading = loadingZones[plantId] === true

                  const zonesSelectedCount = plantZones.filter((zone) =>
                    selectedZoneIds.some(
                      (zoneId) => String(zoneId) === String(zone.id)
                    )
                  ).length

                  return (
                    <div
                      key={plantId}
                      className={`overflow-hidden rounded-xl border transition-colors ${
                        selected
                          ? 'border-brand/40 bg-brand-soft/20'
                          : 'border-line bg-surface'
                      }`}
                    >
                      <button
                        type="button"
                        aria-pressed={selected}
                        onClick={() => togglePlant(plant.id)}
                        className="flex w-full items-center justify-between gap-3 p-4 text-left"
                      >
                        <span className="flex min-w-0 items-center gap-3">
                          <span
                            className={`flex h-5 w-5 shrink-0 items-center justify-center rounded border text-xs font-bold ${
                              selected
                                ? 'border-brand bg-brand text-white'
                                : 'border-line-strong bg-surface text-transparent'
                            }`}
                          >
                            ✓
                          </span>

                          <span className="min-w-0">
                            <span className="block truncate text-sm font-semibold text-ink2">
                              {plant.name}
                            </span>
                            {plant.code && (
                              <span className="mt-0.5 block text-xs text-ink2-muted">
                                {plant.code}
                              </span>
                            )}
                          </span>
                        </span>

                        <span
                          className={`shrink-0 rounded-full px-2.5 py-1 text-xs font-semibold ${
                            selected
                              ? 'bg-brand-soft text-brand'
                              : 'bg-canvas text-ink2-secondary'
                          }`}
                        >
                          {selected ? 'Assigned' : 'Not assigned'}
                        </span>
                      </button>

                      {selected && (
                        <div className="border-t border-line px-4 pb-4 pt-3">
                          <div className="mb-3 flex items-center justify-between gap-3">
                            <h3 className="text-xs font-bold uppercase tracking-wide text-ink2-secondary">
                              Available Zones
                            </h3>

                            {!isLoading && (
                              <span className="text-xs text-ink2-muted">
                                {zonesSelectedCount} of {plantZones.length} selected
                              </span>
                            )}
                          </div>

                          {isLoading ? (
                            <div className="rounded-lg bg-canvas px-3 py-4 text-sm text-ink2-secondary">
                              Loading Zones...
                            </div>
                          ) : plantZones.length === 0 ? (
                            <div className="rounded-lg border border-dashed border-line-strong px-3 py-4 text-sm text-ink2-secondary">
                              No active Zones found for this Plant.
                            </div>
                          ) : (
                            <div className="grid gap-2 sm:grid-cols-2">
                              {plantZones.map((zone) => {
                                const zoneId = String(zone.id)
                                const checked = selectedZoneIds.some(
                                  (value) => String(value) === zoneId
                                )

                                return (
                                  <button
                                    key={zoneId}
                                    type="button"
                                    aria-pressed={checked}
                                    onClick={() => toggleZone(zone.id)}
                                    className={`flex min-w-0 items-center gap-3 rounded-lg border px-3 py-3 text-left transition-colors ${
                                      checked
                                        ? 'border-brand bg-brand-soft'
                                        : 'border-line bg-surface hover:border-line-strong hover:bg-canvas'
                                    }`}
                                  >
                                    <span
                                      className={`flex h-4 w-4 shrink-0 items-center justify-center rounded border text-[10px] font-bold ${
                                        checked
                                          ? 'border-brand bg-brand text-white'
                                          : 'border-line-strong bg-surface text-transparent'
                                      }`}
                                    >
                                      ✓
                                    </span>

                                    <span className="break-words text-sm font-medium text-ink2">
                                      {zone.name}
                                    </span>
                                  </button>
                                )
                              })}
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  )
                })}
              </div>
            )}

            <div className="mt-6 flex flex-col-reverse gap-3 border-t border-line pt-5 sm:flex-row sm:items-center sm:justify-between">
              <p className="text-xs leading-5 text-ink2-muted">
                Access changes take effect after saving successfully.
              </p>

              <button
                type="button"
                disabled={
                  saving ||
                  plants.length === 0 ||
                  selectedPlantIds.some(
                    (plantId) => loadingZones[String(plantId)] === true
                  )
                }
                onClick={handleSave}
                className="inline-flex items-center justify-center rounded-lg bg-brand px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-brand-hover disabled:cursor-not-allowed disabled:opacity-50"
              >
                {saving ? 'Saving Access...' : 'Save Access'}
              </button>
            </div>
          </section>
        </div>
      </div>
    </div>
  )
}
