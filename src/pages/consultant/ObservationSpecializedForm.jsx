import { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'

import FormField from '../../components/FormField'
import ObservationSuccessModal from '../../components/ObservationSuccessModal'
import ObservationTypeBadge from '../../components/ObservationTypeBadge'
import { useToast } from '../../hooks/useToast'
import { createObservation } from '../../services/observationService'
import { uploadObservationEvidence } from '../../services/evidenceService'

const CONFIG = {
  gemba: {
    type: 'GEMBA',
    title: 'Gemba Observation',
    subtitle: 'Capture what you saw at the actual workplace.',
    fields: [
      ['gemba_area', 'Gemba Area / Process', 'e.g. Assembly Line 2'],
      ['people_process', 'People / Process Observed', 'Who or what process was observed?'],
      ['what_was_seen', 'What Was Seen?', 'Describe the actual condition observed.'],
      ['waste_or_gap', 'Waste / Gap Identified', 'e.g. Waiting, motion, defect, unclear standard'],
      ['improvement_opportunity', 'Improvement Opportunity', 'What could be improved?'],
    ],
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
  const detail = error?.response?.data?.detail
  if (typeof detail === 'string') return detail
  if (Array.isArray(detail)) return detail.map((x) => x?.msg || x).filter(Boolean).join(', ') || 'Unable to create observation.'
  return error?.message || 'Unable to create observation. Please try again.'
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
    return () => urls.forEach((url) => URL.revokeObjectURL(url))
  }, [files])

  const setField = (key, value) => setValues((current) => ({ ...current, [key]: value }))

  function validate() {
    const next = {}
    config.fields.forEach(([key, label]) => {
      if (!String(values[key] || '').trim()) next[key] = `${label} is required.`
    })
    if (!location.trim()) next.location = 'Location is required.'
    if (!severity) next.severity = 'Severity is required.'
    if (!description.trim()) next.description = 'Description is required.'
    if (!correctiveAction.trim()) next.correctiveAction = 'Corrective Action is required.'
    if (!targetDate) next.targetDate = 'Target Date is required.'
    setErrors(next)
    return Object.keys(next).length === 0
  }

  function handleFiles(e) {
    const selected = Array.from(e.target.files || [])
    const allowed = ['image/jpeg', 'image/png', 'image/webp']
    if (selected.some((file) => !allowed.includes(file.type))) {
      showToast('Only JPG, PNG and WEBP images are allowed.', 'error')
      e.target.value = ''
      return
    }
    if (selected.some((file) => file.size > 10 * 1024 * 1024)) {
      showToast('Each image must not exceed 10 MB.', 'error')
      e.target.value = ''
      return
    }
    setFiles((current) => [...current, ...selected])
    e.target.value = ''
  }

  async function handleSubmit(e) {
    e.preventDefault()
    if (!validate()) return
    setIsSubmitting(true)
    try {
      const observation = await createObservation(auditId, {
        observation_type: config.type,
        category_id: null,
        location: location.trim(),
        severity,
        description: description.trim(),
        corrective_action: correctiveAction.trim(),
        responsible_person_id: null,
        target_date: targetDate,
        details: values,
      })

      if (files.length && observation?.id) {
        setIsUploading(true)
        for (const file of files) await uploadObservationEvidence(observation.id, file)
      }

      showToast('Observation added successfully.')
      setSuccess({ number: observation?.observation_number || 'Observation saved' })
    } catch (error) {
      console.error(error)
      showToast(getApiErrorMessage(error), 'error')
    } finally {
      setIsUploading(false)
      setIsSubmitting(false)
    }
  }

  return (
    <div className="mx-auto max-w-2xl animate-fade-in">
      <button type="button" onClick={() => navigate(`/consultant/audits/${auditId}`)} className="text-sm font-medium text-ink2-secondary hover:text-ink2">
        &larr; Back to Audit
      </button>

      <div className="mt-4 flex items-center justify-between gap-3">
        <div>
          <div className="text-xs font-semibold uppercase tracking-wider text-ink2-muted">Observation Form</div>
          <h1 className="mt-1 text-xl font-bold text-ink2 sm:text-2xl">{config.title}</h1>
          <p className="mt-1 text-sm text-ink2-secondary">{config.subtitle}</p>
        </div>
        <ObservationTypeBadge type={config.type} />
      </div>

      <form onSubmit={handleSubmit} className="mt-6 rounded-xl border border-line bg-surface p-6 shadow-xs">
        {config.fields.map(([key, label, placeholder]) => (
          <div className="mb-5" key={key}>
            <label htmlFor={key} className="mb-1.5 block text-sm font-medium text-ink2-secondary">{label}</label>
            {key === 'what_was_seen' || key === 'unsafe_condition_or_act' || key === 'improvement_opportunity' || key === 'immediate_action' || key === 'root_cause' ? (
              <textarea id={key} rows={3} value={values[key] || ''} onChange={(e) => setField(key, e.target.value)} placeholder={placeholder} className="w-full resize-y rounded-md border border-line-strong bg-surface px-3.5 py-2.5 text-sm text-ink2 outline-none focus:border-brand focus:ring-2 focus:ring-brand/15" />
            ) : (
              <input id={key} type="text" value={values[key] || ''} onChange={(e) => setField(key, e.target.value)} placeholder={placeholder} className="w-full rounded-md border border-line-strong bg-surface px-3.5 py-2.5 text-sm text-ink2 outline-none focus:border-brand focus:ring-2 focus:ring-brand/15" />
            )}
            {errors[key] && <p className="mt-1 text-xs text-danger">{errors[key]}</p>}
          </div>
        ))}

        <div className="mb-5">
          <label htmlFor="special-location" className="mb-1.5 block text-sm font-medium text-ink2-secondary">Location</label>
          <input id="special-location" type="text" value={location} onChange={(e) => setLocation(e.target.value)} maxLength={255} placeholder="Enter plant / line / area / machine" className="w-full rounded-md border border-line-strong bg-surface px-3.5 py-2.5 text-sm text-ink2 outline-none focus:border-brand focus:ring-2 focus:ring-brand/15" />
          {errors.location && <p className="mt-1 text-xs text-danger">{errors.location}</p>}
        </div>

        <div className="mb-5">
          <label htmlFor="special-severity" className="mb-1.5 block text-sm font-medium text-ink2-secondary">Severity</label>
          <select id="special-severity" value={severity} onChange={(e) => setSeverity(e.target.value)} className="w-full rounded-md border border-line-strong bg-surface px-3.5 py-2.5 text-sm text-ink2 outline-none focus:border-brand focus:ring-2 focus:ring-brand/15">
            <option value="LOW">Low</option><option value="MEDIUM">Medium</option><option value="HIGH">High</option>
          </select>
          {errors.severity && <p className="mt-1 text-xs text-danger">{errors.severity}</p>}
        </div>

        <div className="mb-5">
          <label htmlFor="special-description" className="mb-1.5 block text-sm font-medium text-ink2-secondary">Observation Summary</label>
          <textarea id="special-description" rows={4} value={description} onChange={(e) => setDescription(e.target.value)} placeholder="Summarize the observation..." className="w-full resize-y rounded-md border border-line-strong bg-surface px-3.5 py-2.5 text-sm text-ink2 outline-none focus:border-brand focus:ring-2 focus:ring-brand/15" />
          {errors.description && <p className="mt-1 text-xs text-danger">{errors.description}</p>}
        </div>

        <div className="mb-5">
          <label htmlFor="special-action" className="mb-1.5 block text-sm font-medium text-ink2-secondary">Corrective Action</label>
          <textarea id="special-action" rows={4} value={correctiveAction} onChange={(e) => setCorrectiveAction(e.target.value)} placeholder="Describe the required corrective action..." className="w-full resize-y rounded-md border border-line-strong bg-surface px-3.5 py-2.5 text-sm text-ink2 outline-none focus:border-brand focus:ring-2 focus:ring-brand/15" />
          {errors.correctiveAction && <p className="mt-1 text-xs text-danger">{errors.correctiveAction}</p>}
        </div>

        <div className="mb-5">
          <label className="mb-1.5 block text-sm font-medium text-ink2-secondary">Evidence / Photos</label>
          <div className="rounded-lg border border-dashed border-line-strong bg-canvas px-4 py-5 text-center">
            <div className="flex flex-wrap items-center justify-center gap-2">
              <label htmlFor="special-evidence" className="cursor-pointer rounded-md border border-line-strong bg-surface px-4 py-2.5 text-sm font-semibold text-ink2 hover:bg-canvas">
                + Add Photos
              </label>
              <input id="special-evidence" type="file" accept="image/jpeg,image/png,image/webp" multiple className="hidden" onChange={handleFiles} disabled={isSubmitting || isUploading} />

              <label htmlFor="special-evidence-camera" className={`cursor-pointer rounded-md border border-brand/40 bg-brand/5 px-4 py-2.5 text-sm font-semibold text-brand hover:bg-brand/10 ${isSubmitting || isUploading ? 'pointer-events-none opacity-50' : ''}`}>
                Take Photo
              </label>
              <input id="special-evidence-camera" type="file" accept="image/*" capture="environment" className="hidden" onChange={handleFiles} disabled={isSubmitting || isUploading} />
            </div>
            <p className="mt-2 text-xs text-ink2-muted">Choose existing photos or use your device camera. JPG, PNG or WEBP · Maximum 10 MB each.</p>
          </div>
          {files.length > 0 && <div className="mt-3 grid grid-cols-2 gap-3 sm:grid-cols-3">{files.map((file, index) => <div key={`${file.name}-${file.size}-${index}`} className="overflow-hidden rounded-lg border border-line bg-surface"><div className="aspect-square bg-canvas">{previews[index] && <img src={previews[index]} alt={file.name} className="h-full w-full object-cover" />}</div><div className="flex items-center justify-between gap-2 border-t border-line px-2 py-2"><span className="truncate text-xs text-ink2">{file.name}</span><button type="button" onClick={() => setFiles((current) => current.filter((_, i) => i !== index))} className="text-xs font-semibold text-danger">Remove</button></div></div>)}</div>}
        </div>

        <FormField id="special-target-date" label="Target Date" type="date" value={targetDate} onChange={(e) => setTargetDate(e.target.value)} error={errors.targetDate} />

        <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:justify-end">
          <button type="button" onClick={() => navigate(`/consultant/audits/${auditId}`)} className="rounded-md border border-line-strong px-5 py-3 text-sm font-semibold text-ink2 hover:bg-canvas">Cancel</button>
          <button type="submit" disabled={isSubmitting || isUploading} className="rounded-md bg-brand px-5 py-3 text-sm font-semibold text-white shadow-xs hover:bg-brand-hover disabled:cursor-not-allowed disabled:opacity-60">{isUploading ? 'Uploading photos...' : isSubmitting ? 'Saving...' : 'Save Observation'}</button>
        </div>
      </form>

      {success && <ObservationSuccessModal observationNumber={success.number} onContinue={() => { setSuccess(null); navigate(`/consultant/audits/${auditId}`) }} />}
    </div>
  )
}
