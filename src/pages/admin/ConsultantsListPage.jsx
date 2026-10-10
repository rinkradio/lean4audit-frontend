import { useCallback, useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'

import StatusBadge from '../../components/StatusBadge'
import RowActionMenu from '../../components/RowActionMenu'
import ConfirmDialog from '../../components/ConfirmDialog'
import ConsultantFormDrawer from './ConsultantFormDrawer'
import ResetPasswordDialog from './ResetPasswordDialog'

import {
  fetchConsultants,
  setConsultantStatus,
} from '../../services/consultantService'

import { useToast } from '../../hooks/useToast'

const PAGE_SIZE = 10

// ---------------------------------------------------------
// HELPERS
// ---------------------------------------------------------

function formatDate(value) {
  if (!value) return '—'

  return new Date(value).toLocaleDateString('en-GB', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  })
}

function getInitials(name = '') {
  const parts = name
    .trim()
    .split(/\s+/)
    .filter(Boolean)

  if (!parts.length) return 'LC'

  return parts
    .slice(0, 2)
    .map((part) => part.charAt(0))
    .join('')
    .toUpperCase()
}

// ---------------------------------------------------------
// ICONS
// ---------------------------------------------------------

function SearchIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
      className="h-[17px] w-[17px]"
    >
      <circle cx="11" cy="11" r="7" />
      <path d="m20 20-4-4" />
    </svg>
  )
}

function UserPlusIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
      className="h-[17px] w-[17px]"
    >
      <path d="M15 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
      <circle cx="8.5" cy="7" r="4" />
      <path d="M19 8v6" />
      <path d="M22 11h-6" />
    </svg>
  )
}

function UsersIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.7"
      strokeLinecap="round"
      strokeLinejoin="round"
      className="h-[19px] w-[19px]"
    >
      <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
      <circle cx="9" cy="7" r="4" />
      <path d="M22 21v-2a4 4 0 0 0-3-3.87" />
      <path d="M16 3.13a4 4 0 0 1 0 7.75" />
    </svg>
  )
}

function BuildingIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.7"
      strokeLinecap="round"
      strokeLinejoin="round"
      className="h-[15px] w-[15px]"
    >
      <path d="M3 21h18" />
      <path d="M5 21V5l7-3v19" />
      <path d="M12 21V8l7-3v16" />
      <path d="M8 7h1" />
      <path d="M8 11h1" />
      <path d="M8 15h1" />
      <path d="M15 10h1" />
      <path d="M15 14h1" />
      <path d="M15 18h1" />
    </svg>
  )
}

function ZoneIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.7"
      strokeLinecap="round"
      strokeLinejoin="round"
      className="h-[15px] w-[15px]"
    >
      <rect x="3" y="3" width="7" height="7" rx="1" />
      <rect x="14" y="3" width="7" height="7" rx="1" />
      <rect x="3" y="14" width="7" height="7" rx="1" />
      <rect x="14" y="14" width="7" height="7" rx="1" />
    </svg>
  )
}

function RefreshIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
      className="h-[15px] w-[15px]"
    >
      <path d="M20 11a8.1 8.1 0 0 0-15.5-2" />
      <path d="M4 5v4h4" />
      <path d="M4 13a8.1 8.1 0 0 0 15.5 2" />
      <path d="M20 19v-4h-4" />
    </svg>
  )
}

function ChevronLeftIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
      className="h-4 w-4"
    >
      <path d="m15 18-6-6 6-6" />
    </svg>
  )
}

function ChevronRightIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
      className="h-4 w-4"
    >
      <path d="m9 18 6-6-6-6" />
    </svg>
  )
}

// ---------------------------------------------------------
// ACCESS BADGES
// ---------------------------------------------------------

function AccessBadge({ children }) {
  return (
    <span className="inline-flex max-w-full items-center rounded-md border border-[#d8e4eb] bg-[#f4f8fa] px-2 py-1 text-[11px] font-semibold leading-4 text-[#31566e]">
      {children}
    </span>
  )
}

function AccessList({ items = [], emptyText = 'None' }) {
  if (!items?.length) {
    return (
      <span className="text-[11px] font-medium text-[#8b99a2]">
        {emptyText}
      </span>
    )
  }

  return (
    <div className="flex max-w-[280px] flex-wrap gap-1.5">
      {items.map((item) => (
        <AccessBadge key={item.id}>
          {item.name}
          {item.code ? ` (${item.code})` : ''}
        </AccessBadge>
      ))}
    </div>
  )
}

// ---------------------------------------------------------
// CONSULTANT AVATAR
// ---------------------------------------------------------

function ConsultantAvatar({ name }) {
  return (
    <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border border-[#d7e4eb] bg-[#eef5f9] text-[11px] font-bold tracking-wide text-[#35627e]">
      {getInitials(name)}
    </div>
  )
}

// ---------------------------------------------------------
// SHARED PAGINATION BAR
// Rendered above and below the directory table so users can
// change pages without having to scroll to either end.
// ---------------------------------------------------------

function PaginationBar({
  page,
  totalPages,
  firstResult,
  lastResult,
  total,
  setPage,
  placement = 'bottom',
}) {
  const isTop = placement === 'top'

  return (
    <div
      className={`flex flex-col gap-3 px-4 py-3 sm:flex-row sm:items-center sm:justify-between sm:px-5 ${
        isTop
          ? 'border-b border-[#e8eef2] bg-[#fbfcfd]'
          : 'mt-4 rounded-xl border border-[#e1e9ee] bg-white'
      }`}
      aria-label={`${isTop ? 'Top' : 'Bottom'} table pagination`}
    >
      <p className="text-xs font-medium text-[#7d8d97]">
        Showing{' '}
        <span className="font-bold text-[#425c6b]">{firstResult}</span>
        {' '}–{' '}
        <span className="font-bold text-[#425c6b]">{lastResult}</span>
        {' '}of{' '}
        <span className="font-bold text-[#425c6b]">{total}</span>
        {' '}
        {total === 1 ? 'consultant' : 'consultants'}
      </p>

      {totalPages > 1 && (
        <div className="flex w-full items-center justify-between gap-2 sm:w-auto sm:justify-end">
          <button
            type="button"
            aria-label="Go to previous page"
            className="inline-flex min-h-10 flex-1 items-center justify-center gap-1.5 rounded-lg border border-[#d6e0e6] bg-white px-3 text-xs font-semibold text-[#526b79] transition-colors hover:border-[#b9ccd7] hover:bg-[#f4f8fa] focus:outline-none focus:ring-4 focus:ring-[#e6f0f5] disabled:cursor-not-allowed disabled:opacity-40 sm:flex-none"
            disabled={page <= 1}
            onClick={() => setPage((current) => Math.max(1, current - 1))}
          >
            <ChevronLeftIcon />
            Previous
          </button>

          <div
            className="flex min-h-10 shrink-0 items-center rounded-lg border border-[#d6e0e6] bg-white px-3 text-xs font-bold text-[#526975]"
            aria-live="polite"
          >
            Page {page} <span className="mx-1.5 text-[#a0adb5]">/</span> {totalPages}
          </div>

          <button
            type="button"
            aria-label="Go to next page"
            className="inline-flex min-h-10 flex-1 items-center justify-center gap-1.5 rounded-lg border border-[#d6e0e6] bg-white px-3 text-xs font-semibold text-[#526b79] transition-colors hover:border-[#b9ccd7] hover:bg-[#f4f8fa] focus:outline-none focus:ring-4 focus:ring-[#e6f0f5] disabled:cursor-not-allowed disabled:opacity-40 sm:flex-none"
            disabled={page >= totalPages}
            onClick={() => setPage((current) => Math.min(totalPages, current + 1))}
          >
            Next
            <ChevronRightIcon />
          </button>
        </div>
      )}
    </div>
  )
}

// ---------------------------------------------------------
// MAIN PAGE
// ---------------------------------------------------------

export default function ConsultantsListPage() {
  const navigate = useNavigate()
  const { showToast } = useToast()

  const [consultants, setConsultants] = useState([])
  const [total, setTotal] = useState(0)

  const [page, setPage] = useState(1)

  const [search, setSearch] = useState('')
  const [debouncedSearch, setDebouncedSearch] =
    useState('')

  const [statusFilter, setStatusFilter] =
    useState('')

  const [isLoading, setIsLoading] = useState(true)
  const [loadError, setLoadError] = useState('')

  const [showCreateDrawer, setShowCreateDrawer] =
    useState(false)

  const [resetPasswordFor, setResetPasswordFor] =
    useState(null)

  const [statusConfirm, setStatusConfirm] =
    useState(null)

  const [isStatusSubmitting, setIsStatusSubmitting] =
    useState(false)

  // -------------------------------------------------------
  // SEARCH DEBOUNCE
  // -------------------------------------------------------

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(search)
    }, 350)

    return () => clearTimeout(timer)
  }, [search])

  // -------------------------------------------------------
  // RESET PAGE WHEN FILTER CHANGES
  // -------------------------------------------------------

  useEffect(() => {
    setPage(1)
  }, [debouncedSearch, statusFilter])

  // -------------------------------------------------------
  // LOAD CONSULTANTS
  // -------------------------------------------------------

  const loadConsultants = useCallback(async () => {
    setIsLoading(true)
    setLoadError('')

    try {
      const data = await fetchConsultants({
        search: debouncedSearch,
        status: statusFilter,
        page,
        pageSize: PAGE_SIZE,
      })

      setConsultants(data?.items || [])
      setTotal(data?.total || 0)
    } catch (error) {
      console.error(
        'Failed to load consultants:',
        error
      )

      setLoadError(
        'Unable to load consultants. Please try again.'
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
    loadConsultants()
  }, [loadConsultants])

  // -------------------------------------------------------
  // STATUS CHANGE
  // -------------------------------------------------------

  async function confirmStatusChange() {
    if (!statusConfirm) return

    setIsStatusSubmitting(true)

    try {
      await setConsultantStatus(
        statusConfirm.consultant.id,
        statusConfirm.nextActive
      )

      showToast(
        statusConfirm.nextActive
          ? 'Consultant activated successfully.'
          : 'Consultant deactivated successfully.'
      )

      setStatusConfirm(null)

      await loadConsultants()
    } catch (error) {
      console.error(
        'Failed to update consultant status:',
        error
      )

      showToast(
        'Unable to update consultant status. Please try again.',
        'error'
      )
    } finally {
      setIsStatusSubmitting(false)
    }
  }

  // -------------------------------------------------------
  // ROW ACTIONS
  // -------------------------------------------------------

  function rowActions(consultant) {
    return [
      {
        label: 'View Profile',
        onClick: () =>
          navigate(
            `/admin/consultants/${consultant.id}`
          ),
      },

      {
        label: 'Edit Access',
        onClick: () =>
          navigate(
            `/admin/consultants/${consultant.id}`
          ),
      },

      {
        label: 'Reset Password',
        onClick: () =>
          setResetPasswordFor(consultant),
      },

      consultant.is_active
        ? {
            label: 'Deactivate',
            danger: true,
            onClick: () =>
              setStatusConfirm({
                consultant,
                nextActive: false,
              }),
          }
        : {
            label: 'Activate',
            onClick: () =>
              setStatusConfirm({
                consultant,
                nextActive: true,
              }),
          },
    ]
  }

  // -------------------------------------------------------
  // DERIVED VALUES
  // -------------------------------------------------------

  const totalPages = Math.max(
    1,
    Math.ceil(total / PAGE_SIZE)
  )

  const hasFilters = Boolean(
    debouncedSearch || statusFilter
  )

  const activeCount = consultants.filter(
    (consultant) => consultant.is_active
  ).length

  const inactiveCount =
    consultants.length - activeCount

  const firstResult =
    total === 0
      ? 0
      : (page - 1) * PAGE_SIZE + 1

  const lastResult =
    Math.min(page * PAGE_SIZE, total)

  // -------------------------------------------------------
  // RENDER
  // -------------------------------------------------------

  return (
    <div className="min-h-full w-full bg-[#f5f7fa]">

      <div className="mx-auto w-full max-w-[1480px] px-3 py-4 sm:px-6 sm:py-6 lg:px-8 xl:px-10 2xl:px-12">

        {/* =================================================
            PAGE HEADER
        ================================================= */}

        <div className="mb-6 sm:mb-7">

          <div className="flex flex-col gap-4 sm:gap-5 lg:flex-row lg:items-end lg:justify-between">

            <div className="min-w-0">

              <div className="mb-2.5 flex items-center gap-2 text-[10px] font-bold uppercase tracking-[0.18em] text-[#80919d]">
                <span>
                  Administration
                </span>

                <span className="text-[#b6c2c9]">
                  /
                </span>

                <span className="text-[#3d6d8a]">
                  People &amp; Access
                </span>
              </div>

              <h1 className="text-[27px] font-bold tracking-[-0.035em] text-[#172d3d] sm:text-[31px]">
                Lean Consultants
              </h1>

              <p className="mt-2 max-w-[680px] text-[13px] leading-6 text-[#71828d]">
                Manage consultants, plant access, zone
                permissions, and account status from one
                central workspace.
              </p>

            </div>

            <button
              type="button"
              onClick={() =>
                setShowCreateDrawer(true)
              }
              className="inline-flex min-h-11 w-full shrink-0 items-center justify-center gap-2 self-stretch rounded-xl bg-[#245d80] px-4 text-[13px] font-semibold text-white shadow-[0_1px_2px_rgba(16,42,59,0.14)] transition-colors hover:bg-[#1e4f6d] focus:outline-none focus:ring-4 focus:ring-[#dcebf2] sm:w-auto sm:self-start lg:self-auto"
            >
              <UserPlusIcon />
              Add Consultant
            </button>

          </div>

        </div>

        {/* =================================================
            SUMMARY CARDS
        ================================================= */}

        <div className="mb-5 grid grid-cols-1 gap-3 sm:grid-cols-3 sm:gap-4">

          {/* TOTAL */}

          <div className="rounded-xl border border-[#dfe7ec] bg-white px-4 py-4 shadow-[0_1px_2px_rgba(25,55,72,0.03)] sm:px-5">

            <div className="flex items-center justify-between">

              <div>
                <p className="text-[10px] font-bold uppercase tracking-[0.14em] text-[#7c8e99]">
                  Total Consultants
                </p>

                <div className="mt-2 flex items-end gap-2">

                  <span className="text-[25px] font-bold tracking-tight text-[#203746]">
                    {total}
                  </span>

                  <span className="mb-1 text-[11px] font-medium text-[#91a0a9]">
                    registered
                  </span>

                </div>
              </div>

              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-[#eef5f9] text-[#3d6e8d]">
                <UsersIcon />
              </div>

            </div>

          </div>

          {/* ACTIVE */}

          <div className="rounded-xl border border-[#dfe7ec] bg-white px-4 py-4 shadow-[0_1px_2px_rgba(25,55,72,0.03)] sm:px-5">

            <div className="flex items-center justify-between">

              <div>
                <p className="text-[10px] font-bold uppercase tracking-[0.14em] text-[#7c8e99]">
                  Active Consultants
                </p>

                <div className="mt-2 flex items-end gap-2">

                  <span className="text-[25px] font-bold tracking-tight text-[#203746]">
                    {activeCount}
                  </span>

                  <span className="mb-1 text-[11px] font-medium text-[#91a0a9]">
                    on current page
                  </span>

                </div>
              </div>

              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-[#eef7f1]">
                <span className="h-2.5 w-2.5 rounded-full bg-[#4a9a6d]" />
              </div>

            </div>

          </div>

          {/* INACTIVE */}

          <div className="rounded-xl border border-[#dfe7ec] bg-white px-4 py-4 shadow-[0_1px_2px_rgba(25,55,72,0.03)] sm:px-5">

            <div className="flex items-center justify-between">

              <div>
                <p className="text-[10px] font-bold uppercase tracking-[0.14em] text-[#7c8e99]">
                  Inactive Consultants
                </p>

                <div className="mt-2 flex items-end gap-2">

                  <span className="text-[25px] font-bold tracking-tight text-[#203746]">
                    {inactiveCount}
                  </span>

                  <span className="mb-1 text-[11px] font-medium text-[#91a0a9]">
                    on current page
                  </span>

                </div>
              </div>

              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-[#f2f4f5]">
                <span className="h-2.5 w-2.5 rounded-full bg-[#9ba6ad]" />
              </div>

            </div>

          </div>

        </div>

        {/* =================================================
            FILTER TOOLBAR
        ================================================= */}

        <div className="mb-4 rounded-xl border border-[#dfe7ec] bg-white p-3 shadow-[0_1px_2px_rgba(25,55,72,0.03)] sm:mb-5 sm:p-4">

          <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">

            <div className="flex min-w-0 flex-col gap-3 sm:flex-row">

              {/* SEARCH */}

              <div className="relative w-full sm:w-auto">

                <div className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-[#82939e]">
                  <SearchIcon />
                </div>

                <input
                  type="text"
                  value={search}
                  onChange={(event) =>
                    setSearch(event.target.value)
                  }
                  placeholder="Search consultants..."
                  className="h-11 w-full rounded-xl border border-[#d8e2e8] bg-[#fbfcfd] pl-10 pr-4 text-[13px] font-medium text-[#243b4a] outline-none transition focus:border-[#4b7d9b] focus:bg-white focus:ring-4 focus:ring-[#e6f0f5] sm:w-[300px]"
                />

              </div>

              {/* STATUS */}

              <div className="flex min-h-11 w-full rounded-xl border border-[#d8e2e8] bg-[#f5f7f8] p-1 sm:w-auto">

                {[
                  ['', 'All'],
                  ['active', 'Active'],
                  ['inactive', 'Inactive'],
                ].map(([value, label]) => (
                  <button
                    key={value || 'all'}
                    type="button"
                    onClick={() =>
                      setStatusFilter(value)
                    }
                    className={`flex-1 rounded-lg px-3 text-[12px] font-bold transition sm:flex-none sm:px-4 ${
                      statusFilter === value
                        ? 'bg-white text-[#244e68] shadow-[0_1px_3px_rgba(25,55,72,0.10)]'
                        : 'text-[#788993] hover:text-[#29495d]'
                    }`}
                  >
                    {label}
                  </button>
                ))}

              </div>

            </div>

            {/* TOOL ACTIONS */}

            <div className="flex w-full items-center gap-2 sm:w-auto sm:gap-3">

              {hasFilters && (
                <button
                  type="button"
                  onClick={() => {
                    setSearch('')
                    setStatusFilter('')
                  }}
                  className="min-h-10 flex-1 rounded-lg px-3 text-center text-[12px] font-semibold text-[#687b87] transition-colors hover:bg-[#f5f8fa] hover:text-[#245d80] sm:flex-none"
                >
                  Clear filters
                </button>
              )}

              <button
                type="button"
                onClick={loadConsultants}
                disabled={isLoading}
                className="inline-flex min-h-10 flex-1 items-center justify-center gap-2 rounded-lg border border-[#d5e0e6] bg-white px-3.5 text-[12px] font-semibold text-[#566d7a] transition-colors hover:bg-[#f7f9fa] disabled:cursor-not-allowed disabled:opacity-50 sm:flex-none"
              >
                <RefreshIcon />
                Refresh
              </button>

            </div>

          </div>

        </div>

        {/* =================================================
            DIRECTORY CARD
        ================================================= */}

        <div className="overflow-hidden rounded-xl border border-[#dce5ea] bg-white shadow-[0_2px_5px_rgba(25,55,72,0.035)]">

          {/* DIRECTORY HEADER */}

          <div className="flex flex-col gap-2 border-b border-[#e5ebef] bg-white px-5 py-4 sm:flex-row sm:items-center sm:justify-between">

            <div>

              <h2 className="text-[13px] font-bold text-[#294151]">
                Consultant Directory
              </h2>

              <p className="mt-0.5 text-[11px] text-[#8797a1]">
                Consultants with assigned plant and
                zone access
              </p>

            </div>

            <div className="text-[11px] font-semibold text-[#8797a1]">
              {total} {total === 1 ? 'record' : 'records'}
            </div>

          </div>

          {/* TOP PAGINATION: keep page controls visible before the table */}
          {!isLoading && !loadError && consultants.length > 0 && (
            <PaginationBar
              placement="top"
              page={page}
              totalPages={totalPages}
              firstResult={firstResult}
              lastResult={lastResult}
              total={total}
              setPage={setPage}
            />
          )}

          {/* =================================================
              LOADING
          ================================================= */}

          {isLoading ? (
            <SkeletonTable />
          ) : loadError ? (

            /* =================================================
               ERROR
            ================================================= */

            <div className="flex min-h-[330px] flex-col items-center justify-center px-6 text-center">

              <div className="mb-4 flex h-11 w-11 items-center justify-center rounded-xl border border-[#e0e7eb] bg-[#f5f7f8] text-[#71838e]">
                <RefreshIcon />
              </div>

              <h3 className="text-sm font-bold text-[#2b4352]">
                Unable to load consultants
              </h3>

              <p className="mt-1.5 max-w-sm text-[12px] leading-5 text-[#788993]">
                {loadError}
              </p>

              <button
                type="button"
                className="mt-4 inline-flex h-9 items-center gap-2 rounded-lg border border-[#d2dee5] bg-white px-4 text-[12px] font-semibold text-[#31566d] transition-colors hover:bg-[#f6f9fa]"
                onClick={loadConsultants}
              >
                <RefreshIcon />
                Retry
              </button>

            </div>

          ) : consultants.length === 0 ? (

            /* =================================================
               EMPTY STATE
            ================================================= */

            <div className="flex min-h-[330px] flex-col items-center justify-center px-6 text-center">

              <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl border border-[#dfe8ed] bg-[#f2f7fa] text-[#52748a]">
                <UsersIcon />
              </div>

              {hasFilters ? (
                <>
                  <h3 className="text-sm font-bold text-[#293f4e]">
                    No matching consultants
                  </h3>

                  <p className="mt-1.5 max-w-sm text-[12px] leading-5 text-[#788993]">
                    Try changing your search or status
                    filter.
                  </p>

                  <button
                    type="button"
                    className="mt-4 text-[12px] font-semibold text-[#2c6687] hover:underline"
                    onClick={() => {
                      setSearch('')
                      setStatusFilter('')
                    }}
                  >
                    Clear filters
                  </button>
                </>
              ) : (
                <>
                  <h3 className="text-sm font-bold text-[#293f4e]">
                    No Lean Consultants yet
                  </h3>

                  <p className="mt-1.5 max-w-sm text-[12px] leading-5 text-[#788993]">
                    Create your first Lean Consultant to
                    begin managing your plant audit team.
                  </p>

                  <button
                    type="button"
                    className="mt-4 inline-flex h-9 items-center gap-2 rounded-lg bg-[#245d80] px-4 text-[12px] font-semibold text-white transition-colors hover:bg-[#1e4f6d]"
                    onClick={() =>
                      setShowCreateDrawer(true)
                    }
                  >
                    <UserPlusIcon />
                    Add Consultant
                  </button>
                </>
              )}

            </div>

          ) : (

            /* =================================================
               DATA
            ================================================= */

            <>
              {/* =============================================
                  DESKTOP TABLE
              ============================================= */}

              <div className="hidden overflow-x-auto lg:block">

                <table className="w-full min-w-[1080px] table-fixed text-left">

                  <thead>
                    <tr className="border-b border-[#e1e8ec] bg-[#f8fafb]">

                      <th className="w-[24%] px-5 py-3.5 text-[10px] font-bold uppercase tracking-[0.13em] text-[#71838f]">
                        Consultant
                      </th>

                      <th className="w-[12%] px-5 py-3.5 text-[10px] font-bold uppercase tracking-[0.13em] text-[#71838f]">
                        Employee ID
                      </th>

                      <th className="w-[17%] px-5 py-3.5 text-[10px] font-bold uppercase tracking-[0.13em] text-[#71838f]">
                        Plant Access
                      </th>

                      <th className="w-[16%] px-5 py-3.5 text-[10px] font-bold uppercase tracking-[0.13em] text-[#71838f]">
                        Zone Access
                      </th>

                      <th className="w-[10%] px-5 py-3.5 text-[10px] font-bold uppercase tracking-[0.13em] text-[#71838f]">
                        Status
                      </th>

                      <th className="w-[9%] px-5 py-3.5 text-[10px] font-bold uppercase tracking-[0.13em] text-[#71838f]">
                        Created
                      </th>

                      <th className="w-[9%] px-5 py-3.5 text-[10px] font-bold uppercase tracking-[0.13em] text-[#71838f]">
                        Last Login
                      </th>

                      <th
                        className="w-[3%] px-4 py-3.5"
                        aria-label="Actions"
                      />

                    </tr>
                  </thead>

                  <tbody>

                    {consultants.map((consultant) => (
                      <tr
                        key={consultant.id}
                        className="group border-b border-[#edf1f3] transition-colors last:border-0 hover:bg-[#fbfcfd]"
                      >

                        {/* CONSULTANT */}

                        <td className="px-5 py-4">

                          <button
                            type="button"
                            className="flex min-w-0 items-center gap-3 text-left"
                            onClick={() =>
                              navigate(
                                `/admin/consultants/${consultant.id}`
                              )
                            }
                          >

                            <ConsultantAvatar
                              name={
                                consultant.full_name
                              }
                            />

                            <div className="min-w-0">

                              <div className="truncate text-[13px] font-bold text-[#243b4a] transition-colors group-hover:text-[#245d80]">
                                {consultant.full_name}
                              </div>

                              <div className="mt-1 text-[11px] font-medium text-[#87959e]">
                                Lean Consultant
                              </div>

                            </div>

                          </button>

                        </td>

                        {/* EMPLOYEE ID */}

                        <td className="px-5 py-4">

                          <button
                            type="button"
                            className="rounded text-[12px] font-bold text-[#2d698b] transition-colors hover:text-[#1e4f6d] hover:underline focus:outline-none"
                            onClick={() =>
                              navigate(
                                `/admin/consultants/${consultant.id}`
                              )
                            }
                          >
                            {consultant.employee_id}
                          </button>

                        </td>

                        {/* PLANT ACCESS */}

                        <td className="px-5 py-4">

                          <div className="flex items-start gap-2">

                            <div className="mt-0.5 shrink-0 text-[#78909f]">
                              <BuildingIcon />
                            </div>

                            <AccessList
                              items={
                                consultant.plants || []
                              }
                              emptyText="No Plants"
                            />

                          </div>

                        </td>

                        {/* ZONE ACCESS */}

                        <td className="px-5 py-4">

                          <div className="flex items-start gap-2">

                            <div className="mt-0.5 shrink-0 text-[#78909f]">
                              <ZoneIcon />
                            </div>

                            <AccessList
                              items={
                                consultant.zones || []
                              }
                              emptyText="No Zones"
                            />

                          </div>

                        </td>

                        {/* STATUS */}

                        <td className="px-5 py-4">

                          <StatusBadge
                            isActive={
                              consultant.is_active
                            }
                          />

                        </td>

                        {/* CREATED */}

                        <td className="whitespace-nowrap px-5 py-4 text-[11px] font-medium text-[#71828d]">
                          {formatDate(
                            consultant.created_at
                          )}
                        </td>

                        {/* LAST LOGIN */}

                        <td className="whitespace-nowrap px-5 py-4 text-[11px] font-medium text-[#71828d]">
                          {formatDate(
                            consultant.last_login
                          )}
                        </td>

                        {/* ACTIONS */}

                        <td className="px-4 py-4 text-right">

                          <RowActionMenu
                            items={rowActions(
                              consultant
                            )}
                          />

                        </td>

                      </tr>
                    ))}

                  </tbody>

                </table>

              </div>

              {/* =============================================
                  MOBILE CARDS
              ============================================= */}

              <div className="space-y-3 bg-[#f7f9fb] p-3 lg:hidden">

                {consultants.map((consultant) => (
                  <div
                    key={consultant.id}
                    className="rounded-xl border border-[#e3eaf0] bg-white p-4 shadow-[0_1px_3px_rgba(25,55,72,0.04)]"
                  >

                    <div className="flex items-start justify-between gap-3">

                      <button
                        type="button"
                        className="flex min-w-0 items-center gap-3 text-left"
                        onClick={() =>
                          navigate(
                            `/admin/consultants/${consultant.id}`
                          )
                        }
                      >

                        <ConsultantAvatar
                          name={
                            consultant.full_name
                          }
                        />

                        <div className="min-w-0">

                          <div className="truncate text-[13px] font-bold text-[#243b4a]">
                            {consultant.full_name}
                          </div>

                          <div className="mt-1 text-[11px] font-semibold text-[#2d698b]">
                            {consultant.employee_id}
                          </div>

                        </div>

                      </button>

                      <RowActionMenu
                        items={rowActions(
                          consultant
                        )}
                      />

                    </div>

                    <div className="mt-3">
                      <StatusBadge
                        isActive={
                          consultant.is_active
                        }
                      />
                    </div>

                    {/* PLANT ACCESS */}

                    <div className="mt-4 rounded-lg border border-[#e5ebef] bg-[#fafcfd] p-3">

                      <div className="mb-2 flex items-center gap-2 text-[10px] font-bold uppercase tracking-[0.12em] text-[#7a8b96]">

                        <BuildingIcon />

                        Plant Access

                      </div>

                      <AccessList
                        items={
                          consultant.plants || []
                        }
                        emptyText="No Plants assigned"
                      />

                    </div>

                    {/* ZONE ACCESS */}

                    <div className="mt-2.5 rounded-lg border border-[#e5ebef] bg-[#fafcfd] p-3">

                      <div className="mb-2 flex items-center gap-2 text-[10px] font-bold uppercase tracking-[0.12em] text-[#7a8b96]">

                        <ZoneIcon />

                        Zone Access

                      </div>

                      <AccessList
                        items={
                          consultant.zones || []
                        }
                        emptyText="No Zones assigned"
                      />

                    </div>

                    {/* DATES */}

                    <div className="mt-3 flex flex-wrap gap-x-5 gap-y-2 border-t border-[#edf0f2] pt-3 text-[11px] font-medium text-[#82909a]">

                      <span>
                        Created:{' '}
                        <strong className="font-semibold text-[#637681]">
                          {formatDate(
                            consultant.created_at
                          )}
                        </strong>
                      </span>

                      <span>
                        Last Login:{' '}
                        <strong className="font-semibold text-[#637681]">
                          {formatDate(
                            consultant.last_login
                          )}
                        </strong>
                      </span>

                    </div>

                  </div>
                ))}

              </div>

            </>
          )}

        </div>

        {/* BOTTOM PAGINATION: same page state as the controls above */}
        {!isLoading && !loadError && consultants.length > 0 && (
          <PaginationBar
            placement="bottom"
            page={page}
            totalPages={totalPages}
            firstResult={firstResult}
            lastResult={lastResult}
            total={total}
            setPage={setPage}
          />
        )}

        {/* =================================================
            CREATE DRAWER
        ================================================= */}

        {showCreateDrawer && (
          <ConsultantFormDrawer
            onClose={() =>
              setShowCreateDrawer(false)
            }
            onCreated={() => {
              setShowCreateDrawer(false)

              showToast(
                'Lean Consultant created successfully.'
              )

              setPage(1)

              loadConsultants()
            }}
          />
        )}

        {/* =================================================
            RESET PASSWORD
        ================================================= */}

        {resetPasswordFor && (
          <ResetPasswordDialog
            consultant={resetPasswordFor}
            onClose={() =>
              setResetPasswordFor(null)
            }
            onDone={() => {
              setResetPasswordFor(null)

              showToast(
                'Password reset successfully.'
              )
            }}
          />
        )}

        {/* =================================================
            STATUS CONFIRMATION
        ================================================= */}

        {statusConfirm && (
          <ConfirmDialog
            title={
              statusConfirm.nextActive
                ? 'Activate Consultant?'
                : 'Deactivate Consultant?'
            }
            message={
              statusConfirm.nextActive
                ? `${statusConfirm.consultant.full_name} (${statusConfirm.consultant.employee_id}) will be able to sign in to the system again.`
                : `${statusConfirm.consultant.full_name} (${statusConfirm.consultant.employee_id}) will no longer be able to sign in to the system.`
            }
            confirmLabel={
              statusConfirm.nextActive
                ? 'Activate'
                : 'Deactivate'
            }
            variant={
              statusConfirm.nextActive
                ? 'default'
                : 'danger'
            }
            isSubmitting={
              isStatusSubmitting
            }
            onCancel={() =>
              setStatusConfirm(null)
            }
            onConfirm={
              confirmStatusChange
            }
          />
        )}

      </div>

    </div>
  )
}

// ---------------------------------------------------------
// SKELETON
// ---------------------------------------------------------

function SkeletonTable() {
  return (
    <div className="overflow-hidden">

      {/* TABLE HEADER SKELETON */}

      <div className="hidden border-b border-[#e1e8ec] bg-[#f8fafb] px-5 py-4 md:grid md:grid-cols-7 md:gap-5">

        {Array.from({ length: 7 }).map(
          (_, index) => (
            <div
              key={index}
              className="h-2.5 rounded bg-[#e6ecef]"
            />
          )
        )}

      </div>

      {/* ROWS */}

      <div>

        {Array.from({ length: 5 }).map(
          (_, index) => (
            <div
              key={index}
              className="flex min-h-[76px] items-center gap-4 border-b border-[#edf1f3] px-5 py-4 last:border-0"
            >

              <div className="h-9 w-9 shrink-0 rounded-lg bg-[#edf1f3]" />

              <div className="flex-1 space-y-2">

                <div className="h-3 w-32 rounded bg-[#edf1f3]" />

                <div className="h-2.5 w-20 rounded bg-[#f0f3f5]" />

              </div>

              <div className="hidden h-3 w-20 rounded bg-[#edf1f3] sm:block" />

              <div className="hidden h-3 w-24 rounded bg-[#edf1f3] lg:block" />

              <div className="hidden h-6 w-16 rounded-full bg-[#edf1f3] md:block" />

            </div>
          )
        )}

      </div>

    </div>
  )
}