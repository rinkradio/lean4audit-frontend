import { useEffect, useState } from 'react'
import {
  Edit3,
  Loader2,
  MapPin,
  MoreHorizontal,
  Plus,
  Search,
  Upload,
  X,
} from 'lucide-react'

import { fetchPlants } from '../../services/plantService'
import {
  createZone,
  deleteZone,
  fetchZonesPage,
  updateZone,
  updateZoneStatus,
} from '../../services/zoneService'
import BulkZoneUploadModal from '../../components/admin/BulkZoneUploadModal'
import Pagination from '../../components/Pagination'

export default function ZonesPage() {
  const [zones, setZones] = useState([])
  const [plants, setPlants] = useState([])
  const [total, setTotal] = useState(0)
  const [activeCount, setActiveCount] = useState(0)
  const [page, setPage] = useState(1)
  const PAGE_SIZE = 10

  const [loading, setLoading] = useState(true)
  const [loadingFormData, setLoadingFormData] = useState(true)
  const [submitting, setSubmitting] = useState(false)

  const [search, setSearch] = useState('')
  const [plantFilter, setPlantFilter] = useState('')

  const [showForm, setShowForm] = useState(false)
  const [showBulk, setShowBulk] = useState(false)
  const [editingZone, setEditingZone] = useState(null)

  const [form, setForm] = useState({
    name: '',
    code: '',
    description: '',
    plant_id: '',
    zone_leader: '',
  })

  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  useEffect(() => {
    setPage(1)
  }, [search, plantFilter])

  useEffect(() => {
    const timer = setTimeout(() => {
      loadAll()
    }, 250)
    return () => clearTimeout(timer)
  }, [page, search, plantFilter])

  async function loadAll() {
    try {
      setLoading(true)
      setLoadingFormData(true)
      setError('')

      const [zoneData, plantData] = await Promise.all([
        fetchZonesPage({
          search,
          plantId: plantFilter,
          includeInactive: true,
          page,
          pageSize: PAGE_SIZE,
        }),
        fetchPlants(),
      ])

      setZones(zoneData?.items || [])
      setTotal(Number(zoneData?.total || 0))
      setActiveCount(Number(zoneData?.active_count || 0))
      setPlants(Array.isArray(plantData) ? plantData : [])
    } catch (err) {
      console.error('Failed to load Zone data:', err)
      setError(
        err?.response?.data?.detail ||
          'Unable to load Zones. Please try again.'
      )
    } finally {
      setLoading(false)
      setLoadingFormData(false)
    }
  }

  function openCreate() {
    setEditingZone(null)
    setForm({
      name: '',
      code: '',
      description: '',
      plant_id: '',
      zone_leader: '',
    })
    setError('')
    setShowForm(true)
  }

  function openEdit(zone) {
    setEditingZone(zone)
    setForm({
      name: zone.name || '',
      code: zone.code || '',
      description: zone.description || '',
      plant_id: zone.plant_id || '',
      zone_leader: zone.zone_leader || '',
    })
    setError('')
    setShowForm(true)
  }

  function closeForm() {
    if (submitting) return
    setShowForm(false)
    setEditingZone(null)
  }

  function forceCloseForm() {
    setShowForm(false)
    setEditingZone(null)
  }

  function handleChange(event) {
    const { name, value } = event.target
    setForm((current) => ({
      ...current,
      [name]: value,
    }))
    setError('')
  }

  async function handleSubmit(event) {
    event.preventDefault()

    const name = form.name.trim()

    if (!name) {
      setError('Zone name is required.')
      return
    }

    if (!form.plant_id) {
      setError('Plant is required.')
      return
    }

    if (!form.zone_leader.trim()) {
      setError('Zone Leader is required.')
      return
    }

    setSubmitting(true)
    setError('')
    setSuccess('')

    try {
      const payload = {
        name,
        code: form.code.trim() || null,
        description: form.description.trim() || null,
        plant_id: form.plant_id,
        zone_leader: form.zone_leader,
      }

      const savedZone = editingZone
        ? await updateZone(editingZone.id, payload)
        : await createZone(payload)

      setZones((current) => {
        if (editingZone) {
          return current.map((zone) =>
            zone.id === savedZone.id
              ? savedZone
              : zone
          )
        }

        return [savedZone, ...current]
      })

      setSuccess(
        editingZone
          ? 'Zone updated successfully.'
          : 'Zone created successfully.'
      )

      forceCloseForm()

      setTimeout(() => setSuccess(''), 3000)
    } catch (err) {
      console.error('Failed to save Zone:', err)
      setError(
        err?.response?.data?.detail ||
          'Unable to save Zone. Please try again.'
      )
    } finally {
      setSubmitting(false)
    }
  }

  async function handleToggleStatus(zone) {
    try {
      setError('')

      const updatedZone = await updateZoneStatus(
        zone.id,
        !zone.is_active
      )

      setZones((current) =>
        current.map((item) =>
          item.id === zone.id
            ? updatedZone
            : item
        )
      )

      setSuccess(
        updatedZone.is_active
          ? 'Zone activated successfully.'
          : 'Zone deactivated successfully.'
      )

      setTimeout(() => setSuccess(''), 3000)
    } catch (err) {
      setError(
        err?.response?.data?.detail ||
          'Unable to update Zone status.'
      )
    }
  }

  async function handleDelete(zone) {
    const confirmed = window.confirm(
      `Delete/deactivate "${zone.name}"?`
    )

    if (!confirmed) return

    try {
      setError('')
      await deleteZone(zone.id)
      setZones((current) =>
        current.filter((item) => item.id !== zone.id)
      )
      setSuccess('Zone removed successfully.')
      setTimeout(() => setSuccess(''), 3000)
    } catch (err) {
      setError(
        err?.response?.data?.detail ||
          'Unable to remove Zone.'
      )
    }
  }



  const activeZones = activeCount

  return (
    <div className="min-h-full bg-[var(--background)] p-4 md:p-6 lg:p-8">
      <div className="mx-auto max-w-7xl">
        <div className="mb-6 flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <div className="mb-1 flex items-center gap-2 text-sm text-ink2-muted">
              <MapPin className="h-4 w-4" />
              Administration
            </div>

            <h1 className="text-2xl font-bold tracking-tight text-ink2 md:text-3xl">
              Zones
            </h1>

            <p className="mt-1 text-sm text-ink2-secondary">
              Manage Plant Zones and their responsible Zone Leaders.
            </p>

            <div className="mt-3 flex flex-wrap gap-2">
              <span className="rounded-full bg-canvas px-3 py-1 text-xs font-semibold text-ink2-secondary">
                {total} total
              </span>
              <span className="rounded-full bg-success-soft px-3 py-1 text-xs font-semibold text-success">
                {activeZones} active
              </span>
            </div>
          </div>

          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={() => setShowBulk(true)}
              className="inline-flex h-11 items-center justify-center gap-2 rounded-xl border border-line-strong bg-surface px-4 text-sm font-semibold text-ink2 transition hover:bg-canvas"
            >
              <Upload className="h-4 w-4" />
              Bulk Upload
            </button>

            <button
              type="button"
              onClick={openCreate}
              className="inline-flex h-11 items-center justify-center gap-2 rounded-xl bg-brand px-4 text-sm font-semibold text-white shadow-sm transition hover:bg-brand-hover"
            >
              <Plus className="h-4 w-4" />
              Add Zone
            </button>
          </div>
        </div>

        {success && (
          <div className="mb-5 rounded-xl border border-line bg-surface px-4 py-3 text-sm font-medium text-success">
            {success}
          </div>
        )}

        {error && !showForm && (
          <div className="mb-5 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-medium text-red-600">
            {error}
          </div>
        )}

        <div className="mb-5 grid gap-3 md:grid-cols-[minmax(0,1fr)_240px]">
          <div className="flex h-11 items-center gap-3 rounded-xl border border-line bg-surface px-3">
            <Search className="h-4 w-4 shrink-0 text-ink2-muted" />
            <input
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Search Zone, Plant or Zone Leader..."
              className="w-full bg-transparent text-sm text-ink2 outline-none placeholder:text-ink2-muted"
            />
          </div>

          <select
            value={plantFilter}
            onChange={(event) => setPlantFilter(event.target.value)}
            className="h-11 rounded-xl border border-line bg-surface px-3 text-sm text-ink2 outline-none focus:border-brand focus:ring-4 focus:ring-brand-soft"
          >
            <option value="">All Plants</option>
            {plants.map((plant) => (
              <option key={plant.id} value={plant.id}>
                {plant.name}{plant.code ? ` (${plant.code})` : ''}
              </option>
            ))}
          </select>
        </div>

        <div className="overflow-hidden rounded-2xl border border-line bg-surface shadow-xs">
          {loading ? (
            <div className="flex min-h-[300px] items-center justify-center gap-2 text-sm text-ink2-muted">
              <Loader2 className="h-5 w-5 animate-spin" />
              Loading Zones...
            </div>
          ) : zones.length === 0 ? (
            <div className="flex min-h-[300px] flex-col items-center justify-center px-6 text-center">
              <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-canvas text-ink2-muted">
                <MapPin className="h-5 w-5" />
              </div>
              <h3 className="text-sm font-semibold text-ink2">
                {search || plantFilter ? 'No Zones found' : 'No Zones yet'}
              </h3>
              <p className="mt-1 max-w-sm text-sm text-ink2-muted">
                {search || plantFilter
                  ? 'Try changing your filters.'
                  : 'Create a Zone and assign its Plant and Zone Leader.'}
              </p>
            </div>
          ) : (
            <div className="divide-y divide-line">
              <div className="hidden grid-cols-[1.35fr_1fr_1.2fr_1.35fr_110px_90px] gap-4 bg-canvas/60 px-5 py-3 text-xs font-semibold uppercase tracking-wide text-ink2-muted lg:grid">
                <div>Zone</div>
                <div>Code</div>
                <div>Plant</div>
                <div>Zone Leader</div>
                <div>Status</div>
                <div className="text-right">Action</div>
              </div>

              {zones.map((zone) => (
                <div
                  key={zone.id}
                  className="grid gap-4 px-5 py-4 lg:grid-cols-[1.35fr_1fr_1.2fr_1.35fr_110px_90px] lg:items-center"
                >
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-canvas text-ink2-muted">
                      <MapPin className="h-4 w-4" />
                    </div>
                    <div className="min-w-0">
                      <div className="truncate text-sm font-semibold text-ink2">
                        {zone.name}
                      </div>
                      <div className="text-xs text-ink2-muted">
                        Audit Zone
                      </div>
                    </div>
                  </div>

                  <div>
                    <div className="text-xs font-semibold uppercase tracking-wide text-ink2-muted lg:hidden">
                      Zone Code
                    </div>
                    <div className="mt-0.5 text-sm font-semibold text-ink2">
                      {zone.code || '—'}
                    </div>
                    {zone.description && (
                      <div className="mt-0.5 line-clamp-1 text-xs text-ink2-muted">
                        {zone.description}
                      </div>
                    )}
                  </div>

                  <div>
                    <div className="text-xs font-semibold uppercase tracking-wide text-ink2-muted lg:hidden">
                      Plant
                    </div>
                    <div className="mt-0.5 text-sm font-medium text-ink2">
                      {zone.plant?.name || '—'}
                    </div>
                    {zone.plant?.code && (
                      <div className="text-xs text-ink2-muted">
                        {zone.plant.code}
                      </div>
                    )}
                  </div>

                  <div>
                    <div className="text-xs font-semibold uppercase tracking-wide text-ink2-muted lg:hidden">
                      Zone Leader
                    </div>
                    {zone.zone_leader ? (
                      <div className="mt-1 flex items-center gap-2">
                        <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-brand-soft text-xs font-bold text-brand">
                          {zone.zone_leader.charAt(0).toUpperCase()}
                        </div>
                        <div className="min-w-0">
                          <div className="truncate text-sm font-semibold text-ink2">
                            {zone.zone_leader}
                          </div>
                        </div>
                      </div>
                    ) : (
                      <span className="text-sm font-medium text-danger">
                        Not assigned
                      </span>
                    )}
                  </div>

                  <div>
                    <button
                      type="button"
                      onClick={() => handleToggleStatus(zone)}
                      className={`inline-flex items-center gap-2 rounded-full px-3 py-1.5 text-xs font-semibold ${
                        zone.is_active
                          ? 'bg-success-soft text-success'
                          : 'bg-canvas text-ink2-muted'
                      }`}
                    >
                      <span className="h-1.5 w-1.5 rounded-full bg-current" />
                      {zone.is_active ? 'Active' : 'Inactive'}
                    </button>
                  </div>

                  <div className="flex items-center justify-end gap-1">
                    <button
                      type="button"
                      onClick={() => openEdit(zone)}
                      className="rounded-lg p-2 text-ink2-muted hover:bg-canvas hover:text-ink2"
                      title="Edit Zone"
                    >
                      <Edit3 className="h-4 w-4" />
                    </button>

                    <button
                      type="button"
                      onClick={() => handleDelete(zone)}
                      className="rounded-lg p-2 text-ink2-muted hover:bg-red-50 hover:text-danger"
                      title="Delete Zone"
                    >
                      <MoreHorizontal className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {showForm && (
        <div className="fixed inset-0 z-[1000] flex items-center justify-center bg-black/35 p-4 backdrop-blur-sm">
          <div className="w-full max-w-lg overflow-hidden rounded-2xl border border-line bg-surface shadow-2xl">
            <div className="flex items-center justify-between border-b border-line px-6 py-5">
              <div>
                <h2 className="text-lg font-bold text-ink2">
                  {editingZone ? 'Edit Zone' : 'Add Zone'}
                </h2>
                <p className="mt-1 text-sm text-ink2-secondary">
                  Assign a Plant and responsible Zone Leader.
                </p>
              </div>

              <button
                type="button"
                onClick={closeForm}
                disabled={submitting}
                className="rounded-lg p-2 text-ink2-muted hover:bg-canvas"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit}>
              <div className="space-y-5 px-6 py-6">
                <div>
                  <label className="mb-2 block text-sm font-semibold text-ink2">
                    Zone Name *
                  </label>
                  <input
                    name="name"
                    value={form.name}
                    onChange={handleChange}
                    placeholder="e.g. Dispatch"
                    disabled={submitting}
                    autoFocus
                    className="w-full rounded-xl border border-line-strong bg-surface px-4 py-3 text-sm text-ink2 outline-none focus:border-brand focus:ring-4 focus:ring-brand-soft"
                  />
                </div>

                <div>
                  <label className="mb-2 block text-sm font-semibold text-ink2">
                    Zone Code
                  </label>
                  <input
                    name="code"
                    value={form.code}
                    onChange={handleChange}
                    placeholder="e.g. ZN-001"
                    disabled={submitting}
                    className="w-full rounded-xl border border-line-strong bg-surface px-4 py-3 text-sm text-ink2 outline-none focus:border-brand focus:ring-4 focus:ring-brand-soft"
                  />
                </div>

                <div>
                  <label className="mb-2 block text-sm font-semibold text-ink2">
                    Description
                  </label>
                  <textarea
                    name="description"
                    value={form.description}
                    onChange={handleChange}
                    placeholder="Brief description of this Zone"
                    rows={3}
                    disabled={submitting}
                    className="w-full resize-none rounded-xl border border-line-strong bg-surface px-4 py-3 text-sm text-ink2 outline-none focus:border-brand focus:ring-4 focus:ring-brand-soft"
                  />
                </div>

                <div>
                  <label className="mb-2 block text-sm font-semibold text-ink2">
                    Plant *
                  </label>
                  <select
                    name="plant_id"
                    value={form.plant_id}
                    onChange={handleChange}
                    disabled={submitting || loadingFormData}
                    className="w-full rounded-xl border border-line-strong bg-surface px-4 py-3 text-sm text-ink2 outline-none focus:border-brand focus:ring-4 focus:ring-brand-soft"
                  >
                    <option value="">Select Plant</option>
                    {plants.map((plant) => (
                      <option key={plant.id} value={plant.id}>
                        {plant.name}{plant.code ? ` (${plant.code})` : ''}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="mb-2 block text-sm font-semibold text-ink2">
                    Zone Leader *
                  </label>

                  <input
                    type="text"
                    name="zone_leader"
                    value={form.zone_leader}
                    onChange={handleChange}
                    disabled={submitting}
                    placeholder="Enter Zone Leader name"
                    maxLength={150}
                    className="w-full rounded-xl border border-line-strong bg-surface px-4 py-3 text-sm text-ink2 outline-none focus:border-brand focus:ring-4 focus:ring-brand-soft"
                  />

                  <p className="mt-1.5 text-xs text-ink2-muted">
                    Enter the Zone Leader's name only. No Employee ID or user account is required.
                  </p>
                </div>

                {error && (
                  <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm font-medium text-red-600">
                    {error}
                  </div>
                )}
              </div>

              <div className="flex justify-end gap-3 border-t border-line px-6 py-4">
                <button
                  type="button"
                  onClick={closeForm}
                  disabled={submitting}
                  className="rounded-lg border border-line-strong px-5 py-2.5 text-sm font-semibold text-ink2-secondary hover:bg-canvas"
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  disabled={submitting || loadingFormData}
                  className="inline-flex items-center gap-2 rounded-lg bg-brand px-5 py-2.5 text-sm font-semibold text-white hover:bg-brand-hover disabled:opacity-60"
                >
                  {submitting && (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  )}
                  {submitting
                    ? 'Saving...'
                    : editingZone
                      ? 'Save Changes'
                      : 'Create Zone'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <BulkZoneUploadModal
        open={showBulk}
        plants={plants}
        onClose={() => setShowBulk(false)}
        onUploaded={loadAll}
      />
    </div>
  )
}
