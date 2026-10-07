import { useCallback, useEffect, useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'

import { fetchPlants } from '../../services/plantService'
import { fetchZones } from '../../services/zoneService'
import { fetchAudits } from '../../services/auditService'
import apiClient from '../../services/apiClient'

const STATUS_META = {
  SUBMITTED: {
    label: 'Submitted',
    className: 'bg-success-soft text-success',
  },
  IN_PROGRESS: {
    label: 'In Progress',
    className: 'bg-warning-soft text-warning',
  },
  DRAFT: {
    label: 'Draft',
    className: 'bg-ink2-muted/15 text-ink2-secondary',
  },
}

const SEVERITY_META = {
  HIGH: {
    label: 'High',
    className: 'bg-danger-soft text-danger',
  },
  MEDIUM: {
    label: 'Medium',
    className: 'bg-warning-soft text-warning',
  },
  LOW: {
    label: 'Low',
    className: 'bg-ink2-muted/15 text-ink2-secondary',
  },
}

function formatDate(value) {
  if (!value) return '—'

  return new Date(value).toLocaleDateString('en-GB', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  })
}

function StatusBadge({ status }) {
  const meta =
    STATUS_META[status] || {
      label: status || 'Unknown',
      className: 'bg-ink2-muted/15 text-ink2-secondary',
    }

  return (
    <span
      className={`inline-flex items-center rounded-full px-2.5 py-1 text-xs font-semibold ${meta.className}`}
    >
      {meta.label}
    </span>
  )
}

function MetricCard({
  title,
  value,
  subtitle,
  icon,
  onClick,
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="group rounded-2xl border border-line bg-surface p-4 text-left shadow-xs transition-all hover:-translate-y-0.5 hover:border-brand/30 hover:shadow-sm sm:p-5"
    >
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-xs font-semibold uppercase tracking-wide text-ink2-muted">
            {title}
          </p>

          <p className="mt-2 text-2xl font-bold text-ink2 sm:text-3xl">
            {value}
          </p>

          <p className="mt-1 text-xs text-ink2-secondary">
            {subtitle}
          </p>
        </div>

        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-brand-soft text-brand">
          {icon}
        </div>
      </div>
    </button>
  )
}

function SectionHeader({
  title,
  description,
}) {
  return (
    <div className="mb-5">
      <h2 className="text-base font-bold text-ink2 sm:text-lg">
        {title}
      </h2>

      {description && (
        <p className="mt-1 text-xs text-ink2-secondary sm:text-sm">
          {description}
        </p>
      )}
    </div>
  )
}

function EmptyState({ text }) {
  return (
    <div className="rounded-xl border border-dashed border-line-strong px-5 py-10 text-center">
      <p className="text-sm text-ink2-secondary">
        {text}
      </p>
    </div>
  )
}

export default function AdminReportsPage() {
  const navigate = useNavigate()

  const [plants, setPlants] = useState([])
  const [zones, setZones] = useState([])
  const [audits, setAudits] = useState([])

  const [selectedPlant, setSelectedPlant] = useState('')
  const [selectedZone, setSelectedZone] = useState('')
  const [selectedStatus, setSelectedStatus] = useState('')
  const [dateFrom, setDateFrom] = useState('')
  const [dateTo, setDateTo] = useState('')

  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [exporting, setExporting] = useState(null)

  const loadData = useCallback(async () => {
    setLoading(true)
    setError('')

    try {
      const [
        plantsData,
        zonesData,
        auditsData,
      ] = await Promise.all([
        fetchPlants(true),
        fetchZones(),
        fetchAudits({
          page: 1,
          pageSize: 100,
          sort: 'newest',
        }),
      ])

      setPlants(
        Array.isArray(plantsData)
          ? plantsData
          : []
      )

      setZones(
        Array.isArray(zonesData)
          ? zonesData
          : []
      )

      setAudits(
        auditsData?.items || []
      )
    } catch (err) {
      console.error(err)

      setError(
        err?.response?.data?.detail ||
          'Unable to load report data.'
      )
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    loadData()
  }, [loadData])

  const zoneMap = useMemo(() => {
    return Object.fromEntries(
      zones.map((zone) => [
        zone.id,
        zone,
      ])
    )
  }, [zones])

  const filteredZones = useMemo(() => {
    if (!selectedPlant) {
      return zones
    }

    return zones.filter(
      (zone) =>
        zone.plant_id === selectedPlant
    )
  }, [zones, selectedPlant])

  useEffect(() => {
    if (
      selectedZone &&
      !filteredZones.some(
        (zone) => zone.id === selectedZone
      )
    ) {
      setSelectedZone('')
    }
  }, [
    filteredZones,
    selectedZone,
  ])

  const filteredAudits = useMemo(() => {
    return audits.filter((audit) => {
      const zone =
        zoneMap[audit.zone_id] ||
        audit.zone

      const plantId =
        zone?.plant_id ||
        zone?.plant?.id ||
        ''

      const zoneId =
        audit.zone_id ||
        audit.zone?.id ||
        ''

      if (
        selectedPlant &&
        plantId !== selectedPlant
      ) {
        return false
      }

      if (
        selectedZone &&
        zoneId !== selectedZone
      ) {
        return false
      }

      if (
        selectedStatus &&
        audit.status !== selectedStatus
      ) {
        return false
      }

      if (dateFrom) {
        const auditDate =
          audit.audit_date?.slice(0, 10)

        if (
          !auditDate ||
          auditDate < dateFrom
        ) {
          return false
        }
      }

      if (dateTo) {
        const auditDate =
          audit.audit_date?.slice(0, 10)

        if (
          !auditDate ||
          auditDate > dateTo
        ) {
          return false
        }
      }

      return true
    })
  }, [
    audits,
    zoneMap,
    selectedPlant,
    selectedZone,
    selectedStatus,
    dateFrom,
    dateTo,
  ])

  const metrics = useMemo(() => {
    const total = filteredAudits.length

    const submitted = filteredAudits.filter(
      (audit) =>
        audit.status === 'SUBMITTED'
    ).length

    const ongoing = filteredAudits.filter(
      (audit) =>
        audit.status === 'IN_PROGRESS'
    ).length

    const draft = filteredAudits.filter(
      (audit) =>
        audit.status === 'DRAFT'
    ).length

    const observations =
      filteredAudits.reduce(
        (sum, audit) =>
          sum +
          Number(
            audit.total_observations || 0
          ),
        0
      )

    const high =
      filteredAudits.reduce(
        (sum, audit) =>
          sum +
          Number(
            audit.high_observations || 0
          ),
        0
      )

    const medium =
      filteredAudits.reduce(
        (sum, audit) =>
          sum +
          Number(
            audit.medium_observations || 0
          ),
        0
      )

    const low =
      filteredAudits.reduce(
        (sum, audit) =>
          sum +
          Number(
            audit.low_observations || 0
          ),
        0
      )

    const closed =
      filteredAudits.reduce(
        (sum, audit) =>
          sum +
          Number(
            audit.closed_observations || 0
          ),
        0
      )

    const open =
      Math.max(
        0,
        observations - closed
      )

    return {
      total,
      submitted,
      ongoing,
      draft,
      observations,
      high,
      medium,
      low,
      open,
      closed,
    }
  }, [filteredAudits])

  const plantPerformance = useMemo(() => {
    return plants
      .map((plant) => {
        const plantAudits =
          filteredAudits.filter((audit) => {
            const zone =
              zoneMap[audit.zone_id] ||
              audit.zone

            return (
              zone?.plant_id === plant.id ||
              zone?.plant?.id === plant.id
            )
          })

        const submitted =
          plantAudits.filter(
            (audit) =>
              audit.status === 'SUBMITTED'
          )

        const totalObservations =
          plantAudits.reduce(
            (sum, audit) =>
              sum +
              Number(
                audit.total_observations || 0
              ),
            0
          )

        const highObservations =
          plantAudits.reduce(
            (sum, audit) =>
              sum +
              Number(
                audit.high_observations || 0
              ),
            0
          )

        const scores =
          submitted
            .map((audit) =>
              Number(
                audit.score ??
                  audit.total_score ??
                  audit.overall_score ??
                  0
              )
            )
            .filter(
              (score) =>
                Number.isFinite(score) &&
                score > 0
            )

        const score =
          scores.length > 0
            ? Math.round(
                scores.reduce(
                  (sum, value) =>
                    sum + value,
                  0
                ) / scores.length
              )
            : 0

        return {
          ...plant,
          auditCount:
            plantAudits.length,
          submittedCount:
            submitted.length,
          observationCount:
            totalObservations,
          highObservationCount:
            highObservations,
          score,
        }
      })
      .filter(
        (plant) =>
          plant.auditCount > 0
      )
      .sort(
        (a, b) =>
          b.auditCount -
          a.auditCount
      )
  }, [
    plants,
    filteredAudits,
    zoneMap,
  ])

  const severityTotal =
    metrics.high +
    metrics.medium +
    metrics.low

  const highPercent =
    severityTotal > 0
      ? Math.round(
          (metrics.high /
            severityTotal) *
            100
        )
      : 0

  const mediumPercent =
    severityTotal > 0
      ? Math.round(
          (metrics.medium /
            severityTotal) *
            100
        )
      : 0

  const lowPercent =
    severityTotal > 0
      ? Math.round(
          (metrics.low /
            severityTotal) *
            100
        )
      : 0

  async function exportAudit(
    auditId,
    type
  ) {
    const key =
      `${auditId}-${type}`

    try {
      setExporting(key)

      const response =
        await apiClient.get(
          `/audits/${auditId}/export/${type}`,
          {
            responseType: 'blob',
          }
        )

      const contentType =
        response.headers[
          'content-type'
        ] ||
        'application/octet-stream'

      const blob = new Blob(
        [response.data],
        {
          type: contentType,
        }
      )

      const url =
        window.URL.createObjectURL(
          blob
        )

      const link =
        document.createElement('a')

      link.href = url

      const extension =
        type === 'pdf'
          ? 'pdf'
          : 'xlsx'

      link.download =
        `${auditId}-audit-report.${extension}`

      document.body.appendChild(link)

      link.click()

      link.remove()

      window.URL.revokeObjectURL(
        url
      )
    } catch (err) {
      console.error(
        'Report export failed:',
        err
      )

      window.alert(
        `Unable to export ${type.toUpperCase()} report.`
      )
    } finally {
      setExporting(null)
    }
  }

  function clearFilters() {
    setSelectedPlant('')
    setSelectedZone('')
    setSelectedStatus('')
    setDateFrom('')
    setDateTo('')
  }

  if (loading) {
    return (
      <div className="mx-auto max-w-7xl animate-fade-in">
        <div className="mb-6">
          <div className="h-7 w-40 animate-pulse rounded bg-canvas" />
          <div className="mt-2 h-4 w-72 animate-pulse rounded bg-canvas" />
        </div>

        <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
          {Array.from({
            length: 8,
          }).map((_, index) => (
            <div
              key={index}
              className="h-32 animate-pulse rounded-2xl border border-line bg-surface"
            />
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="mx-auto max-w-7xl animate-fade-in pb-8">

      {/* HEADER */}
      <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-ink2 sm:text-[1.75rem]">
            Reports
          </h1>

          <p className="mt-1 max-w-2xl text-sm text-ink2-secondary">
            Analyze audit performance, plant performance,
            zone activity and observation trends.
          </p>
        </div>

        <button
          type="button"
          onClick={loadData}
          className="inline-flex min-h-10 items-center justify-center rounded-lg border border-line-strong bg-surface px-4 text-sm font-semibold text-ink2 transition-colors hover:bg-canvas"
        >
          Refresh Reports
        </button>
      </div>

      {/* ERROR */}
      {error && (
        <div className="mb-5 rounded-xl border border-danger/20 bg-danger-soft px-4 py-3 text-sm font-medium text-danger">
          {error}
        </div>
      )}

      {/* FILTERS */}
      <div className="mb-6 rounded-2xl border border-line bg-surface p-4 shadow-xs sm:p-5">
        <div className="mb-4 flex flex-col gap-1">
          <h2 className="text-sm font-bold text-ink2">
            Report Filters
          </h2>

          <p className="text-xs text-ink2-secondary">
            Filter all report metrics and analysis.
          </p>
        </div>

        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-5">

          <select
            value={selectedPlant}
            onChange={(event) =>
              setSelectedPlant(
                event.target.value
              )
            }
            className="min-h-11 rounded-lg border border-line-strong bg-surface px-3 text-sm text-ink2 outline-none focus:border-brand"
          >
            <option value="">
              All Plants
            </option>

            {plants.map((plant) => (
              <option
                key={plant.id}
                value={plant.id}
              >
                {plant.name}
              </option>
            ))}
          </select>

          <select
            value={selectedZone}
            onChange={(event) =>
              setSelectedZone(
                event.target.value
              )
            }
            className="min-h-11 rounded-lg border border-line-strong bg-surface px-3 text-sm text-ink2 outline-none focus:border-brand"
          >
            <option value="">
              All Zones
            </option>

            {filteredZones.map((zone) => (
              <option
                key={zone.id}
                value={zone.id}
              >
                {zone.name}
              </option>
            ))}
          </select>

          <select
            value={selectedStatus}
            onChange={(event) =>
              setSelectedStatus(
                event.target.value
              )
            }
            className="min-h-11 rounded-lg border border-line-strong bg-surface px-3 text-sm text-ink2 outline-none focus:border-brand"
          >
            <option value="">
              All Status
            </option>

            <option value="SUBMITTED">
              Submitted
            </option>

            <option value="IN_PROGRESS">
              In Progress
            </option>

            <option value="DRAFT">
              Draft
            </option>
          </select>

          <input
            type="date"
            value={dateFrom}
            onChange={(event) =>
              setDateFrom(
                event.target.value
              )
            }
            className="min-h-11 rounded-lg border border-line-strong bg-surface px-3 text-sm text-ink2 outline-none focus:border-brand"
          />

          <input
            type="date"
            value={dateTo}
            onChange={(event) =>
              setDateTo(
                event.target.value
              )
            }
            className="min-h-11 rounded-lg border border-line-strong bg-surface px-3 text-sm text-ink2 outline-none focus:border-brand"
          />
        </div>

        <div className="mt-3 flex flex-wrap items-center justify-between gap-3">
          <span className="text-xs text-ink2-muted">
            Showing{' '}
            <strong className="text-ink2">
              {filteredAudits.length}
            </strong>{' '}
            audits
          </span>

          <button
            type="button"
            onClick={clearFilters}
            className="text-xs font-semibold text-brand hover:underline"
          >
            Clear Filters
          </button>
        </div>
      </div>

      {/* KPI CARDS */}
      <div className="mb-6 grid grid-cols-2 gap-3 xl:grid-cols-4">

        <MetricCard
          title="Total Audits"
          value={metrics.total}
          subtitle="Matching selected filters"
          onClick={() =>
            navigate('/admin/audits')
          }
          icon={
            <svg
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.8"
            >
              <path d="M6 3h12v18H6z" />
              <path d="M9 7h6" />
              <path d="M9 11h6" />
              <path d="M9 15h4" />
            </svg>
          }
        />

        <MetricCard
          title="Submitted"
          value={metrics.submitted}
          subtitle="Completed audit reports"
          onClick={() =>
            navigate(
              '/admin/audits?status=SUBMITTED'
            )
          }
          icon={
            <svg
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.8"
            >
              <path d="M5 12l4 4L19 6" />
            </svg>
          }
        />

        <MetricCard
          title="Ongoing"
          value={metrics.ongoing}
          subtitle="Audits in progress"
          onClick={() =>
            navigate(
              '/admin/audits?status=IN_PROGRESS'
            )
          }
          icon={
            <svg
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.8"
            >
              <circle
                cx="12"
                cy="12"
                r="8"
              />
              <path d="M12 8v5l3 2" />
            </svg>
          }
        />

        <MetricCard
          title="Draft"
          value={metrics.draft}
          subtitle="Audits not submitted"
          onClick={() =>
            navigate(
              '/admin/audits?status=DRAFT'
            )
          }
          icon={
            <svg
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.8"
            >
              <path d="M4 20h16" />
              <path d="M6 16l9-9 3 3-9 9H6z" />
            </svg>
          }
        />

        <MetricCard
          title="Observations"
          value={metrics.observations}
          subtitle="Total findings"
          onClick={() =>
            navigate('/admin/audits')
          }
          icon={
            <svg
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.8"
            >
              <circle
                cx="12"
                cy="12"
                r="8"
              />
              <path d="M12 8v5" />
              <path d="M12 16h.01" />
            </svg>
          }
        />

        <MetricCard
          title="High Severity"
          value={metrics.high}
          subtitle="High priority findings"
          onClick={() =>
            navigate('/admin/audits')
          }
          icon={
            <svg
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.8"
            >
              <path d="M12 4l9 16H3L12 4z" />
              <path d="M12 9v5" />
              <path d="M12 17h.01" />
            </svg>
          }
        />

        <MetricCard
          title="Open"
          value={metrics.open}
          subtitle="Open observations"
          onClick={() =>
            navigate('/admin/audits')
          }
          icon={
            <svg
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.8"
            >
              <circle
                cx="12"
                cy="12"
                r="8"
              />
              <path d="M12 8v4" />
              <path d="M12 16h.01" />
            </svg>
          }
        />

        <MetricCard
          title="Closed"
          value={metrics.closed}
          subtitle="Closed observations"
          onClick={() =>
            navigate('/admin/audits')
          }
          icon={
            <svg
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.8"
            >
              <circle
                cx="12"
                cy="12"
                r="8"
              />
              <path d="M8 12l3 3 5-6" />
            </svg>
          }
        />
      </div>

      {/* ANALYSIS GRID */}
      <div className="grid gap-5 xl:grid-cols-2">

        {/* AUDIT STATUS */}
        <section className="rounded-2xl border border-line bg-surface p-5 shadow-xs">
          <SectionHeader
            title="Audit Status"
            description="Current distribution of audit workflow status."
          />

          <div className="grid gap-6 sm:grid-cols-[180px_1fr] sm:items-center">

            <div
              className="mx-auto flex h-40 w-40 items-center justify-center rounded-full"
              style={{
                background: `conic-gradient(
                  #2563eb 0 ${metrics.total ? (metrics.submitted / metrics.total) * 100 : 0}%,
                  #f59e0b ${metrics.total ? (metrics.submitted / metrics.total) * 100 : 0}% ${metrics.total ? ((metrics.submitted + metrics.ongoing) / metrics.total) * 100 : 0}%,
                  #cbd5e1 ${metrics.total ? ((metrics.submitted + metrics.ongoing) / metrics.total) * 100 : 0}% 100%
                )`,
              }}
            >
              <div className="flex h-24 w-24 flex-col items-center justify-center rounded-full bg-surface">
                <span className="text-2xl font-bold text-ink2">
                  {metrics.total}
                </span>

                <span className="text-[10px] font-semibold uppercase tracking-wide text-ink2-muted">
                  Audits
                </span>
              </div>
            </div>

            <div className="space-y-4">

              <div className="flex items-center justify-between gap-3">
                <div className="flex items-center gap-2">
                  <span className="h-2.5 w-2.5 rounded-full bg-brand" />
                  <span className="text-sm text-ink2">
                    Submitted
                  </span>
                </div>

                <strong className="text-sm text-ink2">
                  {metrics.submitted}
                </strong>
              </div>

              <div className="flex items-center justify-between gap-3">
                <div className="flex items-center gap-2">
                  <span className="h-2.5 w-2.5 rounded-full bg-warning" />
                  <span className="text-sm text-ink2">
                    In Progress
                  </span>
                </div>

                <strong className="text-sm text-ink2">
                  {metrics.ongoing}
                </strong>
              </div>

              <div className="flex items-center justify-between gap-3">
                <div className="flex items-center gap-2">
                  <span className="h-2.5 w-2.5 rounded-full bg-ink2-muted" />
                  <span className="text-sm text-ink2">
                    Draft
                  </span>
                </div>

                <strong className="text-sm text-ink2">
                  {metrics.draft}
                </strong>
              </div>

            </div>
          </div>
        </section>

        {/* OBSERVATION SEVERITY */}
        <section className="rounded-2xl border border-line bg-surface p-5 shadow-xs">
          <SectionHeader
            title="Observation Analysis"
            description="Severity distribution across the selected audits."
          />

          <div className="space-y-5">

            <div>
              <div className="mb-2 flex items-center justify-between text-sm">
                <span className="font-medium text-ink2">
                  High
                </span>

                <span className="font-bold text-danger">
                  {metrics.high}
                </span>
              </div>

              <div className="h-3 overflow-hidden rounded-full bg-canvas">
                <div
                  className="h-full rounded-full bg-danger transition-all"
                  style={{
                    width: `${highPercent}%`,
                  }}
                />
              </div>
            </div>

            <div>
              <div className="mb-2 flex items-center justify-between text-sm">
                <span className="font-medium text-ink2">
                  Medium
                </span>

                <span className="font-bold text-warning">
                  {metrics.medium}
                </span>
              </div>

              <div className="h-3 overflow-hidden rounded-full bg-canvas">
                <div
                  className="h-full rounded-full bg-warning transition-all"
                  style={{
                    width: `${mediumPercent}%`,
                  }}
                />
              </div>
            </div>

            <div>
              <div className="mb-2 flex items-center justify-between text-sm">
                <span className="font-medium text-ink2">
                  Low
                </span>

                <span className="font-bold text-ink2-secondary">
                  {metrics.low}
                </span>
              </div>

              <div className="h-3 overflow-hidden rounded-full bg-canvas">
                <div
                  className="h-full rounded-full bg-ink2-muted transition-all"
                  style={{
                    width: `${lowPercent}%`,
                  }}
                />
              </div>
            </div>

          </div>

          <div className="mt-6 grid grid-cols-2 gap-3">
            <div className="rounded-xl bg-canvas p-4">
              <p className="text-xs text-ink2-muted">
                Open
              </p>

              <p className="mt-1 text-xl font-bold text-ink2">
                {metrics.open}
              </p>
            </div>

            <div className="rounded-xl bg-canvas p-4">
              <p className="text-xs text-ink2-muted">
                Closed
              </p>

              <p className="mt-1 text-xl font-bold text-success">
                {metrics.closed}
              </p>
            </div>
          </div>
        </section>
      </div>

      {/* PLANT PERFORMANCE */}
      <section className="mt-5 rounded-2xl border border-line bg-surface p-5 shadow-xs">
        <SectionHeader
          title="Plant Performance"
          description="Audit activity and observation status by plant."
        />

        {plantPerformance.length === 0 ? (
          <EmptyState text="No plant performance data available for the selected filters." />
        ) : (
          <div className="space-y-3">
            {plantPerformance.map(
              (plant) => (
                <button
                  key={plant.id}
                  type="button"
                  onClick={() =>
                    navigate(
                      `/admin/zones?plant_id=${plant.id}`
                    )
                  }
                  className="w-full rounded-xl border border-line bg-canvas/40 p-4 text-left transition-colors hover:border-brand/30 hover:bg-canvas"
                >
                  <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">

                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="truncate text-sm font-bold text-ink2">
                          {plant.name}
                        </span>

                        {plant.code && (
                          <span className="rounded-md bg-surface px-2 py-0.5 text-[10px] font-semibold text-ink2-muted">
                            {plant.code}
                          </span>
                        )}
                      </div>

                      <p className="mt-1 text-xs text-ink2-secondary">
                        {plant.auditCount} audits ·{' '}
                        {plant.observationCount} observations ·{' '}
                        {plant.highObservationCount} high severity
                      </p>
                    </div>

                    <div className="w-full sm:w-56">
                      <div className="mb-1 flex items-center justify-between">
                        <span className="text-[11px] font-semibold text-ink2-muted">
                          Submitted
                        </span>

                        <span className="text-xs font-bold text-ink2">
                          {plant.submittedCount}
                        </span>
                      </div>

                      <div className="h-2 overflow-hidden rounded-full bg-canvas">
                        <div
                          className="h-full rounded-full bg-brand"
                          style={{
                            width: `${
                              plant.auditCount
                                ? Math.min(
                                    100,
                                    (plant.submittedCount /
                                      plant.auditCount) *
                                      100
                                  )
                                : 0
                            }%`,
                          }}
                        />
                      </div>
                    </div>

                  </div>
                </button>
              )
            )}
          </div>
        )}
      </section>

      {/* RECENT AUDITS */}
      <section className="mt-5 rounded-2xl border border-line bg-surface p-5 shadow-xs">
        <div className="mb-5 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
          <SectionHeader
            title="Recent Audit Reports"
            description="Open an audit to view its complete report and observations."
          />

          <button
            type="button"
            onClick={() =>
              navigate('/admin/audits')
            }
            className="text-sm font-semibold text-brand hover:underline"
          >
            View All Audits →
          </button>
        </div>

        {filteredAudits.length === 0 ? (
          <EmptyState text="No audits match the selected filters." />
        ) : (
          <div className="space-y-3">
            {filteredAudits
              .slice(0, 8)
              .map((audit) => {
                const zone =
                  zoneMap[audit.zone_id] ||
                  audit.zone

                const plant =
                  zone?.plant ||
                  plants.find(
                    (item) =>
                      item.id ===
                      zone?.plant_id
                  )

                return (
                  <div
                    key={audit.id}
                    className="rounded-xl border border-line p-4 transition-colors hover:bg-canvas/50"
                  >
                    <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">

                      <button
                        type="button"
                        onClick={() =>
                          navigate(
                            `/admin/audits/${audit.id}`
                          )
                        }
                        className="min-w-0 text-left"
                      >
                        <div className="flex flex-wrap items-center gap-2">
                          <span className="text-sm font-bold text-brand">
                            {audit.audit_number}
                          </span>

                          <StatusBadge
                            status={
                              audit.status
                            }
                          />
                        </div>

                        <p className="mt-1 text-sm font-medium text-ink2">
                          {plant?.name ||
                            'Plant not assigned'}
                          {' · '}
                          {zone?.name ||
                            'Zone not assigned'}
                        </p>

                        <p className="mt-1 text-xs text-ink2-muted">
                          Audit Date:{' '}
                          {formatDate(
                            audit.audit_date
                          )}
                          {' · '}
                          {audit.total_observations ||
                            0}{' '}
                          observations
                        </p>
                      </button>

                      <div className="flex flex-wrap items-center gap-2">

                        {['HIGH', 'MEDIUM', 'LOW'].map(
                          (severity) => {
                            const count =
                              Number(
                                audit[
                                  `${severity.toLowerCase()}_observations`
                                ] || 0
                              )

                            if (!count) {
                              return null
                            }

                            return (
                              <span
                                key={severity}
                                className={`rounded-full px-2.5 py-1 text-[11px] font-semibold ${SEVERITY_META[severity].className}`}
                              >
                                {SEVERITY_META[severity].label}:{' '}
                                {count}
                              </span>
                            )
                          }
                        )}

                        <button
                          type="button"
                          onClick={() =>
                            navigate(
                              `/admin/audits/${audit.id}`
                            )
                          }
                          className="rounded-lg border border-line-strong px-3 py-2 text-xs font-semibold text-ink2 hover:bg-canvas"
                        >
                          View
                        </button>

                        <button
                          type="button"
                          disabled={
                            exporting ===
                            `${audit.id}-excel`
                          }
                          onClick={() =>
                            exportAudit(
                              audit.id,
                              'excel'
                            )
                          }
                          className="rounded-lg border border-line-strong px-3 py-2 text-xs font-semibold text-ink2 hover:bg-canvas disabled:cursor-not-allowed disabled:opacity-50"
                        >
                          {exporting ===
                          `${audit.id}-excel`
                            ? 'Exporting...'
                            : 'Excel'}
                        </button>

                        <button
                          type="button"
                          disabled={
                            exporting ===
                            `${audit.id}-pdf`
                          }
                          onClick={() =>
                            exportAudit(
                              audit.id,
                              'pdf'
                            )
                          }
                          className="rounded-lg bg-brand px-3 py-2 text-xs font-semibold text-white hover:bg-brand/90 disabled:cursor-not-allowed disabled:opacity-50"
                        >
                          {exporting ===
                          `${audit.id}-pdf`
                            ? 'Exporting...'
                            : 'PDF'}
                        </button>

                      </div>
                    </div>
                  </div>
                )
              })}
          </div>
        )}
      </section>

      {/* QUICK ACCESS */}
      <section className="mt-5 grid gap-3 sm:grid-cols-3">

        <button
          type="button"
          onClick={() =>
            navigate('/admin/plants')
          }
          className="rounded-2xl border border-line bg-surface p-5 text-left shadow-xs transition-all hover:-translate-y-0.5 hover:border-brand/30"
        >
          <p className="text-sm font-bold text-ink2">
            Plant Management
          </p>

          <p className="mt-1 text-xs text-ink2-secondary">
            View and manage all plants.
          </p>

          <span className="mt-4 inline-block text-xs font-bold text-brand">
            Open Plants →
          </span>
        </button>

        <button
          type="button"
          onClick={() =>
            navigate('/admin/zones')
          }
          className="rounded-2xl border border-line bg-surface p-5 text-left shadow-xs transition-all hover:-translate-y-0.5 hover:border-brand/30"
        >
          <p className="text-sm font-bold text-ink2">
            Zone Management
          </p>

          <p className="mt-1 text-xs text-ink2-secondary">
            Explore plant-wise zones.
          </p>

          <span className="mt-4 inline-block text-xs font-bold text-brand">
            Open Zones →
          </span>
        </button>

        <button
          type="button"
          onClick={() =>
            navigate('/admin/audits')
          }
          className="rounded-2xl border border-line bg-surface p-5 text-left shadow-xs transition-all hover:-translate-y-0.5 hover:border-brand/30"
        >
          <p className="text-sm font-bold text-ink2">
            Audit Management
          </p>

          <p className="mt-1 text-xs text-ink2-secondary">
            Search and manage all audits.
          </p>

          <span className="mt-4 inline-block text-xs font-bold text-brand">
            Open Audits →
          </span>
        </button>

      </section>
    </div>
  )
}