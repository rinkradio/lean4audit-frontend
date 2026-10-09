import { useCallback, useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'

import AuditStatusBadge from '../../components/AuditStatusBadge'
import FiveSProgress from '../../components/FiveSProgress'
import ConfirmDialog from '../../components/ConfirmDialog'
import FormField from '../../components/FormField'

import { useToast } from '../../hooks/useToast'

import {
  fetchAudit,
  updateAudit,
  submitAudit,
} from '../../services/auditService'

import {
  fetchObservations,
  deleteObservation,
} from '../../services/observationService'

import {
  fetchObservationEvidence,
  fetchObservationEvidenceFile,
  uploadObservationEvidence,
  deleteObservationEvidence,
} from '../../services/evidenceService'

import EvidenceLightbox from '../../components/EvidenceLightbox'
import AuditAchievementModal from '../../components/AuditAchievementModal'
import Pagination from '../../components/Pagination'
import ObservationTypeBadge from '../../components/ObservationTypeBadge'


// ---------------------------------------------------------
// HELPERS
// ---------------------------------------------------------

function formatDate(value) {
  if (!value) return '—'

  return new Date(value).toLocaleDateString('en-GB', {
    day: '2-digit',
    month: 'long',
    year: 'numeric',
  })
}


function normalizeDate(value) {
  if (!value) return ''

  if (typeof value === 'string') {
    return value.slice(0, 10)
  }

  return ''
}


function getSeverityLabel(severity) {
  if (!severity) return '—'

  return (
    severity.charAt(0) +
    severity.slice(1).toLowerCase()
  )
}


// ---------------------------------------------------------
// PAGE
// ---------------------------------------------------------

export default function AuditWorkspacePage() {
  const { auditId } = useParams()
  const navigate = useNavigate()
  const { showToast } = useToast()


  // ---------------------------------------------------------
  // AUDIT STATE
  // ---------------------------------------------------------

  const [audit, setAudit] = useState(null)

  const [observations, setObservations] =
    useState([])

  const [observationPage, setObservationPage] =
    useState(1)

  const [observationTotal, setObservationTotal] =
    useState(0)

  const OBSERVATION_PAGE_SIZE = 10

  // ---------------------------------------------------------
  // EVIDENCE PREVIEW STATE
  // ---------------------------------------------------------

  const [
    evidencePreviewUrls,
    setEvidencePreviewUrls,
  ] = useState({})


  // ---------------------------------------------------------
  // CLEANUP EVIDENCE PREVIEW URLS
  // ---------------------------------------------------------

  useEffect(() => {
    return () => {
      Object.values(
        evidencePreviewUrls
      ).forEach((url) => {
        if (url) {
          URL.revokeObjectURL(url)
        }
      })
    }
  }, [evidencePreviewUrls])



  // ---------------------------------------------------------
  // LOADING STATE
  // ---------------------------------------------------------

  const [isLoading, setIsLoading] =
    useState(true)

  const [
    isLoadingObservations,
    setIsLoadingObservations,
  ] = useState(true)

  const [loadError, setLoadError] =
    useState(false)


  // ---------------------------------------------------------
  // AUDIT EDITING
  // ---------------------------------------------------------

  const [isEditing, setIsEditing] =
    useState(false)

  const [auditDate, setAuditDate] =
    useState('')

  const [zoneLeader, setZoneLeader] =
    useState('')

  const [hod, setHod] =
    useState('')

  const [editErrors, setEditErrors] =
    useState({})

  const [isSaving, setIsSaving] =
    useState(false)


  // ---------------------------------------------------------
  // SUBMIT STATE
  // ---------------------------------------------------------

  const [
    showSubmitConfirm,
    setShowSubmitConfirm,
  ] = useState(false)

  const [isSubmitting, setIsSubmitting] =
    useState(false)

  const [showAuditAchievement, setShowAuditAchievement] =
    useState(false)


  // ---------------------------------------------------------
  // OBSERVATION DELETE
  // ---------------------------------------------------------

  const [
    isDeletingObservation,
    setIsDeletingObservation,
  ] = useState(false)


  // ---------------------------------------------------------
  // EVIDENCE STATE
  // ---------------------------------------------------------

  const [
    observationEvidence,
    setObservationEvidence,
  ] = useState({})

  const [
    uploadingEvidence,
    setUploadingEvidence,
  ] = useState({})

  const [
    deletingEvidence,
    setDeletingEvidence,
  ] = useState({})

  // ---------------------------------------------------------
  // EVIDENCE LIGHTBOX STATE
  // ---------------------------------------------------------

  const [lightboxImages, setLightboxImages] =
    useState([])

  const [lightboxIndex, setLightboxIndex] =
    useState(0)


  // ---------------------------------------------------------
  // LOAD AUDIT
  // ---------------------------------------------------------

  const loadAudit = useCallback(async () => {
    setIsLoading(true)
    setLoadError(false)

    try {
      const data = await fetchAudit(auditId)

      setAudit(data)

      setAuditDate(
        normalizeDate(data.audit_date)
      )

      setZoneLeader(
        data.zone_leader || ''
      )

      setHod(
        data.hod || ''
      )
    } catch (err) {
      console.error(
        'Failed to load audit:',
        err
      )

      setLoadError(true)
    } finally {
      setIsLoading(false)
    }
  }, [auditId])


  // ---------------------------------------------------------
  // LOAD EVIDENCE
  // ---------------------------------------------------------

  const loadObservationEvidence = useCallback(
    async (observationId) => {
      try {
        const data =
          await fetchObservationEvidence(
            observationId
          )

        const items =
          Array.isArray(data)
            ? data
            : []

        setObservationEvidence(
          (current) => ({
            ...current,
            [observationId]: items,
          })
        )

        const previewEntries =
          await Promise.all(
            items.map(
              async (item) => {
                try {
                  const url =
                    await fetchObservationEvidenceFile(
                      item.id
                    )

                  return [
                    item.id,
                    url,
                  ]
                } catch (err) {
                  console.error(
                    `Failed to load evidence file ${item.id}:`,
                    err
                  )

                  return [
                    item.id,
                    null,
                  ]
                }
              }
            )
          )

        setEvidencePreviewUrls(
          (current) => ({
            ...current,
            ...Object.fromEntries(
              previewEntries
            ),
          })
        )
      } catch (err) {
        console.error(
          'Failed to load observation evidence:',
          err
        )

        showToast(
          err.response?.data?.detail ||
            'Unable to load observation evidence.',
          'error'
        )
      }
    },
    [showToast]
  )


  // ---------------------------------------------------------
  // LOAD OBSERVATIONS
  // ---------------------------------------------------------

  const loadObservations = useCallback(
    async () => {
      setIsLoadingObservations(true)

      try {
        const data =
          await fetchObservations(auditId, {
            page: observationPage,
            pageSize: OBSERVATION_PAGE_SIZE,
          })

        const observationItems =
          Array.isArray(data)
            ? data
            : data?.items || []

        setObservations(
          observationItems
        )
        setObservationTotal(
          Number(data?.total || observationItems.length || 0)
        )

        // Load evidence for every observation.
        await Promise.all(
          observationItems.map(
            (observation) =>
              loadObservationEvidence(
                observation.id
              )
          )
        )
      } catch (err) {
        console.error(
          'Failed to load observations:',
          err
        )

        showToast(
          err.response?.data?.detail ||
            'Unable to load observations.',
          'error'
        )

        setObservations([])
      } finally {
        setIsLoadingObservations(false)
      }
    },
    [
      auditId,
      observationPage,
      loadObservationEvidence,
      showToast,
    ]
  )


  // ---------------------------------------------------------
  // INITIAL LOAD
  // ---------------------------------------------------------

  useEffect(() => {
    loadAudit()
    loadObservations()
  }, [
    loadAudit,
    loadObservations,
  ])


  // ---------------------------------------------------------
  // EDIT AUDIT
  // ---------------------------------------------------------

  function startEditing() {
    setAuditDate(
      normalizeDate(audit.audit_date)
    )

    setZoneLeader(
      audit.zone_leader || ''
    )

    setHod(
      audit.hod || ''
    )

    setEditErrors({})
    setIsEditing(true)
  }


  function cancelEditing() {
    setAuditDate(
      normalizeDate(audit.audit_date)
    )

    setZoneLeader(
      audit.zone_leader || ''
    )

    setHod(
      audit.hod || ''
    )

    setEditErrors({})
    setIsEditing(false)
  }


  // ---------------------------------------------------------
  // SAVE AUDIT
  // ---------------------------------------------------------

  async function handleSaveAndContinue() {
    const nextErrors = {}

    if (!auditDate) {
      nextErrors.auditDate =
        'Audit date is required.'
    }

    if (!hod.trim()) {
      nextErrors.hod =
        'HOD is required.'
    }

    setEditErrors(nextErrors)

    if (
      Object.keys(nextErrors).length > 0
    ) {
      return
    }

    setIsSaving(true)

    try {
      const updated =
        await updateAudit(
          auditId,
          {
            audit_date: auditDate,
            hod: hod.trim(),
          }
        )

      setAudit(updated)

      setAuditDate(
        normalizeDate(
          updated.audit_date
        )
      )

      setZoneLeader(
        updated.zone_leader || ''
      )

      setHod(
        updated.hod || ''
      )

      setIsEditing(false)
      setEditErrors({})

      showToast(
        'Audit saved successfully.'
      )
    } catch (err) {
      console.error(
        'Failed to save audit:',
        err
      )

      showToast(
        err.response?.data?.detail ||
          'Unable to save audit. Please try again.',
        'error'
      )
    } finally {
      setIsSaving(false)
    }
  }


  // ---------------------------------------------------------
  // DELETE OBSERVATION
  // ---------------------------------------------------------

  async function handleDeleteObservation(
    observationId
  ) {
    if (isDeletingObservation) {
      return
    }

    const confirmed =
      window.confirm(
        'Are you sure you want to delete this observation? This action cannot be undone.'
      )

    if (!confirmed) {
      return
    }

    setIsDeletingObservation(true)

    try {
      await deleteObservation(
        observationId
      )

      showToast(
        'Observation deleted successfully.'
      )

      await loadObservations()
    } catch (err) {
      console.error(
        'Failed to delete observation:',
        err
      )

      showToast(
        err.response?.data?.detail ||
          'Unable to delete observation.',
        'error'
      )
    } finally {
      setIsDeletingObservation(false)
    }
  }


  // ---------------------------------------------------------
  // UPLOAD EVIDENCE
  // ---------------------------------------------------------

  async function handleEvidenceUpload(
    observationId,
    event
  ) {
    const files = Array.from(
      event.target.files || []
    )

    if (files.length === 0) {
      return
    }

    const allowedTypes = [
      'image/jpeg',
      'image/png',
      'image/webp',
    ]

    const invalidFile =
      files.find(
        (file) =>
          !allowedTypes.includes(
            file.type
          )
      )

    if (invalidFile) {
      showToast(
        'Only JPG, PNG and WEBP images are allowed.',
        'error'
      )

      event.target.value = ''
      return
    }

    const oversizedFile =
      files.find(
        (file) =>
          file.size >
          10 * 1024 * 1024
      )

    if (oversizedFile) {
      showToast(
        'Each image must not exceed 10 MB.',
        'error'
      )

      event.target.value = ''
      return
    }

    setUploadingEvidence(
      (current) => ({
        ...current,
        [observationId]: true,
      })
    )

    try {
      for (const file of files) {
        await uploadObservationEvidence(
          observationId,
          file
        )
      }

      showToast(
        files.length === 1
          ? 'Evidence uploaded successfully.'
          : 'Evidence photos uploaded successfully.'
      )

      await loadObservationEvidence(
        observationId
      )
    } catch (err) {
      console.error(
        'Failed to upload evidence:',
        err
      )

      showToast(
        err.response?.data?.detail ||
          'Unable to upload evidence.',
        'error'
      )
    } finally {
      setUploadingEvidence(
        (current) => ({
          ...current,
          [observationId]: false,
        })
      )

      event.target.value = ''
    }
  }


  // ---------------------------------------------------------
  // DELETE EVIDENCE
  // ---------------------------------------------------------

  async function handleDeleteEvidence(
    evidenceId,
    observationId
  ) {
    if (
      deletingEvidence[evidenceId]
    ) {
      return
    }

    const confirmed =
      window.confirm(
        'Delete this evidence photo?'
      )

    if (!confirmed) {
      return
    }

    setDeletingEvidence(
      (current) => ({
        ...current,
        [evidenceId]: true,
      })
    )

    try {
      await deleteObservationEvidence(
        evidenceId
      )

      showToast(
        'Evidence deleted successfully.'
      )

      await loadObservationEvidence(
        observationId
      )
    } catch (err) {
      console.error(
        'Failed to delete evidence:',
        err
      )

      showToast(
        err.response?.data?.detail ||
          'Unable to delete evidence.',
        'error'
      )
    } finally {
      setDeletingEvidence(
        (current) => ({
          ...current,
          [evidenceId]: false,
        })
      )
    }
  }


  // ---------------------------------------------------------
  // EVIDENCE LIGHTBOX
  // ---------------------------------------------------------

  function openEvidenceLightbox(
    evidenceItems,
    selectedEvidenceId
  ) {
    const images = evidenceItems
      .map((item) => ({
        id: item.id,
        url: evidencePreviewUrls[item.id],
        name: item.file_name,
      }))
      .filter((item) => item.url)

    const selectedIndex = Math.max(
      0,
      images.findIndex(
        (item) => item.id === selectedEvidenceId
      )
    )

    setLightboxImages(images)
    setLightboxIndex(selectedIndex)
  }

  function closeEvidenceLightbox() {
    setLightboxImages([])
    setLightboxIndex(0)
  }

  function showPreviousEvidence() {
    setLightboxIndex((current) =>
      lightboxImages.length === 0
        ? 0
        : (current - 1 + lightboxImages.length) % lightboxImages.length
    )
  }

  function showNextEvidence() {
    setLightboxIndex((current) =>
      lightboxImages.length === 0
        ? 0
        : (current + 1) % lightboxImages.length
    )
  }


  // ---------------------------------------------------------
  // SUBMIT AUDIT
  // ---------------------------------------------------------

  async function handleConfirmSubmit() {
    setIsSubmitting(true)

    try {
      const updated =
        await submitAudit(auditId)

      setAudit(updated)

      setShowSubmitConfirm(false)
      setIsEditing(false)

      showToast(
        'Audit submitted successfully.'
      )

      setShowAuditAchievement(true)
    } catch (err) {
      console.error(
        'Failed to submit audit:',
        err
      )

      showToast(
        err.response?.data?.detail ||
          'Unable to submit audit. Please try again.',
        'error'
      )
    } finally {
      setIsSubmitting(false)
    }
  }


  // ---------------------------------------------------------
  // LOADING
  // ---------------------------------------------------------

  if (isLoading) {
    return (
      <div className="mx-auto max-w-4xl space-y-4">

        <div className="skeleton h-5 w-32 rounded" />

        <div className="skeleton h-8 w-64 rounded" />

        <div className="skeleton h-40 rounded-xl" />

        <div className="skeleton h-48 rounded-xl" />

      </div>
    )
  }


  // ---------------------------------------------------------
  // ERROR
  // ---------------------------------------------------------

  if (loadError || !audit) {
    return (
      <div className="mx-auto flex max-w-md flex-col items-center px-4 py-20 text-center">

        <h1 className="text-lg font-semibold text-ink2">
          Unable to load this audit.
        </h1>

        <p className="mt-2 text-sm text-ink2-secondary">
          The audit may not exist or you may not have permission
          to access it.
        </p>

        <button
          className="mt-6 rounded-md border border-line-strong px-4 py-2.5 text-sm font-semibold text-ink2 transition-colors hover:bg-canvas"
          onClick={() =>
            navigate('/consultant/audits')
          }
        >
          Back to My Audits
        </button>

      </div>
    )
  }


  const isSubmitted =
    audit.status === 'SUBMITTED'


  // ---------------------------------------------------------
  // OBSERVATION COUNTS
  // ---------------------------------------------------------

  const totalObservations =
    observations.length

  const highObservations =
    observations.filter(
      (observation) =>
        observation.severity === 'HIGH'
    ).length

  const mediumObservations =
    observations.filter(
      (observation) =>
        observation.severity === 'MEDIUM'
    ).length

  const lowObservations =
    observations.filter(
      (observation) =>
        observation.severity === 'LOW'
    ).length


  // ---------------------------------------------------------
  // AUDIT INFORMATION
  // ---------------------------------------------------------

  const infoRows = [
    {
      label: 'Zone',
      value:
        audit.zone?.name || '—',
    },
    {
      label: 'Auditor',
      value:
        audit.auditor?.full_name || '—',
    },
  ]


  // ---------------------------------------------------------
  // RENDER
  // ---------------------------------------------------------

  return (
    <div className="mx-auto max-w-4xl animate-fade-in">

      {/* -------------------------------------------------
          BACK
      ------------------------------------------------- */}

      <button
        onClick={() =>
          navigate(
            '/consultant/audits'
          )
        }
        className="text-sm font-medium text-ink2-secondary hover:text-ink2"
      >
        &larr; Back to My Audits
      </button>


      {/* -------------------------------------------------
          HEADER
      ------------------------------------------------- */}

      <div className="mt-3 flex flex-wrap items-center justify-between gap-3">

        <div>

          <div className="text-xs font-semibold uppercase tracking-wider text-ink2-muted">
            5S Audit
          </div>

          <h1 className="text-xl font-bold text-ink2 sm:text-2xl">
            {audit.audit_number}
          </h1>

        </div>

        <AuditStatusBadge
          status={audit.status}
        />

      </div>


      {/* -------------------------------------------------
          SUBMITTED NOTICE
      ------------------------------------------------- */}

      {isSubmitted && (
        <div className="mt-4 rounded-lg border border-success/25 bg-success-soft px-4 py-3 text-sm text-success">
          This audit has been submitted and is now read-only.
        </div>
      )}


      {/* -------------------------------------------------
          PRIMARY OBSERVATION ACTION
      ------------------------------------------------- */}

      <div className="mt-5 overflow-hidden rounded-xl border border-brand/20 bg-brand-soft shadow-xs">
        <div className="flex flex-col gap-4 p-5 sm:flex-row sm:items-center sm:justify-between sm:p-6">
          <div className="flex items-start gap-3.5">
            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-white text-brand shadow-sm ring-1 ring-brand/10">
              <svg
                width="22"
                height="22"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                aria-hidden="true"
              >
                <path d="M12 5v14M5 12h14" />
              </svg>
            </div>

            <div>
              <div className="text-xs font-semibold uppercase tracking-[0.14em] text-brand">
                Required Audit Action
              </div>
              <h2 className="mt-1 text-base font-bold text-ink2 sm:text-lg">
                Add Observation
              </h2>
              <p className="mt-1 text-sm leading-5 text-ink2-secondary">
                Record a finding as soon as you identify an issue during the audit walk.
              </p>
            </div>
          </div>

          <button
            type="button"
            disabled={isSubmitted}
            onClick={() =>
              navigate(
                `/consultant/audits/${audit.id}/observations/new`
              )
            }
            className="inline-flex min-h-11 w-full items-center justify-center gap-2 rounded-lg bg-white px-5 py-2.5 text-sm font-bold text-brand shadow-sm ring-1 ring-brand/20 transition hover:-translate-y-0.5 hover:bg-white hover:shadow-md disabled:cursor-not-allowed disabled:opacity-50 sm:w-auto"
          >
            <span className="text-lg leading-none">+</span>
            Add Observation
          </button>
        </div>
      </div>


      {/* -------------------------------------------------
          AUDIT INFORMATION
      ------------------------------------------------- */}

      <div className="mt-6 rounded-xl border border-line bg-surface p-6 shadow-xs">

        <div className="flex flex-wrap items-center justify-between gap-3">

          <h2 className="text-xs font-semibold uppercase tracking-wider text-ink2-muted">
            Audit Information
          </h2>

          {!isSubmitted &&
            !isEditing && (
              <button
                type="button"
                onClick={startEditing}
                className="rounded-md border border-line-strong px-3 py-2 text-xs font-semibold text-ink2 transition-colors hover:bg-canvas"
              >
                Edit Details
              </button>
            )}

        </div>


        {!isEditing ? (

          <dl className="mt-4 grid gap-4 sm:grid-cols-2">

            {infoRows.map((row) => (
              <div key={row.label}>

                <dt className="text-xs font-medium text-ink2-muted">
                  {row.label}
                </dt>

                <dd className="mt-0.5 text-sm font-semibold text-ink2">
                  {row.value}
                </dd>

              </div>
            ))}


            <div>

              <dt className="text-xs font-medium text-ink2-muted">
                Audit Date
              </dt>

              <dd className="mt-0.5 text-sm font-semibold text-ink2">
                {formatDate(
                  audit.audit_date
                )}
              </dd>

            </div>


            <div>

              <dt className="text-xs font-medium text-ink2-muted">
                Zone Leader
              </dt>

              <dd className="mt-0.5 text-sm font-semibold text-ink2">
                {audit.zone_leader ||
                  '—'}
              </dd>

            </div>


            <div>

              <dt className="text-xs font-medium text-ink2-muted">
                HOD
              </dt>

              <dd className="mt-0.5 text-sm font-semibold text-ink2">
                {audit.hod || '—'}
              </dd>

            </div>

          </dl>

        ) : (

          <div className="mt-4">

            <div className="mb-4">

              <label className="mb-1.5 block text-sm font-medium text-ink2-secondary">
                Zone
              </label>

              <div className="rounded-md border border-line bg-canvas px-3.5 py-2.5 text-sm text-ink2-muted">
                {audit.zone?.name ||
                  '—'}
              </div>

            </div>


            <div className="mb-4">

              <label className="mb-1.5 block text-sm font-medium text-ink2-secondary">
                Auditor
              </label>

              <div className="rounded-md border border-line bg-canvas px-3.5 py-2.5 text-sm text-ink2-muted">
                {audit.auditor?.full_name ||
                  '—'}
              </div>

            </div>


            <FormField
              id="workspace-audit-date"
              label="Audit Date"
              type="date"
              value={auditDate}
              onChange={(e) =>
                setAuditDate(
                  e.target.value
                )
              }
              error={
                editErrors.auditDate
              }
            />


            <div className="mb-4">
              <label className="mb-1.5 block text-sm font-medium text-ink2-secondary">
                Zone Leader
              </label>

              <div className="rounded-md border border-line bg-canvas px-3.5 py-2.5 text-sm text-ink2">
                {audit.zone_leader || '—'}
                <div className="mt-0.5 text-xs text-ink2-muted">
                  Automatically assigned from the Zone
                </div>
              </div>
            </div>


            <FormField
              id="workspace-hod"
              label="HOD"
              value={hod}
              onChange={(e) =>
                setHod(
                  e.target.value
                )
              }
              placeholder="e.g. Suresh Kumar"
              error={editErrors.hod}
            />


            <div className="mt-2 flex flex-col gap-2 sm:flex-row">

              <button
                type="button"
                disabled={isSaving}
                onClick={
                  handleSaveAndContinue
                }
                className="rounded-md bg-brand px-4 py-2.5 text-sm font-semibold text-white shadow-xs transition-colors hover:bg-brand-hover disabled:cursor-not-allowed disabled:opacity-60"
              >
                {isSaving
                  ? 'Saving…'
                  : 'Save & Continue'}
              </button>


              <button
                type="button"
                disabled={isSaving}
                onClick={cancelEditing}
                className="rounded-md border border-line-strong px-4 py-2.5 text-sm font-semibold text-ink2 transition-colors hover:bg-canvas disabled:cursor-not-allowed disabled:opacity-60"
              >
                Cancel
              </button>

            </div>

          </div>

        )}

      </div>


      {/* -------------------------------------------------
          5S PROGRESS
      ------------------------------------------------- */}

      <div className="mt-5 rounded-xl border border-line bg-surface p-6 shadow-xs">

        <h2 className="text-xs font-semibold uppercase tracking-wider text-ink2-muted">
          5S Progress
        </h2>

        <div className="mt-4">
          <FiveSProgress />
        </div>

      </div>


      {/* -------------------------------------------------
          OBSERVATIONS
      ------------------------------------------------- */}

      <div className="mt-5 rounded-xl border border-line bg-surface p-6 shadow-xs">

        <div className="flex items-center justify-between">

          <h2 className="text-xs font-semibold uppercase tracking-wider text-ink2-muted">
            Observations
          </h2>

          <span className="text-lg font-bold text-ink2">
            {totalObservations}
          </span>

        </div>


        {/* -------------------------------------------------
            SEVERITY SUMMARY
        ------------------------------------------------- */}

        <div className="mt-4 grid grid-cols-3 gap-3">

          <div className="rounded-lg border border-line bg-canvas px-4 py-3">

            <div className="text-xs font-medium uppercase tracking-wide text-ink2-muted">
              High
            </div>

            <div className="mt-1 text-lg font-bold text-ink2">
              {highObservations}
            </div>

          </div>


          <div className="rounded-lg border border-line bg-canvas px-4 py-3">

            <div className="text-xs font-medium uppercase tracking-wide text-ink2-muted">
              Medium
            </div>

            <div className="mt-1 text-lg font-bold text-ink2">
              {mediumObservations}
            </div>

          </div>


          <div className="rounded-lg border border-line bg-canvas px-4 py-3">

            <div className="text-xs font-medium uppercase tracking-wide text-ink2-muted">
              Low
            </div>

            <div className="mt-1 text-lg font-bold text-ink2">
              {lowObservations}
            </div>

          </div>

        </div>


        {/* -------------------------------------------------
            OBSERVATION LIST
        ------------------------------------------------- */}

        {isLoadingObservations ? (

          <div className="mt-5 space-y-3">

            <div className="skeleton h-24 rounded-lg" />

            <div className="skeleton h-24 rounded-lg" />

          </div>

        ) : observations.length === 0 ? (

          <div className="mt-5 rounded-lg border border-dashed border-line-strong px-4 py-8 text-center">

            <p className="text-sm font-medium text-ink2-secondary">
              No observations added yet.
            </p>

          </div>

        ) : (

          <div className="mt-5 space-y-3">

            {observations.map(
              (observation) => {

                const evidence =
                  observationEvidence[
                    observation.id
                  ] || []

                return (

                  <div
                    key={observation.id}
                    className="rounded-lg border border-line bg-canvas p-4"
                  >

                    {/* -------------------------------------------------
                        OBSERVATION HEADER
                    ------------------------------------------------- */}

                    <div className="flex flex-wrap items-start justify-between gap-3">

                      <div>

                        <div className="flex flex-wrap items-center gap-2">
                          <div className="text-xs font-semibold uppercase tracking-wide text-ink2-muted">
                            {observation.observation_number || 'Observation'}
                          </div>
                          <ObservationTypeBadge type={observation.observation_type} />
                        </div>

                        <div className="mt-1 text-sm font-semibold text-ink2">

                          {observation.category?.code
                            ? `${observation.category.code} — `
                            : ''}

                          {observation.category?.name || (observation.observation_type === 'GEMBA' ? 'Gemba Observation' : observation.observation_type === 'SAFETY' ? 'Safety Observation' : '5S Category')}

                        </div>

                      </div>


                      <div className="flex flex-wrap items-center gap-2">

                        <span className="rounded-full border border-line-strong px-2.5 py-1 text-xs font-semibold text-ink2">
                          {getSeverityLabel(
                            observation.severity
                          )}
                        </span>


                        {/* Edit */}

                        {!isSubmitted && (
                          <button
                            type="button"
                            onClick={() =>
                              navigate(
                                `/consultant/audits/${audit.id}/observations/${observation.id}/edit`
                              )
                            }
                            className="rounded-md border border-line-strong px-2.5 py-1 text-xs font-semibold text-ink2 transition-colors hover:bg-surface"
                          >
                            Edit
                          </button>
                        )}


                        {/* Delete */}

                        {!isSubmitted && (
                          <button
                            type="button"
                            disabled={
                              isDeletingObservation
                            }
                            onClick={() =>
                              handleDeleteObservation(
                                observation.id
                              )
                            }
                            className="rounded-md border border-danger/30 px-2.5 py-1 text-xs font-semibold text-danger transition-colors hover:bg-danger-soft disabled:cursor-not-allowed disabled:opacity-50"
                          >
                            {isDeletingObservation
                              ? 'Deleting…'
                              : 'Delete'}
                          </button>
                        )}

                      </div>

                    </div>


                    {/* -------------------------------------------------
                        DESCRIPTION
                    ------------------------------------------------- */}

                    <div className="mt-3">

                      <div className="text-xs font-medium text-ink2-muted">
                        Description
                      </div>

                      <p className="mt-1 text-sm text-ink2-secondary">
                        {observation.description}
                      </p>

                    </div>


                    {/* -------------------------------------------------
                        CORRECTIVE ACTION
                    ------------------------------------------------- */}

                    <div className="mt-3">

                      <div className="text-xs font-medium text-ink2-muted">
                        Corrective Action
                      </div>

                      <p className="mt-1 text-sm text-ink2-secondary">
                        {observation.corrective_action}
                      </p>

                    </div>


                    {/* -------------------------------------------------
                        LOCATION
                    ------------------------------------------------- */}

                 {observation.location && (
  <div className="mt-3">
    <div className="text-xs font-medium text-ink2-muted">
      Location
    </div>

    <p className="mt-1 text-sm text-ink2-secondary">
      {observation.location}
    </p>
  </div>
)}


                    {/* -------------------------------------------------
                        STATUS / TARGET
                    ------------------------------------------------- */}

                    <div className="mt-3 flex flex-wrap gap-x-6 gap-y-2 text-xs text-ink2-muted">

                      <span>
                        Status:{' '}
                        <strong className="text-ink2">
                          {observation.status ||
                            'OPEN'}
                        </strong>
                      </span>

                      {observation.target_date && (
                        <span>
                          Target:{' '}
                          <strong className="text-ink2">
                            {formatDate(
                              observation.target_date
                            )}
                          </strong>
                        </span>
                      )}

                    </div>


                    {/* -------------------------------------------------
                        EVIDENCE
                    ------------------------------------------------- */}

                    <div className="mt-4 border-t border-line pt-4">

                      <div className="flex flex-wrap items-center justify-between gap-3">

                        <div>

                          <div className="text-xs font-semibold uppercase tracking-wide text-ink2-muted">
                            Evidence
                          </div>

                          <p className="mt-0.5 text-xs text-ink2-muted">
                            Photos showing the observation
                            or corrective action.
                          </p>

                        </div>


                        {!isSubmitted && (
                          <div className="flex flex-wrap gap-2">
                            <label
                              className={`cursor-pointer rounded-md border border-line-strong px-3 py-2 text-xs font-semibold text-ink2 transition-colors hover:bg-surface ${
                                uploadingEvidence[observation.id]
                                  ? 'pointer-events-none opacity-50'
                                  : ''
                              }`}
                            >
                              {uploadingEvidence[observation.id]
                                ? 'Uploading…'
                                : '+ Add Photo'}
                              <input
                                type="file"
                                accept="image/jpeg,image/png,image/webp"
                                multiple
                                className="hidden"
                                disabled={uploadingEvidence[observation.id]}
                                onChange={(event) =>
                                  handleEvidenceUpload(observation.id, event)
                                }
                              />
                            </label>

                            <label
                              className={`cursor-pointer rounded-md border border-brand/40 bg-brand/5 px-3 py-2 text-xs font-semibold text-brand transition-colors hover:bg-brand/10 ${
                                uploadingEvidence[observation.id]
                                  ? 'pointer-events-none opacity-50'
                                  : ''
                              }`}
                            >
                              Take Photo
                              <input
                                type="file"
                                accept="image/*"
                                capture="environment"
                                className="hidden"
                                disabled={uploadingEvidence[observation.id]}
                                onChange={(event) =>
                                  handleEvidenceUpload(observation.id, event)
                                }
                              />
                            </label>
                          </div>
                        )}

                      </div>


                      {/* -------------------------------------------------
                          EVIDENCE LIST
                      ------------------------------------------------- */}

                      <div className="mt-3">

                        {evidence.length === 0 ? (

                          <div className="rounded-lg border border-dashed border-line-strong px-4 py-5 text-center">

                            <p className="text-xs text-ink2-muted">
                              No evidence photos uploaded.
                            </p>

                          </div>

                        ) : (

                          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">

                            {evidence.map((item) => {

                              const previewUrl =
                                evidencePreviewUrls[
                                  item.id
                                ]

                              return (

                                <div
                                  key={item.id}
                                  className="group relative overflow-hidden rounded-lg border border-line bg-surface"
                                >

                                  {previewUrl ? (

                                    <button
                                      type="button"
                                      onClick={() =>
                                        openEvidenceLightbox(
                                          evidence,
                                          item.id
                                        )
                                      }
                                      className="block aspect-square w-full cursor-zoom-in text-left"
                                      aria-label={`Open ${item.file_name || 'evidence photo'}`}
                                    >

                                      <img
                                        src={previewUrl}
                                        alt={
                                          item.file_name ||
                                          'Observation evidence'
                                        }
                                        className="h-full w-full object-cover transition-transform duration-200 group-hover:scale-105"
                                      />

                                    </button>

                                  ) : (

                                    <div className="flex aspect-square items-center justify-center">

                                      <span className="text-xs text-ink2-muted">
                                        Loading…
                                      </span>

                                    </div>

                                  )}

                                  {!isSubmitted && (
                                    <button
                                      type="button"
                                      disabled={
                                        deletingEvidence[
                                          item.id
                                        ]
                                      }
                                      onClick={() =>
                                        handleDeleteEvidence(
                                          item.id,
                                          observation.id
                                        )
                                      }
                                      className="absolute right-2 top-2 rounded-md bg-black/70 px-2 py-1 text-xs font-semibold text-white backdrop-blur-sm transition-colors hover:bg-black disabled:cursor-not-allowed disabled:opacity-50"
                                    >
                                      {deletingEvidence[
                                        item.id
                                      ]
                                        ? '…'
                                        : 'Delete'}
                                    </button>
                                  )}

                                </div>

                              )
                            })}

                          </div>

                        )}

                      </div>

                    </div>

                  </div>

                )
              }
            )}

          </div>

        )}


        <Pagination
          page={observationPage}
          pageSize={OBSERVATION_PAGE_SIZE}
          total={observationTotal}
          onPageChange={setObservationPage}
          disabled={isLoadingObservations}
          className="mt-4 rounded-lg border border-line bg-surface"
        />


      </div>


      {/* -------------------------------------------------
          ACTIONS
      ------------------------------------------------- */}

      {!isSubmitted &&
        !isEditing && (

          <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:justify-end">

            <button
              className="rounded-md border border-line-strong px-5 py-3 text-sm font-semibold text-ink2 transition-colors hover:bg-canvas"
              onClick={startEditing}
            >
              Save & Continue
            </button>


            <button
              className="rounded-md bg-brand px-5 py-3 text-sm font-semibold text-white shadow-xs transition-colors hover:bg-brand-hover"
              onClick={() =>
                setShowSubmitConfirm(true)
              }
            >
              Submit Audit
            </button>

          </div>

        )}


      {/* -------------------------------------------------
          SUBMIT CONFIRMATION
      ------------------------------------------------- */}

      {showAuditAchievement && (
        <AuditAchievementModal
          auditNumber={audit?.audit_number}
          observationCount={observationTotal}
          onContinue={() => {
            setShowAuditAchievement(false)
          }}
        />
      )}

      {showSubmitConfirm && (

        <ConfirmDialog
          title="Submit Audit?"
          message={`Once submitted, ${audit.audit_number} (${audit.zone?.name || 'this zone'}) will be sent to the Principal Consultant for review. You may not be able to make further changes after submission.`}
          confirmLabel="Submit Audit"
          isSubmitting={isSubmitting}
          onCancel={() =>
            setShowSubmitConfirm(false)
          }
          onConfirm={
            handleConfirmSubmit
          }
        />

      )}

      {lightboxImages.length > 0 && (
        <EvidenceLightbox
          images={lightboxImages}
          index={lightboxIndex}
          onClose={closeEvidenceLightbox}
          onPrevious={showPreviousEvidence}
          onNext={showNextEvidence}
        />
      )}

    </div>
  )
}