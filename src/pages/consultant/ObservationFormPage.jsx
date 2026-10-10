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
    <div className="five-s-observation-page">
      <style>{`
        .five-s-observation-page {
          --form-ink: #172033;
          --form-muted: #657187;
          --form-line: #e1e7ef;
          --form-brand: #2563eb;
          --form-brand-soft: #eff6ff;
          width: 100%;
          max-width: 920px;
          margin: 0 auto;
          padding: 4px 0 28px;
          color: var(--form-ink);
        }
        .five-s-observation-page * { box-sizing: border-box; }
        .five-s-back {
          display: inline-flex; align-items: center; gap: 9px;
          min-height: 42px; padding: 8px 12px; margin: 0 0 16px -8px;
          border: 0; border-radius: 10px; background: transparent;
          color: #526078; font-size: 14px; font-weight: 650; cursor: pointer;
        }
        .five-s-back:hover { background: #f1f5f9; color: #172033; }
        .five-s-heading { margin-bottom: 22px; }
        .five-s-eyebrow {
          display: inline-flex; align-items: center; gap: 8px;
          color: #2563eb; font-size: 11px; font-weight: 800;
          letter-spacing: .12em; text-transform: uppercase;
        }
        .five-s-eyebrow-mark { width: 7px; height: 7px; border-radius: 50%; background: #2563eb; }
        .five-s-title { margin: 8px 0 0; color: #111827; font-size: clamp(25px, 5vw, 34px); line-height: 1.15; letter-spacing: -.035em; font-weight: 780; }
        .five-s-subtitle { max-width: 620px; margin: 10px 0 0; color: #657187; font-size: 14px; line-height: 1.65; }
        .five-s-form {
          overflow: hidden; border: 1px solid var(--form-line); border-radius: 18px;
          background: #fff; box-shadow: 0 8px 30px rgba(15, 23, 42, .045);
        }
        .five-s-form-intro { padding: 20px 20px 18px; background: linear-gradient(135deg, #f8fbff 0%, #fff 75%); border-bottom: 1px solid #e8edf4; }
        .five-s-form-intro-title { margin: 0; font-size: 15px; font-weight: 750; letter-spacing: -.01em; color: #172033; }
        .five-s-form-intro-copy { margin: 5px 0 0; color: #657187; font-size: 12px; line-height: 1.55; }
        .five-s-form-body { padding: 20px; }
        .five-s-section { margin: 0 0 22px; }
        .five-s-section:last-child { margin-bottom: 0; }
        .five-s-section-heading { display: flex; align-items: center; gap: 10px; margin: 0 0 14px; color: #263247; font-size: 13px; font-weight: 800; }
        .five-s-section-number { display: inline-flex; width: 27px; height: 27px; align-items: center; justify-content: center; flex: 0 0 27px; border: 1px solid #dbeafe; border-radius: 9px; background: #eff6ff; color: #2563eb; font-size: 11px; font-weight: 800; }
        .five-s-field { min-width: 0; margin-bottom: 17px; }
        .five-s-field:last-child { margin-bottom: 0; }
        .five-s-field label, .five-s-field-label { display: block; margin-bottom: 7px; color: #354158; font-size: 13px; font-weight: 700; }
        .five-s-required { margin-left: 3px; color: #dc2626; }
        .five-s-help { margin: 6px 0 0; color: #7a8699; font-size: 11px; line-height: 1.5; }
        .five-s-observation-page input[type="text"],
        .five-s-observation-page input[type="date"],
        .five-s-observation-page select,
        .five-s-observation-page textarea {
          display: block; width: 100%; min-height: 49px; padding: 12px 13px;
          border: 1px solid #d7deea; border-radius: 11px; outline: none;
          background-color: #fff; color: #172033; font: inherit; font-size: 15px;
          line-height: 1.45; box-shadow: 0 1px 2px rgba(15, 23, 42, .025);
          transition: border-color .15s ease, box-shadow .15s ease, background .15s ease;
        }
        .five-s-observation-page select { padding-right: 36px; }
        .five-s-observation-page textarea { min-height: 126px; resize: vertical; }
        .five-s-observation-page input::placeholder,
        .five-s-observation-page textarea::placeholder { color: #9aa5b5; }
        .five-s-observation-page input:focus,
        .five-s-observation-page select:focus,
        .five-s-observation-page textarea:focus { border-color: #60a5fa; box-shadow: 0 0 0 4px rgba(59, 130, 246, .12); }
        .five-s-error { margin: 6px 0 0; color: #b91c1c; font-size: 12px; line-height: 1.45; }
        .five-s-severity-wrap { display: grid; grid-template-columns: repeat(3, minmax(0, 1fr)); gap: 8px; }
        .five-s-severity-option { display: flex; min-height: 47px; align-items: center; justify-content: center; gap: 7px; padding: 10px 8px; border: 1px solid #dce3ed; border-radius: 11px; color: #526078; font-size: 13px; font-weight: 700; }
        .five-s-severity-option:has(input:checked) { border-color: #93c5fd; background: #eff6ff; color: #1d4ed8; }
        .five-s-severity-option input { accent-color: #2563eb; }
        .five-s-upload-box { padding: 14px; border: 1px dashed #cbd5e1; border-radius: 14px; background: #f8fafc; }
        .five-s-upload-actions { display: grid; grid-template-columns: 1fr; gap: 9px; }
        .five-s-upload-button { display: flex; min-height: 49px; align-items: center; justify-content: center; gap: 9px; padding: 12px 14px; border: 1px solid #d9e1ed; border-radius: 11px; background: #fff; color: #263247; font-size: 13px; font-weight: 750; text-align: center; cursor: pointer; transition: background .15s ease, border-color .15s ease; }
        .five-s-upload-button:hover { border-color: #93baf8; background: #f8fbff; }
        .five-s-upload-button-primary { border-color: #2563eb; background: #2563eb; color: #fff; }
        .five-s-upload-button-primary:hover { border-color: #1d4ed8; background: #1d4ed8; }
        .five-s-upload-note { margin: 11px 0 0; color: #7a8699; font-size: 11px; line-height: 1.6; }
        .five-s-photo-grid { display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 10px; margin-top: 14px; }
        .five-s-photo { position: relative; overflow: hidden; border: 1px solid #e1e7ef; border-radius: 12px; background: #fff; }
        .five-s-photo-image { aspect-ratio: 1; background: #f1f5f9; }
        .five-s-photo-image img { width: 100%; height: 100%; object-fit: cover; }
        .five-s-photo-info { padding: 9px 10px; border-top: 1px solid #e8edf4; }
        .five-s-photo-name { overflow: hidden; color: #263247; font-size: 11px; font-weight: 700; text-overflow: ellipsis; white-space: nowrap; }
        .five-s-photo-size { margin-top: 4px; color: #7a8699; font-size: 10px; }
        .five-s-photo-remove { position: absolute; top: 7px; right: 7px; min-height: 32px; padding: 6px 9px; border: 0; border-radius: 8px; background: rgba(15, 23, 42, .78); color: #fff; font-size: 11px; font-weight: 750; cursor: pointer; }
        .five-s-actions { display: grid; grid-template-columns: 1fr; gap: 9px; padding: 16px 20px calc(16px + env(safe-area-inset-bottom)); border-top: 1px solid #e8edf4; background: rgba(255,255,255,.96); }
        .five-s-button { display: inline-flex; min-height: 50px; align-items: center; justify-content: center; padding: 12px 18px; border-radius: 11px; font-size: 14px; font-weight: 750; cursor: pointer; transition: background .15s ease, transform .15s ease; }
        .five-s-button:active { transform: translateY(1px); }
        .five-s-button-secondary { border: 1px solid #d7deea; background: #fff; color: #344054; }
        .five-s-button-secondary:hover { background: #f8fafc; }
        .five-s-button-primary { border: 1px solid #2563eb; background: #2563eb; color: #fff; box-shadow: 0 3px 8px rgba(37, 99, 235, .16); }
        .five-s-button-primary:hover { background: #1d4ed8; }
        .five-s-button:disabled { cursor: not-allowed; opacity: .55; box-shadow: none; }
        @media (min-width: 560px) {
          .five-s-observation-page { padding: 8px 4px 32px; }
          .five-s-heading { margin-bottom: 26px; }
          .five-s-form-intro { padding: 24px 28px 21px; }
          .five-s-form-body { padding: 28px; }
          .five-s-section { margin-bottom: 27px; }
          .five-s-upload-actions { grid-template-columns: 1fr 1fr; }
          .five-s-photo-grid { grid-template-columns: repeat(3, minmax(0, 1fr)); }
          .five-s-actions { display: flex; justify-content: flex-end; padding: 18px 28px; }
          .five-s-button { min-width: 140px; }
        }
        @media (max-width: 380px) {
          .five-s-form-body { padding: 15px; }
          .five-s-form-intro { padding: 17px 15px; }
          .five-s-severity-wrap { gap: 5px; }
          .five-s-severity-option { gap: 4px; padding: 8px 4px; font-size: 12px; }
          .five-s-actions { padding-right: 15px; padding-left: 15px; }
        }
        @media (prefers-reduced-motion: reduce) {
          .five-s-observation-page *, .five-s-observation-page *::before, .five-s-observation-page *::after { transition: none !important; animation: none !important; }
        }
      `}</style>

      <button
        type="button"
        onClick={() => navigate(`/consultant/audits/${auditId}`)}
        className="five-s-back"
      >
        <span aria-hidden="true">←</span> Back to Audit
      </button>

      <header className="five-s-heading">
        <div className="five-s-eyebrow">
          <span className="five-s-eyebrow-mark" /> 5S AUDIT WORKSPACE
        </div>
        <h1 className="five-s-title">Add Observation</h1>
        <p className="five-s-subtitle">
          Record a workplace finding, document its severity, and define the corrective action needed to resolve it.
        </p>
      </header>

      <form onSubmit={handleSubmit} className="five-s-form">
        <div className="five-s-form-intro">
          <h2 className="five-s-form-intro-title">Observation details</h2>
          <p className="five-s-form-intro-copy">
            Complete the required fields. You can attach photos from your camera or gallery to support the finding.
          </p>
        </div>

        <div className="five-s-form-body">
          <section className="five-s-section" aria-labelledby="five-s-location-heading">
            <h3 id="five-s-location-heading" className="five-s-section-heading">
              <span className="five-s-section-number">01</span> Finding details
            </h3>

            <div className="five-s-field">
              <label htmlFor="category">5S Category <span className="five-s-required">*</span></label>
              <select
                id="category"
                value={categoryId}
                onChange={(e) => setCategoryId(e.target.value)}
                disabled={isLoadingCategories}
                aria-invalid={Boolean(errors.categoryId)}
                aria-describedby={errors.categoryId ? 'category-error' : undefined}
              >
                <option value="">
                  {isLoadingCategories
                    ? 'Loading categories...'
                    : categories.length === 0
                      ? 'No categories available'
                      : 'Select 5S category'}
                </option>
                {categories.map((category) => (
                  <option key={category.id} value={category.id}>
                    {category.code} — {category.name}
                  </option>
                ))}
              </select>
              {errors.categoryId && <p id="category-error" className="five-s-error" role="alert">{errors.categoryId}</p>}
            </div>

            <div className="five-s-field">
              <label htmlFor="location">Location <span className="five-s-required">*</span></label>
              <input
                id="location"
                type="text"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                maxLength={255}
                placeholder="e.g. Assembly Line 02, near workstation 4"
                aria-invalid={Boolean(errors.location)}
                aria-describedby={errors.location ? 'location-error' : 'location-help'}
              />
              <p id="location-help" className="five-s-help">Be specific so the team can find the exact area.</p>
              {errors.location && <p id="location-error" className="five-s-error" role="alert">{errors.location}</p>}
            </div>

            <div className="five-s-field">
              <label htmlFor="severity">Severity <span className="five-s-required">*</span></label>
              <select
                id="severity"
                value={severity}
                onChange={(e) => setSeverity(e.target.value)}
                aria-invalid={Boolean(errors.severity)}
                aria-describedby={errors.severity ? 'severity-error' : undefined}
              >
                <option value="LOW">Low</option>
                <option value="MEDIUM">Medium</option>
                <option value="HIGH">High</option>
              </select>
              {errors.severity && <p id="severity-error" className="five-s-error" role="alert">{errors.severity}</p>}
            </div>

            <div className="five-s-field">
              <label htmlFor="description">Description <span className="five-s-required">*</span></label>
              <textarea
                id="description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={4}
                placeholder="Describe what you observed, where it occurs, and why it is a concern..."
                aria-invalid={Boolean(errors.description)}
                aria-describedby={errors.description ? 'description-error' : 'description-help'}
              />
              <p id="description-help" className="five-s-help">Describe the actual condition, not just the proposed solution.</p>
              {errors.description && <p id="description-error" className="five-s-error" role="alert">{errors.description}</p>}
            </div>
          </section>

          <section className="five-s-section" aria-labelledby="five-s-action-heading">
            <h3 id="five-s-action-heading" className="five-s-section-heading">
              <span className="five-s-section-number">02</span> Corrective action
            </h3>

            <div className="five-s-field">
              <label htmlFor="corrective-action">Corrective Action <span className="five-s-required">*</span></label>
              <textarea
                id="corrective-action"
                value={correctiveAction}
                onChange={(e) => setCorrectiveAction(e.target.value)}
                rows={4}
                placeholder="Describe the action required to correct or prevent this issue..."
                aria-invalid={Boolean(errors.correctiveAction)}
                aria-describedby={errors.correctiveAction ? 'corrective-action-error' : 'corrective-action-help'}
              />
              <p id="corrective-action-help" className="five-s-help">Write an actionable next step the responsible team can follow.</p>
              {errors.correctiveAction && <p id="corrective-action-error" className="five-s-error" role="alert">{errors.correctiveAction}</p>}
            </div>

            <div className="five-s-field">
              <FormField
                id="target-date"
                label="Target Date"
                type="date"
                value={targetDate}
                onChange={(e) => setTargetDate(e.target.value)}
                error={errors.targetDate}
              />
            </div>
          </section>

          <section className="five-s-section" aria-labelledby="five-s-evidence-heading">
            <h3 id="five-s-evidence-heading" className="five-s-section-heading">
              <span className="five-s-section-number">03</span> Evidence & photos
              <span style={{ marginLeft: 'auto', color: '#7a8699', fontSize: 11, fontWeight: 600 }}>Optional</span>
            </h3>

            <div className="five-s-upload-box">
              <div className="five-s-upload-actions">
                <label htmlFor="observation-evidence-camera" className="five-s-upload-button">
                  <span aria-hidden="true">◎</span> Take Photo
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
                <label htmlFor="observation-evidence-gallery" className="five-s-upload-button five-s-upload-button-primary">
                  <span aria-hidden="true">＋</span> Choose from Gallery
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
              <p className="five-s-upload-note">
                Photos are optimized on your device before upload. Supported output: JPG, PNG or WEBP; images are limited to 8 MB after optimization.
              </p>

              {evidenceError && <p className="five-s-error" role="alert">{evidenceError}</p>}

              {evidenceFiles.length > 0 && (
                <div className="five-s-photo-grid">
                  {evidenceFiles.map((file, index) => (
                    <div key={`${file.name}-${file.size}-${index}`} className="five-s-photo">
                      <div className="five-s-photo-image">
                        {evidencePreviewUrls[index] && (
                          <img src={evidencePreviewUrls[index]} alt={file.name} />
                        )}
                      </div>
                      <div className="five-s-photo-info">
                        <div className="five-s-photo-name">{file.name}</div>
                        <div className="five-s-photo-size">{(file.size / 1024 / 1024).toFixed(2)} MB</div>
                      </div>
                      <button
                        type="button"
                        onClick={() => removeEvidenceFile(index)}
                        disabled={isSubmitting || isUploadingEvidence}
                        className="five-s-photo-remove"
                      >
                        Remove
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </section>
        </div>

        <div className="five-s-actions">
          <button
            type="button"
            onClick={() => navigate(`/consultant/audits/${auditId}`)}
            className="five-s-button five-s-button-secondary"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={isSubmitting || isUploadingEvidence || isLoadingCategories || categories.length === 0}
            className="five-s-button five-s-button-primary"
          >
            {isUploadingEvidence
              ? 'Uploading photos...'
              : isSubmitting
                ? 'Saving...'
                : 'Save Observation'}
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
