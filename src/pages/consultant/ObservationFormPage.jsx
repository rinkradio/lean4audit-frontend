import { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'

import FormField from '../../components/FormField'
import ObservationSuccessModal from '../../components/ObservationSuccessModal'
import { useToast } from '../../hooks/useToast'

import {
  createObservation,
} from '../../services/observationService'

import {
  prepareEvidenceFile,
  uploadObservationEvidence,
} from '../../services/evidenceService'

import apiClient from '../../services/apiClient'


// ---------------------------------------------------------
// API ERROR MESSAGE
// ---------------------------------------------------------

function getApiErrorMessage(
  error,
  fallback = 'Unable to create observation. Please try again.'
) {
  if (error?.userMessage) return error.userMessage
  const detail = error?.response?.data?.detail

  if (typeof detail === 'string') {
    return detail
  }

  if (Array.isArray(detail)) {
    return detail
      .map((item) => {
        if (typeof item === 'string') {
          return item
        }

        if (item?.msg) {
          const location = Array.isArray(item.loc)
            ? item.loc
                .filter(
                  (part) => part !== 'body'
                )
                .join('.')
            : ''

          return location
            ? `${location}: ${item.msg}`
            : item.msg
        }

        return null
      })
      .filter(Boolean)
      .join(', ')
      || fallback
  }

  if (
    detail &&
    typeof detail === 'object'
  ) {
    return (
      detail.msg ||
      detail.message ||
      fallback
    )
  }

  if (
    typeof error?.message === 'string' &&
    error.message
  ) {
    return error.message
  }

  return fallback
}


export default function ObservationFormPage() {
  const { auditId } = useParams()
  const navigate = useNavigate()
  const { showToast } = useToast()

  const [categories, setCategories] = useState([])

  const [isLoadingCategories, setIsLoadingCategories] =
    useState(true)

  const [isSubmitting, setIsSubmitting] =
    useState(false)

  const [successObservation, setSuccessObservation] =
    useState(null)

  const [categoryId, setCategoryId] = useState('')

  // ---------------------------------------------------------
  // LOCATION
  // ---------------------------------------------------------
  //
  // Location is now a normal text input.
  //
  const [location, setLocation] = useState('')

  const [severity, setSeverity] = useState('MEDIUM')
  const [description, setDescription] = useState('')
  const [correctiveAction, setCorrectiveAction] = useState('')
  const [targetDate, setTargetDate] = useState('')


  // ---------------------------------------------------------
  // EVIDENCE
  // ---------------------------------------------------------

  const [evidenceFiles, setEvidenceFiles] = useState([])

  const [evidencePreviewUrls, setEvidencePreviewUrls] =
    useState([])

  const [isUploadingEvidence, setIsUploadingEvidence] =
    useState(false)

  const [evidenceError, setEvidenceError] =
    useState('')

  const [errors, setErrors] = useState({})


  // ---------------------------------------------------------
  // LOAD 5S CATEGORIES
  // ---------------------------------------------------------

  useEffect(() => {
    let isMounted = true

    async function loadCategories() {
      setIsLoadingCategories(true)

      try {
        const response = await apiClient.get(
          '/five-s-categories'
        )

        const data = Array.isArray(response.data)
          ? response.data
          : response.data?.items || []

        if (isMounted) {
          setCategories(data)
        }
      } catch (err) {
        console.error(
          'Failed to load 5S categories:',
          err
        )

        if (isMounted) {
          setCategories([])

          showToast(
            err.response?.data?.detail ||
              'Unable to load 5S categories.',
            'error'
          )
        }
      } finally {
        if (isMounted) {
          setIsLoadingCategories(false)
        }
      }
    }

    loadCategories()

    return () => {
      isMounted = false
    }
  }, [showToast])


  // ---------------------------------------------------------
  // EVIDENCE PREVIEW URLS
  // ---------------------------------------------------------

  useEffect(() => {
    const urls = evidenceFiles.map((file) =>
      URL.createObjectURL(file)
    )

    setEvidencePreviewUrls(urls)

    return () => {
      urls.forEach((url) => {
        URL.revokeObjectURL(url)
      })
    }
  }, [evidenceFiles])


  // ---------------------------------------------------------
  // VALIDATION
  // ---------------------------------------------------------

  function validate() {
    const nextErrors = {}

    if (!categoryId) {
      nextErrors.categoryId =
        '5S Category is required.'
    }

    // -----------------------------------------------------
    // LOCATION VALIDATION
    // -----------------------------------------------------

    if (!location.trim()) {
      nextErrors.location =
        'Location is required.'
    }

    if (location.trim().length > 255) {
      nextErrors.location =
        'Location cannot exceed 255 characters.'
    }

    if (!severity) {
      nextErrors.severity =
        'Severity is required.'
    }

    if (!description.trim()) {
      nextErrors.description =
        'Description is required.'
    }

    if (!correctiveAction.trim()) {
      nextErrors.correctiveAction =
        'Corrective Action is required.'
    }

    if (!targetDate) {
      nextErrors.targetDate =
        'Target Date is required.'
    }

    setErrors(nextErrors)

    return Object.keys(nextErrors).length === 0
  }


  // ---------------------------------------------------------
  // EVIDENCE FILE SELECTION
  // ---------------------------------------------------------

  async function handleEvidenceChange(e) {
    const selectedFiles = Array.from(e.target.files || [])
    e.target.value = ''

    if (!selectedFiles.length) return

    try {
      setEvidenceError('')
      const preparedFiles = await Promise.all(
        selectedFiles.map((file) => prepareEvidenceFile(file))
      )
      setEvidenceFiles((current) => [...current, ...preparedFiles])
    } catch (error) {
      setEvidenceError(error?.message || 'Unable to prepare this image. Please try another photo.')
    }
  }


  function removeEvidenceFile(index) {
    setEvidenceFiles((current) =>
      current.filter(
        (_, fileIndex) =>
          fileIndex !== index
      )
    )
  }


  // ---------------------------------------------------------
  // SUBMIT
  // ---------------------------------------------------------

  async function handleSubmit(e) {
    e.preventDefault()

    if (!validate()) {
      return
    }

    setIsSubmitting(true)

    try {
      const observation =
        await createObservation(
          auditId,
          {
            category_id: categoryId,

            // -------------------------------------------------
            // LOCATION IS NOW SENT AS TEXT
            // -------------------------------------------------

            location:
              location.trim(),

            severity,

            description:
              description.trim(),

            corrective_action:
              correctiveAction.trim(),

            responsible_person_id: null,

            target_date: targetDate,
          }
        )

      // The observation is saved before its evidence. Keep the success
      // state if a photo upload fails so the user does not submit a duplicate.
      let evidenceUploadFailed = false
      if (evidenceFiles.length > 0 && observation?.id) {
        setIsUploadingEvidence(true)
        try {
          for (const file of evidenceFiles) {
            await uploadObservationEvidence(observation.id, file)
          }
        } catch (uploadError) {
          evidenceUploadFailed = true
          console.error('Observation saved, but evidence upload failed:', uploadError)
          showToast(
            uploadError?.userMessage ||
              uploadError?.response?.data?.detail ||
              'Observation saved, but a photo could not be uploaded. Open the observation and retry the photo.',
            'error'
          )
        }
      }

      if (!evidenceUploadFailed) {
        showToast(
          evidenceFiles.length > 0
            ? 'Observation and evidence added successfully.'
            : 'Observation added successfully.'
        )
      }

      setSuccessObservation({
        id: observation?.id || null,
        number:
          observation?.observation_number ||
          observation?.observationNumber ||
          'Observation saved',
      })

    } catch (err) {
      console.error('Failed to create observation:', err)
      showToast(getApiErrorMessage(err), 'error')

    } finally {
      setIsUploadingEvidence(false)
      setIsSubmitting(false)
    }
  }


  function handleSuccessContinue() {
    setSuccessObservation(null)
    navigate(`/consultant/audits/${auditId}`)
  }

  return (
    <div className="mx-auto max-w-2xl animate-fade-in">

      {/* -------------------------------------------------
          BACK
      ------------------------------------------------- */}

      <button
        type="button"
        onClick={() =>
          navigate(
            `/consultant/audits/${auditId}`
          )
        }
        className="text-sm font-medium text-ink2-secondary hover:text-ink2"
      >
        &larr; Back to Audit
      </button>


      {/* -------------------------------------------------
          HEADER
      ------------------------------------------------- */}

      <div className="mt-3">

        <div className="text-xs font-semibold uppercase tracking-wider text-ink2-muted">
          5S Audit
        </div>

        <h1 className="mt-1 text-xl font-bold text-ink2 sm:text-2xl">
          Add Observation
        </h1>

        <p className="mt-1.5 text-sm text-ink2-secondary">
          Record a finding and its corrective action.
        </p>

      </div>


      {/* -------------------------------------------------
          FORM
      ------------------------------------------------- */}

      <form
        onSubmit={handleSubmit}
        className="mt-6 rounded-xl border border-line bg-surface p-6 shadow-xs"
      >

        {/* -------------------------------------------------
            5S CATEGORY
        ------------------------------------------------- */}

        <div className="mb-5">

          <label
            htmlFor="category"
            className="mb-1.5 block text-sm font-medium text-ink2-secondary"
          >
            5S Category
          </label>

          <select
            id="category"
            value={categoryId}
            onChange={(e) =>
              setCategoryId(e.target.value)
            }
            disabled={isLoadingCategories}
            className="w-full rounded-md border border-line-strong bg-surface px-3.5 py-2.5 text-sm text-ink2 outline-none transition focus:border-brand focus:ring-2 focus:ring-brand/15 disabled:cursor-not-allowed disabled:opacity-60"
          >

            <option value="">
              {isLoadingCategories
                ? 'Loading categories...'
                : categories.length === 0
                  ? 'No categories available'
                  : 'Select 5S category'}
            </option>

            {categories.map((category) => (
              <option
                key={category.id}
                value={category.id}
              >
                {category.code} — {category.name}
              </option>
            ))}

          </select>

          {errors.categoryId && (
            <p className="mt-1 text-xs text-danger">
              {errors.categoryId}
            </p>
          )}

        </div>


        {/* -------------------------------------------------
            LOCATION
        ------------------------------------------------- */}

        <div className="mb-5">

          <label
            htmlFor="location"
            className="mb-1.5 block text-sm font-medium text-ink2-secondary"
          >
            Location
          </label>

          <input
            id="location"
            type="text"
            value={location}
            onChange={(e) =>
              setLocation(e.target.value)
            }
            maxLength={255}
            placeholder="Enter location"
            className="w-full rounded-md border border-line-strong bg-surface px-3.5 py-2.5 text-sm text-ink2 outline-none transition focus:border-brand focus:ring-2 focus:ring-brand/15"
          />

          {errors.location && (
            <p className="mt-1 text-xs text-danger">
              {errors.location}
            </p>
          )}

        </div>


        {/* -------------------------------------------------
            SEVERITY
        ------------------------------------------------- */}

        <div className="mb-5">

          <label
            htmlFor="severity"
            className="mb-1.5 block text-sm font-medium text-ink2-secondary"
          >
            Severity
          </label>

          <select
            id="severity"
            value={severity}
            onChange={(e) =>
              setSeverity(e.target.value)
            }
            className="w-full rounded-md border border-line-strong bg-surface px-3.5 py-2.5 text-sm text-ink2 outline-none transition focus:border-brand focus:ring-2 focus:ring-brand/15"
          >

            <option value="LOW">
              Low
            </option>

            <option value="MEDIUM">
              Medium
            </option>

            <option value="HIGH">
              High
            </option>

          </select>

          {errors.severity && (
            <p className="mt-1 text-xs text-danger">
              {errors.severity}
            </p>
          )}

        </div>


        {/* -------------------------------------------------
            DESCRIPTION
        ------------------------------------------------- */}

        <div className="mb-5">

          <label
            htmlFor="description"
            className="mb-1.5 block text-sm font-medium text-ink2-secondary"
          >
            Description
          </label>

          <textarea
            id="description"
            value={description}
            onChange={(e) =>
              setDescription(e.target.value)
            }
            rows={4}
            placeholder="Describe the observation..."
            className="w-full resize-y rounded-md border border-line-strong bg-surface px-3.5 py-2.5 text-sm text-ink2 outline-none transition focus:border-brand focus:ring-2 focus:ring-brand/15"
          />

          {errors.description && (
            <p className="mt-1 text-xs text-danger">
              {errors.description}
            </p>
          )}

        </div>


        {/* -------------------------------------------------
            CORRECTIVE ACTION
        ------------------------------------------------- */}

        <div className="mb-5">

          <label
            htmlFor="corrective-action"
            className="mb-1.5 block text-sm font-medium text-ink2-secondary"
          >
            Corrective Action
          </label>

          <textarea
            id="corrective-action"
            value={correctiveAction}
            onChange={(e) =>
              setCorrectiveAction(
                e.target.value
              )
            }
            rows={4}
            placeholder="Describe the corrective action..."
            className="w-full resize-y rounded-md border border-line-strong bg-surface px-3.5 py-2.5 text-sm text-ink2 outline-none transition focus:border-brand focus:ring-2 focus:ring-brand/15"
          />

          {errors.correctiveAction && (
            <p className="mt-1 text-xs text-danger">
              {errors.correctiveAction}
            </p>
          )}

        </div>


        {/* -------------------------------------------------
            EVIDENCE / PHOTOS
        ------------------------------------------------- */}

        <div className="mb-5">

          <div className="mb-1.5 flex items-center justify-between gap-3">

            <label
              htmlFor="observation-evidence"
              className="block text-sm font-medium text-ink2-secondary"
            >
              Evidence / Photos
            </label>

            <span className="text-xs text-ink2-muted">
              Optional
            </span>

          </div>

          <div className="rounded-lg border border-dashed border-line-strong bg-canvas p-4">

            <div className="flex flex-col gap-3 sm:flex-row">
              <label
                htmlFor="observation-evidence-camera"
                className="flex min-h-12 flex-1 cursor-pointer items-center justify-center rounded-md border border-line-strong bg-surface px-4 py-3 text-center text-sm font-semibold text-ink2 transition-colors hover:bg-canvas"
              >
                <span>Take Photo</span>
                <input
                  id="observation-evidence-camera"
                  type="file"
                  accept="image/*"
                  capture="environment"
                  className="hidden"
                  disabled={isSubmitting || isUploadingEvidence}
                  onChange={handleEvidenceChange}
                />
              </label>
              <label
                htmlFor="observation-evidence-gallery"
                className="flex min-h-12 flex-1 cursor-pointer items-center justify-center rounded-md bg-brand px-4 py-3 text-center text-sm font-semibold text-white transition-colors hover:bg-brand-hover"
              >
                <span>Choose from Gallery</span>
                <input
                  id="observation-evidence-gallery"
                  type="file"
                  accept="image/*"
                  multiple
                  className="hidden"
                  disabled={isSubmitting || isUploadingEvidence}
                  onChange={handleEvidenceChange}
                />
              </label>
            </div>
            <p className="mt-2 text-xs text-ink2-muted">
              Photos are optimized on your device before upload. Supported output: JPG, PNG or WEBP; images are limited to 8 MB after optimization.
            </p>


            {evidenceError && (
              <p className="mt-2 text-xs text-danger">
                {evidenceError}
              </p>
            )}


            {evidenceFiles.length > 0 && (
              <div className="mt-3 grid grid-cols-2 gap-3 sm:grid-cols-3">

                {evidenceFiles.map(
                  (file, index) => (
                    <div
                      key={`${file.name}-${file.size}-${index}`}
                      className="group relative overflow-hidden rounded-lg border border-line bg-surface"
                    >

                      <div className="aspect-square bg-canvas">

                        {evidencePreviewUrls[index] && (
                          <img
                            src={evidencePreviewUrls[index]}
                            alt={file.name}
                            className="h-full w-full object-cover"
                          />
                        )}

                      </div>


                      <div className="border-t border-line px-2.5 py-2">

                        <div className="truncate text-xs font-medium text-ink2">
                          {file.name}
                        </div>

                        <div className="mt-0.5 text-xs text-ink2-muted">
                          {(
                            file.size /
                            1024 /
                            1024
                          ).toFixed(2)}{' '}
                          MB
                        </div>

                      </div>


                      <button
                        type="button"
                        onClick={() =>
                          removeEvidenceFile(
                            index
                          )
                        }
                        disabled={
                          isSubmitting ||
                          isUploadingEvidence
                        }
                        className="absolute right-2 top-2 rounded-md bg-black/70 px-2 py-1 text-xs font-semibold text-white backdrop-blur-sm transition-colors hover:bg-black disabled:cursor-not-allowed disabled:opacity-50"
                      >
                        Remove
                      </button>

                    </div>
                  )
                )}

              </div>
            )}

          </div>

        </div>


        {/* -------------------------------------------------
            TARGET DATE
        ------------------------------------------------- */}

        <FormField
          id="target-date"
          label="Target Date"
          type="date"
          value={targetDate}
          onChange={(e) =>
            setTargetDate(e.target.value)
          }
          error={errors.targetDate}
        />


        {/* -------------------------------------------------
            ACTIONS
        ------------------------------------------------- */}

        <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:justify-end">

          <button
            type="button"
            onClick={() =>
              navigate(
                `/consultant/audits/${auditId}`
              )
            }
            className="rounded-md border border-line-strong px-5 py-3 text-sm font-semibold text-ink2 transition-colors hover:bg-canvas"
          >
            Cancel
          </button>


          <button
            type="submit"
            disabled={
              isSubmitting ||
              isUploadingEvidence ||
              isLoadingCategories ||
              categories.length === 0
            }
            className="rounded-md bg-brand px-5 py-3 text-sm font-semibold text-white shadow-xs transition-colors hover:bg-brand-hover disabled:cursor-not-allowed disabled:opacity-60"
          >
            {
              isUploadingEvidence
                ? 'Uploading photos...'
                : isSubmitting
                  ? 'Saving...'
                  : 'Save Observation'
            }
          </button>

        </div>

      </form>

      {successObservation && (
        <ObservationSuccessModal
          observationNumber={successObservation.number}
          onContinue={handleSuccessContinue}
        />
      )}

    </div>
  )
}