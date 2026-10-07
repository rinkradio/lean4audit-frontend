const STATUS_STYLES = {
  DRAFT: { dot: 'bg-ink2-muted', text: 'text-ink2-secondary', bg: 'bg-ink2-muted/15', label: 'Draft' },
  IN_PROGRESS: { dot: 'bg-brand', text: 'text-brand', bg: 'bg-brand-soft', label: 'In Progress' },
  SUBMITTED: { dot: 'bg-success', text: 'text-success', bg: 'bg-success-soft', label: 'Submitted' },
}

export default function AuditStatusBadge({ status }) {
  const style = STATUS_STYLES[status] || STATUS_STYLES.DRAFT

  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-semibold tracking-wide ${style.bg} ${style.text}`}
    >
      <span className={`h-1.5 w-1.5 rounded-full ${style.dot}`} />
      {style.label}
    </span>
  )
}
