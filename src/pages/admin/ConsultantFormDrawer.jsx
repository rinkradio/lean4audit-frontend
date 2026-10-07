import { useEffect, useState } from 'react'

import {
  createConsultant,
  fetchConsultantPlants,
  fetchConsultantZones,
} from '../../services/consultantService'

export default function ConsultantFormDrawer({
  onClose,
  onCreated,
}) {
  const [form, setForm] = useState({
    employee_id: '',
    full_name: '',
    password: '',
    confirm_password: '',
  })

  const [plants, setPlants] = useState([])
  const [zones, setZones] = useState([])

  const [selectedPlantId, setSelectedPlantId] = useState('')
  const [selectedZoneIds, setSelectedZoneIds] = useState([])

  const [loadingPlants, setLoadingPlants] = useState(true)
  const [loadingZones, setLoadingZones] = useState(false)
  const [submitting, setSubmitting] = useState(false)

  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)

  const [error, setError] = useState('')

  useEffect(() => {
    loadPlants()
  }, [])

  async function loadPlants() {
    setLoadingPlants(true)
    setError('')

    try {
      const data = await fetchConsultantPlants()

      setPlants(Array.isArray(data) ? data : [])
    } catch (err) {
      console.error('Failed to load plants:', err)

      setError(
        err?.response?.data?.detail ||
          'Unable to load Plants. Please try again.'
      )
    } finally {
      setLoadingPlants(false)
    }
  }

  async function loadZones(plantId) {
    if (!plantId) {
      setZones([])
      setSelectedZoneIds([])
      return
    }

    setLoadingZones(true)
    setError('')
    setZones([])
    setSelectedZoneIds([])

    try {
      const data = await fetchConsultantZones(plantId)

      setZones(Array.isArray(data) ? data : [])
    } catch (err) {
      console.error('Failed to load zones:', err)

      setZones([])

      setError(
        err?.response?.data?.detail ||
          'Unable to load Zones. Please try again.'
      )
    } finally {
      setLoadingZones(false)
    }
  }

  function handleChange(event) {
    const { name, value } = event.target

    setForm((current) => ({
      ...current,
      [name]: value,
    }))

    if (error) {
      setError('')
    }
  }

  function handlePlantChange(event) {
    const plantId = event.target.value

    setSelectedPlantId(plantId)

    loadZones(plantId)
  }

  function toggleZone(zoneId) {
    const id = String(zoneId)

    setSelectedZoneIds((current) => {
      if (current.includes(id)) {
        return current.filter(
          (currentId) => currentId !== id
        )
      }

      return [...current, id]
    })

    if (error) {
      setError('')
    }
  }

  function selectAllZones() {
    setSelectedZoneIds(
      zones.map((zone) => String(zone.id))
    )
  }

  function clearAllZones() {
    setSelectedZoneIds([])
  }

  async function handleSubmit(event) {
    event.preventDefault()

    setError('')

    const employeeId = form.employee_id.trim()
    const fullName = form.full_name.trim()

    if (!employeeId) {
      setError('Employee ID is required.')
      return
    }

    if (!fullName) {
      setError('Full Name is required.')
      return
    }

    if (!form.password) {
      setError('Password is required.')
      return
    }

    if (form.password.length < 8) {
      setError('Password must be at least 8 characters.')
      return
    }

    if (form.password !== form.confirm_password) {
      setError('Passwords do not match.')
      return
    }

    if (!selectedPlantId) {
      setError('At least one Plant must be assigned.')
      return
    }

    if (selectedZoneIds.length === 0) {
      setError('At least one Zone must be assigned.')
      return
    }

    setSubmitting(true)

    try {
      await createConsultant({
        employee_id: employeeId,
        full_name: fullName,
        password: form.password,
        confirm_password: form.confirm_password,
        plant_ids: [selectedPlantId],
        zone_ids: selectedZoneIds,
      })

      onCreated?.()
    } catch (err) {
      console.error(
        'Failed to create consultant:',
        err
      )

      const detail = err?.response?.data?.detail

      if (Array.isArray(detail)) {
        setError(
          detail
            .map(
              (item) =>
                item?.msg || 'Validation error'
            )
            .join(', ')
        )
      } else {
        setError(
          detail ||
            'Unable to create consultant. Please try again.'
        )
      }
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="fixed inset-0 z-[1000] flex">
      {/* BACKDROP */}
      <button
        type="button"
        aria-label="Close"
        className="absolute inset-0 cursor-default bg-black/30 backdrop-blur-[2px]"
        onClick={onClose}
      />

      {/* DRAWER */}
      <div className="relative ml-auto flex h-full w-full max-w-xl flex-col bg-surface shadow-2xl">
        {/* HEADER */}
        <div className="flex shrink-0 items-center justify-between border-b border-line px-6 py-5">
          <div>
            <h2 className="text-xl font-bold text-ink2">
              Add Lean Consultant
            </h2>

            <p className="mt-1 text-sm text-ink2-secondary">
              Create a consultant and assign Plant & Zone access.
            </p>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="flex h-9 w-9 items-center justify-center rounded-full text-2xl text-ink2-muted transition hover:bg-canvas hover:text-ink2"
          >
            ×
          </button>
        </div>

        {/* FORM */}
        <form
          onSubmit={handleSubmit}
          className="flex min-h-0 flex-1 flex-col"
        >
          {/* BODY */}
          <div className="flex-1 overflow-y-auto px-6 py-6">
            <div className="space-y-6">
              {/* EMPLOYEE ID */}
              <div>
                <label className="mb-2 block text-sm font-semibold text-ink2">
                  Employee ID *
                </label>

                <input
                  type="text"
                  name="employee_id"
                  value={form.employee_id}
                  onChange={handleChange}
                  placeholder="e.g. LTCG001"
                  disabled={submitting}
                  autoFocus
                  className="w-full rounded-lg border border-line-strong bg-surface px-4 py-3 text-sm text-ink2 outline-none transition focus:border-brand focus:ring-4 focus:ring-brand-soft disabled:cursor-not-allowed disabled:opacity-60"
                />
              </div>

              {/* FULL NAME */}
              <div>
                <label className="mb-2 block text-sm font-semibold text-ink2">
                  Full Name *
                </label>

                <input
                  type="text"
                  name="full_name"
                  value={form.full_name}
                  onChange={handleChange}
                  placeholder="Enter consultant name"
                  disabled={submitting}
                  className="w-full rounded-lg border border-line-strong bg-surface px-4 py-3 text-sm text-ink2 outline-none transition focus:border-brand focus:ring-4 focus:ring-brand-soft disabled:cursor-not-allowed disabled:opacity-60"
                />
              </div>

              {/* PASSWORD */}
              <div>
                <label className="mb-2 block text-sm font-semibold text-ink2">
                  Password *
                </label>

                <div className="relative">
                  <input
                    type={
                      showPassword
                        ? 'text'
                        : 'password'
                    }
                    name="password"
                    value={form.password}
                    onChange={handleChange}
                    placeholder="Minimum 8 characters"
                    disabled={submitting}
                    className="w-full rounded-lg border border-line-strong bg-surface px-4 py-3 pr-16 text-sm text-ink2 outline-none transition focus:border-brand focus:ring-4 focus:ring-brand-soft disabled:cursor-not-allowed disabled:opacity-60"
                  />

                  <button
                    type="button"
                    onClick={() =>
                      setShowPassword(
                        (current) => !current
                      )
                    }
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-xs font-semibold text-brand hover:underline"
                  >
                    {showPassword ? 'Hide' : 'Show'}
                  </button>
                </div>
              </div>

              {/* CONFIRM PASSWORD */}
              <div>
                <label className="mb-2 block text-sm font-semibold text-ink2">
                  Confirm Password *
                </label>

                <div className="relative">
                  <input
                    type={
                      showConfirmPassword
                        ? 'text'
                        : 'password'
                    }
                    name="confirm_password"
                    value={form.confirm_password}
                    onChange={handleChange}
                    placeholder="Re-enter password"
                    disabled={submitting}
                    className="w-full rounded-lg border border-line-strong bg-surface px-4 py-3 pr-16 text-sm text-ink2 outline-none transition focus:border-brand focus:ring-4 focus:ring-brand-soft disabled:cursor-not-allowed disabled:opacity-60"
                  />

                  <button
                    type="button"
                    onClick={() =>
                      setShowConfirmPassword(
                        (current) => !current
                      )
                    }
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-xs font-semibold text-brand hover:underline"
                  >
                    {showConfirmPassword
                      ? 'Hide'
                      : 'Show'}
                  </button>
                </div>
              </div>

              {/* PLANT ACCESS */}
              <div className="rounded-xl border border-line bg-canvas/40 p-4">
                <div className="mb-3">
                  <h3 className="text-sm font-bold text-ink2">
                    Plant Access *
                  </h3>

                  <p className="mt-1 text-xs text-ink2-muted">
                    Select the Plant this consultant can access.
                  </p>
                </div>

                {loadingPlants ? (
                  <div className="rounded-lg border border-line bg-surface px-4 py-4 text-sm text-ink2-muted">
                    Loading Plants...
                  </div>
                ) : plants.length === 0 ? (
                  <div className="rounded-lg border border-dashed border-line-strong bg-surface px-4 py-4 text-sm text-ink2-secondary">
                    No active Plants available.
                  </div>
                ) : (
                  <select
                    value={selectedPlantId}
                    onChange={handlePlantChange}
                    disabled={submitting}
                    className="w-full rounded-lg border border-line-strong bg-surface px-4 py-3 text-sm text-ink2 outline-none transition focus:border-brand focus:ring-4 focus:ring-brand-soft disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    <option value="">
                      Select Plant
                    </option>

                    {plants.map((plant) => (
                      <option
                        key={plant.id}
                        value={plant.id}
                      >
                        {plant.name}
                        {plant.code
                          ? ` (${plant.code})`
                          : ''}
                      </option>
                    ))}
                  </select>
                )}
              </div>

              {/* ZONE ACCESS */}
              <div className="rounded-xl border border-line bg-canvas/40 p-4">
                <div className="mb-3 flex items-start justify-between gap-3">
                  <div>
                    <h3 className="text-sm font-bold text-ink2">
                      Zone Access *
                    </h3>

                    <p className="mt-1 text-xs text-ink2-muted">
                      Select the Zones inside the selected Plant.
                    </p>
                  </div>

                  {zones.length > 0 && (
                    <div className="flex shrink-0 gap-2">
                      <button
                        type="button"
                        onClick={selectAllZones}
                        disabled={submitting}
                        className="text-xs font-semibold text-brand hover:underline"
                      >
                        Select All
                      </button>

                      <button
                        type="button"
                        onClick={clearAllZones}
                        disabled={submitting}
                        className="text-xs font-semibold text-ink2-muted hover:text-ink2"
                      >
                        Clear
                      </button>
                    </div>
                  )}
                </div>

                {!selectedPlantId ? (
                  <div className="rounded-lg border border-dashed border-line-strong bg-surface px-4 py-5 text-center text-sm text-ink2-muted">
                    Select a Plant first to view its Zones.
                  </div>
                ) : loadingZones ? (
                  <div className="rounded-lg border border-line bg-surface px-4 py-5 text-center text-sm text-ink2-muted">
                    Loading Zones...
                  </div>
                ) : zones.length === 0 ? (
                  <div className="rounded-lg border border-dashed border-line-strong bg-surface px-4 py-5 text-center text-sm text-ink2-secondary">
                    No active Zones found for this Plant.
                  </div>
                ) : (
                  <div className="space-y-2">
                    {zones.map((zone) => {
                      const zoneId = String(
                        zone.id
                      )

                      const checked =
                        selectedZoneIds.includes(
                          zoneId
                        )

                      return (
                        <label
                          key={zone.id}
                          className={`flex cursor-pointer items-center gap-3 rounded-lg border px-4 py-3 transition ${
                            checked
                              ? 'border-brand bg-brand-soft'
                              : 'border-line bg-surface hover:border-brand/40 hover:bg-canvas'
                          }`}
                        >
                          <input
                            type="checkbox"
                            checked={checked}
                            onChange={() =>
                              toggleZone(
                                zoneId
                              )
                            }
                            disabled={submitting}
                            className="h-4 w-4 accent-[var(--brand)]"
                          />

                          <div className="min-w-0">
                            <div className="text-sm font-semibold text-ink2">
                              {zone.name}
                            </div>

                            {zone.code && (
                              <div className="text-xs text-ink2-muted">
                                {zone.code}
                              </div>
                            )}
                          </div>
                        </label>
                      )
                    })}
                  </div>
                )}

                {selectedZoneIds.length > 0 && (
                  <div className="mt-3 text-xs font-medium text-ink2-secondary">
                    {selectedZoneIds.length}{' '}
                    Zone
                    {selectedZoneIds.length !== 1
                      ? 's'
                      : ''}{' '}
                    selected
                  </div>
                )}
              </div>

              {/* STATUS */}
              <div className="flex items-center justify-between rounded-xl bg-canvas px-4 py-3">
                <span className="text-sm font-semibold text-ink2-secondary">
                  Status
                </span>

                <span className="inline-flex items-center gap-2 text-sm font-semibold text-emerald-600">
                  <span className="h-2 w-2 rounded-full bg-emerald-500" />
                  Active
                </span>
              </div>

              {/* ERROR */}
              {error && (
                <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm font-medium text-red-600">
                  {error}
                </div>
              )}
            </div>
          </div>

          {/* FOOTER */}
          <div className="flex shrink-0 items-center justify-end gap-3 border-t border-line bg-surface px-6 py-4">
            <button
              type="button"
              onClick={onClose}
              disabled={submitting}
              className="rounded-lg border border-line-strong bg-surface px-5 py-2.5 text-sm font-semibold text-ink2-secondary transition hover:bg-canvas disabled:cursor-not-allowed disabled:opacity-50"
            >
              Cancel
            </button>

            <button
              type="submit"
              disabled={
                submitting ||
                loadingPlants ||
                loadingZones
              }
              className="rounded-lg bg-brand px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-brand-hover disabled:cursor-not-allowed disabled:opacity-60"
            >
              {submitting
                ? 'Creating...'
                : 'Create Consultant'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}