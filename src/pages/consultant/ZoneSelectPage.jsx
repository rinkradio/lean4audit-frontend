import { useEffect, useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { fetchZones } from '../../services/zoneService'

export default function ZoneSelectPage() {
  const navigate = useNavigate()

  const [zones, setZones] = useState([])
  const [selectedZoneId, setSelectedZoneId] = useState('')
  const [isLoading, setIsLoading] = useState(true)
  const [loadError, setLoadError] = useState('')

  useEffect(() => {
    let mounted = true

    async function load() {
      try {
        setIsLoading(true)
        setLoadError('')

        const data = await fetchZones()

        if (mounted) {
          setZones(Array.isArray(data) ? data : [])
        }
      } catch (err) {
        if (mounted) {
          setLoadError(
            err?.response?.data?.detail ||
              'Unable to load Zones. Please try again.'
          )
        }
      } finally {
        if (mounted) {
          setIsLoading(false)
        }
      }
    }

    load()

    return () => {
      mounted = false
    }
  }, [])

  const selectedZone = useMemo(
    () =>
      zones.find(
        (zone) => String(zone.id) === String(selectedZoneId)
      ),
    [zones, selectedZoneId]
  )

  const groupedZones = useMemo(() => {
    const groups = new Map()

    zones.forEach((zone) => {
      const key = zone.plant_id || 'unassigned'

      if (!groups.has(key)) {
        groups.set(key, {
          id: key,
          plant: zone.plant || null,
          zones: [],
        })
      }

      groups.get(key).zones.push(zone)
    })

    return Array.from(groups.values())
  }, [zones])

  function handleContinue() {
    if (!selectedZone) return

    navigate('/consultant/audits/new/details', {
      state: {
        plantId: selectedZone.plant_id,
        zoneId: selectedZone.id,
        plant: selectedZone.plant,
        zone: selectedZone,
      },
    })
  }

  return (
    <div className="mx-auto max-w-4xl animate-fade-in">
      <button
        type="button"
        onClick={() => navigate('/consultant')}
        className="text-sm font-medium text-ink2-secondary hover:text-ink2"
      >
        ← Back
      </button>

      <div className="mt-3">
        <h1 className="text-xl font-bold text-ink2 sm:text-2xl">
          Select Plant & Zone
        </h1>
        <p className="mt-1.5 text-sm text-ink2-secondary">
          Select a Zone you are authorized to audit. The Zone Leader assigned by Admin will be loaded automatically.
        </p>
      </div>

      <div className="mt-6 rounded-xl border border-line bg-surface p-4 shadow-xs sm:p-6">
        {isLoading && (
          <div className="space-y-3">
            {[0, 1, 2].map((item) => (
              <div
                key={item}
                className="skeleton h-24 rounded-xl"
              />
            ))}
          </div>
        )}

        {!isLoading && loadError && (
          <div className="py-10 text-center text-sm text-danger">
            {loadError}
          </div>
        )}

        {!isLoading && !loadError && zones.length === 0 && (
          <div className="py-10 text-center">
            <h3 className="text-base font-semibold text-ink2">
              No Zones assigned
            </h3>
            <p className="mt-1 text-sm text-ink2-muted">
              Contact the Admin if you need access to a Zone.
            </p>
          </div>
        )}

        {!isLoading && !loadError && zones.length > 0 && (
          <div className="space-y-5">
            {groupedZones.map((group) => (
              <div key={group.id}>
                <div className="mb-2 flex items-center gap-2 px-1">
                  <div className="h-2 w-2 rounded-full bg-brand" />
                  <div className="text-sm font-bold text-ink2">
                    {group.plant?.name || 'Plant'}
                  </div>
                  {group.plant?.code && (
                    <span className="text-xs text-ink2-muted">
                      ({group.plant.code})
                    </span>
                  )}
                </div>

                <div className="space-y-2">
                  {group.zones.map((zone) => {
                    const selected =
                      String(selectedZoneId) === String(zone.id)

                    return (
                      <label
                        key={zone.id}
                        className={`flex cursor-pointer items-center justify-between gap-4 rounded-xl border px-4 py-4 transition-colors ${
                          selected
                            ? 'border-brand bg-brand-soft'
                            : 'border-line hover:bg-canvas'
                        }`}
                      >
                        <div className="flex min-w-0 items-center gap-3">
                          <input
                            type="radio"
                            name="zone"
                            checked={selected}
                            onChange={() =>
                              setSelectedZoneId(zone.id)
                            }
                            className="h-4 w-4 accent-[#1c5cff]"
                          />

                          <div className="min-w-0">
                            <div className="truncate text-sm font-semibold text-ink2">
                              {zone.name}
                            </div>
                            <div className="mt-1 text-xs text-ink2-muted">
                              {zone.is_active ? 'Active Zone' : 'Inactive Zone'}
                            </div>
                          </div>
                        </div>

                        <div className="shrink-0 text-right">
                          <div className="text-[10px] font-semibold uppercase tracking-wide text-ink2-muted">
                            Zone Leader
                          </div>
                          <div className="mt-0.5 text-xs font-semibold text-ink2">
                            {zone.zone_leader || 'Not assigned'}
                          </div>

                        </div>
                      </label>
                    )
                  })}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {selectedZone && (
        <div className="mt-4 rounded-xl border border-brand/20 bg-brand-soft px-4 py-3">
          <div className="text-xs font-semibold uppercase tracking-wide text-brand">
            Selected Zone Leader
          </div>
          <div className="mt-1 text-sm font-bold text-ink2">
            {selectedZone.zone_leader || 'Not assigned'}
          </div>
        </div>
      )}

      <button
        type="button"
        disabled={!selectedZone || !selectedZone.zone_leader}
        onClick={handleContinue}
        className="mt-6 w-full rounded-md bg-brand px-4 py-3 text-sm font-semibold text-white shadow-xs transition-colors hover:bg-brand-hover disabled:cursor-not-allowed disabled:opacity-50 sm:w-auto"
      >
        Continue
      </button>
    </div>
  )
}
