export default function SectionPlaceholder({ title }) {
  return (
    <div className="flex min-h-[60vh] flex-col items-center justify-center rounded-xl border border-dashed border-line-strong bg-surface px-6 py-16 text-center animate-fade-in">
      <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-brand-soft text-brand">
        <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round">
          <rect x="3" y="4" width="18" height="16" rx="2" />
          <path d="M3 9h18M8 4v5" />
        </svg>
      </div>
      <h1 className="text-lg font-bold text-ink2 sm:text-xl">{title}</h1>
      <p className="mt-2 max-w-sm text-sm text-ink2-secondary">
        This module is coming in a future phase.
      </p>
    </div>
  )
}
