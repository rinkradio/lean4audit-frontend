import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth'

const ROLE_HOME = {
  ADMIN: '/admin',
  SUB_ADMIN: '/consultant',
}

export default function LoginPage() {
  const { login } = useAuth()
  const navigate = useNavigate()

  const [employeeId, setEmployeeId] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [fieldErrors, setFieldErrors] = useState({})
  const [formError, setFormError] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)

  function validate() {
    const errors = {}
    if (!employeeId.trim()) errors.employeeId = 'Employee ID is required.'
    if (!password) errors.password = 'Password is required.'
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

  const inputBase =
    'h-12 sm:h-[52px] w-full rounded-xl border bg-white pl-11 pr-4 text-base sm:text-sm text-[#17212B] outline-none transition placeholder:text-[#9AA5B1] focus:ring-4'

  return (
    <main className="min-h-[100svh] bg-[#F8FAFC] text-[#152536] antialiased">
      <div className="grid min-h-[100svh] lg:grid-cols-[0.92fr_1.08fr]">
        {/* Brand panel: decorative only; all authentication behavior stays unchanged. */}
        <aside className="relative hidden overflow-hidden bg-[#F0F6FA] lg:flex lg:min-h-[100svh] lg:flex-col lg:justify-between lg:px-10 lg:py-10 xl:px-16 xl:py-12">
          <div aria-hidden="true" className="pointer-events-none absolute -right-24 -top-20 h-80 w-80 rounded-full bg-[#D8EAF5] blur-3xl" />
          <div aria-hidden="true" className="pointer-events-none absolute -bottom-28 -left-24 h-96 w-96 rounded-full bg-[#E1EEF6] blur-3xl" />
          <div aria-hidden="true" className="absolute inset-0 opacity-40" style={{ backgroundImage: 'radial-gradient(#A7C5D8 0.8px, transparent 0.8px)', backgroundSize: '22px 22px' }} />

          <Brand dark className="relative z-10" />

          <div className="relative z-10 max-w-xl pb-4 xl:pb-10">
            <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-[#D7E6EF] bg-white/70 px-3.5 py-2 text-xs font-semibold text-[#42647A]">
              <span className="h-2 w-2 rounded-full bg-[#4B9B78]" />
              Operational excellence, made practical
            </div>
            <h1 className="max-w-lg text-4xl font-semibold leading-[1.12] tracking-[-0.045em] text-[#132B3D] xl:text-[52px]">
              Better audits.
              <br />
              Clearer actions.
              <br />
              <span className="text-[#397CA4]">Stronger operations.</span>
            </h1>
            <p className="mt-6 max-w-md text-base leading-7 text-[#637B8B]">
              A focused workspace for plant audits, observations, and continuous improvement.
            </p>
            <div className="mt-10 grid max-w-lg grid-cols-3 border-t border-[#D5E4EC] pt-5">
              <Capability number="01" title="Audits" description="Consistent checks" />
              <Capability number="02" title="Insights" description="Clear observations" bordered />
              <Capability number="03" title="Actions" description="Track improvement" bordered />
            </div>
          </div>

          <div className="relative z-10 flex items-center justify-between gap-4 text-xs text-[#8296A3]">
            <span>© {new Date().getFullYear()} Lean4HR Systems</span>
            <span className="inline-flex items-center gap-2">
              <ShieldSmallIcon /> Secure enterprise access
            </span>
          </div>
        </aside>

        {/* Login area */}
        <section className="relative flex min-h-[100svh] items-center justify-center overflow-hidden px-5 py-7 sm:px-8 sm:py-10 lg:px-12 xl:px-16">
          <div aria-hidden="true" className="pointer-events-none absolute -right-24 -top-24 h-64 w-64 rounded-full bg-[#E7F2F8] blur-3xl lg:hidden" />
          <div aria-hidden="true" className="pointer-events-none absolute -bottom-24 -left-24 h-64 w-64 rounded-full bg-[#F0F5F8] blur-3xl lg:hidden" />

          <div className="relative z-10 w-full max-w-[420px]">
            <div className="mb-10 lg:hidden">
              <Brand />
            </div>

            <div className="mb-8">
              <div className="mb-5 flex h-11 w-11 items-center justify-center rounded-2xl border border-[#DCEAF2] bg-[#EDF6FB] text-[#36779E]">
                <LockIcon />
              </div>
              <p className="mb-2 text-xs font-bold uppercase tracking-[0.16em] text-[#57809A]">Welcome to Lean4Audit</p>
              <h2 className="text-[30px] font-semibold leading-tight tracking-[-0.045em] text-[#172B3A] sm:text-[34px]">
                Sign in to your account
              </h2>
              <p className="mt-3 max-w-sm text-sm leading-6 text-[#718391]">
                Enter your employee credentials to continue to your workspace.
              </p>
            </div>

            <form onSubmit={handleSubmit} noValidate className="space-y-5">
              <div>
                <label htmlFor="employee_id" className="mb-2 block text-sm font-semibold text-[#344B5A]">
                  Employee ID
                </label>
                <div className="relative">
                  <span className="pointer-events-none absolute inset-y-0 left-0 flex w-11 items-center justify-center text-[#8A9BA7]"><UserIcon /></span>
                  <input
                    id="employee_id"
                    type="text"
                    value={employeeId}
                    onChange={(e) => {
                      setEmployeeId(e.target.value)
                      if (fieldErrors.employeeId) setFieldErrors((prev) => ({ ...prev, employeeId: '' }))
                    }}
                    placeholder="Enter your employee ID"
                    autoComplete="username"
                    aria-invalid={Boolean(fieldErrors.employeeId)}
                    aria-describedby={fieldErrors.employeeId ? 'employee_id-error' : undefined}
                    className={`${inputBase} ${fieldErrors.employeeId ? 'border-[#C84A42] bg-[#FFF9F8] focus:border-[#C84A42] focus:ring-[#C84A42]/10' : 'border-[#D9E2E8] hover:border-[#B8CAD5] focus:border-[#4D8CAE] focus:ring-[#4D8CAE]/10'}`}
                  />
                </div>
                {fieldErrors.employeeId && (
                  <p id="employee_id-error" className="mt-2 flex items-center gap-1.5 text-xs font-medium text-[#C84A42]" role="alert">
                    <AlertIcon /> {fieldErrors.employeeId}
                  </p>
                )}
              </div>

              <div>
                <label htmlFor="password" className="mb-2 block text-sm font-semibold text-[#344B5A]">Password</label>
                <div className="relative">
                  <span className="pointer-events-none absolute inset-y-0 left-0 flex w-11 items-center justify-center text-[#8A9BA7]"><KeyIcon /></span>
                  <input
                    id="password"
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => {
                      setPassword(e.target.value)
                      if (fieldErrors.password) setFieldErrors((prev) => ({ ...prev, password: '' }))
                    }}
                    placeholder="Enter your password"
                    autoComplete="current-password"
                    aria-invalid={Boolean(fieldErrors.password)}
                    aria-describedby={fieldErrors.password ? 'password-error' : undefined}
                    className={`${inputBase} pr-12 ${fieldErrors.password ? 'border-[#C84A42] bg-[#FFF9F8] focus:border-[#C84A42] focus:ring-[#C84A42]/10' : 'border-[#D9E2E8] hover:border-[#B8CAD5] focus:border-[#4D8CAE] focus:ring-[#4D8CAE]/10'}`}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword((prev) => !prev)}
                    className="absolute inset-y-0 right-0 flex w-12 items-center justify-center rounded-r-xl text-[#7D909D] transition hover:text-[#294B60] focus-visible:outline focus-visible:outline-2 focus-visible:outline-[#4D8CAE]"
                    aria-label={showPassword ? 'Hide password' : 'Show password'}
                  >
                    {showPassword ? <EyeOffIcon /> : <EyeIcon />}
                  </button>
                </div>
                {fieldErrors.password && (
                  <p id="password-error" className="mt-2 flex items-center gap-1.5 text-xs font-medium text-[#C84A42]" role="alert">
                    <AlertIcon /> {fieldErrors.password}
                  </p>
                )}
              </div>

              {formError && (
                <div className="flex items-start gap-3 rounded-xl border border-[#F0D0CC] bg-[#FFF7F6] px-4 py-3" role="alert">
                  <span className="mt-0.5 flex h-6 w-6 flex-none items-center justify-center rounded-full bg-[#F9E2DF] text-[#B83E36]"><AlertIcon /></span>
                  <div>
                    <p className="text-sm font-semibold text-[#9F3730]">Sign in unsuccessful</p>
                    <p className="mt-1 text-xs leading-5 text-[#B55A53]">{formError}</p>
                  </div>
                </div>
              )}

              <button
                type="submit"
                disabled={isSubmitting}
                className="group mt-2 flex min-h-12 w-full items-center justify-center gap-2 rounded-xl bg-[#245F82] px-5 py-3 text-sm font-semibold text-white shadow-[0_5px_14px_rgba(36,95,130,0.14)] transition duration-200 hover:bg-[#1D506F] hover:shadow-[0_8px_20px_rgba(36,95,130,0.18)] active:scale-[0.99] disabled:cursor-not-allowed disabled:opacity-60 sm:min-h-[52px]"
              >
                {isSubmitting ? (
                  <><span className="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white" /> Signing in...</>
                ) : (
                  <>Continue to workspace <span className="transition-transform group-hover:translate-x-1"><ArrowRightIcon /></span></>
                )}
              </button>
            </form>

            <div className="mt-7 flex items-start gap-2.5 border-t border-[#E7EDF1] pt-5">
              <span className="mt-0.5 text-[#8096A4]"><ShieldSmallIcon /></span>
              <p className="text-xs leading-5 text-[#8495A0]">
                Authorized access only. Your credentials are used to securely access the Lean4Audit platform.
              </p>
            </div>

            <div className="mt-8 flex flex-wrap items-center justify-center gap-x-2 gap-y-1 text-center text-[11px] text-[#9AA8B1] lg:justify-start">
              <span className="font-semibold tracking-wide text-[#7C919F]">LEAN4HR SYSTEMS</span>
              <span aria-hidden="true">·</span>
              <span>Secure enterprise platform</span>
            </div>
          </div>
        </section>
      </div>

      <style>{`
        @media (prefers-reduced-motion: reduce) {
          *, *::before, *::after {
            animation-duration: 0.01ms !important;
            animation-iteration-count: 1 !important;
            transition-duration: 0.01ms !important;
            scroll-behavior: auto !important;
          }
        }
      `}</style>
    </main>
  )
}

function Brand({ dark = false, className = '' }) {
  return (
    <div className={`flex items-center gap-3 ${className}`}>
      <div className={`flex h-11 w-11 items-center justify-center rounded-2xl ${dark ? 'border border-[#D5E6EF] bg-white/80' : 'border border-[#D8E7EF] bg-white shadow-sm'}`}>
        <ShieldIcon />
      </div>
      <div>
        <div className="text-[19px] font-extrabold tracking-[-0.045em] text-[#173247]">
          LEAN<span className="text-[#397FA5]">4</span>AUDIT
        </div>
        <div className="mt-0.5 text-[9px] font-semibold uppercase tracking-[0.14em] text-[#718A9A]">
          Plant Audit &amp; Continuous Improvement
        </div>
      </div>
    </div>
  )
}

function Capability({ number, title, description, bordered }) {
  return (
    <div className={`${bordered ? 'border-l border-[#D5E4EC] pl-4 sm:pl-5' : 'pr-3 sm:pr-5'} py-1`}>
      <div className="mb-2 text-[10px] font-bold tracking-[0.14em] text-[#5A8CAA]">{number}</div>
      <div className="text-sm font-semibold text-[#29475B]">{title}</div>
      <div className="mt-1 text-[11px] leading-4 text-[#8195A2]">{description}</div>
    </div>
  )
}

function ShieldIcon() {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" aria-hidden="true" className="text-[#397FA5]">
      <path d="M12 3 20 6v5.8c0 4.8-3.2 7.8-8 9.2-4.8-1.4-8-4.4-8-9.2V6l8-3Z" stroke="currentColor" strokeWidth="1.7" strokeLinejoin="round" />
      <path d="m8.5 12 2.2 2.2 4.8-4.8" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}

function ShieldSmallIcon() {
  return (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" aria-hidden="true" className="inline-block flex-none">
      <path d="M12 3 20 6v5.8c0 4.8-3.2 7.8-8 9.2-4.8-1.4-8-4.4-8-9.2V6l8-3Z" stroke="currentColor" strokeWidth="1.7" strokeLinejoin="round" />
      <path d="m8.5 12 2.2 2.2 4.8-4.8" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}

function LockIcon() {
  return (
    <svg width="19" height="19" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <rect x="5" y="10" width="14" height="10" rx="2" stroke="currentColor" strokeWidth="1.7" />
      <path d="M8 10V7a4 4 0 0 1 8 0v3" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" />
    </svg>
  )
}

function UserIcon() {
  return (
    <svg width="17" height="17" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <circle cx="12" cy="8" r="3.2" stroke="currentColor" strokeWidth="1.7" />
      <path d="M5.5 20c.7-3.5 3-5.2 6.5-5.2s5.8 1.7 6.5 5.2" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" />
    </svg>
  )
}

function KeyIcon() {
  return (
    <svg width="17" height="17" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <circle cx="8" cy="15" r="3" stroke="currentColor" strokeWidth="1.7" />
      <path d="m10.2 12.8 8.3-8.3M15 7l2 2M17.5 4.5l2 2" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}

function EyeIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path d="M2 12s3.6-6 10-6 10 6 10 6-3.6 6-10 6S2 12 2 12Z" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
      <circle cx="12" cy="12" r="2.5" stroke="currentColor" strokeWidth="1.6" />
    </svg>
  )
}

function EyeOffIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path d="m3 3 18 18" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" />
      <path d="M10.6 10.6a2.5 2.5 0 0 0 3.5 3.5" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
      <path d="M9.4 5.5A11.8 11.8 0 0 1 12 5c6.4 0 10 7 10 7a15 15 0 0 1-3.2 4.1M6.4 6.4A15.8 15.8 0 0 0 2 12s3.6 7 10 7c1.3 0 2.5-.2 3.6-.6" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}

function ArrowRightIcon() {
  return (
    <svg width="17" height="17" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path d="M5 12h13" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
      <path d="m13 6 6 6-6 6" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}

function AlertIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" aria-hidden="true" className="flex-none">
      <path d="M12 8v4M12 16h.01" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
      <path d="M10.3 4.5 3.1 17a2 2 0 0 0 1.7 3h14.4a2 2 0 0 0 1.7-3L13.7 4.5a2 2 0 0 0-3.4 0Z" stroke="currentColor" strokeWidth="1.6" strokeLinejoin="round" />
    </svg>
  )
}
