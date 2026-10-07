import { useEffect } from 'react'

export default function ObservationSuccessModal({
  observationNumber,
  onContinue,
}) {
  useEffect(() => {
    const timer = window.setTimeout(() => {
      onContinue?.()
    }, 2200)

    return () => window.clearTimeout(timer)
  }, [onContinue])

  const particles = Array.from({ length: 18 }, (_, index) => index)

  return (
    <>
      <style>{`
        @keyframes observationSuccessBackdrop {
          from { opacity: 0; }
          to { opacity: 1; }
        }

        @keyframes observationSuccessCard {
          0% { opacity: 0; transform: translateY(18px) scale(.96); }
          100% { opacity: 1; transform: translateY(0) scale(1); }
        }

        @keyframes observationSuccessCheck {
          0% { transform: scale(.65); opacity: 0; }
          70% { transform: scale(1.08); opacity: 1; }
          100% { transform: scale(1); opacity: 1; }
        }

        @keyframes observationSuccessRing {
          0% { transform: scale(.75); opacity: .7; }
          100% { transform: scale(1.35); opacity: 0; }
        }

        @keyframes successProgress {
          from { transform: scaleX(1); }
          to { transform: scaleX(0); }
        }

        @keyframes observationSuccessParticle {
          0% { opacity: 0; transform: translateY(10px) scale(.6); }
          35% { opacity: 1; }
          100% { opacity: 0; transform: translateY(-42px) scale(1); }
        }

        .observation-success-backdrop {
          animation: observationSuccessBackdrop .18s ease-out both;
        }

        .observation-success-card {
          animation: observationSuccessCard .32s cubic-bezier(.22,1,.36,1) both;
        }

        .observation-success-check {
          animation: observationSuccessCheck .5s cubic-bezier(.22,1,.36,1) .08s both;
        }

        .observation-success-ring {
          animation: observationSuccessRing 1.2s ease-out .18s infinite;
        }

        .observation-success-particle {
          animation: observationSuccessParticle 1.4s ease-out infinite;
        }
      `}</style>

      <div
        className="observation-success-backdrop fixed inset-0 z-[100] flex items-center justify-center bg-slate-950/45 px-4 backdrop-blur-sm"
        role="dialog"
        aria-modal="true"
        aria-labelledby="observation-success-title"
      >
        <div className="observation-success-card relative w-full max-w-md overflow-hidden rounded-2xl border border-white/70 bg-white p-7 text-center shadow-2xl sm:p-8">
          <div className="pointer-events-none absolute inset-0 bg-gradient-to-b from-brand/10 via-transparent to-transparent" />

          <div className="relative mx-auto flex h-24 w-24 items-center justify-center">
            <div className="observation-success-ring absolute inset-2 rounded-full border-2 border-brand/25" />

            <div className="observation-success-check relative flex h-20 w-20 items-center justify-center rounded-full bg-brand-soft text-brand shadow-sm ring-8 ring-brand/5">
              <svg
                width="34"
                height="34"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2.5"
                strokeLinecap="round"
                strokeLinejoin="round"
                aria-hidden="true"
              >
                <path d="M5 12.5 9.2 17 19 7" />
              </svg>
            </div>

            {particles.map((particle) => (
              <span
                key={particle}
                className="observation-success-particle absolute h-1.5 w-1.5 rounded-full bg-brand"
                style={{
                  left: `${10 + ((particle * 37) % 80)}%`,
                  top: `${22 + ((particle * 19) % 48)}%`,
                  animationDelay: `${(particle % 6) * 90}ms`,
                }}
              />
            ))}
          </div>

          <div className="relative mt-3">
            <div className="text-xs font-semibold uppercase tracking-[0.16em] text-brand">
              Observation Complete
            </div>

            <h2
              id="observation-success-title"
              className="mt-2 text-xl font-bold text-ink2 sm:text-2xl"
            >
              Observation saved successfully
            </h2>

            <p className="mx-auto mt-2 max-w-sm text-sm leading-6 text-ink2-secondary">
              Your observation has been added to this audit and is ready for review.
            </p>

            {observationNumber && (
              <div className="mx-auto mt-5 inline-flex items-center rounded-full border border-brand/20 bg-brand-soft px-4 py-2 text-sm font-semibold text-brand">
                {observationNumber}
              </div>
            )}

            <div className="mt-6 h-1 overflow-hidden rounded-full bg-canvas">
              <div className="h-full w-full origin-left animate-[successProgress_2.2s_linear_forwards] bg-brand" />
            </div>

            <button
              type="button"
              onClick={onContinue}
              className="mt-5 w-full rounded-md bg-brand px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-brand-hover"
            >
              Continue to Audit
            </button>
          </div>
        </div>
      </div>
    </>
  )
}
