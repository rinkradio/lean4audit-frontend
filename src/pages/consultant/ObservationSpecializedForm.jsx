
import { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'

import FormField from '../../components/FormField'
import ObservationSuccessModal from '../../components/ObservationSuccessModal'
import ObservationTypeBadge from '../../components/ObservationTypeBadge'
import { useToast } from '../../hooks/useToast'
import { createObservation } from '../../services/observationService'
import {
  prepareEvidenceFile,
  uploadObservationEvidence,
} from '../../services/evidenceService'

const CONFIG = {
  gemba: {
    type: 'GEMBA',
    title: 'Gemba Observation',
    subtitle: 'Capture what you saw at the actual workplace.',
    fields: [],
  },
  safety: {
    type: 'SAFETY',
    title: 'Safety Observation',
    subtitle: 'Capture a hazard, unsafe act or unsafe condition.',
    fields: [
      ['hazard_type', 'Hazard Type', 'e.g. PPE, machine guarding, slip/trip, electrical'],
      ['risk_level', 'Risk Level', 'e.g. Low, Medium, High, Critical'],
      ['unsafe_condition_or_act', 'Unsafe Condition / Act', 'Describe the unsafe condition or act.'],
      ['immediate_action', 'Immediate Action Taken', 'What was done immediately to control the risk?'],
      ['root_cause', 'Likely Root Cause', 'What appears to be causing the unsafe condition?'],
    ],
  },
}

function getApiErrorMessage(error) {
  if (error?.userMessage) return error.userMessage

  const detail = error?.response?.data?.detail

  if (typeof detail === 'string') return detail

  if (Array.isArray(detail)) {
    return (
      detail
        .map((item) => {
          const field = item?.loc?.slice(1).join('.')
          return field
            ? `${field}: ${item?.msg || 'Invalid value'}`
            : item?.msg || 'Invalid field'
        })
        .filter(Boolean)
        .join(', ') || 'Unable to create observation.'
    )
  }

  return (
    error?.response?.data?.message ||
    error?.message ||
    'Unable to create observation. Please try again.'
  )
}

export default function ObservationSpecializedForm({ kind }) {
  const { auditId } = useParams()
  const navigate = useNavigate()
  const { showToast } = useToast()

  const config = CONFIG[kind]

  const [values, setValues] = useState({})
  const [location, setLocation] = useState('')
  const [severity, setSeverity] = useState('MEDIUM')
  const [description, setDescription] = useState('')
  const [correctiveAction, setCorrectiveAction] = useState('')
  const [targetDate, setTargetDate] = useState('')
  const [files, setFiles] = useState([])
  const [previews, setPreviews] = useState([])
  const [errors, setErrors] = useState({})
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isUploading, setIsUploading] = useState(false)
  const [success, setSuccess] = useState(null)

  useEffect(() => {
    const urls = files.map((file) => URL.createObjectURL(file))

    setPreviews(urls)

    return () => {
      urls.forEach((url) => URL.revokeObjectURL(url))
    }
  }, [files])

  const setField = (key, value) => {
    setValues((current) => ({
      ...current,
      [key]: value,
    }))
  }

  function validate() {
    const next = {}

    config.fields.forEach(([key, label]) => {
      if (!String(values[key] || '').trim()) {
        next[key] = `${label} is required.`
      }
    })

    if (!location.trim()) {
      next.location = 'Location is required.'
    }

    if (!severity) {
      next.severity = 'Severity is required.'
    }

    if (!description.trim()) {
      next.description = 'Observation Summary is required.'
    }

    // Backend requires corrective_action.
    if (!correctiveAction.trim()) {
      next.correctiveAction = 'Corrective Action is required.'
    }

    if (!targetDate) {
      next.targetDate = 'Target Date is required.'
    }

    setErrors(next)

    return Object.keys(next).length === 0
  }

  async function handleFiles(e) {
    const selected = Array.from(e.target.files || [])

    e.target.value = ''

    if (!selected.length) return

    try {
      const prepared = await Promise.all(
        selected.map((file) => prepareEvidenceFile(file))
      )

      setFiles((current) => [...current, ...prepared])
    } catch (error) {
      showToast(
        error?.message ||
          'Unable to prepare this image. Please try another photo.',
        'error'
      )
    }
  }

  async function handleSubmit(e) {
    e.preventDefault()

    if (!validate()) return

    setIsSubmitting(true)

    try {
      const payload = {
        observation_type: config.type,
        category_id: null,
        location: location.trim(),
        severity,
        description: description.trim(),
        corrective_action: correctiveAction.trim(),
        responsible_person_id: null,
        target_date: targetDate,
        details: values,
      }

      console.log('Observation submission payload:', payload)

      const observation = await createObservation(auditId, payload)

      let evidenceUploadFailed = false

      if (files.length && observation?.id) {
        setIsUploading(true)

        try {
          for (const file of files) {
            await uploadObservationEvidence(observation.id, file)
          }
        } catch (uploadError) {
          evidenceUploadFailed = true

          console.error(
            'Observation saved, but evidence upload failed:',
            uploadError.response?.data || uploadError
          )

          showToast(
            getApiErrorMessage(uploadError) ||
              'Observation saved, but a photo could not be uploaded. Open the observation and retry the photo.',
            'error'
          )
        }
      }

      if (!evidenceUploadFailed) {
        showToast('Observation added successfully.')
      }

      setSuccess({
        number: observation?.observation_number || 'Observation saved',
      })
    } catch (error) {
      console.error('========== OBSERVATION SUBMISSION ERROR ==========')
      console.error('HTTP STATUS:', error.response?.status)
      console.error(
        'BACKEND VALIDATION DETAILS:',
        JSON.stringify(error.response?.data, null, 2)
      )
      console.error('SUBMITTED PAYLOAD:', error.config?.data)
      console.error('ERROR MESSAGE:', error.message)
      console.error('===================================================')

      showToast(getApiErrorMessage(error), 'error')
    } finally {
      setIsUploading(false)
      setIsSubmitting(false)
    }
  }

  if (!config) {
    return (
      <div className="p-6 text-sm text-danger">
        Invalid observation form type.
      </div>
    )
  }

  return (
    <div className="mx-auto max-w-2xl animate-fade-in">
      <button
        type="button"
        onClick={() => navigate(`/consultant/audits/${auditId}`)}
        className="text-sm font-medium text-ink2-secondary hover:text-ink2"
      >
        &larr; Back to Audit
      </button>

      <div className="mt-4 flex items-center justify-between gap-3">
        <div>
          <div className="text-xs font-semibold uppercase tracking-wider text-ink2-muted">
            Observation Form
          </div>

          <h1 className="mt-1 text-xl font-bold text-ink2 sm:text-2xl">
            {config.title}
          </h1>

          <p className="mt-1 text-sm text-ink2-secondary">
            {config.subtitle}
          </p>
        </div>

        <ObservationTypeBadge type={config.type} />
      </div>

      <form
        onSubmit={handleSubmit}
        className="mt-6 rounded-xl border border-line bg-surface p-4 shadow-xs sm:p-6"
      >
        {/* Safety-specific fields */}
        {config.fields.map(([key, label, placeholder]) => (
          <div className="mb-5" key={key}>
            <label
              htmlFor={key}
              className="mb-1.5 block text-sm font-medium text-ink2-secondary"
            >
              {label}
            </label>

            {[
              'what_was_seen',
              'unsafe_condition_or_act',
              'improvement_opportunity',
              'immediate_action',
              'root_cause',
            ].includes(key) ? (
              <textarea
                id={key}
                rows={3}
                value={values[key] || ''}
                onChange={(e) => setField(key, e.target.value)}
                placeholder={placeholder}
                className="w-full resize-y rounded-md border border-line-strong bg-surface px-3.5 py-2.5 text-sm text-ink2 outline-none focus:border-brand focus:ring-2 focus:ring-brand/15"
              />
            ) : (
              <input
                id={key}
                type="text"
                value={values[key] || ''}
                onChange={(e) => setField(key, e.target.value)}
                placeholder={placeholder}
                className="w-full rounded-md border border-line-strong bg-surface px-3.5 py-2.5 text-sm text-ink2 outline-none focus:border-brand focus:ring-2 focus:ring-brand/15"
              />
            )}

            {errors[key] && (
              <p className="mt-1 text-xs text-danger">
                {errors[key]}
              </p>
            )}
          </div>
        ))}

        {/* Location */}
        <div className="mb-5">
          <label
            htmlFor="special-location"
            className="mb-1.5 block text-sm font-medium text-ink2-secondary"
          >
            Location
          </label>

          <input
            id="special-location"
            type="text"
            value={location}
            onChange={(e) => setLocation(e.target.value)}
            maxLength={255}
            placeholder="Enter plant / line / area / machine"
            className="w-full rounded-md border border-line-strong bg-surface px-3.5 py-2.5 text-sm text-ink2 outline-none focus:border-brand focus:ring-2 focus:ring-brand/15"
          />

          {errors.location && (
            <p className="mt-1 text-xs text-danger">
              {errors.location}
            </p>
          )}
        </div>

        {/* Severity */}
        <div className="mb-5">
          <label
            htmlFor="special-severity"
            className="mb-1.5 block text-sm font-medium text-ink2-secondary"
          >
            Severity
          </label>

          <select
            id="special-severity"
            value={severity}
            onChange={(e) => setSeverity(e.target.value)}
            className="w-full rounded-md border border-line-strong bg-surface px-3.5 py-2.5 text-sm text-ink2 outline-none focus:border-brand focus:ring-2 focus:ring-brand/15"
          >
            <option value="LOW">Low</option>
            <option value="MEDIUM">Medium</option>
            <option value="HIGH">High</option>
          </select>

          {errors.severity && (
            <p className="mt-1 text-xs text-danger">
              {errors.severity}
            </p>
          )}
        </div>

        {/* Observation Summary */}
        <div className="mb-5">
          <label
            htmlFor="special-description"
            className="mb-1.5 block text-sm font-medium text-ink2-secondary"
          >
            Observation Summary
          </label>

          <textarea
            id="special-description"
            rows={4}
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Summarize the observation..."
            className="w-full resize-y rounded-md border border-line-strong bg-surface px-3.5 py-2.5 text-sm text-ink2 outline-none focus:border-brand focus:ring-2 focus:ring-brand/15"
          />

          {errors.description && (
            <p className="mt-1 text-xs text-danger">
              {errors.description}
            </p>
          )}
        </div>

        {/* Corrective Action - required by backend */}
        <div className="mb-5">
          <label
            htmlFor="special-action"
            className="mb-1.5 block text-sm font-medium text-ink2-secondary"
          >
            Corrective Action
          </label>

          <textarea
            id="special-action"
            rows={4}
            value={correctiveAction}
            onChange={(e) => setCorrectiveAction(e.target.value)}
            placeholder="Describe the action required to correct this observation..."
            className="w-full resize-y rounded-md border border-line-strong bg-surface px-3.5 py-2.5 text-sm text-ink2 outline-none focus:border-brand focus:ring-2 focus:ring-brand/15"
          />

          {errors.correctiveAction && (
            <p className="mt-1 text-xs text-danger">
              {errors.correctiveAction}
            </p>
          )}
        </div>

        {/* Evidence / Photos */}
        <div className="mb-5">
          <label className="mb-1.5 block text-sm font-medium text-ink2-secondary">
            Evidence / Photos
          </label>

          <div className="rounded-lg border border-dashed border-line-strong bg-canvas p-4">
            <div className="flex flex-col gap-3 sm:flex-row">
              <label
                htmlFor="special-evidence-camera"
                className="flex min-h-12 flex-1 cursor-pointer items-center justify-center rounded-md border border-line-strong bg-surface px-4 py-3 text-center text-sm font-semibold text-ink2 hover:bg-canvas"
              >
                Take Photo

                <input
                  id="special-evidence-camera"
                  type="file"
                  accept="image/*"
                  capture="environment"
                  className="hidden"
                  onChange={handleFiles}
                  disabled={isSubmitting || isUploading}
                />
              </label>

              <label
                htmlFor="special-evidence-gallery"
                className="flex min-h-12 flex-1 cursor-pointer items-center justify-center rounded-md bg-brand px-4 py-3 text-center text-sm font-semibold text-white hover:bg-brand-hover"
              >
                Choose from Gallery

                <input
                  id="special-evidence-gallery"
                  type="file"
                  accept="image/*"
                  multiple
                  className="hidden"
                  onChange={handleFiles}
                  disabled={isSubmitting || isUploading}
                />
              </label>
            </div>

            <p className="mt-2 text-xs text-ink2-muted">
              Photos are optimized on your device before upload. Supported
              output: JPG, PNG or WEBP; images are limited to 8 MB after
              optimization.
            </p>
          </div>

          {files.length > 0 && (
            <div className="mt-3 grid grid-cols-2 gap-3 sm:grid-cols-3">
              {files.map((file, index) => (
                <div
                  key={`${file.name}-${file.size}-${index}`}
                  className="overflow-hidden rounded-lg border border-line bg-surface"
                >
                  <div className="aspect-square bg-canvas">
                    {previews[index] && (
                      <img
                        src={previews[index]}
                        alt={file.name}
                        className="h-full w-full object-cover"
                      />
                    )}
                  </div>

                  <div className="flex items-center justify-between gap-2 border-t border-line px-2 py-2">
                    <span className="truncate text-xs text-ink2">
                      {file.name}
                    </span>

                    <button
                      type="button"
                      onClick={() =>
                        setFiles((current) =>
                          current.filter((_, i) => i !== index)
                        )
                      }
                      className="text-xs font-semibold text-danger"
                    >
                      Remove
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Target Date */}
        <FormField
          id="special-target-date"
          label="Target Date"
          type="date"
          value={targetDate}
          onChange={(e) => setTargetDate(e.target.value)}
          error={errors.targetDate}
        />

        {/* Buttons */}
        <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:justify-end">
          <button
            type="button"
            onClick={() => navigate(`/consultant/audits/${auditId}`)}
            className="rounded-md border border-line-strong px-5 py-3 text-sm font-semibold text-ink2 hover:bg-canvas"
          >
            Cancel
          </button>

          <button
            type="submit"
            disabled={isSubmitting || isUploading}
            className="rounded-md bg-brand px-5 py-3 text-sm font-semibold text-white shadow-xs hover:bg-brand-hover disabled:cursor-not-allowed disabled:opacity-60"
          >
            {isUploading
              ? 'Uploading photos...'
              : isSubmitting
                ? 'Saving...'
                : 'Save Observation'}
          </button>
        </div>
      </form>

      {success && (
        <ObservationSuccessModal
          observationNumber={success.number}
          onContinue={() => {
            setSuccess(null)
            navigate(`/consultant/audits/${auditId}`)
          }}
        />
      )}
    </div>
  )
}
