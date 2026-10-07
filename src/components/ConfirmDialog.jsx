export default function ConfirmDialog({
  title,
  message,
  confirmLabel = 'Confirm',
  cancelLabel = 'Cancel',
  variant = 'default',
  isSubmitting = false,
  onConfirm,
  onCancel,
}) {
  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-ink-950/45 p-4 backdrop-blur-sm animate-fade-in"
      onClick={onCancel}
    >
      <div
        className="w-full max-w-[420px] rounded-xl bg-surface p-6 shadow-pop animate-scale-in"
        role="alertdialog"
        aria-modal="true"
        aria-labelledby="confirm-dialog-title"
        onClick={(e) => e.stopPropagation()}
      >
        <h3 className="text-lg font-semibold text-ink2" id="confirm-dialog-title">
          {title}
        </h3>
        <p className="mt-2 text-sm leading-relaxed text-ink2-secondary">{message}</p>
        <div className="mt-6 flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
          <button
            className="rounded-md border border-line px-4 py-2.5 text-sm font-semibold text-ink2-secondary transition-colors hover:bg-canvas disabled:cursor-not-allowed disabled:opacity-60"
            onClick={onCancel}
            disabled={isSubmitting}
          >
            {cancelLabel}
          </button>
          <button
            className={`rounded-md px-4 py-2.5 text-sm font-semibold text-white shadow-xs transition-colors disabled:cursor-not-allowed disabled:opacity-60 ${
              variant === 'danger'
                ? 'bg-danger hover:bg-danger-hover'
                : 'bg-brand hover:bg-brand-hover'
            }`}
            onClick={onConfirm}
            disabled={isSubmitting}
          >
            {isSubmitting ? 'Please wait…' : confirmLabel}
          </button>
        </div>
      </div>
    </div>
  )
}
