import { useNavigate } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth'

export default function ConsultantPage() {
  const { user } = useAuth()
  const navigate = useNavigate()

  const firstName = user?.full_name?.split(' ')?.[0] || 'Consultant'

  return (
    <div className="min-h-full bg-[#f5f7f9]">
      <div className="mx-auto w-full max-w-[1440px] px-5 py-6 sm:px-7 sm:py-7 lg:px-9 lg:py-8 xl:px-10 2xl:px-12">
        {/* =========================================================
            HEADER
        ========================================================= */}
        <section className="mb-7">
          <div className="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
            <div>
              <div className="mb-2 flex items-center gap-2">
                <span className="h-1.5 w-1.5 rounded-full bg-[#4386b5]" />
                <span className="text-[11px] font-bold uppercase tracking-[0.16em] text-[#667085]">
                  Consultant Workspace
                </span>
              </div>

              <h1 className="text-[26px] font-semibold tracking-[-0.025em] text-[#102b43] sm:text-[30px]">
                Good morning, {firstName}
              </h1>

              <p className="mt-2 max-w-2xl text-sm leading-6 text-[#667085]">
                Manage your plant audits, continue ongoing work, and start new
                assessments from one place.
              </p>
            </div>

            <div className="flex items-center gap-2 self-start lg:self-auto">
              <div className="flex h-10 w-10 items-center justify-center rounded-full border border-[#dfe3e8] bg-white text-sm font-bold text-[#102b43] shadow-[0_1px_2px_rgba(16,24,40,0.04)]">
                {(user?.full_name || 'L')
                  .split(' ')
                  .map((part) => part[0])
                  .slice(0, 2)
                  .join('')
                  .toUpperCase()}
              </div>

              <div className="hidden sm:block">
                <div className="text-sm font-semibold text-[#102b43]">
                  {user?.full_name || 'Consultant'}
                </div>
                <div className="text-xs text-[#667085]">
                  Lean Consultant
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* =========================================================
            PRIMARY ACTIONS
        ========================================================= */}
        <section className="grid gap-5 lg:grid-cols-2">
          {/* Start New Audit */}
          <button
            type="button"
            onClick={() => navigate('/consultant/audits/new')}
            className="group relative overflow-hidden rounded-2xl border border-[#d7e1e8] bg-white p-6 text-left shadow-[0_2px_6px_rgba(16,42,67,0.04)] transition-all duration-200 hover:-translate-y-0.5 hover:border-[#b9cbd8] hover:shadow-[0_8px_24px_rgba(16,42,67,0.08)] focus:outline-none focus:ring-4 focus:ring-[#4386b5]/15 sm:p-7"
          >
            <div className="flex items-start justify-between gap-5">
              <div className="flex min-w-0 items-start gap-4">
                <div className="flex h-12 w-12 flex-none items-center justify-center rounded-xl bg-[#102b43] text-white shadow-sm">
                  <ClipboardPlusIcon />
                </div>

                <div className="min-w-0">
                  <div className="text-[11px] font-bold uppercase tracking-[0.14em] text-[#4386b5]">
                    Primary Action
                  </div>

                  <h2 className="mt-1.5 text-lg font-semibold text-[#102b43]">
                    Start New Audit
                  </h2>

                  <p className="mt-2 max-w-md text-sm leading-6 text-[#667085]">
                    Select a plant zone, enter audit information, and begin a
                    new assessment.
                  </p>
                </div>
              </div>

              <div className="flex h-9 w-9 flex-none items-center justify-center rounded-full border border-[#dfe3e8] bg-[#f8fafb] text-[#667085] transition-all group-hover:border-[#4386b5] group-hover:bg-[#edf5fa] group-hover:text-[#4386b5]">
                <ArrowRightIcon />
              </div>
            </div>

            <div className="mt-6 flex items-center justify-between border-t border-[#eaecf0] pt-4">
              <span className="text-xs font-medium text-[#667085]">
                Begin assessment
              </span>

              <span className="text-xs font-semibold text-[#4386b5]">
                Create audit
              </span>
            </div>
          </button>

          {/* My Audits */}
          <button
            type="button"
            onClick={() => navigate('/consultant/audits')}
            className="group relative overflow-hidden rounded-2xl border border-[#dfe3e8] bg-white p-6 text-left shadow-[0_2px_6px_rgba(16,42,67,0.04)] transition-all duration-200 hover:-translate-y-0.5 hover:border-[#b9cbd8] hover:shadow-[0_8px_24px_rgba(16,42,67,0.08)] focus:outline-none focus:ring-4 focus:ring-[#4386b5]/15 sm:p-7"
          >
            <div className="flex items-start justify-between gap-5">
              <div className="flex min-w-0 items-start gap-4">
                <div className="flex h-12 w-12 flex-none items-center justify-center rounded-xl border border-[#d8e4eb] bg-[#edf5fa] text-[#102b43]">
                  <ChecklistIcon />
                </div>

                <div className="min-w-0">
                  <div className="text-[11px] font-bold uppercase tracking-[0.14em] text-[#667085]">
                    Your Workspace
                  </div>

                  <h2 className="mt-1.5 text-lg font-semibold text-[#102b43]">
                    My Audits
                  </h2>

                  <p className="mt-2 max-w-md text-sm leading-6 text-[#667085]">
                    View audits you have started, continue unfinished work,
                    or review completed assessments.
                  </p>
                </div>
              </div>

              <div className="flex h-9 w-9 flex-none items-center justify-center rounded-full border border-[#dfe3e8] bg-[#f8fafb] text-[#667085] transition-all group-hover:border-[#4386b5] group-hover:bg-[#edf5fa] group-hover:text-[#4386b5]">
                <ArrowRightIcon />
              </div>
            </div>

            <div className="mt-6 flex items-center justify-between border-t border-[#eaecf0] pt-4">
              <span className="text-xs font-medium text-[#667085]">
                Manage assessments
              </span>

              <span className="text-xs font-semibold text-[#4386b5]">
                View audits
              </span>
            </div>
          </button>
        </section>

        {/* =========================================================
            WORKFLOW
        ========================================================= */}
        <section className="mt-6 rounded-2xl border border-[#dfe3e8] bg-white shadow-[0_2px_6px_rgba(16,42,67,0.03)]">
          <div className="border-b border-[#eaecf0] px-6 py-5 sm:px-7">
            <div className="flex flex-col gap-1">
              <div className="text-[11px] font-bold uppercase tracking-[0.15em] text-[#667085]">
                Audit Workflow
              </div>

              <h2 className="text-base font-semibold text-[#102b43]">
                Your standard audit process
              </h2>

              <p className="text-sm text-[#667085]">
                Follow the same controlled workflow for every plant assessment.
              </p>
            </div>
          </div>

          <div className="grid divide-y divide-[#eaecf0] md:grid-cols-3 md:divide-x md:divide-y-0">
            <WorkflowStep
              number="01"
              title="Select Zone"
              description="Choose the plant area where the audit will be conducted."
            />

            <WorkflowStep
              number="02"
              title="Conduct Audit"
              description="Record observations, findings, evidence, and corrective actions."
            />

            <WorkflowStep
              number="03"
              title="Submit & Review"
              description="Complete the assessment and submit the audit for review."
            />
          </div>
        </section>

        {/* =========================================================
            INFORMATION PANEL
        ========================================================= */}
        <section className="mt-6 grid gap-5 lg:grid-cols-[1.35fr_0.65fr]">
          {/* Working principle */}
          <div className="rounded-2xl border border-[#dfe3e8] bg-[#102b43] p-6 text-white shadow-[0_4px_12px_rgba(16,42,67,0.08)] sm:p-7">
            <div className="flex items-start gap-4">
              <div className="flex h-10 w-10 flex-none items-center justify-center rounded-lg bg-white/10">
                <ShieldIcon />
              </div>

              <div>
                <div className="text-[11px] font-bold uppercase tracking-[0.15em] text-[#a9c8dc]">
                  Audit Standard
                </div>

                <h2 className="mt-1.5 text-base font-semibold">
                  Keep every assessment evidence-based
                </h2>

                <p className="mt-2 max-w-2xl text-sm leading-6 text-white/65">
                  Record observations accurately, attach supporting evidence
                  where required, and keep corrective actions clear and
                  actionable.
                </p>
              </div>
            </div>

            <div className="mt-6 grid gap-3 sm:grid-cols-3">
              <Principle
                icon={<EyeIcon />}
                title="Observe"
                text="Capture the actual condition."
              />

              <Principle
                icon={<DocumentIcon />}
                title="Record"
                text="Document the finding clearly."
              />

              <Principle
                icon={<CheckCircleIcon />}
                title="Improve"
                text="Define practical action."
              />
            </div>
          </div>

          {/* Quick navigation */}
          <div className="rounded-2xl border border-[#dfe3e8] bg-white p-6 shadow-[0_2px_6px_rgba(16,42,67,0.03)] sm:p-7">
            <div className="text-[11px] font-bold uppercase tracking-[0.15em] text-[#667085]">
              Quick Access
            </div>

            <h2 className="mt-1.5 text-base font-semibold text-[#102b43]">
              Frequently used
            </h2>

            <div className="mt-5 space-y-2">
              <QuickLink
                icon={<ChecklistIcon />}
                label="My Audits"
                description="Open your audit list"
                onClick={() => navigate('/consultant/audits')}
              />

              <QuickLink
                icon={<ClipboardPlusIcon />}
                label="New Audit"
                description="Start an assessment"
                onClick={() => navigate('/consultant/audits/new')}
              />

              <QuickLink
                icon={<PersonIcon />}
                label="Profile"
                description="Manage your account"
                onClick={() => navigate('/consultant/profile')}
              />
            </div>
          </div>
        </section>
      </div>
    </div>
  )
}

/* =========================================================
   WORKFLOW STEP
========================================================= */

function WorkflowStep({ number, title, description }) {
  return (
    <div className="px-6 py-5 sm:px-7">
      <div className="flex items-start gap-4">
        <div className="flex h-9 w-9 flex-none items-center justify-center rounded-lg border border-[#dfe3e8] bg-[#f8fafb] text-[11px] font-bold text-[#4386b5]">
          {number}
        </div>

        <div>
          <h3 className="text-sm font-semibold text-[#102b43]">
            {title}
          </h3>

          <p className="mt-1 text-xs leading-5 text-[#667085]">
            {description}
          </p>
        </div>
      </div>
    </div>
  )
}

/* =========================================================
   PRINCIPLE
========================================================= */

function Principle({ icon, title, text }) {
  return (
    <div className="rounded-xl border border-white/10 bg-white/[0.06] p-4">
      <div className="flex items-center gap-2.5">
        <div className="text-[#a9c8dc]">
          {icon}
        </div>

        <span className="text-sm font-semibold">
          {title}
        </span>
      </div>

      <p className="mt-2 text-xs leading-5 text-white/55">
        {text}
      </p>
    </div>
  )
}

/* =========================================================
   QUICK LINK
========================================================= */

function QuickLink({ icon, label, description, onClick }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="group flex w-full items-center gap-3 rounded-xl border border-transparent px-3 py-3 text-left transition-colors hover:border-[#dfe3e8] hover:bg-[#f8fafb] focus:outline-none focus:ring-4 focus:ring-[#4386b5]/10"
    >
      <div className="flex h-9 w-9 flex-none items-center justify-center rounded-lg border border-[#dfe3e8] bg-white text-[#667085] transition-colors group-hover:border-[#c7d9e4] group-hover:bg-[#edf5fa] group-hover:text-[#4386b5]">
        {icon}
      </div>

      <div className="min-w-0 flex-1">
        <div className="text-sm font-semibold text-[#102b43]">
          {label}
        </div>

        <div className="mt-0.5 text-xs text-[#667085]">
          {description}
        </div>
      </div>

      <ArrowRightIcon />
    </button>
  )
}

/* =========================================================
   ICONS
========================================================= */

function iconProps(className = 'h-5 w-5') {
  return {
    className,
    viewBox: '0 0 24 24',
    fill: 'none',
    stroke: 'currentColor',
    strokeWidth: 1.8,
    strokeLinecap: 'round',
    strokeLinejoin: 'round',
  }
}

function ClipboardPlusIcon({ className = 'h-5 w-5' }) {
  return (
    <svg {...iconProps(className)}>
      <rect x="5" y="4" width="14" height="17" rx="2" />
      <path d="M9 4V3h6v1" />
      <path d="M12 9v6" />
      <path d="M9 12h6" />
    </svg>
  )
}

function ChecklistIcon({ className = 'h-5 w-5' }) {
  return (
    <svg {...iconProps(className)}>
      <path d="M9 4h11" />
      <path d="M9 12h11" />
      <path d="M9 20h11" />

      <path d="M4 4.5 5 5.5 6.8 3.5" />
      <path d="M4 12.5 5 13.5 6.8 11.5" />
      <path d="M4 20.5 5 21.5 6.8 19.5" />
    </svg>
  )
}

function ArrowRightIcon({ className = 'h-4 w-4' }) {
  return (
    <svg {...iconProps(className)}>
      <path d="M5 12h14" />
      <path d="m13 6 6 6-6 6" />
    </svg>
  )
}

function ShieldIcon({ className = 'h-5 w-5' }) {
  return (
    <svg {...iconProps(className)}>
      <path d="M12 3 20 6v5c0 5.2-3.2 8.7-8 10-4.8-1.3-8-4.8-8-10V6l8-3Z" />
      <path d="m9 12 2 2 4-4" />
    </svg>
  )
}

function EyeIcon({ className = 'h-4 w-4' }) {
  return (
    <svg {...iconProps(className)}>
      <path d="M2.5 12s3.3-5 9.5-5 9.5 5 9.5 5-3.3 5-9.5 5-9.5-5-9.5-5Z" />
      <circle cx="12" cy="12" r="2.2" />
    </svg>
  )
}

function DocumentIcon({ className = 'h-4 w-4' }) {
  return (
    <svg {...iconProps(className)}>
      <path d="M7 3h7l4 4v14H7a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2Z" />
      <path d="M14 3v5h5" />
      <path d="M9 13h6" />
      <path d="M9 17h6" />
    </svg>
  )
}

function CheckCircleIcon({ className = 'h-4 w-4' }) {
  return (
    <svg {...iconProps(className)}>
      <circle cx="12" cy="12" r="8.5" />
      <path d="m8.5 12 2.2 2.2 4.8-4.8" />
    </svg>
  )
}

function PersonIcon({ className = 'h-4 w-4' }) {
  return (
    <svg {...iconProps(className)}>
      <circle cx="12" cy="8" r="3.5" />
      <path d="M4.5 20c0-4 3.3-6.5 7.5-6.5s7.5 2.5 7.5 6.5" />
    </svg>
  )
}