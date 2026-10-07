import { useEffect } from 'react'

export default function AuditAchievementModal({
  auditNumber,
  observationCount = 0,
  onContinue,
}) {
  useEffect(() => {
    const timer = window.setTimeout(() => {
      onContinue?.()
    }, 5200)

    return () => window.clearTimeout(timer)
  }, [onContinue])

  const confetti = Array.from({ length: 46 }, (_, index) => index)

  return (
    <>
      <style>{`
        @keyframes auditAchievementBackdrop {
          from { opacity: 0; }
          to { opacity: 1; }
        }

        @keyframes auditAchievementCard {
          0% { opacity: 0; transform: translateY(45px) scale(.78); }
          55% { opacity: 1; transform: translateY(-7px) scale(1.035); }
          100% { opacity: 1; transform: translateY(0) scale(1); }
        }

        @keyframes auditAchievementBadge {
          0% { opacity: 0; transform: scale(.15) rotate(-28deg); }
          55% { opacity: 1; transform: scale(1.16) rotate(7deg); }
          78% { transform: scale(.96) rotate(-2deg); }
          100% { opacity: 1; transform: scale(1) rotate(0); }
        }

        @keyframes auditAchievementGlow {
          0%, 100% { transform: scale(.82); opacity: .25; }
          50% { transform: scale(1.18); opacity: .75; }
        }

        @keyframes auditAchievementRing {
          0% { transform: scale(.72); opacity: .8; }
          100% { transform: scale(1.65); opacity: 0; }
        }

        @keyframes auditAchievementRing2 {
          0% { transform: scale(.72); opacity: .55; }
          100% { transform: scale(1.42); opacity: 0; }
        }

        @keyframes auditAchievementStar {
          0% { opacity: 0; transform: scale(0) rotate(-40deg); }
          65% { opacity: 1; transform: scale(1.2) rotate(10deg); }
          100% { opacity: 1; transform: scale(1) rotate(0); }
        }

        @keyframes auditAchievementConfetti {
          0% { opacity: 0; transform: translate3d(0, -30px, 0) rotate(0) scale(.35); }
          12% { opacity: 1; }
          100% { opacity: 0; transform: translate3d(var(--x), var(--y), 0) rotate(var(--r)) scale(1); }
        }

        @keyframes auditAchievementLine {
          from { transform: scaleX(0); }
          to { transform: scaleX(1); }
        }

        @keyframes auditAchievementText {
          from { opacity: 0; transform: translateY(12px); }
          to { opacity: 1; transform: translateY(0); }
        }

        .audit-achievement-backdrop { animation: auditAchievementBackdrop .25s ease-out both; }
        .audit-achievement-card { animation: auditAchievementCard .8s cubic-bezier(.16,1,.3,1) both; }
        .audit-achievement-badge { animation: auditAchievementBadge .85s cubic-bezier(.16,1,.3,1) .1s both; }
        .audit-achievement-glow { animation: auditAchievementGlow 2.1s ease-in-out infinite; }
        .audit-achievement-ring { animation: auditAchievementRing 1.7s ease-out .3s infinite; }
        .audit-achievement-ring2 { animation: auditAchievementRing2 1.7s ease-out .7s infinite; }
        .audit-achievement-star { animation: auditAchievementStar .6s cubic-bezier(.16,1,.3,1) both; }
        .audit-achievement-text { animation: auditAchievementText .5s ease-out .55s both; }
        .audit-achievement-line { animation: auditAchievementLine 4.9s linear .25s both; transform-origin: left; }
        .audit-achievement-confetti { animation: auditAchievementConfetti 3.3s cubic-bezier(.12,.7,.2,1) infinite; }
      `}</style>

      <div
        className="audit-achievement-backdrop fixed inset-0 z-[130] flex items-center justify-center overflow-hidden bg-slate-950/75 px-4 py-6 backdrop-blur-lg"
        role="dialog"
        aria-modal="true"
        aria-labelledby="audit-achievement-title"
      >
        <div className="pointer-events-none absolute inset-0 overflow-hidden">
          {confetti.map((item) => {
            const colors = [
              'bg-brand',
              'bg-emerald-500',
              'bg-amber-400',
              'bg-sky-400',
              'bg-violet-500',
              'bg-rose-400',
            ]

            return (
              <span
                key={item}
                className={`audit-achievement-confetti absolute left-1/2 top-1/3 h-3 w-1.5 rounded-sm ${colors[item % colors.length]}`}
                style={{
                  '--x': `${-520 + ((item * 83) % 1040)}px`,
                  '--y': `${180 + ((item * 47) % 470)}px`,
                  '--r': `${-520 + ((item * 97) % 1040)}deg`,
                  animationDelay: `${(item % 14) * 85}ms`,
                }}
              />
            )
          })}
        </div>

        <div className="audit-achievement-card relative w-full max-w-xl overflow-hidden rounded-[32px] border border-white/80 bg-white text-center shadow-[0_40px_120px_rgba(0,0,0,.42)]">
          <div className="pointer-events-none absolute inset-x-0 top-0 h-52 bg-gradient-to-b from-brand/20 via-brand/5 to-transparent" />

          <div className="relative px-6 pb-8 pt-9 sm:px-10 sm:pb-10 sm:pt-11">
            <div className="relative mx-auto h-40 w-40">
              <div className="audit-achievement-glow absolute inset-4 rounded-full bg-brand/25 blur-2xl" />
              <div className="audit-achievement-ring absolute inset-5 rounded-full border-2 border-brand/35" />
              <div className="audit-achievement-ring2 absolute inset-7 rounded-full border border-emerald-400/40" />

              <div className="audit-achievement-badge relative flex h-full w-full items-center justify-center">
                <div className="relative flex h-28 w-28 items-center justify-center rounded-full bg-gradient-to-br from-brand via-brand-hover to-emerald-500 text-white shadow-2xl ring-[10px] ring-white">
                  <svg
                    width="58"
                    height="58"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="1.8"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    aria-hidden="true"
                  >
                    <path d="M12 3 14.6 8.4 20.5 9.2 16.2 13.3 17.2 19.2 12 16.4 6.8 19.2 7.8 13.3 3.5 9.2 9.4 8.4 12 3Z" />
                    <path d="m9.5 12.2 1.7 1.7 3.5-3.8" />
                  </svg>
                </div>

                <span className="audit-achievement-star absolute right-1 top-0 text-amber-400">
                  <svg width="28" height="28" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                    <path d="m12 2 1.7 6.3L20 10l-6.3 1.7L12 18l-1.7-6.3L4 10l6.3-1.7L12 2Z" />
                  </svg>
                </span>

                <span className="audit-achievement-star absolute bottom-1 left-0 text-amber-400" style={{ animationDelay: '180ms' }}>
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                    <path d="m12 2 1.7 6.3L20 10l-6.3 1.7L12 18l-1.7-6.3L4 10l6.3-1.7L12 2Z" />
                  </svg>
                </span>
              </div>
            </div>

            <div className="audit-achievement-text">
              <div className="mt-3 text-[11px] font-extrabold uppercase tracking-[0.28em] text-brand">
                Audit Achievement Unlocked
              </div>

              <h2
                id="audit-achievement-title"
                className="mt-2 text-3xl font-black tracking-tight text-ink2 sm:text-4xl"
              >
                Audit Submitted!
              </h2>

              <p className="mx-auto mt-3 max-w-md text-sm leading-6 text-ink2-secondary sm:text-base">
                Outstanding work. The complete audit has been successfully submitted for review.
              </p>

              <div className="mt-7 grid grid-cols-2 gap-3">
                <div className="rounded-2xl border border-line bg-canvas px-4 py-3.5">
                  <div className="text-[10px] font-bold uppercase tracking-wider text-ink2-muted">
                    Audit
                  </div>
                  <div className="mt-1 truncate text-sm font-extrabold text-ink2">
                    {auditNumber || 'Submitted'}
                  </div>
                </div>

                <div className="rounded-2xl border border-line bg-canvas px-4 py-3.5">
                  <div className="text-[10px] font-bold uppercase tracking-wider text-ink2-muted">
                    Observations
                  </div>
                  <div className="mt-1 text-sm font-extrabold text-ink2">
                    {observationCount}
                  </div>
                </div>
              </div>

              <div className="mt-6 overflow-hidden rounded-full bg-canvas">
                <div className="audit-achievement-line h-1.5 w-full rounded-full bg-gradient-to-r from-brand via-emerald-500 to-brand" />
              </div>

              <button
                type="button"
                onClick={onContinue}
                className="mt-6 w-full rounded-xl bg-brand px-5 py-3.5 text-sm font-bold text-white shadow-lg shadow-brand/20 transition duration-200 hover:-translate-y-0.5 hover:bg-brand-hover hover:shadow-xl focus:outline-none focus:ring-2 focus:ring-brand/30"
              >
                Continue
              </button>

              <p className="mt-3 text-[11px] text-ink2-muted">
                Returning automatically in a few seconds
              </p>
            </div>
          </div>
        </div>
      </div>
    </>
  )
}
