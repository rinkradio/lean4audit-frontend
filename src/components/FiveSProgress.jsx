const STAGES = [
  { code: '1S', label: 'Sort' },
  { code: '2S', label: 'Set in Order' },
  { code: '3S', label: 'Shine' },
  { code: '4S', label: 'Standardize' },
  { code: '5S', label: 'Sustain' },
]

export default function FiveSProgress() {
  return (
    <div>
      <div className="grid grid-cols-5 gap-2 sm:gap-3">
        {STAGES.map((stage) => (
          <div
            key={stage.code}
            className="flex flex-col items-center rounded-lg border border-line bg-canvas px-1.5 py-3 text-center sm:px-3"
          >
            <span className="text-sm font-bold text-ink2 sm:text-base">{stage.code}</span>
            <span className="mt-1 text-[10px] font-medium leading-tight text-ink2-muted sm:text-xs">
              {stage.label}
            </span>
            <span className="mt-2 text-lg font-semibold text-ink2-muted">—</span>
          </div>
        ))}
      </div>

      <div className="mt-5 border-t border-line pt-4">
        <div className="text-xs font-semibold uppercase tracking-wider text-ink2-muted">
          Overall Score
        </div>
        <div className="mt-1 text-sm font-medium text-ink2-secondary">Not calculated yet</div>
      </div>
    </div>
  )
}
