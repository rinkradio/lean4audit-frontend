import { useNavigate, useParams } from 'react-router-dom'

const TYPES = [
  {
    key: '5S',
    title: '5S',
    subtitle: 'Workplace organization & discipline',
    description: 'Record a 5S finding using the existing 5S audit form.',
    icon: '✓',
    className: 'border-brand/20 bg-brand-soft text-brand',
    path: '5s',
  },
  {
    key: 'GEMBA',
    title: 'Gemba',
    subtitle: 'Go & see the actual workplace',
    description: 'Capture what was observed at the actual process or work area.',
    icon: '⌖',
    className: 'border-success/20 bg-success-soft text-success',
    path: 'gemba',
  },
  {
    key: 'SAFETY',
    title: 'Safety',
    subtitle: 'Hazards, risks & unsafe conditions',
    description: 'Record a safety observation, risk and required action.',
    icon: '!',
    className: 'border-warning/20 bg-warning-soft text-warning',
    path: 'safety',
  },
]

export default function ObservationTypeSelectionPage() {
  const { auditId } = useParams()
  const navigate = useNavigate()

  return (
    <div className="mx-auto max-w-4xl animate-fade-in">
      <button
        type="button"
        onClick={() => navigate(`/consultant/audits/${auditId}`)}
        className="text-sm font-medium text-ink2-secondary hover:text-ink2"
      >
        &larr; Back to Audit
      </button>

      <div className="mt-5 rounded-2xl border border-line bg-surface p-6 shadow-xs sm:p-8">
        <div className="text-center">
          <div className="text-xs font-bold uppercase tracking-[0.16em] text-ink2-muted">
            New Observation
          </div>
          <h1 className="mt-2 text-2xl font-bold text-ink2 sm:text-3xl">
            What type of observation are you recording?
          </h1>
          <p className="mx-auto mt-2 max-w-2xl text-sm leading-6 text-ink2-secondary">
            Select the audit type. Each type opens its own form and is clearly identified in the observation register and final reports.
          </p>
        </div>

        <div className="mt-8 grid gap-4 md:grid-cols-3">
          {TYPES.map((type) => (
            <button
              key={type.key}
              type="button"
              onClick={() => navigate(`/consultant/audits/${auditId}/observations/new/${type.path}`)}
              className="group rounded-2xl border border-line bg-canvas p-5 text-left transition-all hover:-translate-y-1 hover:border-brand/30 hover:bg-surface hover:shadow-md focus:outline-none focus:ring-2 focus:ring-brand/20"
            >
              <div className={`flex h-12 w-12 items-center justify-center rounded-xl border text-xl font-black ${type.className}`}>
                {type.icon}
              </div>
              <h2 className="mt-5 text-xl font-bold text-ink2">{type.title}</h2>
              <p className="mt-1 text-sm font-semibold text-ink2-secondary">{type.subtitle}</p>
              <p className="mt-3 text-sm leading-5 text-ink2-muted">{type.description}</p>
              <div className="mt-5 text-sm font-bold text-brand transition-transform group-hover:translate-x-1">
                Open {type.title} Form →
              </div>
            </button>
          ))}
        </div>
      </div>
    </div>
  )
}
