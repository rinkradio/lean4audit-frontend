import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth'
import FormField from '../components/FormField'

const ROLE_HOME = {
  ADMIN: '/admin',
  SUB_ADMIN: '/consultant',
}

export default function LoginPage() {
  const { login } = useAuth()
  const navigate = useNavigate()

  const [employeeId, setEmployeeId] = useState('')
  const [password, setPassword] = useState('')
  const [fieldErrors, setFieldErrors] = useState({})
  const [formError, setFormError] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)

  function validate() {
    const errors = {}
    if (!employeeId.trim()) {
      errors.employeeId = 'Employee ID is required.'
    }
    if (!password) {
      errors.password = 'Password is required.'
    }
    setFieldErrors(errors)
    return Object.keys(errors).length === 0
  }

  async function handleSubmit(event) {
    event.preventDefault()
    if (isSubmitting) return

    setFormError('')
    if (!validate()) return

    setIsSubmitting(true)
    try {
      const user = await login(employeeId.trim(), password)
      navigate(ROLE_HOME[user.role] || '/login', { replace: true })
    } catch (err) {
      const status = err?.response?.status
      if (status === 401) {
        setFormError('Invalid employee ID or password.')
      } else {
        setFormError('Something went wrong. Please try again.')
      }
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="flex min-h-screen flex-col lg:flex-row">
      {/* Brand panel */}
      <div className="relative flex flex-col justify-between overflow-hidden bg-ink-900 px-6 py-10 text-ink2-inverse sm:px-10 sm:py-14 lg:w-1/2 lg:px-16 lg:py-16">
        <div
          className="pointer-events-none absolute inset-0 opacity-40"
          style={{
            backgroundImage:
              'radial-gradient(circle at 15% 20%, rgba(28,92,255,0.35), transparent 45%), radial-gradient(circle at 85% 80%, rgba(28,92,255,0.2), transparent 50%)',
          }}
        />
        <div
          className="pointer-events-none absolute inset-0 opacity-[0.06]"
          style={{
            backgroundImage:
              'linear-gradient(rgba(255,255,255,0.6) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.6) 1px, transparent 1px)',
            backgroundSize: '40px 40px',
          }}
        />

        <div className="relative z-10 max-w-md animate-slide-up">
          <div className="mb-8 flex h-12 w-12 items-center justify-center rounded-xl bg-brand text-base font-bold shadow-lg shadow-brand/30 sm:mb-10">
            L4A
          </div>
          <h1 className="text-3xl font-bold tracking-tight sm:text-4xl lg:text-[2.6rem] lg:leading-[1.1]">
            LEAN4AUDIT
          </h1>
          <p className="mt-3 text-base text-ink2-inverse/70 sm:text-lg">
            Plant Audit &amp; Continuous Improvement
          </p>

          <ul className="mt-8 space-y-3 sm:mt-10">
            {['Lean Audits', 'Digital Observations', 'Continuous Improvement'].map((item) => (
              <li key={item} className="flex items-center gap-3 text-sm text-ink2-inverse/85 sm:text-[15px]">
                <span className="flex h-6 w-6 flex-none items-center justify-center rounded-full bg-white/10">
                  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M20 6 9 17l-5-5" />
                  </svg>
                </span>
                {item}
              </li>
            ))}
          </ul>
        </div>

        <p className="relative z-10 mt-10 text-xs text-ink2-inverse/45 lg:mt-0">
          Secure enterprise access for manufacturing operations
        </p>
      </div>

      {/* Form panel */}
      <div className="flex flex-1 items-center justify-center bg-canvas px-5 py-10 sm:px-10 sm:py-14">
        <form
          className="w-full max-w-[400px] animate-slide-up rounded-xl border border-line bg-surface p-6 shadow-card sm:p-9"
          onSubmit={handleSubmit}
          noValidate
        >
          <h2 className="text-xl font-bold text-ink2 sm:text-2xl">Welcome back</h2>
          <p className="mt-1.5 mb-7 text-sm text-ink2-secondary">Sign in to continue</p>

          <FormField
            id="employee_id"
            label="Employee ID"
            value={employeeId}
            onChange={(e) => setEmployeeId(e.target.value)}
            placeholder="Enter your employee ID"
            autoComplete="username"
            error={fieldErrors.employeeId}
          />

          <FormField
            id="password"
            label="Password"
            isPassword
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Enter your password"
            autoComplete="current-password"
            error={fieldErrors.password}
          />

          {formError && (
            <div
              className="mb-4 rounded-md border border-danger/20 bg-danger-soft px-3.5 py-2.5 text-sm font-medium text-danger"
              role="alert"
            >
              {formError}
            </div>
          )}

          <button
            type="submit"
            className="mt-2 w-full rounded-md bg-brand py-3 text-sm font-bold tracking-wide text-white shadow-xs transition-all hover:bg-brand-hover active:scale-[0.99] disabled:cursor-not-allowed disabled:opacity-60"
            disabled={isSubmitting}
          >
            {isSubmitting ? 'Signing in…' : 'SIGN IN'}
          </button>

          <p className="mt-6 text-center text-xs text-ink2-muted">Secure enterprise access</p>
        </form>
      </div>
    </div>
  )
}
