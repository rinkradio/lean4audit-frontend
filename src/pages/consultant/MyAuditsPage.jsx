import { useCallback, useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import AuditStatusBadge from '../../components/AuditStatusBadge'
import { fetchAudits } from '../../services/auditService'

const PAGE_SIZE = 10
const STATUS_TABS = [
  { value: '', label: 'All' },
  { value: 'IN_PROGRESS', label: 'In Progress' },
  { value: 'SUBMITTED', label: 'Submitted' },
  { value: 'DRAFT', label: 'Draft' },
]

function formatDate(value) {
  if (!value) return '—'
  return new Date(value).toLocaleDateString('en-GB', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  })
}

export default function MyAuditsPage() {
  const navigate = useNavigate()

  const [audits, setAudits] = useState([])
  const [total, setTotal] = useState(0)
  const [page, setPage] = useState(1)
  const [search, setSearch] = useState('')
  const [debouncedSearch, setDebouncedSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState('')
  const [isLoading, setIsLoading] = useState(true)
  const [loadError, setLoadError] = useState('')

  useEffect(() => {
    const timer = setTimeout(() => setDebouncedSearch(search), 350)
    return () => clearTimeout(timer)
  }, [search])

  useEffect(() => {
    setPage(1)
  }, [debouncedSearch, statusFilter])

  const loadAudits = useCallback(async () => {
    setIsLoading(true)
    setLoadError('')
    try {
      const data = await fetchAudits({
        search: debouncedSearch,
        status: statusFilter,
        page,
        pageSize: PAGE_SIZE,
      })
      setAudits(data.items)
      setTotal(data.total)
    } catch {
      setLoadError('Unable to load audits. Please try again.')
    } finally {
      setIsLoading(false)
    }
  }, [debouncedSearch, statusFilter, page])

  useEffect(() => {
    loadAudits()
  }, [loadAudits])

  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE))
  const hasFilters = Boolean(debouncedSearch || statusFilter)

  return (
    <div className="mx-auto max-w-7xl animate-fade-in">
      <div className="mb-6 flex flex-col gap-1">
        <h1 className="text-2xl font-bold text-ink2 sm:text-[1.75rem]">My Audits</h1>
        <p className="text-sm text-ink2-secondary">
          Audits you've started or completed. Only audits assigned to you are shown.
        </p>
      </div>

      <div className="mb-5 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
          <div className="relative">
            <svg
              className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-ink2-muted"
              viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"
            >
              <circle cx="11" cy="11" r="7" />
              <path d="m21 21-4.35-4.35" />
            </svg>
            <input
              type="text"
              className="w-full rounded-md border border-line-strong bg-surface py-2.5 pl-9 pr-3.5 text-sm text-ink2 outline-none transition-colors placeholder:text-ink2-muted focus:border-brand focus:ring-4 focus:ring-brand-soft sm:w-64"
              placeholder="Search by Audit ID or Zone…"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>

          <div className="flex flex-wrap gap-1.5 rounded-md bg-line/50 p-1">
            {STATUS_TABS.map((tab) => (
              <button
                key={tab.value || 'all'}
                className={`rounded px-3 py-1.5 text-xs font-semibold transition-colors ${
                  statusFilter === tab.value
                    ? 'bg-surface text-ink2 shadow-xs'
                    : 'text-ink2-secondary hover:text-ink2'
                }`}
                onClick={() => setStatusFilter(tab.value)}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        <button
          className="inline-flex items-center justify-center gap-1.5 rounded-md bg-brand px-4 py-2.5 text-sm font-semibold text-white shadow-xs transition-colors hover:bg-brand-hover"
          onClick={() => navigate('/consultant/audits/new')}
        >
          <span className="text-base leading-none">+</span> Start New Audit
        </button>
      </div>

      <div className="overflow-hidden rounded-xl border border-line bg-surface shadow-xs">
        {isLoading ? (
          <SkeletonTable />
        ) : loadError ? (
          <div className="flex flex-col items-center gap-3 px-6 py-16 text-center">
            <p className="text-sm text-ink2-secondary">{loadError}</p>
            <button
              className="rounded-md border border-line-strong px-4 py-2 text-sm font-semibold text-ink2 transition-colors hover:bg-canvas"
              onClick={loadAudits}
            >
              Retry
            </button>
          </div>
        ) : audits.length === 0 ? (
          <div className="flex flex-col items-center gap-2 px-6 py-16 text-center">
            {hasFilters ? (
              <p className="text-sm text-ink2-secondary">No audits match your search.</p>
            ) : (
              <>
                <h3 className="text-base font-semibold text-ink2">No audits yet</h3>
                <p className="max-w-sm text-sm text-ink2-secondary">
                  Start your first 5S audit to see it listed here.
                </p>
                <button
                  className="mt-3 inline-flex items-center gap-1.5 rounded-md bg-brand px-4 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-brand-hover"
                  onClick={() => navigate('/consultant/audits/new')}
                >
                  + Start New Audit
                </button>
              </>
            )}
          </div>
        ) : (
          <>
            {/* Desktop table */}
            <table className="hidden w-full text-left text-sm md:table">
              <thead>
                <tr className="border-b border-line bg-canvas/60 text-xs font-semibold uppercase tracking-wide text-ink2-muted">
                  <th className="px-5 py-3 font-semibold">Audit ID</th>
                  <th className="px-5 py-3 font-semibold">Zone</th>
                  <th className="px-5 py-3 font-semibold">Date</th>
                  <th className="px-5 py-3 font-semibold">Status</th>
                  <th className="px-5 py-3" aria-label="Actions" />
                </tr>
              </thead>
              <tbody>
                {audits.map((a) => (
                  <tr key={a.id} className="border-b border-line last:border-0 transition-colors hover:bg-canvas/50">
                    <td className="px-5 py-3.5">
                      <button
                        className="font-semibold text-brand transition-colors hover:text-brand-hover hover:underline"
                        onClick={() => navigate(`/consultant/audits/${a.id}`)}
                      >
                        {a.audit_number}
                      </button>
                    </td>
                    <td className="px-5 py-3.5 text-ink2">{a.zone.name}</td>
                    <td className="px-5 py-3.5 text-ink2-secondary">{formatDate(a.audit_date)}</td>
                    <td className="px-5 py-3.5">
                      <AuditStatusBadge status={a.status} />
                    </td>
                    <td className="px-5 py-3.5 text-right">
                      <button
                        className="text-sm font-semibold text-brand hover:underline"
                        onClick={() => navigate(`/consultant/audits/${a.id}`)}
                      >
                        Open
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            {/* Mobile cards */}
            <div className="divide-y divide-line md:hidden">
              {audits.map((a) => (
                <button
                  key={a.id}
                  className="flex w-full items-start justify-between gap-3 px-4 py-4 text-left"
                  onClick={() => navigate(`/consultant/audits/${a.id}`)}
                >
                  <div className="min-w-0">
                    <div className="text-sm font-semibold text-brand">{a.audit_number}</div>
                    <div className="mt-0.5 truncate text-sm text-ink2">{a.zone.name}</div>
                    <div className="mt-2 flex flex-wrap items-center gap-2">
                      <AuditStatusBadge status={a.status} />
                      <span className="text-xs text-ink2-muted">{formatDate(a.audit_date)}</span>
                    </div>
                  </div>
                </button>
              ))}
            </div>
          </>
        )}
      </div>

      {!isLoading && !loadError && audits.length > 0 && totalPages > 1 && (
        <div className="mt-4 flex items-center justify-center gap-3 text-sm">
          <button
            className="rounded-md border border-line-strong px-3.5 py-2 font-medium text-ink2-secondary transition-colors hover:bg-surface disabled:cursor-not-allowed disabled:opacity-50"
            disabled={page <= 1}
            onClick={() => setPage((p) => p - 1)}
          >
            Previous
          </button>
          <span className="text-ink2-secondary">
            Page {page} of {totalPages}
          </span>
          <button
            className="rounded-md border border-line-strong px-3.5 py-2 font-medium text-ink2-secondary transition-colors hover:bg-surface disabled:cursor-not-allowed disabled:opacity-50"
            disabled={page >= totalPages}
            onClick={() => setPage((p) => p + 1)}
          >
            Next
          </button>
        </div>
      )}
    </div>
  )
}

function SkeletonTable() {
  return (
    <div className="space-y-3 p-5">
      {Array.from({ length: 5 }).map((_, i) => (
        <div key={i} className="skeleton h-12 rounded-md" />
      ))}
    </div>
  )
}
