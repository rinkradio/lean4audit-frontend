import { useEffect, useState } from 'react'
import { NavLink, Outlet, useLocation } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth'
import { fetchAuditNotificationSummary } from '../services/auditNotificationService'

const NAV_ITEMS = [
  { label: 'Dashboard', to: '/admin', end: true, icon: DashboardIcon },
  { label: 'Consultants', to: '/admin/consultants', icon: PeopleIcon },
  { label: 'Plants', to: '/admin/plants', icon: FactoryIcon },
  { label: 'Zones', to: '/admin/zones', icon: ZoneIcon },
  { label: 'Audits', to: '/admin/audits', icon: ChecklistIcon },
  { label: 'Reports', to: '/admin/reports', icon: ChartIcon },
  { label: 'Settings', to: '/admin/settings', icon: GearIcon },
]

export default function AdminLayout() {
  const { user, logout } = useAuth()
  const [isNavOpen, setIsNavOpen] = useState(false)
  const [unreadAuditCount, setUnreadAuditCount] = useState(0)
  const location = useLocation()

  useEffect(() => {
    let cancelled = false

    const loadNotificationCount = async () => {
      try {
        const data = await fetchAuditNotificationSummary()

        if (!cancelled) {
          setUnreadAuditCount(Number(data?.unread_count || 0))
        }
      } catch (error) {
        console.error('Unable to load audit notifications', error)
      }
    }

    loadNotificationCount()

    const interval = window.setInterval(
      loadNotificationCount,
      30000
    )

    const handleNotificationRead = async (event) => {
      if (!event.detail?.auditId) return

      try {
        const data = await fetchAuditNotificationSummary()
        if (!cancelled) {
          setUnreadAuditCount(Number(data?.unread_count || 0))
        }
      } catch (error) {
        console.error(
          'Unable to refresh audit notifications',
          error
        )
      }
    }

    window.addEventListener(
      'audit-notification-read',
      handleNotificationRead
    )

    return () => {
      cancelled = true
      window.clearInterval(interval)
      window.removeEventListener(
        'audit-notification-read',
        handleNotificationRead
      )
    }
  }, [])

  useEffect(() => {
    setIsNavOpen(false)
  }, [location.pathname])

  const initials = (user?.full_name || 'A')
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
            <div className="truncate text-sm font-bold tracking-wide">
              LEAN AUDIT
            </div>

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

              <span className="min-w-0 flex-1 truncate">
                {item.label}
              </span>

              {item.label === 'Audits' && unreadAuditCount > 0 && (
                <span
                  className="ml-auto inline-flex min-w-[22px] items-center justify-center rounded-full bg-red-500 px-1.5 py-0.5 text-[10px] font-extrabold leading-none text-white shadow-sm"
                  aria-label={`${unreadAuditCount} unread submitted audits`}
                >
                  {unreadAuditCount > 99 ? '99+' : unreadAuditCount}
                </span>
              )}
            </NavLink>
          ))}
        </nav>

        <div className="border-t border-white/10 px-4 py-4">
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 flex-none items-center justify-center rounded-full bg-white/10 text-xs font-bold">
              {initials}
            </div>

            <div className="min-w-0">
              <div className="truncate text-sm font-semibold">
                {user?.full_name}
              </div>

              <div className="text-[11px] uppercase tracking-wider text-ink2-inverse/50">
                Admin
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

          <span className="text-sm font-bold tracking-wide text-ink2">
            LEAN AUDIT
          </span>
        </header>

        <main className="flex-1 px-4 py-6 sm:px-6 lg:px-10 lg:py-8">
          <Outlet />
        </main>
      </div>
    </div>
  )
}

function iconProps(className) {
  return {
    className,
    viewBox: '0 0 24 24',
    fill: 'none',
    stroke: 'currentColor',
    strokeWidth: 1.7,
    strokeLinecap: 'round',
    strokeLinejoin: 'round',
  }
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

function PeopleIcon({ className }) {
  return (
    <svg {...iconProps(className)}>
      <circle cx="9" cy="8" r="3.2" />
      <path d="M2.5 20c0-3.6 2.9-6 6.5-6s6.5 2.4 6.5 6" />
      <circle cx="17.5" cy="8.5" r="2.4" />
      <path d="M16 14.2c2.7.4 4.5 2.4 4.5 5.8" />
    </svg>
  )
}

function BuildingIcon({ className }) {
  return (
    <svg {...iconProps(className)}>
      <rect x="4" y="3" width="10" height="18" rx="1" />
      <rect x="14" y="9" width="6" height="12" rx="1" />
      <path d="M7.5 7h1M7.5 11h1M7.5 15h1M11 7h1M11 11h1M11 15h1" />
    </svg>
  )
}

function FactoryIcon({ className }) {
  return (
    <svg {...iconProps(className)}>
      <path d="M3 21V10l6 4v-4l6 4V6l6 4v11z" />
      <path d="M3 21h18" />
    </svg>
  )
}

function ZoneIcon({ className }) {
  return (
    <svg {...iconProps(className)}>
      <path d="M12 21s7-5.2 7-11a7 7 0 1 0-14 0c0 5.8 7 11 7 11Z" />
      <circle cx="12" cy="10" r="2.5" />
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

function ChartIcon({ className }) {
  return (
    <svg {...iconProps(className)}>
      <path d="M4 20V10M11 20V4M18 20v-7" />
      <path d="M2 20h20" />
    </svg>
  )
}

function GearIcon({ className }) {
  return (
    <svg {...iconProps(className)}>
      <circle cx="12" cy="12" r="3.2" />
      <path d="M19.4 12a7.4 7.4 0 0 0-.1-1.3l2-1.5-2-3.4-2.3.9a7.5 7.5 0 0 0-2.3-1.3L14.3 3h-4.6l-.4 2.4a7.5 7.5 0 0 0-2.3 1.3l-2.3-.9-2 3.4 2 1.5A7.4 7.4 0 0 0 4.6 12c0 .4 0 .9.1 1.3l-2 1.5 2 3.4 2.3-.9c.7.6 1.5 1 2.3 1.3l.4 2.4h4.6l.4-2.4a7.5 7.5 0 0 0 2.3-1.3l2.3.9 2-3.4-2-1.5c.1-.4.1-.9.1-1.3Z" />
    </svg>
  )
}

function MenuIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      width="20"
      height="20"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
    >
      <path d="M3 6h18M3 12h18M3 18h18" />
    </svg>
  )
}

function CloseIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      width="18"
      height="18"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
    >
      <path d="M6 6l12 12M18 6 6 18" />
    </svg>
  )
}