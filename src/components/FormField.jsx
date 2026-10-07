import { useState } from 'react'

export default function FormField({
  id,
  label,
  type = 'text',
  value,
  onChange,
  placeholder,
  error,
  autoComplete,
  isPassword = false,
}) {
  const [showPassword, setShowPassword] = useState(false)
  const inputType = isPassword ? (showPassword ? 'text' : 'password') : type

  return (
    <div className="mb-4">
      <label className="mb-1.5 block text-sm font-medium text-ink2-secondary" htmlFor={id}>
        {label}
      </label>
      <div className="relative">
        <input
          id={id}
          type={inputType}
          value={value}
          onChange={onChange}
          placeholder={placeholder}
          autoComplete={autoComplete}
          aria-invalid={Boolean(error)}
          aria-describedby={error ? `${id}-error` : undefined}
          className={`w-full rounded-md border bg-surface px-3.5 py-2.5 text-sm text-ink2 outline-none transition-colors placeholder:text-ink2-muted focus:border-brand focus:ring-4 focus:ring-brand-soft ${
            isPassword ? 'pr-10' : ''
          } ${error ? 'border-danger focus:border-danger focus:ring-danger-soft' : 'border-line-strong'}`}
        />
        {isPassword && (
          <button
            type="button"
            className="absolute inset-y-0 right-0 flex w-10 items-center justify-center text-ink2-muted transition-colors hover:text-ink2-secondary"
            onClick={() => setShowPassword((prev) => !prev)}
            aria-label={showPassword ? 'Hide password' : 'Show password'}
          >
            {showPassword ? <EyeOffIcon /> : <EyeIcon />}
          </button>
        )}
      </div>
      {error && (
        <p className="mt-1.5 text-xs font-medium text-danger" id={`${id}-error`} role="alert">
          {error}
        </p>
      )}
    </div>
  )
}

function EyeIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path
        d="M1 12s4-7 11-7 11 7 11 7-4 7-11 7-11-7-11-7Z"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <circle cx="12" cy="12" r="3" stroke="currentColor" strokeWidth="1.6" />
    </svg>
  )
}

function EyeOffIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path
        d="M3 3l18 18M10.6 10.6a2.5 2.5 0 0 0 3.5 3.5M9.4 5.5A11.6 11.6 0 0 1 12 5c7 0 11 7 11 7a15.7 15.7 0 0 1-3.3 4.1M6.4 6.4A15.9 15.9 0 0 0 1 12s4 7 11 7c1.3 0 2.5-.2 3.6-.6"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  )
}
