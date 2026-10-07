import { useState } from 'react'
import FormField from '../../components/FormField'
import { resetConsultantPassword } from '../../services/consultantService'

export default function ResetPasswordDialog({ consultant, onClose, onDone }) {
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [fieldErrors, setFieldErrors] = useState({})
  const [formError, setFormError] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)

  function validate() {
    const errors = {}
    if (!newPassword) {
      errors.newPassword = 'Password is required.'
    } else if (newPassword.length < 8) {
      errors.newPassword = 'Password must be at least 8 characters.'
    }
    if (!confirmPassword) {
      errors.confirmPassword = 'Please confirm the password.'
    } else if (newPassword !== confirmPassword) {
      errors.confirmPassword = 'Passwords do not match.'
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
      await resetConsultantPassword(consultant.id, newPassword, confirmPassword)
      onDone()
    } catch {
      setFormError('Unable to reset password. Please try again.')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-ink-950/45 p-4 backdrop-blur-sm animate-fade-in"
      onClick={onClose}
    >
      <div
        className="w-full max-w-[400px] rounded-xl bg-surface p-6 shadow-pop animate-scale-in sm:p-7"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="mb-1 flex items-center justify-between">
          <h2 className="text-lg font-bold text-ink2">Reset Password</h2>
          <button
            className="flex h-8 w-8 flex-none items-center justify-center rounded-md text-xl leading-none text-ink2-muted transition-colors hover:bg-canvas hover:text-ink2"
            onClick={onClose}
            aria-label="Close"
          >
            ×
          </button>
        </div>

        <p className="mb-5 text-sm text-ink2-secondary">
          {consultant.full_name} ({consultant.employee_id})
        </p>

        <form onSubmit={handleSubmit} noValidate>
          <FormField
            id="reset_new_password"
            label="New Password"
            isPassword
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
            placeholder="Minimum 8 characters"
            autoComplete="new-password"
            error={fieldErrors.newPassword}
          />
          <FormField
            id="reset_confirm_password"
            label="Confirm Password"
            isPassword
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            placeholder="Re-enter password"
            autoComplete="new-password"
            error={fieldErrors.confirmPassword}
          />

          {formError && (
            <div
              className="mb-4 rounded-md border border-danger/20 bg-danger-soft px-3.5 py-2.5 text-sm font-medium text-danger"
              role="alert"
            >
              {formError}
            </div>
          )}

          <div className="mt-2 flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
            <button
              type="button"
              className="rounded-md border border-line px-4 py-2.5 text-sm font-semibold text-ink2-secondary transition-colors hover:bg-canvas disabled:cursor-not-allowed disabled:opacity-60"
              onClick={onClose}
              disabled={isSubmitting}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="rounded-md bg-brand px-4 py-2.5 text-sm font-semibold text-white shadow-xs transition-colors hover:bg-brand-hover disabled:cursor-not-allowed disabled:opacity-60"
              disabled={isSubmitting}
            >
              {isSubmitting ? 'Resetting…' : 'Reset Password'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
