const META = {
  "5S": {
    label: "5S",
    className: "bg-brand-soft text-brand border-brand/20",
    dot: "bg-brand",
  },
  GEMBA: {
    label: "Gemba",
    className: "bg-success-soft text-success border-success/20",
    dot: "bg-success",
  },
  SAFETY: {
    label: "Safety",
    className: "bg-warning-soft text-warning border-warning/20",
    dot: "bg-warning",
  },
}

export function getObservationTypeMeta(type) {
  return META[type] || META["5S"]
}

export default function ObservationTypeBadge({ type, compact = false }) {
  const meta = getObservationTypeMeta(type)

  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-xs font-bold ${meta.className}`}
    >
      <span className={`h-1.5 w-1.5 rounded-full ${meta.dot}`} />
      {meta.label}
    </span>
  )
}
