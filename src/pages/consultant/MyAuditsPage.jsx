import { useCallback, useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'

import { fetchAudits } from '../../services/auditService'

const PAGE_SIZE = 10

const STATUS_TABS = [
  { value: '', label: 'All' },
  { value: 'IN_PROGRESS', label: 'In Progress' },
  { value: 'SUBMITTED', label: 'Submitted' },
  { value: 'DRAFT', label: 'Draft' },
]

/* ============================================================
   HELPERS
============================================================ */

function formatDate(value) {
  if (!value) return '—'

  const date = new Date(value)

  if (Number.isNaN(date.getTime())) {
    return '—'
  }

  return date.toLocaleDateString('en-GB', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  })
}

function getStatusMeta(status) {
  switch (status) {
    case 'IN_PROGRESS':
      return {
        label: 'In Progress',
        dot: 'bg-[#4386b5]',
        text: 'text-[#175cd3]',
        bg: 'bg-[#edf5fa]',
        border: 'border-[#cfe0ea]',
      }

    case 'SUBMITTED':
      return {
        label: 'Submitted',
        dot: 'bg-[#12b76a]',
        text: 'text-[#027a48]',
        bg: 'bg-[#ecfdf3]',
        border: 'border-[#abefc6]',
      }

    case 'DRAFT':
      return {
        label: 'Draft',
        dot: 'bg-[#98a2b3]',
        text: 'text-[#475467]',
        bg: 'bg-[#f2f4f7]',
        border: 'border-[#d0d5dd]',
      }

    default:
      return {
        label: status || 'Unknown',
        dot: 'bg-[#98a2b3]',
        text: 'text-[#475467]',
        bg: 'bg-[#f2f4f7]',
        border: 'border-[#d0d5dd]',
      }
  }
}

function StatusPill({ status }) {
  const meta = getStatusMeta(status)

  return (
    <span
      className={`inline-flex items-center gap-2 rounded-full border px-2.5 py-1 text-[11px] font-semibold ${meta.bg} ${meta.border} ${meta.text}`}
    >
      <span
        className={`h-1.5 w-1.5 rounded-full ${meta.dot}`}
      />

      {meta.label}
    </span>
  )
}

/* ============================================================
   PAGINATION
============================================================ */

function getPaginationPages(currentPage, totalPages) {
  if (totalPages <= 7) {
    return Array.from(
      { length: totalPages },
      (_, index) => index + 1
    )
  }

  if (currentPage <= 4) {
    return [
      1,
      2,
      3,
      4,
      5,
      '...',
      totalPages,
    ]
  }

  if (currentPage >= totalPages - 3) {
    return [
      1,
      '...',
      totalPages - 4,
      totalPages - 3,
      totalPages - 2,
      totalPages - 1,
      totalPages,
    ]
  }

  return [
    1,
    '...',
    currentPage - 1,
    currentPage,
    currentPage + 1,
    '...',
    totalPages,
  ]
}

/* ============================================================
   PAGE
============================================================ */

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

  /* ==========================================================
     SEARCH DEBOUNCE
  ========================================================== */

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(search)
    }, 350)

    return () => clearTimeout(timer)
  }, [search])

  /* ==========================================================
     RESET PAGE WHEN FILTER CHANGES
  ========================================================== */

  useEffect(() => {
    setPage(1)
  }, [debouncedSearch, statusFilter])

  /* ==========================================================
     LOAD AUDITS
  ========================================================== */

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

      setAudits(data?.items || [])
      setTotal(Number(data?.total || 0))
    } catch (error) {
      console.error(
        'Unable to load consultant audits:',
        error
      )

      setAudits([])
      setTotal(0)
      setLoadError(
        'Unable to load audits. Please try again.'
      )
    } finally {
      setIsLoading(false)
    }
  }, [
    debouncedSearch,
    statusFilter,
    page,
  ])

  useEffect(() => {
    loadAudits()
  }, [loadAudits])

  /* ==========================================================
     PAGINATION
  ========================================================== */

  const totalPages = Math.max(
    1,
    Math.ceil(total / PAGE_SIZE)
  )

  const hasFilters = Boolean(
    debouncedSearch || statusFilter
  )

  const firstItem =
    total === 0
      ? 0
      : (page - 1) * PAGE_SIZE + 1

  const lastItem =
    total === 0
      ? 0
      : Math.min(page * PAGE_SIZE, total)

  const paginationPages = getPaginationPages(
    page,
    totalPages
  )

  const handlePageChange = (nextPage) => {
    if (
      nextPage < 1 ||
      nextPage > totalPages ||
      nextPage === page
    ) {
      return
    }

    setPage(nextPage)

    window.scrollTo({
      top: 0,
      behavior: 'smooth',
    })
  }

  const clearFilters = () => {
    setSearch('')
    setStatusFilter('')
    setPage(1)
  }

  /* ==========================================================
     OPEN AUDIT
  ========================================================== */

  const openAudit = (auditId) => {
    navigate(`/consultant/audits/${auditId}`)
  }

  /* ==========================================================
     RENDER
  ========================================================== */

  return (
    <div className="min-h-full bg-[#f5f7f9]">
      <div className="mx-auto w-full max-w-[1440px] px-5 py-6 sm:px-7 sm:py-7 lg:px-9 lg:py-8 xl:px-10 2xl:px-12">

        {/* ====================================================
            PAGE HEADER
        ===================================================== */}

        <section className="mb-7">
          <div className="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">

            <div>
              <div className="mb-2 flex items-center gap-2">
                <span className="h-1.5 w-1.5 rounded-full bg-[#4386b5]" />

                <span className="text-[11px] font-bold uppercase tracking-[0.16em] text-[#667085]">
                  Consultant Workspace
                </span>
              </div>

              <h1 className="text-[27px] font-semibold tracking-[-0.025em] text-[#102b43] sm:text-[30px]">
                My Audits
              </h1>

              <p className="mt-2 max-w-2xl text-sm leading-6 text-[#667085]">
                View, continue, and review audits assigned
                to you.
              </p>
            </div>

            <button
              type="button"
              onClick={() =>
                navigate('/consultant/audits/new')
              }
              className="inline-flex h-11 items-center justify-center gap-2 rounded-lg bg-[#102b43] px-5 text-sm font-semibold text-white shadow-[0_2px_5px_rgba(16,42,67,0.15)] transition-all hover:bg-[#163d5d] focus:outline-none focus:ring-4 focus:ring-[#4386b5]/15"
            >
              <PlusIcon />
              Start New Audit
            </button>
          </div>
        </section>

        {/* ====================================================
            MAIN CONTENT
        ===================================================== */}

        <section className="overflow-hidden rounded-2xl border border-[#dfe3e8] bg-white shadow-[0_2px_8px_rgba(16,42,67,0.035)]">

          {/* ==================================================
              TOOLBAR
          =================================================== */}

          <div className="border-b border-[#eaecf0] px-5 py-5 sm:px-6 lg:px-7">

            <div className="flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">

              {/* SEARCH */}

              <div className="relative w-full xl:max-w-[380px]">
                <SearchIcon />

                <input
                  type="text"
                  value={search}
                  onChange={(event) =>
                    setSearch(event.target.value)
                  }
                  placeholder="Search audit ID or zone..."
                  className="h-11 w-full rounded-lg border border-[#dfe3e8] bg-[#f9fafb] pl-10 pr-10 text-sm text-[#101828] outline-none transition-all placeholder:text-[#98a2b3] hover:border-[#c7d0d9] focus:border-[#4386b5] focus:bg-white focus:ring-4 focus:ring-[#4386b5]/10"
                />

                {search && (
                  <button
                    type="button"
                    onClick={() => setSearch('')}
                    className="absolute right-3 top-1/2 flex h-6 w-6 -translate-y-1/2 items-center justify-center rounded-md text-[#98a2b3] hover:bg-[#eaecf0] hover:text-[#475467]"
                    aria-label="Clear search"
                  >
                    <CloseIcon />
                  </button>
                )}
              </div>

              {/* STATUS FILTERS */}

              <div className="flex w-full flex-wrap items-center gap-1 rounded-lg border border-[#e4e7ec] bg-[#f8fafb] p-1 xl:w-auto">
                {STATUS_TABS.map((tab) => {
                  const active =
                    statusFilter === tab.value

                  return (
                    <button
                      key={tab.value || 'all'}
                      type="button"
                      onClick={() =>
                        setStatusFilter(tab.value)
                      }
                      className={`rounded-md px-3.5 py-2 text-xs font-semibold transition-all ${
                        active
                          ? 'bg-white text-[#102b43] shadow-[0_1px_3px_rgba(16,24,40,0.10)]'
                          : 'text-[#667085] hover:text-[#344054]'
                      }`}
                    >
                      {tab.label}
                    </button>
                  )
                })}
              </div>
            </div>

            {/* FILTER INFORMATION */}

            <div className="mt-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">

              <div className="flex items-center gap-2 text-xs text-[#667085]">
                <FilterIcon />

                <span>
                  {hasFilters
                    ? 'Showing filtered audit results'
                    : 'Showing all audits assigned to you'}
                </span>

                {hasFilters && (
                  <>
                    <span className="text-[#d0d5dd]">
                      •
                    </span>

                    <button
                      type="button"
                      onClick={clearFilters}
                      className="font-semibold text-[#4386b5] hover:text-[#2f6f99]"
                    >
                      Clear filters
                    </button>
                  </>
                )}
              </div>

              {!isLoading && !loadError && (
                <div className="text-xs text-[#667085]">
                  {total === 0 ? (
                    '0 audits'
                  ) : (
                    <>
                      Showing{' '}
                      <span className="font-semibold text-[#344054]">
                        {firstItem}-{lastItem}
                      </span>{' '}
                      of{' '}
                      <span className="font-semibold text-[#344054]">
                        {total}
                      </span>{' '}
                      audits
                    </>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* ==================================================
              LOADING
          =================================================== */}

          {isLoading ? (
            <SkeletonTable />

          ) : loadError ? (
            <ErrorState
              message={loadError}
              onRetry={loadAudits}
            />

          ) : audits.length === 0 ? (
            <EmptyState
              hasFilters={hasFilters}
              onClear={clearFilters}
              onCreate={() =>
                navigate('/consultant/audits/new')
              }
            />

          ) : (
            <>
              {/* ================================================
                  DESKTOP TABLE
              ================================================= */}

              <div className="hidden md:block">
                <div className="overflow-x-auto">
                  <table className="w-full min-w-[760px] text-left">

                    <thead>
                      <tr className="border-b border-[#eaecf0] bg-[#f8fafb]">

                        <th className="px-6 py-3.5 text-[10px] font-bold uppercase tracking-[0.12em] text-[#667085]">
                          Audit
                        </th>

                        <th className="px-6 py-3.5 text-[10px] font-bold uppercase tracking-[0.12em] text-[#667085]">
                          Zone
                        </th>

                        <th className="px-6 py-3.5 text-[10px] font-bold uppercase tracking-[0.12em] text-[#667085]">
                          Audit Date
                        </th>

                        <th className="px-6 py-3.5 text-[10px] font-bold uppercase tracking-[0.12em] text-[#667085]">
                          Status
                        </th>

                        <th className="px-6 py-3.5 text-right text-[10px] font-bold uppercase tracking-[0.12em] text-[#667085]">
                          Action
                        </th>

                      </tr>
                    </thead>

                    <tbody>
                      {audits.map((audit) => (
                        <tr
                          key={audit.id}
                          className="group border-b border-[#eaecf0] last:border-0 transition-colors hover:bg-[#f9fbfc]"
                        >

                          {/* AUDIT */}

                          <td className="px-6 py-4">
                            <button
                              type="button"
                              onClick={() =>
                                openAudit(audit.id)
                              }
                              className="group/audit flex items-center gap-3 text-left"
                            >
                              <div className="flex h-9 w-9 flex-none items-center justify-center rounded-lg border border-[#dfe3e8] bg-[#f8fafb] text-[#4386b5] transition-colors group-hover/audit:border-[#c6d9e5] group-hover/audit:bg-[#edf5fa]">
                                <AuditIcon />
                              </div>

                              <div>
                                <div className="text-sm font-semibold text-[#102b43] transition-colors group-hover/audit:text-[#4386b5]">
                                  {audit.audit_number ||
                                    `Audit #${audit.id}`}
                                </div>

                                <div className="mt-0.5 text-[11px] text-[#98a2b3]">
                                  Audit #{audit.id}
                                </div>
                              </div>
                            </button>
                          </td>

                          {/* ZONE */}

                          <td className="px-6 py-4">
                            <div className="flex items-center gap-2">
                              <LocationIcon />

                              <span className="text-sm font-medium text-[#344054]">
                                {audit.zone?.name || '—'}
                              </span>
                            </div>
                          </td>

                          {/* DATE */}

                          <td className="px-6 py-4">
                            <div className="flex items-center gap-2 text-sm text-[#667085]">
                              <CalendarIcon />

                              {formatDate(
                                audit.audit_date
                              )}
                            </div>
                          </td>

                          {/* STATUS */}

                          <td className="px-6 py-4">
                            <StatusPill
                              status={audit.status}
                            />
                          </td>

                          {/* ACTION */}

                          <td className="px-6 py-4 text-right">
                            <button
                              type="button"
                              onClick={() =>
                                openAudit(audit.id)
                              }
                              className="inline-flex items-center gap-1.5 rounded-md px-3 py-2 text-xs font-semibold text-[#4386b5] transition-colors hover:bg-[#edf5fa] hover:text-[#2f6f99]"
                            >
                              Open

                              <ArrowRightIcon />
                            </button>
                          </td>

                        </tr>
                      ))}
                    </tbody>

                  </table>
                </div>
              </div>

              {/* ================================================
                  MOBILE AUDIT CARDS
              ================================================= */}

              <div className="divide-y divide-[#eaecf0] md:hidden">

                {audits.map((audit) => (
                  <button
                    key={audit.id}
                    type="button"
                    onClick={() =>
                      openAudit(audit.id)
                    }
                    className="flex w-full items-center gap-4 px-5 py-5 text-left transition-colors hover:bg-[#f9fbfc] active:bg-[#f2f6f8] focus:bg-[#f9fbfc] focus:outline-none"
                  >

                    {/* AUDIT ICON */}

                    <div className="flex h-10 w-10 flex-none items-center justify-center rounded-xl border border-[#dfe3e8] bg-[#f8fafb] text-[#4386b5]">
                      <AuditIcon />
                    </div>

                    {/* AUDIT INFORMATION */}

                    <div className="min-w-0 flex-1">

                      <div className="flex items-start gap-2">

                        <div className="min-w-0 flex-1">

                          <div className="truncate text-sm font-semibold text-[#102b43]">
                            {audit.audit_number ||
                              `Audit #${audit.id}`}
                          </div>

                          <div className="mt-1 truncate text-xs text-[#667085]">
                            {audit.zone?.name ||
                              'No zone assigned'}
                          </div>

                        </div>

                      </div>

                      <div className="mt-3 flex flex-wrap items-center gap-2">

                        <StatusPill
                          status={audit.status}
                        />

                        <span className="text-[11px] text-[#98a2b3]">
                          {formatDate(
                            audit.audit_date
                          )}
                        </span>

                      </div>
                    </div>

                    {/* SMALL ACTION ARROW */}

                    <div className="flex h-8 w-8 flex-none items-center justify-center rounded-lg border border-[#e4e7ec] bg-white text-[#98a2b3]">
                      <ArrowRightIcon />
                    </div>

                  </button>
                ))}

              </div>
            </>
          )}

          {/* ==================================================
              PAGINATION
          =================================================== */}

          {!isLoading &&
            !loadError &&
            audits.length > 0 &&
            totalPages > 1 && (
              <div className="border-t border-[#eaecf0] bg-[#fcfcfd] px-5 py-4 sm:px-6">

                <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">

                  {/* RESULT COUNT */}

                  <div className="text-xs text-[#667085]">
                    Showing{' '}

                    <span className="font-semibold text-[#344054]">
                      {firstItem}
                    </span>

                    <span className="px-1 text-[#98a2b3]">
                      –
                    </span>

                    <span className="font-semibold text-[#344054]">
                      {lastItem}
                    </span>

                    {' '}of{' '}

                    <span className="font-semibold text-[#344054]">
                      {total}
                    </span>{' '}
                    audits
                  </div>

                  {/* CONTROLS */}

                  <div className="flex items-center gap-1.5">

                    {/* PREVIOUS */}

                    <button
                      type="button"
                      disabled={page === 1}
                      onClick={() =>
                        handlePageChange(page - 1)
                      }
                      className="inline-flex h-9 items-center justify-center gap-1.5 rounded-lg border border-[#dfe3e8] bg-white px-3 text-xs font-semibold text-[#475467] transition-all hover:border-[#c7d0d9] hover:bg-[#f8fafb] disabled:cursor-not-allowed disabled:opacity-40"
                    >
                      <ChevronLeftIcon />

                      <span className="hidden sm:inline">
                        Previous
                      </span>
                    </button>

                    {/* DESKTOP PAGE NUMBERS */}

                    <div className="hidden items-center gap-1 sm:flex">

                      {paginationPages.map(
                        (item, index) => {

                          if (item === '...') {
                            return (
                              <span
                                key={`ellipsis-${index}`}
                                className="flex h-9 w-9 items-center justify-center text-xs text-[#98a2b3]"
                              >
                                ...
                              </span>
                            )
                          }

                          const active =
                            item === page

                          return (
                            <button
                              key={item}
                              type="button"
                              onClick={() =>
                                handlePageChange(
                                  item
                                )
                              }
                              className={`flex h-9 min-w-9 items-center justify-center rounded-lg border px-3 text-xs font-semibold transition-all ${
                                active
                                  ? 'border-[#102b43] bg-[#102b43] text-white shadow-sm'
                                  : 'border-[#dfe3e8] bg-white text-[#475467] hover:border-[#c7d0d9] hover:bg-[#f8fafb]'
                              }`}
                            >
                              {item}
                            </button>
                          )
                        }
                      )}

                    </div>

                    {/* MOBILE PAGE */}

                    <div className="flex h-9 min-w-[70px] items-center justify-center rounded-lg border border-[#dfe3e8] bg-white px-3 text-xs font-semibold text-[#344054] sm:hidden">
                      {page} / {totalPages}
                    </div>

                    {/* NEXT */}

                    <button
                      type="button"
                      disabled={
                        page === totalPages
                      }
                      onClick={() =>
                        handlePageChange(
                          page + 1
                        )
                      }
                      className="inline-flex h-9 items-center justify-center gap-1.5 rounded-lg border border-[#dfe3e8] bg-white px-3 text-xs font-semibold text-[#475467] transition-all hover:border-[#c7d0d9] hover:bg-[#f8fafb] disabled:cursor-not-allowed disabled:opacity-40"
                    >
                      <span className="hidden sm:inline">
                        Next
                      </span>

                      <ChevronRightIcon />
                    </button>

                  </div>
                </div>
              </div>
            )}
        </section>
      </div>
    </div>
  )
}

/* ============================================================
   LOADING
============================================================ */

function SkeletonTable() {
  return (
    <div>

      {/* DESKTOP */}

      <div className="hidden md:block">

        <div className="border-b border-[#eaecf0] bg-[#f8fafb] px-6 py-4">
          <div className="grid grid-cols-5 gap-6">

            <SkeletonBlock width="70px" />
            <SkeletonBlock width="55px" />
            <SkeletonBlock width="75px" />
            <SkeletonBlock width="60px" />

            <div className="flex justify-end">
              <SkeletonBlock width="55px" />
            </div>

          </div>
        </div>

        <div className="divide-y divide-[#eaecf0]">

          {Array.from({ length: 6 }).map(
            (_, index) => (
              <div
                key={index}
                className="grid grid-cols-5 items-center gap-6 px-6 py-5"
              >
                <SkeletonBlock width="140px" />
                <SkeletonBlock width="110px" />
                <SkeletonBlock width="100px" />
                <SkeletonBlock width="90px" />

                <div className="flex justify-end">
                  <SkeletonBlock width="50px" />
                </div>
              </div>
            )
          )}

        </div>
      </div>

      {/* MOBILE */}

      <div className="space-y-0 md:hidden">

        {Array.from({ length: 5 }).map(
          (_, index) => (
            <div
              key={index}
              className="flex items-center gap-4 border-b border-[#eaecf0] px-5 py-5"
            >
              <div className="h-10 w-10 flex-none animate-pulse rounded-xl bg-[#eaecf0]" />

              <div className="flex-1 space-y-2">
                <div className="h-4 w-32 animate-pulse rounded bg-[#eaecf0]" />

                <div className="h-3 w-24 animate-pulse rounded bg-[#f2f4f7]" />

                <div className="h-6 w-24 animate-pulse rounded-full bg-[#f2f4f7]" />
              </div>

              <div className="h-8 w-8 flex-none animate-pulse rounded-lg bg-[#f2f4f7]" />
            </div>
          )
        )}

      </div>
    </div>
  )
}

function SkeletonBlock({ width }) {
  return (
    <div
      className="h-4 animate-pulse rounded bg-[#eaecf0]"
      style={{ width }}
    />
  )
}

/* ============================================================
   ERROR
============================================================ */

function ErrorState({
  message,
  onRetry,
}) {
  return (
    <div className="flex flex-col items-center justify-center px-6 py-20 text-center">

      <div className="flex h-12 w-12 items-center justify-center rounded-xl border border-[#fecdca] bg-[#fef3f2] text-[#b42318]">
        <AlertIcon />
      </div>

      <h3 className="mt-4 text-sm font-semibold text-[#102b43]">
        Unable to load audits
      </h3>

      <p className="mt-1 max-w-sm text-sm text-[#667085]">
        {message}
      </p>

      <button
        type="button"
        onClick={onRetry}
        className="mt-5 inline-flex h-10 items-center gap-2 rounded-lg border border-[#dfe3e8] bg-white px-4 text-sm font-semibold text-[#344054] shadow-sm transition-colors hover:bg-[#f8fafb]"
      >
        <RefreshIcon />
        Retry
      </button>

    </div>
  )
}

/* ============================================================
   EMPTY STATE
============================================================ */

function EmptyState({
  hasFilters,
  onClear,
  onCreate,
}) {
  return (
    <div className="flex flex-col items-center justify-center px-6 py-20 text-center">

      <div className="flex h-14 w-14 items-center justify-center rounded-2xl border border-[#dfe3e8] bg-[#f8fafb] text-[#667085]">

        {hasFilters ? (
          <SearchIcon className="static h-5 w-5" />
        ) : (
          <AuditIcon />
        )}

      </div>

      {hasFilters ? (
        <>
          <h3 className="mt-4 text-sm font-semibold text-[#102b43]">
            No audits found
          </h3>

          <p className="mt-1 max-w-sm text-sm text-[#667085]">
            No audits match your current search or
            status filter.
          </p>

          <button
            type="button"
            onClick={onClear}
            className="mt-5 inline-flex h-10 items-center rounded-lg border border-[#dfe3e8] bg-white px-4 text-sm font-semibold text-[#344054] shadow-sm hover:bg-[#f8fafb]"
          >
            Clear filters
          </button>
        </>
      ) : (
        <>
          <h3 className="mt-4 text-base font-semibold text-[#102b43]">
            No audits yet
          </h3>

          <p className="mt-1 max-w-sm text-sm leading-6 text-[#667085]">
            Start your first audit to begin recording
            plant observations and findings.
          </p>

          <button
            type="button"
            onClick={onCreate}
            className="mt-5 inline-flex h-10 items-center gap-2 rounded-lg bg-[#102b43] px-4 text-sm font-semibold text-white shadow-sm hover:bg-[#163d5d]"
          >
            <PlusIcon />
            Start New Audit
          </button>
        </>
      )}

    </div>
  )
}

/* ============================================================
   ICONS
============================================================ */

function iconProps(
  className = 'h-4 w-4'
) {
  return {
    className,
    viewBox: '0 0 24 24',
    fill: 'none',
    stroke: 'currentColor',
    strokeWidth: 1.8,
    strokeLinecap: 'round',
    strokeLinejoin: 'round',
    'aria-hidden': true,
  }
}

/* ============================================================
   SEARCH
============================================================ */

function SearchIcon({
  className =
    'pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#98a2b3]',
}) {
  return (
    <svg {...iconProps(className)}>
      <circle
        cx="11"
        cy="11"
        r="7"
      />

      <path d="m20 20-4-4" />
    </svg>
  )
}

/* ============================================================
   CLOSE
============================================================ */

function CloseIcon() {
  return (
    <svg {...iconProps('h-3.5 w-3.5')}>
      <path d="m7 7 10 10" />
      <path d="m17 7-10 10" />
    </svg>
  )
}

/* ============================================================
   PLUS
============================================================ */

function PlusIcon() {
  return (
    <svg {...iconProps('h-4 w-4')}>
      <path d="M12 5v14" />
      <path d="M5 12h14" />
    </svg>
  )
}

/* ============================================================
   FILTER
============================================================ */

function FilterIcon() {
  return (
    <svg {...iconProps('h-3.5 w-3.5')}>
      <path d="M4 6h16" />
      <path d="M7 12h10" />
      <path d="M10 18h4" />
    </svg>
  )
}

/* ============================================================
   AUDIT
============================================================ */

function AuditIcon() {
  return (
    <svg {...iconProps('h-4 w-4')}>
      <rect
        x="5"
        y="3.5"
        width="14"
        height="17"
        rx="2"
      />

      <path d="M9 3.5V2.5h6v1" />

      <path d="M8.5 9h7" />
      <path d="M8.5 13h7" />
      <path d="M8.5 17h4" />
    </svg>
  )
}

/* ============================================================
   LOCATION
============================================================ */

function LocationIcon() {
  return (
    <svg
      {...iconProps(
        'h-3.5 w-3.5 text-[#98a2b3]'
      )}
    >
      <path d="M20 10c0 5-8 11-8 11S4 15 4 10a8 8 0 1 1 16 0Z" />

      <circle
        cx="12"
        cy="10"
        r="2.5"
      />
    </svg>
  )
}

/* ============================================================
   CALENDAR
============================================================ */

function CalendarIcon() {
  return (
    <svg
      {...iconProps(
        'h-3.5 w-3.5 text-[#98a2b3]'
      )}
    >
      <rect
        x="3.5"
        y="5"
        width="17"
        height="15"
        rx="2"
      />

      <path d="M16 3v4" />
      <path d="M8 3v4" />
      <path d="M3.5 9h17" />
    </svg>
  )
}

/* ============================================================
   ARROW
   IMPORTANT: FIXED SIZE
============================================================ */

function ArrowRightIcon({
  className = '',
}) {
  return (
    <svg
      className={`h-3.5 w-3.5 flex-none ${className}`}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d="M5 12h14" />
      <path d="m13 6 6 6-6 6" />
    </svg>
  )
}

/* ============================================================
   CHEVRON LEFT
============================================================ */

function ChevronLeftIcon() {
  return (
    <svg {...iconProps('h-3.5 w-3.5 flex-none')}>
      <path d="m15 18-6-6 6-6" />
    </svg>
  )
}

/* ============================================================
   CHEVRON RIGHT
============================================================ */

function ChevronRightIcon() {
  return (
    <svg {...iconProps('h-3.5 w-3.5 flex-none')}>
      <path d="m9 18 6-6-6-6" />
    </svg>
  )
}

/* ============================================================
   ALERT
============================================================ */

function AlertIcon() {
  return (
    <svg {...iconProps('h-5 w-5')}>
      <path d="M12 3 21 20H3L12 3Z" />
      <path d="M12 9v5" />
      <path d="M12 17h.01" />
    </svg>
  )
}

/* ============================================================
   REFRESH
============================================================ */

function RefreshIcon() {
  return (
    <svg {...iconProps('h-4 w-4')}>
      <path d="M20 11a8 8 0 0 0-14.7-4L4 9" />
      <path d="M4 4v5h5" />
      <path d="M4 13a8 8 0 0 0 14.7 4L20 15" />
      <path d="M20 20v-5h-5" />
    </svg>
  )
}