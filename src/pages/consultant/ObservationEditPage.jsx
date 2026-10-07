import { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'

import FormField from '../../components/FormField'
import ObservationTypeBadge from '../../components/ObservationTypeBadge'
import { useToast } from '../../hooks/useToast'
import { fetchObservation, updateObservation } from '../../services/observationService'
import apiClient from '../../services/apiClient'

const TYPE_FIELDS = {
  GEMBA: [
    ['gemba_area', 'Gemba Area / Process'],
    ['people_process', 'People / Process Observed'],
    ['what_was_seen', 'What Was Seen?'],
    ['waste_or_gap', 'Waste / Gap Identified'],
    ['improvement_opportunity', 'Improvement Opportunity'],
  ],
  SAFETY: [
    ['hazard_type', 'Hazard Type'],
    ['risk_level', 'Risk Level'],
    ['unsafe_condition_or_act', 'Unsafe Condition / Act'],
    ['immediate_action', 'Immediate Action Taken'],
    ['root_cause', 'Likely Root Cause'],
  ],
}

function getError(error) {
  const detail = error?.response?.data?.detail
  if (typeof detail === 'string') return detail
  if (Array.isArray(detail)) return detail.map((x) => x?.msg || x).filter(Boolean).join(', ')
  return error?.message || 'Unable to update observation.'
}

export default function ObservationEditPage() {
  const { observationId } = useParams()
  const navigate = useNavigate()
  const { showToast } = useToast()
  const [observation, setObservation] = useState(null)
  const [categories, setCategories] = useState([])
  const [categoryId, setCategoryId] = useState('')
  const [location, setLocation] = useState('')
  const [severity, setSeverity] = useState('MEDIUM')
  const [description, setDescription] = useState('')
  const [correctiveAction, setCorrectiveAction] = useState('')
  const [targetDate, setTargetDate] = useState('')
  const [status, setStatus] = useState('OPEN')
  const [details, setDetails] = useState({})
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [errors, setErrors] = useState({})

  useEffect(() => {
    let mounted = true
    Promise.all([fetchObservation(observationId), apiClient.get('/five-s-categories')])
      .then(([data, categoryResponse]) => {
        if (!mounted) return
        setObservation(data)
        setCategories(Array.isArray(categoryResponse.data) ? categoryResponse.data : categoryResponse.data?.items || [])
        setCategoryId(data.category_id || '')
        setLocation(data.location || '')
        setSeverity(data.severity || 'MEDIUM')
        setDescription(data.description || '')
        setCorrectiveAction(data.corrective_action || '')
        setTargetDate(data.target_date || '')
        setStatus(data.status || 'OPEN')
        setDetails(data.details || {})
      })
      .catch((error) => showToast(getError(error), 'error'))
      .finally(() => mounted && setLoading(false))
    return () => { mounted = false }
  }, [observationId, showToast])

  function validate() {
    const next = {}
    if (observation?.observation_type === '5S' && !categoryId) next.categoryId = '5S Category is required.'
    if (!location.trim()) next.location = 'Location is required.'
    if (!description.trim()) next.description = 'Description is required.'
    if (!correctiveAction.trim()) next.correctiveAction = 'Corrective Action is required.'
    if (!targetDate) next.targetDate = 'Target Date is required.'
    TYPE_FIELDS[observation?.observation_type]?.forEach(([key, label]) => {
      if (!String(details[key] || '').trim()) next[key] = `${label} is required.`
    })
    setErrors(next)
    return Object.keys(next).length === 0
  }

  async function submit(e) {
    e.preventDefault()
    if (!validate()) return
    setSaving(true)
    try {
      await updateObservation(observationId, {
        category_id: observation.observation_type === '5S' ? categoryId : null,
        location: location.trim(),
        severity,
        description: description.trim(),
        corrective_action: correctiveAction.trim(),
        target_date: targetDate,
        status,
        details,
      })
      showToast('Observation updated successfully.')
      navigate(-1)
    } catch (error) {
      showToast(getError(error), 'error')
    } finally {
      setSaving(false)
    }
  }

  if (loading) return <div className="mx-auto max-w-2xl rounded-xl border border-line bg-surface p-8 text-center text-sm text-ink2-secondary">Loading observation...</div>
  if (!observation) return null

  const type = observation.observation_type || '5S'

  return (
    <div className="mx-auto max-w-2xl animate-fade-in">
      <button type="button" onClick={() => navigate(-1)} className="text-sm font-medium text-ink2-secondary hover:text-ink2">&larr; Back</button>
      <div className="mt-4 flex items-center justify-between gap-3">
        <div><div className="text-xs font-semibold uppercase tracking-wider text-ink2-muted">Edit Observation</div><h1 className="mt-1 text-xl font-bold text-ink2 sm:text-2xl">{observation.observation_number}</h1></div>
        <ObservationTypeBadge type={type} />
      </div>

      <form onSubmit={submit} className="mt-6 rounded-xl border border-line bg-surface p-6 shadow-xs">
        {type === '5S' && <div className="mb-5"><label className="mb-1.5 block text-sm font-medium text-ink2-secondary">5S Category</label><select value={categoryId} onChange={(e) => setCategoryId(e.target.value)} className="w-full rounded-md border border-line-strong bg-surface px-3.5 py-2.5 text-sm text-ink2"><option value="">Select 5S category</option>{categories.map((category) => <option key={category.id} value={category.id}>{category.code} — {category.name}</option>)}</select>{errors.categoryId && <p className="mt-1 text-xs text-danger">{errors.categoryId}</p>}</div>}

        {TYPE_FIELDS[type]?.map(([key, label]) => <div className="mb-5" key={key}><label className="mb-1.5 block text-sm font-medium text-ink2-secondary">{label}</label><textarea rows={3} value={details[key] || ''} onChange={(e) => setDetails((current) => ({ ...current, [key]: e.target.value }))} className="w-full resize-y rounded-md border border-line-strong bg-surface px-3.5 py-2.5 text-sm text-ink2" />{errors[key] && <p className="mt-1 text-xs text-danger">{errors[key]}</p>}</div>)}

        <div className="mb-5"><label className="mb-1.5 block text-sm font-medium text-ink2-secondary">Location</label><input value={location} onChange={(e) => setLocation(e.target.value)} className="w-full rounded-md border border-line-strong bg-surface px-3.5 py-2.5 text-sm text-ink2" />{errors.location && <p className="mt-1 text-xs text-danger">{errors.location}</p>}</div>
        <div className="mb-5"><label className="mb-1.5 block text-sm font-medium text-ink2-secondary">Severity</label><select value={severity} onChange={(e) => setSeverity(e.target.value)} className="w-full rounded-md border border-line-strong bg-surface px-3.5 py-2.5 text-sm text-ink2"><option value="LOW">Low</option><option value="MEDIUM">Medium</option><option value="HIGH">High</option></select></div>
        <div className="mb-5"><label className="mb-1.5 block text-sm font-medium text-ink2-secondary">Observation Summary</label><textarea rows={4} value={description} onChange={(e) => setDescription(e.target.value)} className="w-full resize-y rounded-md border border-line-strong bg-surface px-3.5 py-2.5 text-sm text-ink2" />{errors.description && <p className="mt-1 text-xs text-danger">{errors.description}</p>}</div>
        <div className="mb-5"><label className="mb-1.5 block text-sm font-medium text-ink2-secondary">Corrective Action</label><textarea rows={4} value={correctiveAction} onChange={(e) => setCorrectiveAction(e.target.value)} className="w-full resize-y rounded-md border border-line-strong bg-surface px-3.5 py-2.5 text-sm text-ink2" />{errors.correctiveAction && <p className="mt-1 text-xs text-danger">{errors.correctiveAction}</p>}</div>
        <FormField id="edit-target-date" label="Target Date" type="date" value={targetDate} onChange={(e) => setTargetDate(e.target.value)} error={errors.targetDate} />
        <div className="mt-5"><label className="mb-1.5 block text-sm font-medium text-ink2-secondary">Status</label><select value={status} onChange={(e) => setStatus(e.target.value)} className="w-full rounded-md border border-line-strong bg-surface px-3.5 py-2.5 text-sm text-ink2"><option value="OPEN">Open</option><option value="CLOSED">Closed</option></select></div>
        <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:justify-end"><button type="button" onClick={() => navigate(-1)} className="rounded-md border border-line-strong px-5 py-3 text-sm font-semibold text-ink2 hover:bg-canvas">Cancel</button><button type="submit" disabled={saving} className="rounded-md bg-brand px-5 py-3 text-sm font-semibold text-white hover:bg-brand-hover disabled:opacity-60">{saving ? 'Saving...' : 'Save Changes'}</button></div>
      </form>
    </div>
  )
}
