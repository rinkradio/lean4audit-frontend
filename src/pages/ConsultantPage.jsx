import { useNavigate } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth'

export default function ConsultantPage() {
  const { user } = useAuth()
  const navigate = useNavigate()

  return (
    <div className="mx-auto max-w-3xl">
      <h1 className="text-xl font-bold text-ink2 sm:text-2xl">
        Welcome, {user?.full_name}
      </h1>
      <p className="mt-1.5 text-sm text-ink2-secondary">
        Start a new 5S audit or continue one you've already begun.
      </p>

      <div className="mt-6 grid gap-4 sm:grid-cols-2">
        <button
          onClick={() => navigate('/consultant/audits/new')}
          className="rounded-xl border border-line bg-surface p-6 text-left shadow-xs transition-colors hover:border-brand hover:bg-brand-soft"
        >
          <div className="text-sm font-semibold uppercase tracking-wider text-brand">
            Start New Audit
          </div>
          <p className="mt-2 text-sm text-ink2-secondary">
            Select a zone and enter audit details to begin a new 5S audit.
          </p>
        </button>

        <button
          onClick={() => navigate('/consultant/audits')}
          className="rounded-xl border border-line bg-surface p-6 text-left shadow-xs transition-colors hover:border-brand hover:bg-brand-soft"
        >
          <div className="text-sm font-semibold uppercase tracking-wider text-brand">
            My Audits
          </div>
          <p className="mt-2 text-sm text-ink2-secondary">
            View, resume, or check the status of audits you've conducted.
          </p>
        </button>
      </div>
    </div>
  )
}
