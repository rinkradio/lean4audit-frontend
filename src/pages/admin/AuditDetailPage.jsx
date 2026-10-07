import { useCallback, useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'

import AuditStatusBadge from '../../components/AuditStatusBadge'
import LoadingScreen from '../../components/LoadingScreen'
import EvidenceLightbox from '../../components/EvidenceLightbox'

import { fetchAudit } from '../../services/auditService'
import { markAuditNotificationRead } from '../../services/auditNotificationService'
import { fetchObservations } from '../../services/observationService'
import {
  fetchObservationEvidence,
  fetchObservationEvidenceFile,
} from '../../services/evidenceService'
import {
  exportAuditExcel,
  exportAuditPdf,
} from '../../services/auditExportService'
import Pagination from '../../components/Pagination'
import ObservationTypeBadge from '../../components/ObservationTypeBadge'

function formatDate(value) {
  if (!value) return '—'

  return new Date(value).toLocaleDateString('en-GB', {
    day: '2-digit',
    month: 'long',
    year: 'numeric',
  })
}

function formatDateTime(value) {
  if (!value) return '—'

  return new Date(value).toLocaleString('en-GB', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })
}

const SEVERITY_STYLES = {
  HIGH: 'bg-danger-soft text-danger',
  MEDIUM: 'bg-warning-soft text-warning',
  LOW: 'bg-ink2-muted/15 text-ink2-secondary',
}

const OBS_STATUS_STYLES = {
  OPEN: 'bg-brand-soft text-brand',
  CLOSED: 'bg-success-soft text-success',
}

function SeverityBadge({ severity }) {
  return (
    <span
      className={`inline-flex items-center rounded-full px-2.5 py-1 text-xs font-semibold ${
        SEVERITY_STYLES[severity] || SEVERITY_STYLES.LOW
      }`}
    >
      {severity?.charAt(0) + severity?.slice(1).toLowerCase()}
    </span>
  )
}

function ObsStatusBadge({ status }) {
  return (
    <span
      className={`inline-flex items-center rounded-full px-2.5 py-1 text-xs font-semibold ${
        OBS_STATUS_STYLES[status] || OBS_STATUS_STYLES.OPEN
      }`}
    >
      {status === 'CLOSED' ? 'Closed' : 'Open'}
    </span>
  )
}

function InfoField({ label, value }) {
  return (
    <div>
      <div className="text-xs font-semibold uppercase tracking-wide text-ink2-muted">
        {label}
      </div>

      <div className="mt-0.5 text-sm text-ink2">
        {value || '—'}
      </div>
    </div>
  )
}

export default function AuditDetailPage() {
  const { auditId } = useParams()
  const navigate = useNavigate()

  const [audit, setAudit] = useState(null)
  const [observations, setObservations] = useState([])
  const [observationPage, setObservationPage] = useState(1)
  const [observationTotal, setObservationTotal] = useState(0)
  const OBSERVATION_PAGE_SIZE = 10
  const [evidenceByObservation, setEvidenceByObservation] = useState({})

  const [isLoading, setIsLoading] = useState(true)
  const [loadError, setLoadError] = useState('')

  const [lightbox, setLightbox] = useState(null)

  const [exportingExcel, setExportingExcel] = useState(false)
  const [exportingPdf, setExportingPdf] = useState(false)
  const [exportError, setExportError] = useState('')

  const load = useCallback(async () => {
    setIsLoading(true)
    setLoadError('')

    try {
      const [auditData, obsData] = await Promise.all([
        fetchAudit(auditId),
        fetchObservations(auditId, {
          page: observationPage,
          pageSize: OBSERVATION_PAGE_SIZE,
        }),
      ])

      setAudit(auditData)
      setObservations(obsData.items || [])
      setObservationTotal(Number(obsData.total || 0))

      const evidenceEntries = await Promise.all(
        (obsData.items || []).map(async (obs) => {
          try {
            const evidence = await fetchObservationEvidence(obs.id)

            const withUrls = await Promise.all(
              evidence.map(async (ev) => ({
                ...ev,
                url: await fetchObservationEvidenceFile(ev.id),
              }))
            )

            return [obs.id, withUrls]
          } catch {
            return [obs.id, []]
          }
        })
      )

      setEvidenceByObservation(
        Object.fromEntries(evidenceEntries)
      )
    } catch {
      setLoadError(
        'Unable to load this audit. Please try again.'
      )
    } finally {
      setIsLoading(false)
    }
  }, [auditId, observationPage])

  useEffect(() => {
    load()
  }, [load])

  useEffect(() => {
    let cancelled = false

    const markRead = async () => {
      try {
        await markAuditNotificationRead(auditId)

        if (!cancelled) {
          window.dispatchEvent(
            new CustomEvent('audit-notification-read', {
              detail: { auditId: String(auditId) },
            })
          )
        }
      } catch (error) {
        console.error(
          'Unable to mark audit notification as read',
          error
        )
      }
    }

    markRead()

    return () => {
      cancelled = true
    }
  }, [auditId])

  const isSubmitted =
    audit?.status === 'SUBMITTED'

  const handleExcelExport = async () => {
    if (!isSubmitted || exportingExcel) return

    setExportError('')
    setExportingExcel(true)

    try {
      await exportAuditExcel(auditId)
    } catch {
      setExportError(
        'Unable to generate the Excel report. Please try again.'
      )
    } finally {
      setExportingExcel(false)
    }
  }

  const handlePdfExport = async () => {
    if (!isSubmitted || exportingPdf) return

    setExportError('')
    setExportingPdf(true)

    try {
      await exportAuditPdf(auditId)
    } catch {
      setExportError(
        'Unable to generate the PDF report. Please try again.'
      )
    } finally {
      setExportingPdf(false)
    }
  }

  if (isLoading) {
    return <LoadingScreen />
  }

  if (loadError || !audit) {
    return (
      <div className="mx-auto flex max-w-2xl flex-col items-center gap-3 py-24 text-center">
        <p className="text-sm text-ink2-secondary">
          {loadError || 'Audit not found.'}
        </p>

        <button
          className="rounded-md border border-line-strong px-4 py-2 text-sm font-semibold text-ink2 transition-colors hover:bg-canvas"
          onClick={load}
        >
          Retry
        </button>
      </div>
    )
  }

  const severityCounts = {
    HIGH: audit.high_observations,
    MEDIUM: audit.medium_observations,
    LOW: audit.low_observations,
  }

  return (
    <div className="mx-auto max-w-5xl animate-fade-in">
      <button
        className="mb-4 inline-flex items-center gap-1.5 text-sm font-semibold text-ink2-secondary hover:text-ink2"
        onClick={() => navigate('/admin/audits')}
      >
        ← Back to Audits
      </button>

      <div className="mb-6 rounded-xl border border-line bg-surface p-5 shadow-xs sm:p-6">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <div className="flex items-center gap-2.5">
              <h1 className="text-xl font-bold text-ink2 sm:text-2xl">
                {audit.audit_number}
              </h1>

              <AuditStatusBadge status={audit.status} />
            </div>

            <p className="mt-1 text-sm text-ink2-secondary">
              {audit.zone?.name} · Submitted by{' '}
              {audit.auditor?.full_name} (
              {audit.auditor?.employee_id})
            </p>
          </div>

          <div className="text-right text-xs text-ink2-muted">
            <div>
              Created {formatDateTime(audit.created_at)}
            </div>

            <div>
              Submitted {formatDateTime(audit.submitted_at)}
            </div>
          </div>
        </div>

        {isSubmitted && (
          <div className="mt-5 border-t border-line pt-5">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <div className="text-sm font-semibold text-ink2">
                  Audit Report
                </div>

                <div className="mt-0.5 text-xs text-ink2-secondary">
                  Download the completed audit report.
                </div>
              </div>

              <div className="flex flex-wrap gap-2">
                <button
                  type="button"
                  onClick={handleExcelExport}
                  disabled={exportingExcel}
                  className="inline-flex items-center justify-center gap-2 rounded-md bg-brand px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition-all hover:bg-brand-hover disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {exportingExcel ? (
                    <>
                      <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white" />
                      Generating Excel...
                    </>
                  ) : (
                    <>
                      <span className="text-base">▣</span>
                      Export Excel
                    </>
                  )}
                </button>

                <button
                  type="button"
                  onClick={handlePdfExport}
                  disabled={exportingPdf}
                  className="inline-flex items-center justify-center gap-2 rounded-md border border-line-strong bg-surface px-4 py-2.5 text-sm font-semibold text-ink2 transition-colors hover:bg-canvas disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {exportingPdf ? (
                    <>
                      <span className="h-4 w-4 animate-spin rounded-full border-2 border-ink2-muted border-t-ink2" />
                      Generating PDF...
                    </>
                  ) : (
                    <>
                      <span className="text-base">▤</span>
                      Export PDF
                    </>
                  )}
                </button>
              </div>
            </div>

            {exportError && (
              <div className="mt-3 rounded-md border border-danger/20 bg-danger-soft px-3 py-2 text-xs font-medium text-danger">
                {exportError}
              </div>
            )}
          </div>
        )}

        <div className="mt-5 grid grid-cols-2 gap-4 border-t border-line pt-5 sm:grid-cols-4">
          <InfoField
            label="Audit Date"
            value={formatDate(audit.audit_date)}
          />

          <InfoField
            label="Zone Leader"
            value={audit.zone_leader}
          />

          <InfoField
            label="HOD"
            value={audit.hod}
          />

          <InfoField
            label="Consultant"
            value={audit.auditor?.full_name}
          />
        </div>

        <div className="mt-5 flex flex-wrap items-center gap-2 border-t border-line pt-5">
          <span className="text-xs font-semibold uppercase tracking-wide text-ink2-muted">
            Observations
          </span>

          <span className="rounded-full bg-canvas px-2.5 py-1 text-xs font-semibold text-ink2">
            {audit.total_observations} total
          </span>

          {['HIGH', 'MEDIUM', 'LOW'].map(
            (sev) =>
              severityCounts[sev] > 0 && (
                <span
                  key={sev}
                  className={`rounded-full px-2.5 py-1 text-xs font-semibold ${SEVERITY_STYLES[sev]}`}
                >
                  {severityCounts[sev]}{' '}
                  {sev.charAt(0) +
                    sev.slice(1).toLowerCase()}
                </span>
              )
          )}
        </div>
      </div>

      {observations.length === 0 ? (
        <div className="rounded-xl border border-line bg-surface px-6 py-16 text-center shadow-xs">
          <p className="text-sm text-ink2-secondary">
            No observations were recorded on this audit.
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {observations.map((obs) => {
            const evidence =
              evidenceByObservation[obs.id] || []

            return (
              <div
                key={obs.id}
                className="rounded-xl border border-line bg-surface p-5 shadow-xs"
              >
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-semibold text-ink2">
                      {obs.observation_number}
                    </span>

                    <ObservationTypeBadge type={obs.observation_type} />

                    <SeverityBadge
                      severity={obs.severity}
                    />

                    <ObsStatusBadge
                      status={obs.status}
                    />
                  </div>

                  <span className="text-xs text-ink2-muted">
                    Logged {formatDateTime(obs.created_at)}
                  </span>
                </div>

                <div className="mt-3 grid grid-cols-2 gap-4 text-sm sm:grid-cols-4">
                  <InfoField
                    label="Audit Type"
                    value={obs.observation_type === 'GEMBA' ? 'Gemba' : obs.observation_type === 'SAFETY' ? 'Safety' : '5S'}
                  />

                  <InfoField
                    label="5S Category"
                    value={obs.category?.name || '—'}
                  />

                  <InfoField
                    label="Location"
                    value={obs.location}
                  />

                  <InfoField
                    label="Target Date"
                    value={formatDate(obs.target_date)}
                  />

                  <InfoField
                    label="Logged By"
                    value={obs.creator?.full_name}
                  />
                </div>

                {obs.details && Object.keys(obs.details).length > 0 && (
                  <div className="mt-4 rounded-lg border border-line bg-canvas p-4">
                    <div className="mb-2 text-xs font-semibold uppercase tracking-wide text-ink2-muted">Type-specific Details</div>
                    <div className="grid gap-3 sm:grid-cols-2">
                      {Object.entries(obs.details).filter(([, value]) => value !== null && value !== undefined && String(value).trim() !== '').map(([key, value]) => (
                        <InfoField
                          key={key}
                          label={key.replaceAll('_', ' ')}
                          value={String(value)}
                        />
                      ))}
                    </div>
                  </div>
                )}

                <div className="mt-4 grid gap-4 sm:grid-cols-2">
                  <InfoField
                    label="Observation"
                    value={obs.description}
                  />

                  <InfoField
                    label="Corrective Action"
                    value={obs.corrective_action}
                  />
                </div>

                {evidence.length > 0 && (
                  <div className="mt-4 border-t border-line pt-4">
                    <div className="mb-2 text-xs font-semibold uppercase tracking-wide text-ink2-muted">
                      Evidence ({evidence.length})
                    </div>

                    <div className="flex flex-wrap gap-2">
                      {evidence.map((ev, idx) => (
                        <button
                          key={ev.id}
                          type="button"
                          className="h-20 w-20 overflow-hidden rounded-md border border-line"
                          onClick={() =>
                            setLightbox({
                              images: evidence.map(
                                (e) => ({
                                  url: e.url,
                                  name:
                                    e.original_filename,
                                })
                              ),
                              index: idx,
                            })
                          }
                        >
                          <img
                            src={ev.url}
                            alt={ev.original_filename}
                            className="h-full w-full object-cover"
                          />
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )
          })}
        </div>
      )}

      <Pagination
        page={observationPage}
        pageSize={OBSERVATION_PAGE_SIZE}
        total={observationTotal}
        onPageChange={setObservationPage}
        disabled={isLoading}
        className="mt-4 rounded-xl border border-line bg-surface"
      />

      {lightbox && (
        <EvidenceLightbox
          images={lightbox.images}
          index={lightbox.index}
          onClose={() => setLightbox(null)}
          onPrevious={() =>
            setLightbox((prev) => ({
              ...prev,
              index:
                (prev.index -
                  1 +
                  prev.images.length) %
                prev.images.length,
            }))
          }
          onNext={() =>
            setLightbox((prev) => ({
              ...prev,
              index:
                (prev.index + 1) %
                prev.images.length,
            }))
          }
        />
      )}
    </div>
  )
}