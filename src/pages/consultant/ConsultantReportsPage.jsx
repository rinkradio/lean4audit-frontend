import { useCallback, useEffect, useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'

import Pagination from '../../components/Pagination'
import { useToast } from '../../hooks/useToast'
import { fetchAudits } from '../../services/auditService'
import { fetchPlants } from '../../services/plantService'
import { fetchZones } from '../../services/zoneService'
import { exportAuditPdf } from '../../services/auditExportService'

const PAGE_SIZE = 10

function formatDate(value) {
  if (!value) return '—'
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return '—'
  return date.toLocaleDateString('en-GB', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  })
}

function statusMeta(status) {
  switch (status) {
    case 'SUBMITTED':
      return {
        label: 'Submitted',
        className: 'border-emerald-200 bg-emerald-50 text-emerald-700',
      }
    case 'IN_PROGRESS':
      return {
        label: 'In Progress',
        className: 'border-blue-200 bg-blue-50 text-blue-700',
      }
    case 'DRAFT':
      return {
        label: 'Draft',
        className: 'border-slate-200 bg-slate-50 text-slate-600',
      }
    default:
      return {
        label: status || 'Unknown',
        className: 'border-slate-200 bg-slate-50 text-slate-600',
      }
  }
}

function Metric({ label, value, note }) {
  return (
    <div className="rounded-xl border border-[#e3e8ed] bg-white p-4 sm:p-5">
      <p className="text-[11px] font-semibold uppercase tracking-[0.12em] text-[#7b8794]">
        {label}
      </p>
      <p className="mt-2 text-2xl font-bold tracking-tight text-[#17364d]">
        {value}
      </p>
      <p className="mt-1 text-xs text-[#8a96a3]">{note}</p>
    </div>
  )
}

export default function ConsultantReportsPage() {
  const navigate = useNavigate()
  const { showToast } = useToast()

  const [audits, setAudits] = useState([])
  const [zones, setZones] = useState([])
  const [plants, setPlants] = useState([])
  const [total, setTotal] = useState(0)
  const [page, setPage] = useState(1)
  const [search, setSearch] = useState('')
  const [debouncedSearch, setDebouncedSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState('')
  const [isLoading, setIsLoading] = useState(true)
  const [loadError, setLoadError] = useState('')
  const [exportingId, setExportingId] = useState(null)

  useEffect(() => {
    const timer = window.setTimeout(() => {
      setDebouncedSearch(search.trim())
    }, 350)

    return () => window.clearTimeout(timer)
  }, [search])

  useEffect(() => {
    setPage(1)
  }, [debouncedSearch, statusFilter])

  const loadReports = useCallback(async () => {
    setIsLoading(true)
    setLoadError('')

    try {
      // The API scopes this request according to the authenticated user's role.
      const [auditResult, zoneResult, plantResult] = await Promise.allSettled([
        fetchAudits({
          search: debouncedSearch,
          status: statusFilter,
          page,
          pageSize: PAGE_SIZE,
          sort: 'newest',
        }),
        fetchZones(),
        fetchPlants(true),
      ])

      if (auditResult.status === 'rejected') {
        throw auditResult.reason
      }

      const data = auditResult.value
      setAudits(Array.isArray(data?.items) ? data.items : [])
      setTotal(Number(data?.total || 0))

      // Audit list responses may contain only zone_id. Resolve the related
      // zone and plant from the existing lookup endpoints for display.
      if (zoneResult.status === 'fulfilled') {
        setZones(Array.isArray(zoneResult.value) ? zoneResult.value : [])
      }
      if (plantResult.status === 'fulfilled') {
        setPlants(Array.isArray(plantResult.value) ? plantResult.value : [])
      }
    } catch (error) {
      console.error('Unable to load consultant reports:', error?.response?.data || error)
      setAudits([])
      setTotal(0)
      setLoadError(
        error?.response?.data?.detail ||
          'Unable to load reports. Please try again.'
      )
    } finally {
      setIsLoading(false)
    }
  }, [debouncedSearch, statusFilter, page])

  useEffect(() => {
    loadReports()
  }, [loadReports])

  const pageStats = useMemo(() => ({
    submitted: audits.filter((audit) => audit.status === 'SUBMITTED').length,
    inProgress: audits.filter((audit) => audit.status === 'IN_PROGRESS').length,
    drafts: audits.filter((audit) => audit.status === 'DRAFT').length,
  }), [audits])

  const zoneMap = useMemo(
    () => new Map(zones.map((zone) => [String(zone.id), zone])),
    [zones]
  )

  const plantMap = useMemo(
    () => new Map(plants.map((plant) => [String(plant.id), plant])),
    [plants]
  )

  function getPlantAndZone(audit) {
    const zoneId = audit.zone_id ?? audit.zone?.id
    const resolvedZone = (zoneId != null ? zoneMap.get(String(zoneId)) : null) || audit.zone || null
    const plantId = resolvedZone?.plant_id ?? resolvedZone?.plant?.id ?? audit.plant_id ?? audit.plant?.id
    const resolvedPlant = (plantId != null ? plantMap.get(String(plantId)) : null) || resolvedZone?.plant || audit.plant || null

    return {
      plantName: resolvedPlant?.name || audit.plant_name || 'Plant not assigned',
      plantCode: resolvedPlant?.code || resolvedPlant?.plant_code || '',
      zoneName: resolvedZone?.name || audit.zone_name || 'Zone not assigned',
    }
  }

  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE))

  async function handleDownload(audit) {
    setExportingId(audit.id)
    try {
      await exportAuditPdf(audit.id)
      showToast('PDF report downloaded successfully.')
    } catch (error) {
      console.error('Unable to export audit PDF:', error?.response?.data || error)
      showToast(
        error?.response?.data?.detail ||
          'Unable to download this report. Please try again.',
        'error'
      )
    } finally {
      setExportingId(null)
    }
  }

  function clearFilters() {
    setSearch('')
    setStatusFilter('')
    setPage(1)
  }

  return (
    <div className="min-h-screen bg-[#f5f7f9]">
      <div className="mx-auto w-full max-w-[1440px] px-4 py-6 sm:px-7 sm:py-8 lg:px-9">
        <section className="mb-7 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <div className="mb-2 flex items-center gap-2">
              <span className="h-1.5 w-1.5 rounded-full bg-[#4386b5]" />
              <span className="text-[10px] font-bold uppercase tracking-[0.16em] text-[#667085]">
                Consultant Workspace
              </span>
            </div>
            <h1 className="text-2xl font-semibold tracking-tight text-[#102b43] sm:text-3xl">
              My Reports
            </h1>
            <p className="mt-2 max-w-2xl text-sm leading-6 text-[#667085]">
              Review your assigned audits and download their PDF reports.
            </p>
          </div>

          <button
            type="button"
            onClick={loadReports}
            disabled={isLoading}
            className="inline-flex h-10 items-center justify-center gap-2 rounded-lg border border-[#d7e0e7] bg-white px-4 text-sm font-semibold text-[#34495a] transition hover:bg-[#f8fafb] disabled:opacity-60"
          >
            <RefreshIcon />
            Refresh
          </button>
        </section>

        <section className="mb-6 grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-4">
          <Metric label="Matching audits" value={total} note="Based on current filters" />
          <Metric label="Submitted on this page" value={pageStats.submitted} note="Ready for report review" />
          <Metric label="In progress on this page" value={pageStats.inProgress} note="Audit work not yet submitted" />
          <Metric label="Drafts on this page" value={pageStats.drafts} note="Saved draft audits" />
        </section>

        <section className="overflow-hidden rounded-2xl border border-[#dfe5ea] bg-white shadow-[0_2px_8px_rgba(16,42,67,0.035)]">
          <div className="border-b border-[#eaecf0] p-4 sm:p-5">
            <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
              <div className="relative w-full lg:max-w-md">
                <SearchIcon />
                <input
                  type="search"
                  value={search}
                  onChange={(event) => setSearch(event.target.value)}
                  placeholder="Search audit number, plant or zone..."
                  className="h-11 w-full rounded-lg border border-[#dfe3e8] bg-[#f9fafb] pl-10 pr-3 text-sm text-[#101828] outline-none placeholder:text-[#98a2b3] focus:border-[#4386b5] focus:bg-white focus:ring-4 focus:ring-[#4386b5]/10"
                />
              </div>

              <div className="flex flex-wrap gap-1 rounded-lg border border-[#e4e7ec] bg-[#f8fafb] p-1">
                {[
                  { label: 'All', value: '' },
                  { label: 'Submitted', value: 'SUBMITTED' },
                  { label: 'In Progress', value: 'IN_PROGRESS' },
                  { label: 'Draft', value: 'DRAFT' },
                ].map((tab) => (
                  <button
                    key={tab.value || 'all'}
                    type="button"
                    onClick={() => setStatusFilter(tab.value)}
                    className={`rounded-md px-3 py-2 text-xs font-semibold transition ${
                      statusFilter === tab.value
                        ? 'bg-white text-[#102b43] shadow-sm'
                        : 'text-[#667085] hover:text-[#344054]'
                    }`}
                  >
                    {tab.label}
                  </button>
                ))}
              </div>
            </div>

            <div className="mt-3 flex flex-wrap items-center justify-between gap-2 text-xs text-[#667085]">
              <span>
                {total === 0
                  ? 'No matching audits'
                  : `Showing ${(page - 1) * PAGE_SIZE + 1}–${Math.min(page * PAGE_SIZE, total)} of ${total} audits`}
              </span>
              {(search || statusFilter) && (
                <button
                  type="button"
                  onClick={clearFilters}
                  className="font-semibold text-[#35749a] hover:text-[#245a78]"
                >
                  Clear filters
                </button>
              )}
            </div>
          </div>

          {isLoading ? (
            <div className="space-y-3 p-5">
              {[1, 2, 3, 4].map((item) => (
                <div key={item} className="h-16 animate-pulse rounded-lg bg-[#f2f5f7]" />
              ))}
            </div>
          ) : loadError ? (
            <div className="p-10 text-center">
              <p className="text-sm font-semibold text-[#344054]">{loadError}</p>
              <button
                type="button"
                onClick={loadReports}
                className="mt-4 rounded-lg bg-[#102b43] px-4 py-2.5 text-sm font-semibold text-white hover:bg-[#163d5d]"
              >
                Try again
              </button>
            </div>
          ) : audits.length === 0 ? (
            <div className="px-5 py-14 text-center">
              <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-xl bg-[#eef4f7] text-[#52748a]">
                <ReportIcon />
              </div>
              <h2 className="mt-4 text-sm font-semibold text-[#344054]">
                No reports found
              </h2>
              <p className="mx-auto mt-1 max-w-md text-xs leading-5 text-[#667085]">
                Reports will appear here when audits are available in your consultant account.
              </p>
              {(search || statusFilter) && (
                <button
                  type="button"
                  onClick={clearFilters}
                  className="mt-4 text-xs font-semibold text-[#35749a]"
                >
                  Clear filters
                </button>
              )}
            </div>
          ) : (
            <>
              <div className="hidden overflow-x-auto md:block">
                <table className="w-full min-w-[850px] text-left">
                  <thead className="bg-[#f8fafb]">
                    <tr className="border-y border-[#eaecf0]">
                      {['Audit', 'Plant / Zone', 'Audit date', 'Observations', 'Status', 'Actions'].map((heading) => (
                        <th
                          key={heading}
                          className="px-5 py-3 text-[10px] font-bold uppercase tracking-[0.1em] text-[#667085]"
                        >
                          {heading}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#eef1f4]">
                    {audits.map((audit) => {
                      const meta = statusMeta(audit.status)
                      const { plantName, plantCode, zoneName } =
                        getPlantAndZone(audit)
                      const observationCount =
                        Number(audit.total_observations ?? audit.observation_count ?? 0)

                      return (
                        <tr key={audit.id} className="transition hover:bg-[#fbfcfd]">
                          <td className="px-5 py-4">
                            <div className="text-sm font-semibold text-[#23445a]">
                              {audit.audit_number || `Audit ${String(audit.id).slice(0, 8)}`}
                            </div>
                            <div className="mt-1 text-[11px] text-[#8a96a3]">
                              {audit.hod ? `HOD: ${audit.hod}` : 'Audit report'}
                            </div>
                          </td>
                          <td className="px-5 py-4">
                            <div className="text-xs font-semibold text-[#34495e]">{plantName}</div>
                            <div className="mt-1 text-[11px] text-[#8a96a3]">
                              {plantCode ? `Code: ${plantCode} · ` : ''}Zone: {zoneName}
                            </div>
                          </td>
                          <td className="px-5 py-4 text-xs text-[#475467]">
                            {formatDate(audit.audit_date)}
                          </td>
                          <td className="px-5 py-4 text-xs font-semibold text-[#475467]">
                            {observationCount}
                          </td>
                          <td className="px-5 py-4">
                            <span className={`inline-flex rounded-full border px-2.5 py-1 text-[10px] font-semibold ${meta.className}`}>
                              {meta.label}
                            </span>
                          </td>
                          <td className="px-5 py-4">
                            <div className="flex items-center gap-2">
                              <button
                                type="button"
                                onClick={() => navigate(`/consultant/audits/${audit.id}`)}
                                className="rounded-md border border-[#d7e0e7] px-3 py-2 text-[11px] font-semibold text-[#475467] hover:bg-[#f8fafb]"
                              >
                                View
                              </button>
                              <button
                                type="button"
                                onClick={() => handleDownload(audit)}
                                disabled={exportingId === audit.id}
                                className="inline-flex items-center gap-1.5 rounded-md bg-[#315f79] px-3 py-2 text-[11px] font-semibold text-white hover:bg-[#274f66] disabled:cursor-not-allowed disabled:opacity-60"
                              >
                                <DownloadIcon />
                                {exportingId === audit.id ? 'Preparing…' : 'PDF'}
                              </button>
                            </div>
                          </td>
                        </tr>
                      )
                    })}
                  </tbody>
                </table>
              </div>

              <div className="divide-y divide-[#eef1f4] md:hidden">
                {audits.map((audit) => {
                  const meta = statusMeta(audit.status)
                  const { plantName, plantCode, zoneName } =
                    getPlantAndZone(audit)

                  return (
                    <article key={audit.id} className="p-4">
                      <div className="flex items-start justify-between gap-3">
                        <div className="min-w-0">
                          <p className="truncate text-sm font-bold text-[#23445a]">
                            {audit.audit_number || `Audit ${String(audit.id).slice(0, 8)}`}
                          </p>
                          <p className="mt-1 text-xs font-medium text-[#475467]">
                            {plantName}
                          </p>
                          <p className="mt-1 text-[11px] text-[#8a96a3]">
                            {plantCode ? `Code: ${plantCode} · ` : ''}Zone: {zoneName}
                          </p>
                          <p className="mt-1 text-[11px] text-[#8a96a3]">
                            {formatDate(audit.audit_date)} · {Number(audit.total_observations ?? audit.observation_count ?? 0)} observations
                          </p>
                        </div>
                        <span className={`shrink-0 rounded-full border px-2 py-1 text-[10px] font-semibold ${meta.className}`}>
                          {meta.label}
                        </span>
                      </div>
                      <div className="mt-4 flex gap-2">
                        <button
                          type="button"
                          onClick={() => navigate(`/consultant/audits/${audit.id}`)}
                          className="flex-1 rounded-lg border border-[#d7e0e7] px-3 py-2.5 text-xs font-semibold text-[#475467]"
                        >
                          View Audit
                        </button>
                        <button
                          type="button"
                          onClick={() => handleDownload(audit)}
                          disabled={exportingId === audit.id}
                          className="flex-1 rounded-lg bg-[#315f79] px-3 py-2.5 text-xs font-semibold text-white disabled:opacity-60"
                        >
                          {exportingId === audit.id ? 'Preparing…' : 'Download PDF'}
                        </button>
                      </div>
                    </article>
                  )
                })}
              </div>

              {totalPages > 1 && (
                <div className="border-t border-[#eaecf0] px-4 py-4 sm:px-5">
                  <Pagination
                    page={page}
                    pageSize={PAGE_SIZE}
                    total={total}
                    onPageChange={setPage}
                  />
                </div>
              )}
            </>
          )}
        </section>

        <p className="mt-4 text-[11px] leading-5 text-[#8998a1]">
          Report access follows the audits returned for your authenticated consultant account. PDF files are generated by the existing audit export endpoint.
        </p>
      </div>
    </div>
  )
}

function SearchIcon() {
  return (
    <svg
      className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-[#98a2b3]"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <circle cx="11" cy="11" r="7" />
      <path d="m20 20-4-4" />
    </svg>
  )
}

function RefreshIcon() {
  return (
    <svg
      className="h-4 w-4"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d="M20 11a8 8 0 0 0-15-4" />
      <path d="M5 3v4h4" />
      <path d="M4 13a8 8 0 0 0 15 4" />
      <path d="M19 21v-4h-4" />
    </svg>
  )
}

function ReportIcon() {
  return (
    <svg
      className="h-6 w-6"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.7"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d="M4 19.5V4.5" />
      <path d="M4 19.5h16" />
      <rect x="7" y="11" width="2.8" height="5.5" rx=".5" />
      <rect x="11.2" y="7.5" width="2.8" height="9" rx=".5" />
      <rect x="15.4" y="4.5" width="2.8" height="12" rx=".5" />
    </svg>
  )
}

function DownloadIcon() {
  return (
    <svg
      className="h-3.5 w-3.5"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d="M12 4v11" />
      <path d="m7 11 5 5 5-5" />
      <path d="M5 20h14" />
    </svg>
  )
}
