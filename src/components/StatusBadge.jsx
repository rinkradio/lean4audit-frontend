export default function StatusBadge({ isActive }) {
  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-semibold tracking-wide ${
        isActive ? 'bg-success-soft text-success' : 'bg-ink2-muted/15 text-ink2-secondary'
      }`}
    >
      <span
        className={`h-1.5 w-1.5 rounded-full ${isActive ? 'bg-success' : 'bg-ink2-muted'}`}
      />
      {isActive ? 'Active' : 'Inactive'}
    </span>
  )
}
