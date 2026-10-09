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

      navigate(ROLE_HOME[user.role] || '/login', {
        replace: true,
      })
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
    'h-[52px] w-full rounded-[8px] border bg-white px-4 text-[14px] font-medium text-[#17212B] outline-none transition-all duration-200 placeholder:text-[#9AA5B1]'

  return (
    <main className="min-h-screen bg-[#F3F5F7] text-[#17212B]">
      <div className="grid min-h-screen lg:grid-cols-[1.08fr_0.92fr]">

        {/* =========================================================
            LEFT — BRAND / INDUSTRIAL IDENTITY
        ========================================================== */}
        <section className="relative hidden min-h-screen overflow-hidden bg-[#102B43] lg:flex">
          
          {/* Subtle industrial grid */}
          <div
            className="absolute inset-0 opacity-[0.055]"
            aria-hidden="true"
            style={{
              backgroundImage: `
                linear-gradient(rgba(255,255,255,0.9) 1px, transparent 1px),
                linear-gradient(90deg, rgba(255,255,255,0.9) 1px, transparent 1px)
              `,
              backgroundSize: '48px 48px',
            }}
          />

          {/* Soft architectural glow */}
          <div
            className="absolute -left-40 -top-40 h-[520px] w-[520px] rounded-full bg-[#2D6EA5]/20 blur-3xl"
            aria-hidden="true"
          />

          <div
            className="absolute -bottom-48 right-[-100px] h-[600px] w-[600px] rounded-full bg-[#17496E]/40 blur-3xl"
            aria-hidden="true"
          />

          {/* Industrial line structure */}
          <div
            className="absolute right-0 top-0 h-full w-[42%] opacity-[0.08]"
            aria-hidden="true"
          >
            <div className="absolute right-[25%] top-0 h-full w-px bg-white" />
            <div className="absolute right-[55%] top-0 h-full w-px bg-white" />
            <div className="absolute right-0 top-[26%] h-px w-full bg-white" />
            <div className="absolute right-0 top-[62%] h-px w-full bg-white" />

            <div className="absolute right-[18%] top-[19%] h-24 w-24 border border-white" />
            <div className="absolute right-[42%] top-[43%] h-36 w-36 border border-white" />
            <div className="absolute right-[8%] bottom-[18%] h-28 w-28 border border-white" />
          </div>

          <div className="relative z-10 flex w-full flex-col justify-between px-12 py-12 xl:px-16 xl:py-14 2xl:px-20">

            {/* Brand */}
            <div className="animate-[fadeIn_500ms_ease-out]">
              <div className="flex items-center gap-3">
                
                <div className="flex h-11 w-11 items-center justify-center rounded-[9px] border border-white/15 bg-white/[0.07]">
                  <ShieldIcon />
                </div>

                <div>
                  <div className="text-[20px] font-extrabold tracking-[-0.03em] text-white">
                    LEAN<span className="text-[#4C8FD0]">4</span>AUDIT
                  </div>

                  <div className="mt-0.5 text-[10px] font-semibold uppercase tracking-[0.14em] text-white/45">
                    Plant Audit & Continuous Improvement
                  </div>
                </div>
              </div>
            </div>

            {/* Main message */}
            <div className="max-w-[590px]">

              <div className="mb-7 flex items-center gap-3">
                <span className="h-px w-9 bg-[#5B99CA]" />
                <span className="text-[11px] font-bold uppercase tracking-[0.18em] text-[#76A8CF]">
                  Operational Excellence
                </span>
              </div>

              <h1 className="max-w-[580px] text-[42px] font-semibold leading-[1.08] tracking-[-0.035em] text-white xl:text-[52px]">
                Build safer,
                <br />
                leaner and more
                <br />
                efficient plants.
              </h1>

              <p className="mt-7 max-w-[500px] text-[15px] leading-7 text-white/60">
                A structured digital platform for plant audits,
                observations and continuous improvement initiatives.
              </p>

              {/* Capability indicators */}
              <div className="mt-10 grid max-w-[560px] grid-cols-3 border-y border-white/10">

                <Capability
                  number="01"
                  title="Audits"
                  description="Standardized"
                />

                <Capability
                  number="02"
                  title="Observations"
                  description="Digital"
                  bordered
                />

                <Capability
                  number="03"
                  title="Improvement"
                  description="Action driven"
                  bordered
                />

              </div>
            </div>

            {/* Footer */}
            <div className="flex items-end justify-between gap-8">
              <div>
                <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-white/35">
                  Lean4HR Systems
                </p>
                <p className="mt-2 text-xs text-white/30">
                  Enterprise audit management platform
                </p>
              </div>

              <div className="hidden text-right xl:block">
                <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-white/30">
                  Secure Environment
                </p>
                <div className="mt-2 flex items-center justify-end gap-2">
                  <span className="h-1.5 w-1.5 rounded-full bg-[#4FA875]" />
                  <span className="text-[11px] text-white/35">
                    System operational
                  </span>
                </div>
              </div>
            </div>

          </div>
        </section>

        {/* =========================================================
            RIGHT — LOGIN
        ========================================================== */}
        <section className="relative flex min-h-screen items-center justify-center overflow-hidden bg-[#F3F5F7] px-5 py-10 sm:px-8 lg:px-12">

          {/* Mobile-only subtle background */}
          <div
            className="pointer-events-none absolute inset-0 lg:hidden"
            aria-hidden="true"
            style={{
              backgroundImage: `
                linear-gradient(rgba(16,43,67,0.025) 1px, transparent 1px),
                linear-gradient(90deg, rgba(16,43,67,0.025) 1px, transparent 1px)
              `,
              backgroundSize: '36px 36px',
            }}
          />

          <div className="relative z-10 w-full max-w-[440px]">

            {/* Mobile brand */}
            <div className="mb-9 flex items-center lg:hidden">
              <div className="flex h-10 w-10 items-center justify-center rounded-[8px] bg-[#102B43]">
                <ShieldIcon light />
              </div>

              <div className="ml-3">
                <div className="text-[18px] font-extrabold tracking-[-0.03em] text-[#102B43]">
                  LEAN<span className="text-[#2869A0]">4</span>AUDIT
                </div>

                <div className="text-[9px] font-semibold uppercase tracking-[0.13em] text-[#7C8792]">
                  Plant Audit & Continuous Improvement
                </div>
              </div>
            </div>

            {/* Login card */}
            <div className="rounded-[14px] border border-[#DCE1E6] bg-white px-6 py-7 shadow-[0_18px_50px_rgba(16,43,67,0.07)] sm:px-9 sm:py-9">

              {/* Card heading */}
              <div className="mb-8">
                <div className="mb-4 flex h-9 w-9 items-center justify-center rounded-[7px] bg-[#EDF4FA] text-[#245E8E]">
                  <LockIcon />
                </div>

                <h2 className="text-[26px] font-semibold tracking-[-0.025em] text-[#17212B]">
                  Welcome back
                </h2>

                <p className="mt-2 text-[13px] leading-5 text-[#71808D]">
                  Sign in to access your Lean4Audit workspace.
                </p>
              </div>

              <form
                onSubmit={handleSubmit}
                noValidate
              >

                {/* Employee ID */}
                <div className="mb-5">
                  <label
                    htmlFor="employee_id"
                    className="mb-2 block text-[12px] font-bold uppercase tracking-[0.06em] text-[#4B5864]"
                  >
                    Employee ID
                  </label>

                  <div className="relative">
                    <span className="pointer-events-none absolute inset-y-0 left-0 flex w-11 items-center justify-center text-[#87939E]">
                      <UserIcon />
                    </span>

                    <input
                      id="employee_id"
                      type="text"
                      value={employeeId}
                      onChange={(e) => {
                        setEmployeeId(e.target.value)

                        if (fieldErrors.employeeId) {
                          setFieldErrors((prev) => ({
                            ...prev,
                            employeeId: '',
                          }))
                        }
                      }}
                      placeholder="Enter your employee ID"
                      autoComplete="username"
                      aria-invalid={Boolean(fieldErrors.employeeId)}
                      aria-describedby={
                        fieldErrors.employeeId
                          ? 'employee_id-error'
                          : undefined
                      }
                      className={`${inputBase} pl-11 ${
                        fieldErrors.employeeId
                          ? 'border-[#C84A42] bg-[#FFF9F8] focus:border-[#C84A42] focus:ring-4 focus:ring-[#C84A42]/10'
                          : 'border-[#CDD5DC] hover:border-[#AEB8C1] focus:border-[#2869A0] focus:ring-4 focus:ring-[#2869A0]/10'
                      }`}
                    />
                  </div>

                  {fieldErrors.employeeId && (
                    <p
                      id="employee_id-error"
                      className="mt-2 flex items-center gap-1.5 text-[11px] font-semibold text-[#C84A42]"
                      role="alert"
                    >
                      <AlertIcon />
                      {fieldErrors.employeeId}
                    </p>
                  )}
                </div>

                {/* Password */}
                <div className="mb-5">
                  <label
                    htmlFor="password"
                    className="mb-2 block text-[12px] font-bold uppercase tracking-[0.06em] text-[#4B5864]"
                  >
                    Password
                  </label>

                  <div className="relative">
                    <span className="pointer-events-none absolute inset-y-0 left-0 flex w-11 items-center justify-center text-[#87939E]">
                      <KeyIcon />
                    </span>

                    <input
                      id="password"
                      type={showPassword ? 'text' : 'password'}
                      value={password}
                      onChange={(e) => {
                        setPassword(e.target.value)

                        if (fieldErrors.password) {
                          setFieldErrors((prev) => ({
                            ...prev,
                            password: '',
                          }))
                        }
                      }}
                      placeholder="Enter your password"
                      autoComplete="current-password"
                      aria-invalid={Boolean(fieldErrors.password)}
                      aria-describedby={
                        fieldErrors.password
                          ? 'password-error'
                          : undefined
                      }
                      className={`${inputBase} pl-11 pr-12 ${
                        fieldErrors.password
                          ? 'border-[#C84A42] bg-[#FFF9F8] focus:border-[#C84A42] focus:ring-4 focus:ring-[#C84A42]/10'
                          : 'border-[#CDD5DC] hover:border-[#AEB8C1] focus:border-[#2869A0] focus:ring-4 focus:ring-[#2869A0]/10'
                      }`}
                    />

                    <button
                      type="button"
                      onClick={() => setShowPassword((prev) => !prev)}
                      className="absolute inset-y-0 right-0 flex w-12 items-center justify-center text-[#89949E] transition-colors hover:text-[#34424E]"
                      aria-label={
                        showPassword
                          ? 'Hide password'
                          : 'Show password'
                      }
                    >
                      {showPassword ? <EyeOffIcon /> : <EyeIcon />}
                    </button>
                  </div>

                  {fieldErrors.password && (
                    <p
                      id="password-error"
                      className="mt-2 flex items-center gap-1.5 text-[11px] font-semibold text-[#C84A42]"
                      role="alert"
                    >
                      <AlertIcon />
                      {fieldErrors.password}
                    </p>
                  )}
                </div>

                {/* Server error */}
                {formError && (
                  <div
                    className="mb-5 flex items-start gap-3 rounded-[8px] border border-[#E8C5C2] bg-[#FFF7F6] px-3.5 py-3"
                    role="alert"
                  >
                    <div className="mt-0.5 flex h-5 w-5 flex-none items-center justify-center rounded-full bg-[#F5D8D5] text-[#B83E36]">
                      <AlertIcon />
                    </div>

                    <div>
                      <p className="text-[12px] font-bold text-[#9F3730]">
                        Sign in unsuccessful
                      </p>

                      <p className="mt-0.5 text-[11px] leading-4 text-[#B55A53]">
                        {formError}
                      </p>
                    </div>
                  </div>
                )}

                {/* Sign in */}
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="group relative mt-2 flex h-[52px] w-full items-center justify-center overflow-hidden rounded-[8px] bg-[#1F5F8F] px-5 text-[13px] font-bold tracking-[0.02em] text-white shadow-[0_5px_14px_rgba(31,95,143,0.18)] transition-all duration-200 hover:bg-[#194F78] hover:shadow-[0_7px_18px_rgba(31,95,143,0.23)] active:translate-y-px disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {isSubmitting ? (
                    <>
                      <span className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white" />
                      Signing in...
                    </>
                  ) : (
                    <>
                      Sign in to workspace

                      <span className="ml-3 transition-transform duration-200 group-hover:translate-x-1">
                        <ArrowRightIcon />
                      </span>
                    </>
                  )}
                </button>
              </form>

              {/* Bottom information */}
              <div className="mt-7 border-t border-[#E9EDF0] pt-5">
                <div className="flex items-start gap-2.5">
                  <ShieldSmallIcon />

                  <p className="text-[10.5px] leading-[1.55] text-[#87929C]">
                    Authorized access only. Your credentials are protected
                    and used solely for secure access to the Lean4Audit platform.
                  </p>
                </div>
              </div>
            </div>

            {/* Outside card footer */}
            <div className="mt-6 flex flex-col items-center justify-center gap-2 text-center sm:flex-row sm:gap-3">
              <span className="text-[10px] font-semibold uppercase tracking-[0.12em] text-[#98A1AA]">
                Lean4HR Systems
              </span>

              <span className="hidden h-3 w-px bg-[#CBD1D6] sm:block" />

              <span className="text-[10px] text-[#A0A8B0]">
                Secure enterprise platform
              </span>
            </div>

          </div>
        </section>
      </div>

      {/* Small animation definition — no new CSS file */}
      <style>{`
        @keyframes fadeIn {
          from {
            opacity: 0;
            transform: translateY(6px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        @media (prefers-reduced-motion: reduce) {
          *,
          *::before,
          *::after {
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

/* ================================================================
   SUPPORTING UI COMPONENTS
================================================================ */

function Capability({ number, title, description, bordered }) {
  return (
    <div
      className={`relative py-5 ${
        bordered
          ? 'border-l border-white/10 pl-5'
          : 'pr-5'
      }`}
    >
      <div className="mb-2 text-[10px] font-bold tracking-[0.15em] text-[#6E9DC2]">
        {number}
      </div>

      <div className="text-[13px] font-semibold text-white/90">
        {title}
      </div>

      <div className="mt-1 text-[10px] text-white/35">
        {description}
      </div>
    </div>
  )
}

function ShieldIcon({ light = false }) {
  return (
    <svg
      width="21"
      height="21"
      viewBox="0 0 24 24"
      fill="none"
      aria-hidden="true"
      className={light ? 'text-white' : 'text-white'}
    >
      <path
        d="M12 3 20 6v5.8c0 4.8-3.2 7.8-8 9.2-4.8-1.4-8-4.4-8-9.2V6l8-3Z"
        stroke="currentColor"
        strokeWidth="1.7"
        strokeLinejoin="round"
      />

      <path
        d="m8.5 12 2.2 2.2 4.8-4.8"
        stroke="currentColor"
        strokeWidth="1.7"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  )
}

function ShieldSmallIcon() {
  return (
    <svg
      width="15"
      height="15"
      viewBox="0 0 24 24"
      fill="none"
      className="mt-0.5 flex-none text-[#7F8A94]"
      aria-hidden="true"
    >
      <path
        d="M12 3 20 6v5.8c0 4.8-3.2 7.8-8 9.2-4.8-1.4-8-4.4-8-9.2V6l8-3Z"
        stroke="currentColor"
        strokeWidth="1.7"
        strokeLinejoin="round"
      />

      <path
        d="m8.5 12 2.2 2.2 4.8-4.8"
        stroke="currentColor"
        strokeWidth="1.7"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  )
}

function LockIcon() {
  return (
    <svg
      width="17"
      height="17"
      viewBox="0 0 24 24"
      fill="none"
      aria-hidden="true"
    >
      <rect
        x="5"
        y="10"
        width="14"
        height="10"
        rx="2"
        stroke="currentColor"
        strokeWidth="1.7"
      />

      <path
        d="M8 10V7a4 4 0 0 1 8 0v3"
        stroke="currentColor"
        strokeWidth="1.7"
        strokeLinecap="round"
      />
    </svg>
  )
}

function UserIcon() {
  return (
    <svg
      width="17"
      height="17"
      viewBox="0 0 24 24"
      fill="none"
      aria-hidden="true"
    >
      <circle
        cx="12"
        cy="8"
        r="3.2"
        stroke="currentColor"
        strokeWidth="1.7"
      />

      <path
        d="M5.5 20c.7-3.5 3-5.2 6.5-5.2s5.8 1.7 6.5 5.2"
        stroke="currentColor"
        strokeWidth="1.7"
        strokeLinecap="round"
      />
    </svg>
  )
}

function KeyIcon() {
  return (
    <svg
      width="17"
      height="17"
      viewBox="0 0 24 24"
      fill="none"
      aria-hidden="true"
    >
      <circle
        cx="8"
        cy="15"
        r="3"
        stroke="currentColor"
        strokeWidth="1.7"
      />

      <path
        d="m10.2 12.8 8.3-8.3M15 7l2 2M17.5 4.5l2 2"
        stroke="currentColor"
        strokeWidth="1.7"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  )
}

function EyeIcon() {
  return (
    <svg
      width="18"
      height="18"
      viewBox="0 0 24 24"
      fill="none"
      aria-hidden="true"
    >
      <path
        d="M2 12s3.6-6 10-6 10 6 10 6-3.6 6-10 6S2 12 2 12Z"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinecap="round"
        strokeLinejoin="round"
      />

      <circle
        cx="12"
        cy="12"
        r="2.5"
        stroke="currentColor"
        strokeWidth="1.6"
      />
    </svg>
  )
}

function EyeOffIcon() {
  return (
    <svg
      width="18"
      height="18"
      viewBox="0 0 24 24"
      fill="none"
      aria-hidden="true"
    >
      <path
        d="m3 3 18 18"
        stroke="currentColor"
        strokeWidth="1.7"
        strokeLinecap="round"
      />

      <path
        d="M10.6 10.6a2.5 2.5 0 0 0 3.5 3.5"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinecap="round"
      />

      <path
        d="M9.4 5.5A11.8 11.8 0 0 1 12 5c6.4 0 10 7 10 7a15 15 0 0 1-3.2 4.1"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinecap="round"
        strokeLinejoin="round"
      />

      <path
        d="M6.4 6.4A15.8 15.8 0 0 0 2 12s3.6 7 10 7c1.3 0 2.5-.2 3.6-.6"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  )
}

function ArrowRightIcon() {
  return (
    <svg
      width="17"
      height="17"
      viewBox="0 0 24 24"
      fill="none"
      aria-hidden="true"
    >
      <path
        d="M5 12h13"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
      />

      <path
        d="m13 6 6 6-6 6"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  )
}

function AlertIcon() {
  return (
    <svg
      width="13"
      height="13"
      viewBox="0 0 24 24"
      fill="none"
      aria-hidden="true"
    >
      <path
        d="M12 8v4"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
      />

      <path
        d="M12 16h.01"
        stroke="currentColor"
        strokeWidth="2.5"
        strokeLinecap="round"
      />

      <path
        d="M10.3 4.5 3.1 17a2 2 0 0 0 1.7 3h14.4a2 2 0 0 0 1.7-3L13.7 4.5a2 2 0 0 0-3.4 0Z"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinejoin="round"
      />
    </svg>
  )
}