import { useNavigate, useParams } from 'react-router-dom'

export default function ObservationPlaceholderPage() {
  const { auditId } = useParams()
  const navigate = useNavigate()

  return (
    <div className="mx-auto flex max-w-lg flex-col items-center px-4 py-16 text-center">
      <div className="flex h-14 w-14 items-center justify-center rounded-full bg-brand-soft text-brand">
        <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
          <path d="M12 8v5M12 16h.01" />
          <circle cx="12" cy="12" r="9" />
        </svg>
      </div>

      <h1 className="mt-5 text-xl font-bold text-ink2">Observation Management</h1>
      <p className="mt-2 text-sm leading-relaxed text-ink2-secondary">
        Observation capture will be available in the next phase.
      </p>

      <button
        className="mt-6 rounded-md bg-brand px-5 py-2.5 text-sm font-semibold text-white shadow-xs transition-colors hover:bg-brand-hover"
        onClick={() => navigate(`/consultant/audits/${auditId}`)}
      >
        Back to Audit
      </button>
    </div>
  )
}
