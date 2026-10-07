import { useEffect, useMemo, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'

import {
  fetchConsultant,
  fetchConsultantPlants,
  fetchConsultantZones,
  updateConsultant,
  resetConsultantPassword,
} from '../../services/consultantService'

export default function ConsultantDetailPage() {
  const { id } = useParams()
  const navigate = useNavigate()

  const [consultant, setConsultant] = useState(null)
  const [plants, setPlants] = useState([])
  const [zonesByPlant, setZonesByPlant] = useState({})

  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [loadingZones, setLoadingZones] = useState({})

  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  const [fullName, setFullName] = useState('')

  const [selectedPlantIds, setSelectedPlantIds] =
    useState([])

  const [selectedZoneIds, setSelectedZoneIds] =
    useState([])

  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] =
    useState('')
  const [resettingPassword, setResettingPassword] =
    useState(false)

  // ---------------------------------------------------------
  // LOAD CONSULTANT
  // ---------------------------------------------------------

  useEffect(() => {
    let mounted = true

    async function loadConsultant() {
      try {
        setLoading(true)
        setError('')

        const [
          consultantData,
          plantData,
        ] = await Promise.all([
          fetchConsultant(id),
          fetchConsultantPlants(),
        ])

        if (!mounted) return

        setConsultant(consultantData)
        setPlants(plantData || [])

        setFullName(
          consultantData?.full_name || ''
        )

        setSelectedPlantIds(
          consultantData?.plant_ids || []
        )

        setSelectedZoneIds(
          consultantData?.zone_ids || []
        )
      } catch (err) {
        if (!mounted) return

        console.error(
          'Failed to load consultant:',
          err
        )

        setError(
          err?.response?.data?.detail ||
            'Unable to load consultant.'
        )
      } finally {
        if (mounted) {
          setLoading(false)
        }
      }
    }

    loadConsultant()

    return () => {
      mounted = false
    }
  }, [id])

  // ---------------------------------------------------------
  // LOAD ZONES FOR SELECTED PLANTS
  // ---------------------------------------------------------

  useEffect(() => {
    if (!selectedPlantIds.length) {
      setZonesByPlant({})
      return
    }

    let cancelled = false

    async function loadZones() {
      const nextZones = {}

      for (const plantId of selectedPlantIds) {
        try {
          setLoadingZones((current) => ({
            ...current,
            [plantId]: true,
          }))

          const data =
            await fetchConsultantZones(
              plantId
            )

          if (cancelled) return

          nextZones[plantId] = data || []

          setZonesByPlant((current) => ({
            ...current,
            [plantId]: data || [],
          }))
        } catch (err) {
          console.error(
            `Failed to load zones for plant ${plantId}:`,
            err
          )

          if (!cancelled) {
            setZonesByPlant((current) => ({
              ...current,
              [plantId]: [],
            }))
          }
        } finally {
          if (!cancelled) {
            setLoadingZones((current) => ({
              ...current,
              [plantId]: false,
            }))
          }
        }
      }
    }

    loadZones()

    return () => {
      cancelled = true
    }
  }, [selectedPlantIds])

  // ---------------------------------------------------------
  // SELECTED PLANTS
  // ---------------------------------------------------------

  const selectedPlants = useMemo(() => {
    return plants.filter((plant) =>
      selectedPlantIds.some(
        (id) =>
          String(id) === String(plant.id)
      )
    )
  }, [
    plants,
    selectedPlantIds,
  ])

  // ---------------------------------------------------------
  // TOGGLE PLANT
  // ---------------------------------------------------------

  function togglePlant(plantId) {
    const exists = selectedPlantIds.some(
      (id) =>
        String(id) === String(plantId)
    )

    if (exists) {
      setSelectedPlantIds((current) =>
        current.filter(
          (id) =>
            String(id) !==
            String(plantId)
        )
      )

      const plantZones =
        zonesByPlant[plantId] || []

      const zoneIdsToRemove =
        new Set(
          plantZones.map(
            (zone) => String(zone.id)
          )
        )

      setSelectedZoneIds((current) =>
        current.filter(
          (id) =>
            !zoneIdsToRemove.has(
              String(id)
            )
        )
      )
    } else {
      setSelectedPlantIds((current) => [
        ...current,
        plantId,
      ])
    }

    setError('')
    setSuccess('')
  }

  // ---------------------------------------------------------
  // TOGGLE ZONE
  // ---------------------------------------------------------

  function toggleZone(zoneId) {
    const exists = selectedZoneIds.some(
      (id) =>
        String(id) === String(zoneId)
    )

    if (exists) {
      setSelectedZoneIds((current) =>
        current.filter(
          (id) =>
            String(id) !==
            String(zoneId)
        )
      )
    } else {
      setSelectedZoneIds((current) => [
        ...current,
        zoneId,
      ])
    }

    setError('')
    setSuccess('')
  }

  // ---------------------------------------------------------
  // SAVE
  // ---------------------------------------------------------

  async function handleSave() {
    setError('')
    setSuccess('')

    if (!fullName.trim()) {
      setError('Full name is required.')
      return
    }

    if (!selectedPlantIds.length) {
      setError(
        'Please assign at least one Plant.'
      )
      return
    }

    if (!selectedZoneIds.length) {
      setError(
        'Please assign at least one Zone.'
      )
      return
    }

    setSaving(true)

    try {
      const updated =
        await updateConsultant(
          id,
          {
            full_name:
              fullName.trim(),

            plant_ids:
              selectedPlantIds,

            zone_ids:
              selectedZoneIds,
          }
        )

      setConsultant(updated)

      setSelectedPlantIds(
        updated?.plant_ids || []
      )

      setSelectedZoneIds(
        updated?.zone_ids || []
      )

      setSuccess(
        'Consultant access updated successfully.'
      )
    } catch (err) {
      console.error(
        'Failed to update consultant:',
        err
      )

      setError(
        err?.response?.data?.detail ||
          'Unable to update consultant.'
      )
    } finally {
      setSaving(false)
    }
  }

  // ---------------------------------------------------------
  // RESET PASSWORD
  // ---------------------------------------------------------

  async function handleResetPassword() {
    setError('')
    setSuccess('')

    if (!newPassword) {
      setError(
        'New password is required.'
      )
      return
    }

    if (newPassword.length < 8) {
      setError(
        'Password must be at least 8 characters.'
      )
      return
    }

    if (
      newPassword !==
      confirmPassword
    ) {
      setError(
        'Passwords do not match.'
      )
      return
    }

    setResettingPassword(true)

    try {
      await resetConsultantPassword(
        id,
        {
          new_password:
            newPassword,

          confirm_password:
            confirmPassword,
        }
      )

      setNewPassword('')
      setConfirmPassword('')

      setSuccess(
        'Consultant password reset successfully.'
      )
    } catch (err) {
      console.error(
        'Failed to reset password:',
        err
      )

      setError(
        err?.response?.data?.detail ||
          'Unable to reset password.'
      )
    } finally {
      setResettingPassword(false)
    }
  }

  // ---------------------------------------------------------
  // LOADING
  // ---------------------------------------------------------

  if (loading) {
    return (
      <div className="mx-auto max-w-6xl">
        <div className="rounded-xl border border-line bg-surface p-10 text-center">
          <div className="text-sm text-ink2-secondary">
            Loading consultant...
          </div>
        </div>
      </div>
    )
  }

  // ---------------------------------------------------------
  // NOT FOUND
  // ---------------------------------------------------------

  if (!consultant) {
    return (
      <div className="mx-auto max-w-6xl">
        <div className="rounded-xl border border-line bg-surface p-10 text-center">
          <h2 className="text-base font-semibold text-ink2">
            Consultant not found
          </h2>

          <button
            type="button"
            onClick={() =>
              navigate('/admin/consultants')
            }
            className="mt-4 rounded-lg bg-brand px-4 py-2 text-sm font-semibold text-white"
          >
            Back to Consultants
          </button>
        </div>
      </div>
    )
  }

  // ---------------------------------------------------------
  // RENDER
  // ---------------------------------------------------------

  return (
    <div className="mx-auto max-w-6xl">

      {/* HEADER */}

      <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">

        <div>
          <button
            type="button"
            onClick={() =>
              navigate('/admin/consultants')
            }
            className="mb-3 text-sm font-medium text-brand hover:underline"
          >
            ← Back to Consultants
          </button>

          <h1 className="text-2xl font-bold text-ink2">
            Consultant Details
          </h1>

          <p className="mt-1 text-sm text-ink2-secondary">
            Manage profile and Plant / Zone access.
          </p>
        </div>

        <div className="rounded-full bg-brand-soft px-3 py-1.5 text-xs font-semibold text-brand">
          {consultant.employee_id}
        </div>

      </div>

      {/* MESSAGES */}

      {error && (
        <div className="mb-5 rounded-lg border border-danger/20 bg-danger-soft px-4 py-3 text-sm text-danger">
          {error}
        </div>
      )}

      {success && (
        <div className="mb-5 rounded-lg border border-success/20 bg-success-soft px-4 py-3 text-sm text-success">
          {success}
        </div>
      )}

      <div className="grid gap-6 lg:grid-cols-[1fr_1.5fr]">

        {/* PROFILE */}

        <div className="space-y-6">

          <section className="rounded-xl border border-line bg-surface p-6 shadow-xs">

            <h2 className="mb-5 text-base font-bold text-ink2">
              Consultant Profile
            </h2>

            <div className="space-y-4">

              <div>
                <label className="mb-1.5 block text-xs font-semibold text-ink2-secondary">
                  Employee ID
                </label>

                <input
                  type="text"
                  value={
                    consultant.employee_id
                  }
                  disabled
                  className="w-full rounded-lg border border-line bg-canvas px-3 py-2.5 text-sm text-ink2-muted"
                />
              </div>

              <div>
                <label className="mb-1.5 block text-xs font-semibold text-ink2-secondary">
                  Full Name
                </label>

                <input
                  type="text"
                  value={fullName}
                  onChange={(event) =>
                    setFullName(
                      event.target.value
                    )
                  }
                  className="w-full rounded-lg border border-line-strong bg-surface px-3 py-2.5 text-sm text-ink2 outline-none focus:border-brand focus:ring-4 focus:ring-brand-soft"
                />
              </div>

              <div>
                <label className="mb-1.5 block text-xs font-semibold text-ink2-secondary">
                  Status
                </label>

                <div
                  className={`inline-flex rounded-full px-3 py-1.5 text-xs font-semibold ${
                    consultant.is_active
                      ? 'bg-success-soft text-success'
                      : 'bg-danger-soft text-danger'
                  }`}
                >
                  {consultant.is_active
                    ? 'Active'
                    : 'Inactive'}
                </div>
              </div>

              <div>
                <label className="mb-1.5 block text-xs font-semibold text-ink2-secondary">
                  Created
                </label>

                <div className="text-sm text-ink2">
                  {consultant.created_at
                    ? new Date(
                        consultant.created_at
                      ).toLocaleDateString(
                        'en-GB',
                        {
                          day: '2-digit',
                          month: 'short',
                          year: 'numeric',
                        }
                      )
                    : '—'}
                </div>
              </div>

              <div>
                <label className="mb-1.5 block text-xs font-semibold text-ink2-secondary">
                  Last Login
                </label>

                <div className="text-sm text-ink2">
                  {consultant.last_login
                    ? new Date(
                        consultant.last_login
                      ).toLocaleString(
                        'en-GB'
                      )
                    : 'Never'}
                </div>
              </div>

            </div>
          </section>

          {/* RESET PASSWORD */}

          <section className="rounded-xl border border-line bg-surface p-6 shadow-xs">

            <h2 className="mb-1 text-base font-bold text-ink2">
              Reset Password
            </h2>

            <p className="mb-5 text-sm text-ink2-secondary">
              Set a new password for this consultant.
            </p>

            <div className="space-y-4">

              <input
                type="password"
                placeholder="New password"
                value={newPassword}
                onChange={(event) =>
                  setNewPassword(
                    event.target.value
                  )
                }
                className="w-full rounded-lg border border-line-strong bg-surface px-3 py-2.5 text-sm text-ink2 outline-none focus:border-brand focus:ring-4 focus:ring-brand-soft"
              />

              <input
                type="password"
                placeholder="Confirm new password"
                value={confirmPassword}
                onChange={(event) =>
                  setConfirmPassword(
                    event.target.value
                  )
                }
                className="w-full rounded-lg border border-line-strong bg-surface px-3 py-2.5 text-sm text-ink2 outline-none focus:border-brand focus:ring-4 focus:ring-brand-soft"
              />

              <button
                type="button"
                disabled={resettingPassword}
                onClick={
                  handleResetPassword
                }
                className="w-full rounded-lg border border-line-strong px-4 py-2.5 text-sm font-semibold text-ink2 transition hover:bg-canvas disabled:cursor-not-allowed disabled:opacity-50"
              >
                {resettingPassword
                  ? 'Resetting...'
                  : 'Reset Password'}
              </button>

            </div>
          </section>

        </div>

        {/* ACCESS */}

        <section className="rounded-xl border border-line bg-surface p-6 shadow-xs">

          <div className="mb-6">
            <h2 className="text-base font-bold text-ink2">
              Plant & Zone Access
            </h2>

            <p className="mt-1 text-sm text-ink2-secondary">
              Select the Plants this consultant can access.
              Zones are assigned inside each Plant.
            </p>
          </div>

          <div className="space-y-4">

            {plants.map((plant) => {

              const selected =
                selectedPlantIds.some(
                  (id) =>
                    String(id) ===
                    String(plant.id)
                )

              const plantZones =
                zonesByPlant[plant.id] || []

              const selectedZones =
                plantZones.filter(
                  (zone) =>
                    selectedZoneIds.some(
                      (id) =>
                        String(id) ===
                        String(zone.id)
                    )
                )

              return (
                <div
                  key={plant.id}
                  className={`rounded-xl border transition ${
                    selected
                      ? 'border-brand/40 bg-brand-soft/30'
                      : 'border-line bg-surface'
                  }`}
                >

                  {/* PLANT */}

                  <button
                    type="button"
                    onClick={() =>
                      togglePlant(
                        plant.id
                      )
                    }
                    className="flex w-full items-center justify-between gap-4 p-4 text-left"
                  >

                    <div className="flex items-center gap-3">

                      <div
                        className={`flex h-5 w-5 items-center justify-center rounded border text-xs font-bold ${
                          selected
                            ? 'border-brand bg-brand text-white'
                            : 'border-line-strong bg-surface'
                        }`}
                      >
                        {selected
                          ? '✓'
                          : ''}
                      </div>

                      <div>
                        <div className="text-sm font-bold text-ink2">
                          {plant.name}
                        </div>

                        {plant.code && (
                          <div className="mt-0.5 text-xs text-ink2-muted">
                            {plant.code}
                          </div>
                        )}
                      </div>

                    </div>

                    <span className="text-xs text-ink2-muted">
                      {selected
                        ? 'Assigned'
                        : 'Not assigned'}
                    </span>

                  </button>

                  {/* ZONES */}

                  {selected && (
                    <div className="border-t border-line px-4 pb-4 pt-3">

                      <div className="mb-3 text-xs font-semibold uppercase tracking-wide text-ink2-muted">
                        Zones
                      </div>

                      {loadingZones[
                        plant.id
                      ] ? (
                        <div className="text-sm text-ink2-secondary">
                          Loading Zones...
                        </div>
                      ) : plantZones.length ===
                        0 ? (
                        <div className="rounded-lg border border-dashed border-line-strong p-4 text-sm text-ink2-secondary">
                          No active Zones found
                          for this Plant.
                        </div>
                      ) : (
                        <div className="grid gap-2 sm:grid-cols-2">

                          {plantZones.map(
                            (zone) => {

                              const zoneSelected =
                                selectedZoneIds.some(
                                  (id) =>
                                    String(id) ===
                                    String(zone.id)
                                )

                              return (
                                <button
                                  key={
                                    zone.id
                                  }
                                  type="button"
                                  onClick={() =>
                                    toggleZone(
                                      zone.id
                                    )
                                  }
                                  className={`flex items-center gap-3 rounded-lg border px-3 py-3 text-left transition ${
                                    zoneSelected
                                      ? 'border-brand bg-brand-soft'
                                      : 'border-line hover:border-line-strong hover:bg-canvas'
                                  }`}
                                >

                                  <div
                                    className={`flex h-4 w-4 shrink-0 items-center justify-center rounded border text-[10px] font-bold ${
                                      zoneSelected
                                        ? 'border-brand bg-brand text-white'
                                        : 'border-line-strong bg-surface'
                                    }`}
                                  >
                                    {zoneSelected
                                      ? '✓'
                                      : ''}
                                  </div>

                                  <span className="text-sm font-medium text-ink2">
                                    {zone.name}
                                  </span>

                                </button>
                              )
                            }
                          )}

                        </div>
                      )}

                      <div className="mt-3 text-xs text-ink2-muted">
                        {selectedZones.length}{' '}
                        of{' '}
                        {plantZones.length}{' '}
                        Zones selected
                      </div>

                    </div>
                  )}

                </div>
              )
            })}

          </div>

          {/* SAVE */}

          <div className="mt-6 flex justify-end border-t border-line pt-5">

            <button
              type="button"
              disabled={saving}
              onClick={handleSave}
              className="rounded-lg bg-brand px-6 py-2.5 text-sm font-semibold text-white transition hover:bg-brand-hover disabled:cursor-not-allowed disabled:opacity-50"
            >
              {saving
                ? 'Saving...'
                : 'Save Access'}
            </button>

          </div>

        </section>

      </div>
    </div>
  )
}