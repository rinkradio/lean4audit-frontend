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

function formatDate(value) {
  if (!value) return '—'

  return new Date(value).toLocaleDateString('en-GB', {
    day: '2-digit',
    month: 'short',
    year: '2-digit',
  })
}

function AccessBadge({ children }) {
  return (
    <span className="inline-flex items-center rounded-full bg-brand-soft px-2.5 py-1 text-[11px] font-semibold text-brand">
      {children}
    </span>
  )
}

function AccessList({ items = [], emptyText = 'None' }) {
  if (!items?.length) {
    return (
      <span className="text-xs text-ink2-muted">
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

export default function ConsultantsListPage() {
  const navigate = useNavigate()
  const { showToast } = useToast()

  const [consultants, setConsultants] = useState([])
  const [total, setTotal] = useState(0)

  const [page, setPage] = useState(1)

  const [search, setSearch] = useState('')
  const [debouncedSearch, setDebouncedSearch] = useState('')

  const [statusFilter, setStatusFilter] = useState('')

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

  // ---------------------------------------------------------
  // SEARCH DEBOUNCE
  // ---------------------------------------------------------

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(search)
    }, 350)

    return () => clearTimeout(timer)
  }, [search])

  // ---------------------------------------------------------
  // RESET PAGE WHEN FILTER CHANGES
  // ---------------------------------------------------------

  useEffect(() => {
    setPage(1)
  }, [debouncedSearch, statusFilter])

  // ---------------------------------------------------------
  // LOAD CONSULTANTS
  // ---------------------------------------------------------

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

  // ---------------------------------------------------------
  // STATUS CHANGE
  // ---------------------------------------------------------

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

  // ---------------------------------------------------------
  // ACTIONS
  // ---------------------------------------------------------

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

  const totalPages = Math.max(
    1,
    Math.ceil(total / PAGE_SIZE)
  )

  const hasFilters = Boolean(
    debouncedSearch || statusFilter
  )

  // ---------------------------------------------------------
  // RENDER
  // ---------------------------------------------------------

  return (
    <div className="mx-auto max-w-7xl animate-fade-in">

      {/* HEADER */}

      <div className="mb-6 flex flex-col gap-1">
        <h1 className="text-2xl font-bold text-ink2 sm:text-[1.75rem]">
          Lean Consultants
        </h1>

        <p className="text-sm text-ink2-secondary">
          Manage consultants responsible for conducting
          plant audits and Lean assessments.
        </p>
      </div>

      {/* FILTERS */}

      <div className="mb-5 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">

        <div className="flex flex-col gap-3 sm:flex-row sm:items-center">

          {/* SEARCH */}

          <div className="relative">
            <svg
              className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-ink2-muted"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
            >
              <circle
                cx="11"
                cy="11"
                r="7"
              />

              <path d="m21 21-4.35-4.35" />
            </svg>

            <input
              type="text"
              className="w-full rounded-md border border-line-strong bg-surface py-2.5 pl-9 pr-3.5 text-sm text-ink2 outline-none transition-colors placeholder:text-ink2-muted focus:border-brand focus:ring-4 focus:ring-brand-soft sm:w-64"
              placeholder="Search consultants…"
              value={search}
              onChange={(event) =>
                setSearch(event.target.value)
              }
            />
          </div>

          {/* STATUS FILTER */}

          <div className="flex gap-1.5 rounded-md bg-line/50 p-1">
            {[
              '',
              'active',
              'inactive',
            ].map((value) => (
              <button
                key={value || 'all'}
                type="button"
                className={`rounded px-3 py-1.5 text-xs font-semibold transition-colors ${
                  statusFilter === value
                    ? 'bg-surface text-ink2 shadow-xs'
                    : 'text-ink2-secondary hover:text-ink2'
                }`}
                onClick={() =>
                  setStatusFilter(value)
                }
              >
                {value === ''
                  ? 'All'
                  : value === 'active'
                    ? 'Active'
                    : 'Inactive'}
              </button>
            ))}
          </div>

        </div>

        {/* ADD CONSULTANT */}

        <button
          type="button"
          className="inline-flex items-center justify-center gap-1.5 rounded-md bg-brand px-4 py-2.5 text-sm font-semibold text-white shadow-xs transition-colors hover:bg-brand-hover"
          onClick={() =>
            setShowCreateDrawer(true)
          }
        >
          <span className="text-base leading-none">
            +
          </span>

          Add Lean Consultant
        </button>

      </div>

      {/* TABLE */}

      <div className="overflow-hidden rounded-xl border border-line bg-surface shadow-xs">

        {isLoading ? (
          <SkeletonTable />
        ) : loadError ? (
          <div className="flex flex-col items-center gap-3 px-6 py-16 text-center">
            <p className="text-sm text-ink2-secondary">
              {loadError}
            </p>

            <button
              type="button"
              className="rounded-md border border-line-strong px-4 py-2 text-sm font-semibold text-ink2 transition-colors hover:bg-canvas"
              onClick={loadConsultants}
            >
              Retry
            </button>
          </div>
        ) : consultants.length === 0 ? (
          <div className="flex flex-col items-center gap-2 px-6 py-16 text-center">

            {hasFilters ? (
              <p className="text-sm text-ink2-secondary">
                No consultants match your search.
              </p>
            ) : (
              <>
                <h3 className="text-base font-semibold text-ink2">
                  No Lean Consultants yet
                </h3>

                <p className="max-w-sm text-sm text-ink2-secondary">
                  Create your first Lean Consultant to
                  begin managing your plant audit team.
                </p>

                <button
                  type="button"
                  className="mt-3 inline-flex items-center gap-1.5 rounded-md bg-brand px-4 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-brand-hover"
                  onClick={() =>
                    setShowCreateDrawer(true)
                  }
                >
                  + Add Lean Consultant
                </button>
              </>
            )}

          </div>
        ) : (
          <>
            {/* DESKTOP TABLE */}

            <div className="hidden overflow-x-auto md:block">
              <table className="w-full min-w-[1100px] text-left text-sm">

                <thead>
                  <tr className="border-b border-line bg-canvas/60 text-xs font-semibold uppercase tracking-wide text-ink2-muted">

                    <th className="px-5 py-3 font-semibold">
                      Employee ID
                    </th>

                    <th className="px-5 py-3 font-semibold">
                      Name
                    </th>

                    <th className="px-5 py-3 font-semibold">
                      Plant Access
                    </th>

                    <th className="px-5 py-3 font-semibold">
                      Zone Access
                    </th>

                    <th className="px-5 py-3 font-semibold">
                      Status
                    </th>

                    <th className="px-5 py-3 font-semibold">
                      Created
                    </th>

                    <th className="px-5 py-3 font-semibold">
                      Last Login
                    </th>

                    <th
                      className="px-5 py-3"
                      aria-label="Actions"
                    />

                  </tr>
                </thead>

                <tbody>

                  {consultants.map((consultant) => (
                    <tr
                      key={consultant.id}
                      className="border-b border-line last:border-0 transition-colors hover:bg-canvas/50"
                    >

                      {/* EMPLOYEE ID */}

                      <td className="px-5 py-3.5">
                        <button
                          type="button"
                          className="font-semibold text-brand transition-colors hover:text-brand-hover hover:underline"
                          onClick={() =>
                            navigate(
                              `/admin/consultants/${consultant.id}`
                            )
                          }
                        >
                          {consultant.employee_id}
                        </button>
                      </td>

                      {/* NAME */}

                      <td className="px-5 py-3.5">
                        <div className="font-medium text-ink2">
                          {consultant.full_name}
                        </div>
                      </td>

                      {/* PLANTS */}

                      <td className="px-5 py-3.5">
                        <AccessList
                          items={
                            consultant.plants || []
                          }
                          emptyText="No Plants"
                        />
                      </td>

                      {/* ZONES */}

                      <td className="px-5 py-3.5">
                        <AccessList
                          items={
                            consultant.zones || []
                          }
                          emptyText="No Zones"
                        />
                      </td>

                      {/* STATUS */}

                      <td className="px-5 py-3.5">
                        <StatusBadge
                          isActive={
                            consultant.is_active
                          }
                        />
                      </td>

                      {/* CREATED */}

                      <td className="px-5 py-3.5 text-ink2-secondary">
                        {formatDate(
                          consultant.created_at
                        )}
                      </td>

                      {/* LAST LOGIN */}

                      <td className="px-5 py-3.5 text-ink2-secondary">
                        {formatDate(
                          consultant.last_login
                        )}
                      </td>

                      {/* ACTIONS */}

                      <td className="px-5 py-3.5 text-right">
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

            {/* MOBILE CARDS */}

            <div className="divide-y divide-line md:hidden">

              {consultants.map((consultant) => (
                <div
                  key={consultant.id}
                  className="px-4 py-4"
                >

                  <div className="flex items-start justify-between gap-3">

                    <div className="min-w-0">

                      <button
                        type="button"
                        className="text-left text-sm font-semibold text-brand hover:underline"
                        onClick={() =>
                          navigate(
                            `/admin/consultants/${consultant.id}`
                          )
                        }
                      >
                        {consultant.employee_id}
                      </button>

                      <div className="mt-0.5 truncate text-sm text-ink2">
                        {consultant.full_name}
                      </div>

                      <div className="mt-2">
                        <StatusBadge
                          isActive={
                            consultant.is_active
                          }
                        />
                      </div>

                    </div>

                    <RowActionMenu
                      items={rowActions(
                        consultant
                      )}
                    />

                  </div>

                  {/* ACCESS */}

                  <div className="mt-4 space-y-3">

                    <div>
                      <div className="mb-1 text-[11px] font-semibold uppercase tracking-wide text-ink2-muted">
                        Plants
                      </div>

                      <AccessList
                        items={
                          consultant.plants || []
                        }
                        emptyText="No Plants"
                      />
                    </div>

                    <div>
                      <div className="mb-1 text-[11px] font-semibold uppercase tracking-wide text-ink2-muted">
                        Zones
                      </div>

                      <AccessList
                        items={
                          consultant.zones || []
                        }
                        emptyText="No Zones"
                      />
                    </div>

                    <div className="flex flex-wrap gap-3 text-xs text-ink2-muted">
                      <span>
                        Created:{' '}
                        {formatDate(
                          consultant.created_at
                        )}
                      </span>

                      <span>
                        Last Login:{' '}
                        {formatDate(
                          consultant.last_login
                        )}
                      </span>
                    </div>

                  </div>

                </div>
              ))}

            </div>
          </>
        )}

      </div>

      {/* PAGINATION */}

      {!isLoading &&
        !loadError &&
        consultants.length > 0 &&
        totalPages > 1 && (
          <div className="mt-4 flex items-center justify-center gap-3 text-sm">

            <button
              type="button"
              className="rounded-md border border-line-strong px-3.5 py-2 font-medium text-ink2-secondary transition-colors hover:bg-surface disabled:cursor-not-allowed disabled:opacity-50"
              disabled={page <= 1}
              onClick={() =>
                setPage((current) =>
                  current - 1
                )
              }
            >
              Previous
            </button>

            <span className="text-ink2-secondary">
              Page {page} of {totalPages}
            </span>

            <button
              type="button"
              className="rounded-md border border-line-strong px-3.5 py-2 font-medium text-ink2-secondary transition-colors hover:bg-surface disabled:cursor-not-allowed disabled:opacity-50"
              disabled={
                page >= totalPages
              }
              onClick={() =>
                setPage((current) =>
                  current + 1
                )
              }
            >
              Next
            </button>

          </div>
        )}

      {/* CREATE DRAWER */}

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

      {/* RESET PASSWORD */}

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

      {/* STATUS CONFIRMATION */}

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
  )
}

// ---------------------------------------------------------
// SKELETON
// ---------------------------------------------------------

function SkeletonTable() {
  return (
    <div className="space-y-3 p-5">

      {Array.from({ length: 5 }).map(
        (_, index) => (
          <div
            key={index}
            className="skeleton h-12 rounded-md"
          />
        )
      )}

    </div>
  )
}