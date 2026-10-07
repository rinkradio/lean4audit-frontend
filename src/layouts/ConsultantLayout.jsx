import { useEffect, useState } from 'react'
import { NavLink, Outlet, useLocation } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth'

const NAV_ITEMS = [
  { label: 'Dashboard', to: '/consultant', end: true, icon: DashboardIcon },
  { label: 'My Audits', to: '/consultant/audits', icon: ChecklistIcon },
  { label: 'Profile', to: '/consultant/profile', icon: PersonIcon },
]

export default function ConsultantLayout() {
  const { user, logout } = useAuth()
  const [isNavOpen, setIsNavOpen] = useState(false)
  const location = useLocation()

  useEffect(() => {
    setIsNavOpen(false)
  }, [location.pathname])

  const initials = (user?.full_name || 'L')
    .split(' ')
    .map((p) => p[0])
    .slice(0, 2)
    .join('')
    .toUpperCase()

  return (
    <div className="flex min-h-screen bg-canvas">
      {isNavOpen && (
        <div
          className="fixed inset-0 z-30 bg-ink-950/40 backdrop-blur-sm lg:hidden"
          onClick={() => setIsNavOpen(false)}
          aria-hidden="true"
        />
      )}

      <aside
        className={`fixed inset-y-0 left-0 z-40 flex w-[260px] flex-none flex-col bg-ink-900 text-ink2-inverse transition-transform duration-300 ease-out lg:sticky lg:top-0 lg:h-screen lg:translate-x-0 ${
          isNavOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div className="flex items-center gap-3 px-5 pb-6 pt-6">
          <div className="flex h-10 w-10 flex-none items-center justify-center rounded-lg bg-brand text-sm font-bold tracking-wide">
            L4A
          </div>
          <div className="min-w-0">
            <div className="truncate text-sm font-bold tracking-wide">LEAN AUDIT</div>
            <div className="truncate text-[11px] font-medium uppercase tracking-wider text-ink2-inverse/50">
              Management System
            </div>
          </div>
          <button
            className="ml-auto flex h-8 w-8 flex-none items-center justify-center rounded-md text-ink2-inverse/70 hover:bg-white/5 lg:hidden"
            onClick={() => setIsNavOpen(false)}
            aria-label="Close navigation"
          >
            <CloseIcon />
          </button>
        </div>

        <nav className="flex-1 space-y-1 overflow-y-auto px-3">
          {NAV_ITEMS.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.end}
              className={({ isActive }) =>
                `flex items-center gap-3 rounded-md px-3 py-2.5 text-sm font-medium transition-colors ${
                  isActive
                    ? 'bg-brand text-white shadow-xs'
                    : 'text-ink2-inverse/70 hover:bg-white/5 hover:text-ink2-inverse'
                }`
              }
            >
              <item.icon className="h-[18px] w-[18px] flex-none" />
              {item.label}
            </NavLink>
          ))}
        </nav>

        <div className="border-t border-white/10 px-4 py-4">
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 flex-none items-center justify-center rounded-full bg-white/10 text-xs font-bold">
              {initials}
            </div>
            <div className="min-w-0">
              <div className="truncate text-sm font-semibold">{user?.full_name}</div>
              <div className="text-[11px] uppercase tracking-wider text-ink2-inverse/50">
                Lean Consultant
              </div>
            </div>
          </div>
          <button
            className="mt-3 w-full rounded-md border border-white/15 px-3 py-2 text-sm font-medium text-ink2-inverse/80 transition-colors hover:bg-white/5 hover:text-ink2-inverse"
            onClick={logout}
          >
            Logout
          </button>
        </div>
      </aside>

      <div className="flex min-w-0 flex-1 flex-col">
        <header className="sticky top-0 z-20 flex items-center gap-3 border-b border-line bg-surface/90 px-4 py-3 backdrop-blur lg:hidden">
          <button
            className="flex h-9 w-9 flex-none items-center justify-center rounded-md text-ink2-secondary hover:bg-canvas"
            onClick={() => setIsNavOpen(true)}
            aria-label="Open navigation"
          >
            <MenuIcon />
          </button>
          <div className="flex h-8 w-8 flex-none items-center justify-center rounded-md bg-brand text-xs font-bold text-white">
            L4A
          </div>
          <span className="text-sm font-bold tracking-wide text-ink2">LEAN AUDIT</span>
        </header>

        <main className="flex-1 px-4 py-6 sm:px-6 lg:px-10 lg:py-8">
          <Outlet />
        </main>
      </div>
    </div>
  )
}

function iconProps(className) {
  return { className, viewBox: '0 0 24 24', fill: 'none', stroke: 'currentColor', strokeWidth: 1.7, strokeLinecap: 'round', strokeLinejoin: 'round' }
}

function DashboardIcon({ className }) {
  return (
    <svg {...iconProps(className)}>
      <rect x="3" y="3" width="7" height="9" rx="1.5" />
      <rect x="14" y="3" width="7" height="5" rx="1.5" />
      <rect x="14" y="12" width="7" height="9" rx="1.5" />
      <rect x="3" y="16" width="7" height="5" rx="1.5" />
    </svg>
  )
}
function ChecklistIcon({ className }) {
  return (
    <svg {...iconProps(className)}>
      <path d="M9 4h11M9 12h11M9 20h11" />
      <path d="M4 4.5 5 5.5 6.8 3.5" />
      <path d="M4 12.5 5 13.5 6.8 11.5" />
      <path d="M4 20.5 5 21.5 6.8 19.5" />
    </svg>
  )
}
function PersonIcon({ className }) {
  return (
    <svg {...iconProps(className)}>
      <circle cx="12" cy="8" r="3.6" />
      <path d="M4.5 20c0-4 3.4-6.6 7.5-6.6s7.5 2.6 7.5 6.6" />
    </svg>
  )
}
function MenuIcon() {
  return (
    <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
      <path d="M3 6h18M3 12h18M3 18h18" />
    </svg>
  )
}
function CloseIcon() {
  return (
    <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
      <path d="M6 6l12 12M18 6 6 18" />
    </svg>
  )
}
