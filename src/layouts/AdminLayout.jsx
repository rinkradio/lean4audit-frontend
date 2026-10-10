import { useEffect, useState } from 'react'
import { NavLink, Outlet, useLocation } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth'
import { fetchAuditNotificationSummary } from '../services/auditNotificationService'

const NAV_ITEMS = [
  {
    label: 'Dashboard',
    to: '/admin',
    end: true,
    icon: DashboardIcon,
  },
  {
    label: 'Consultants',
    to: '/admin/consultants',
    icon: PeopleIcon,
  },
  {
    label: 'Plants',
    to: '/admin/plants',
    icon: FactoryIcon,
  },
  {
    label: 'Zones',
    to: '/admin/zones',
    icon: ZoneIcon,
  },
  {
    label: 'Audits',
    to: '/admin/audits',
    icon: ChecklistIcon,
  },
  {
    label: 'Reports',
    to: '/admin/reports',
    icon: ChartIcon,
  },
  {
    label: 'Settings',
    to: '/admin/settings',
    icon: GearIcon,
  },
]

export default function AdminLayout() {
  const { user, logout } = useAuth()

  const [isNavOpen, setIsNavOpen] = useState(false)
  const [unreadAuditCount, setUnreadAuditCount] = useState(0)

  const location = useLocation()

  /* ================================================================
     AUDIT NOTIFICATION COUNT
  ================================================================= */

  useEffect(() => {
    let cancelled = false

    const loadNotificationCount = async () => {
      try {
        const data = await fetchAuditNotificationSummary()

        if (!cancelled) {
          setUnreadAuditCount(
            Number(data?.unread_count || 0)
          )
        }
      } catch (error) {
        console.error(
          'Unable to load audit notifications',
          error
        )
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
        const data =
          await fetchAuditNotificationSummary()

        if (!cancelled) {
          setUnreadAuditCount(
            Number(data?.unread_count || 0)
          )
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

  /* ================================================================
     CLOSE MOBILE NAVIGATION ON ROUTE CHANGE
  ================================================================= */

  useEffect(() => {
    setIsNavOpen(false)
  }, [location.pathname])

  /* ================================================================
     USER INITIALS
  ================================================================= */

  const initials = (user?.full_name || 'A')
    .split(' ')
    .map((part) => part[0])
    .slice(0, 2)
    .join('')
    .toUpperCase()

  return (
    <div className="admin-shell">

      {/* ============================================================
          MOBILE OVERLAY
      ============================================================= */}

      {isNavOpen && (
        <button
          type="button"
          className="admin-sidebar-overlay"
          onClick={() => setIsNavOpen(false)}
          aria-label="Close navigation"
        />
      )}

      {/* ============================================================
          SIDEBAR
      ============================================================= */}

      <aside
        className={`admin-sidebar ${
          isNavOpen
            ? 'admin-sidebar-open'
            : ''
        }`}
      >

        {/* ----------------------------------------------------------
            BRAND HEADER
        ----------------------------------------------------------- */}

        <div className="admin-sidebar-header">

          <NavLink
            to="/admin"
            className="admin-brand"
            aria-label="Lean4Audit Admin Dashboard"
          >

            <div className="admin-brand-mark">
              <BrandMark />
            </div>

            <div className="admin-brand-copy">

              <div className="admin-brand-name">
                LEAN<span>4</span>AUDIT
              </div>

              <div className="admin-brand-subtitle">
                Management System
              </div>

            </div>

          </NavLink>

          {/* Mobile close */}
          <button
            type="button"
            className="admin-mobile-close"
            onClick={() => setIsNavOpen(false)}
            aria-label="Close navigation"
          >
            <CloseIcon />
          </button>

        </div>

        {/* ----------------------------------------------------------
            NAVIGATION
        ----------------------------------------------------------- */}

        <div className="admin-sidebar-navigation">

          <div className="admin-navigation-label">
            WORKSPACE
          </div>

          <nav
            className="admin-navigation"
            aria-label="Admin navigation"
          >

            {NAV_ITEMS.map((item) => (
              <NavLink
                key={item.to}
                to={item.to}
                end={item.end}
                className={({ isActive }) =>
                  `admin-nav-item ${
                    isActive
                      ? 'admin-nav-item-active'
                      : ''
                  }`
                }
              >

                {({ isActive }) => (
                  <>
                    {/* Active indicator */}
                    <span
                      className="admin-nav-active-line"
                      aria-hidden="true"
                    />

                    {/* Icon */}
                    <span className="admin-nav-icon">
                      <item.icon />
                    </span>

                    {/* Label */}
                    <span className="admin-nav-label">
                      {item.label}
                    </span>

                    {/* Audit notification */}
                    {item.label === 'Audits' &&
                      unreadAuditCount > 0 && (
                        <span
                          className="admin-audit-badge"
                          aria-label={`${unreadAuditCount} unread submitted audits`}
                        >
                          {unreadAuditCount > 99
                            ? '99+'
                            : unreadAuditCount}
                        </span>
                      )}

                    {/* Active arrow */}
                    {isActive && (
                      <span
                        className="admin-nav-arrow"
                        aria-hidden="true"
                      >
                        <ArrowRightIcon />
                      </span>
                    )}
                  </>
                )}
              </NavLink>
            ))}

          </nav>

        </div>

        {/* ----------------------------------------------------------
            SIDEBAR LOWER AREA
        ----------------------------------------------------------- */}

        <div className="admin-sidebar-bottom">

          {/* System status */}
          <div className="admin-system-status">

            <span className="admin-system-dot" />

            <div>
              <span className="admin-system-label">
                System status
              </span>

              <span className="admin-system-value">
                Operational
              </span>
            </div>

          </div>

          {/* User account */}
          <div className="admin-user-card">

            <div className="admin-user-avatar">
              {initials}
            </div>

            <div className="admin-user-information">

              <div className="admin-user-name">
                {user?.full_name || 'Administrator'}
              </div>

              <div className="admin-user-role">
                Administrator
              </div>

            </div>

            <div className="admin-user-status">
              <span />
            </div>

          </div>

          {/* Logout */}
          <button
            type="button"
            className="admin-logout-button"
            onClick={logout}
          >
            <LogoutIcon />

            <span>
              Sign out
            </span>
          </button>

        </div>

      </aside>

      {/* ============================================================
          MAIN APPLICATION
      ============================================================= */}

      <div className="admin-main">

        {/* ----------------------------------------------------------
            MOBILE HEADER
        ----------------------------------------------------------- */}

        <header className="admin-mobile-header">

          <button
            type="button"
            className="admin-mobile-menu"
            onClick={() => setIsNavOpen(true)}
            aria-label="Open navigation"
          >
            <MenuIcon />
          </button>

          <NavLink
            to="/admin"
            className="admin-mobile-brand"
          >

            <div className="admin-mobile-brand-mark">
              <BrandMark />
            </div>

            <div className="admin-mobile-brand-name">
              LEAN<span>4</span>AUDIT
            </div>

          </NavLink>

          <div className="admin-mobile-header-spacer" />

        </header>

        {/* ----------------------------------------------------------
            CONTENT
        ----------------------------------------------------------- */}

        <main className="admin-main-content">
          <Outlet />
        </main>

      </div>

      {/* ============================================================
          SIDEBAR STYLES
      ============================================================= */}

      <style>{adminSidebarStyles}</style>

    </div>
  )
}

/* ==================================================================
   BRAND MARK
================================================================== */

function BrandMark() {
  return (
    <svg
      width="22"
      height="22"
      viewBox="0 0 24 24"
      fill="none"
      aria-hidden="true"
    >
      <path
        d="M12 3 20 6v5.7c0 4.6-3.1 7.7-8 9.3-4.9-1.6-8-4.7-8-9.3V6l8-3Z"
        stroke="currentColor"
        strokeWidth="1.7"
        strokeLinejoin="round"
      />

      <path
        d="m8.3 12 2.3 2.3 5.1-5.1"
        stroke="currentColor"
        strokeWidth="1.7"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  )
}

/* ==================================================================
   ICON HELPERS
================================================================== */

function iconProps() {
  return {
    viewBox: '0 0 24 24',
    fill: 'none',
    stroke: 'currentColor',
    strokeWidth: 1.7,
    strokeLinecap: 'round',
    strokeLinejoin: 'round',
    'aria-hidden': true,
  }
}

function DashboardIcon() {
  return (
    <svg {...iconProps()}>
      <rect
        x="3"
        y="3"
        width="7"
        height="9"
        rx="1.5"
      />

      <rect
        x="14"
        y="3"
        width="7"
        height="5"
        rx="1.5"
      />

      <rect
        x="14"
        y="12"
        width="7"
        height="9"
        rx="1.5"
      />

      <rect
        x="3"
        y="16"
        width="7"
        height="5"
        rx="1.5"
      />
    </svg>
  )
}

function PeopleIcon() {
  return (
    <svg {...iconProps()}>
      <circle
        cx="9"
        cy="8"
        r="3.2"
      />

      <path d="M2.5 20c0-3.6 2.9-6 6.5-6s6.5 2.4 6.5 6" />

      <circle
        cx="17.5"
        cy="8.5"
        r="2.4"
      />

      <path d="M16 14.2c2.7.4 4.5 2.4 4.5 5.8" />
    </svg>
  )
}

function FactoryIcon() {
  return (
    <svg {...iconProps()}>
      <path d="M3 21V10l6 4v-4l6 4V6l6 4v11z" />
      <path d="M3 21h18" />
    </svg>
  )
}

function ZoneIcon() {
  return (
    <svg {...iconProps()}>
      <path d="M12 21s7-5.2 7-11a7 7 0 1 0-14 0c0 5.8 7 11 7 11Z" />
      <circle
        cx="12"
        cy="10"
        r="2.5"
      />
    </svg>
  )
}

function ChecklistIcon() {
  return (
    <svg {...iconProps()}>
      <path d="M9 4h11" />
      <path d="M9 12h11" />
      <path d="M9 20h11" />

      <path d="M4 4.5 5 5.5 6.8 3.5" />
      <path d="M4 12.5 5 13.5 6.8 11.5" />
      <path d="M4 20.5 5 21.5 6.8 19.5" />
    </svg>
  )
}

function ChartIcon() {
  return (
    <svg {...iconProps()}>
      <path d="M4 20V10" />
      <path d="M11 20V4" />
      <path d="M18 20v-7" />
      <path d="M2 20h20" />
    </svg>
  )
}

function GearIcon() {
  return (
    <svg {...iconProps()}>
      <circle
        cx="12"
        cy="12"
        r="3.2"
      />

      <path d="M19.4 12a7.4 7.4 0 0 0-.1-1.3l2-1.5-2-3.4-2.3.9a7.5 7.5 0 0 0-2.3-1.3L14.3 3h-4.6l-.4 2.4a7.5 7.5 0 0 0-2.3 1.3l-2.3-.9-2 3.4 2 1.5A7.4 7.4 0 0 0 4.6 12c0 .4 0 .9.1 1.3l-2 1.5 2 3.4 2.3-.9c.7.6 1.5 1 2.3 1.3l.4 2.4h4.6l.4-2.4a7.5 7.5 0 0 0 2.3-1.3l2.3.9 2-3.4-2-1.5c.1-.4.1-.9.1-1.3Z" />
    </svg>
  )
}

function ArrowRightIcon() {
  return (
    <svg
      width="14"
      height="14"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.9"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d="M5 12h13" />
      <path d="m13 6 6 6-6 6" />
    </svg>
  )
}

function LogoutIcon() {
  return (
    <svg
      width="16"
      height="16"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.7"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d="M10 17l5-5-5-5" />
      <path d="M15 12H3" />
      <path d="M21 4v16" />
    </svg>
  )
}

function MenuIcon() {
  return (
    <svg
      width="20"
      height="20"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      aria-hidden="true"
    >
      <path d="M3 6h18" />
      <path d="M3 12h18" />
      <path d="M3 18h18" />
    </svg>
  )
}

function CloseIcon() {
  return (
    <svg
      width="18"
      height="18"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      aria-hidden="true"
    >
      <path d="M6 6l12 12" />
      <path d="M18 6 6 18" />
    </svg>
  )
}

/* ==================================================================
   STYLES
================================================================== */

const adminSidebarStyles = `
  .admin-shell {
    --sidebar-bg: #ffffff;
    --sidebar-text: #17212b;
    --sidebar-text-secondary: #64717e;
    --sidebar-border: #e9edf1;
    --sidebar-accent: #285fdb;
    --sidebar-accent-soft: #edf3ff;
    display: flex;
    width: 100%;
    min-height: 100vh;
    background: #f7f8fa;
    color: #17212b;
    font-family: Inter, ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;
    -webkit-font-smoothing: antialiased;
  }

  .admin-sidebar {
    position: fixed;
    inset: 0 auto 0 0;
    z-index: 50;
    display: flex;
    width: 264px;
    flex: 0 0 264px;
    flex-direction: column;
    overflow: hidden;
    background: #fff;
    color: var(--sidebar-text);
    border-right: 1px solid var(--sidebar-border);
    transform: translateX(-105%);
    transition: transform .24s cubic-bezier(.2,.8,.2,1), box-shadow .24s ease;
  }
  .admin-sidebar.admin-sidebar-open {
    transform: translateX(0);
    box-shadow: 18px 0 48px rgba(17, 31, 48, .14);
  }
  @media (min-width: 1024px) {
    .admin-sidebar {
      position: sticky;
      top: 0;
      height: 100vh;
      transform: translateX(0);
      box-shadow: none;
    }
  }

  .admin-sidebar-header {
    position: relative;
    display: flex;
    align-items: center;
    min-height: 86px;
    padding: 0 20px;
    border-bottom: 1px solid #eef1f4;
  }
  .admin-brand {
    display: flex;
    min-width: 0;
    align-items: center;
    gap: 11px;
    color: inherit;
    text-decoration: none;
    border-radius: 10px;
  }
  .admin-brand-mark {
    display: flex;
    width: 40px;
    height: 40px;
    flex: 0 0 40px;
    align-items: center;
    justify-content: center;
    border: 1px solid #dce7ff;
    border-radius: 12px;
    background: #edf3ff;
    color: #285fdb;
  }
  .admin-brand-copy { min-width: 0; }
  .admin-brand-name {
    overflow: hidden;
    color: #18212b;
    font-size: 14px;
    line-height: 1.2;
    font-weight: 800;
    letter-spacing: .025em;
    text-overflow: ellipsis;
    white-space: nowrap;
  }
  .admin-brand-name span { color: #285fdb; }
  .admin-brand-subtitle {
    margin-top: 5px;
    overflow: hidden;
    color: #89939e;
    font-size: 9px;
    line-height: 1;
    font-weight: 700;
    letter-spacing: .11em;
    text-transform: uppercase;
    text-overflow: ellipsis;
    white-space: nowrap;
  }
  .admin-mobile-close {
    display: none;
    width: 40px;
    height: 40px;
    flex: 0 0 40px;
    align-items: center;
    justify-content: center;
    margin-left: auto;
    border: 1px solid #e7ebf0;
    border-radius: 11px;
    background: #fff;
    color: #536170;
    cursor: pointer;
    transition: background .18s ease, border-color .18s ease;
  }
  .admin-mobile-close:hover { background: #f5f7fa; border-color: #d8dee6; }
  @media (max-width: 1023px) { .admin-mobile-close { display: flex; } }

  .admin-sidebar-navigation {
    display: flex;
    min-height: 0;
    flex: 1;
    flex-direction: column;
    padding: 24px 12px 14px;
  }
  .admin-navigation-label {
    padding: 0 12px 12px;
    color: #9aa4af;
    font-size: 10px;
    line-height: 1;
    font-weight: 750;
    letter-spacing: .13em;
  }
  .admin-navigation {
    display: flex;
    flex-direction: column;
    gap: 5px;
    overflow-y: auto;
    padding: 0 1px 4px;
    scrollbar-width: thin;
    scrollbar-color: #dce2e9 transparent;
  }
  .admin-navigation::-webkit-scrollbar { width: 4px; }
  .admin-navigation::-webkit-scrollbar-track { background: transparent; }
  .admin-navigation::-webkit-scrollbar-thumb { border-radius: 10px; background: #dce2e9; }
  .admin-nav-item {
    position: relative;
    display: flex;
    align-items: center;
    min-height: 48px;
    width: 100%;
    padding: 0 12px;
    border: 1px solid transparent;
    border-radius: 12px;
    color: #5f6b78;
    text-decoration: none;
    transition: background .16s ease, border-color .16s ease, color .16s ease;
    -webkit-tap-highlight-color: transparent;
  }
  .admin-nav-item:hover { background: #f6f8fb; color: #1d2935; }
  .admin-nav-item-active {
    border-color: #e0eaff;
    background: #edf3ff;
    color: #214fae;
  }
  .admin-nav-active-line { display: none; }
  .admin-nav-icon {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 36px;
    height: 36px;
    flex: 0 0 36px;
    color: #7b8794;
    transition: color .16s ease;
  }
  .admin-nav-icon svg { width: 20px; height: 20px; }
  .admin-nav-item:hover .admin-nav-icon,
  .admin-nav-item-active .admin-nav-icon { color: #285fdb; }
  .admin-nav-label {
    min-width: 0;
    flex: 1;
    overflow: hidden;
    font-size: 14px;
    line-height: 1.2;
    font-weight: 550;
    text-overflow: ellipsis;
    white-space: nowrap;
  }
  .admin-nav-item-active .admin-nav-label { font-weight: 700; }
  .admin-audit-badge {
    display: inline-flex;
    min-width: 23px;
    height: 23px;
    align-items: center;
    justify-content: center;
    margin-left: 8px;
    padding: 0 7px;
    border: 1px solid #f6d7d5;
    border-radius: 999px;
    background: #fff0ef;
    color: #bb3c36;
    font-size: 11px;
    line-height: 1;
    font-weight: 750;
  }
  .admin-nav-arrow { display: flex; margin-left: 7px; color: #285fdb; opacity: .9; }

  .admin-sidebar-bottom {
    padding: 14px 12px 16px;
    border-top: 1px solid #eef1f4;
    background: #fff;
  }
  .admin-system-status {
    display: flex;
    align-items: center;
    gap: 10px;
    margin: 0 3px 12px;
    padding: 12px;
    border: 1px solid #e7f2eb;
    border-radius: 12px;
    background: #f7fcf8;
  }
  .admin-system-dot {
    width: 8px;
    height: 8px;
    flex: 0 0 8px;
    border-radius: 50%;
    background: #26a269;
    box-shadow: 0 0 0 4px rgba(38,162,105,.10);
  }
  .admin-system-status > div { display: flex; min-width: 0; flex-direction: column; gap: 4px; }
  .admin-system-label { color: #6b7b72; font-size: 10px; line-height: 1; font-weight: 650; }
  .admin-system-value { color: #21764e; font-size: 12px; line-height: 1.2; font-weight: 700; }

  .admin-user-card {
    display: flex;
    align-items: center;
    gap: 10px;
    min-width: 0;
    padding: 12px 10px;
    border: 1px solid #edf0f4;
    border-radius: 13px;
    background: #fafbfc;
  }
  .admin-user-avatar {
    display: flex;
    width: 38px;
    height: 38px;
    flex: 0 0 38px;
    align-items: center;
    justify-content: center;
    border: 1px solid #dce7ff;
    border-radius: 12px;
    background: #eaf1ff;
    color: #285fdb;
    font-size: 12px;
    font-weight: 800;
    letter-spacing: .02em;
  }
  .admin-user-information { min-width: 0; flex: 1; }
  .admin-user-name {
    overflow: hidden;
    color: #202b36;
    font-size: 12px;
    line-height: 1.35;
    font-weight: 700;
    text-overflow: ellipsis;
    white-space: nowrap;
  }
  .admin-user-role {
    margin-top: 4px;
    color: #89939e;
    font-size: 10px;
    line-height: 1;
    font-weight: 650;
    text-transform: uppercase;
    letter-spacing: .07em;
  }
  .admin-user-status { display: flex; align-items: center; justify-content: center; width: 15px; height: 15px; }
  .admin-user-status span { width: 7px; height: 7px; border-radius: 50%; background: #26a269; box-shadow: 0 0 0 3px rgba(38,162,105,.10); }
  .admin-logout-button {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 9px;
    width: 100%;
    min-height: 44px;
    margin-top: 9px;
    border: 1px solid #e7ebf0;
    border-radius: 11px;
    background: #fff;
    color: #596675;
    font-size: 13px;
    font-weight: 650;
    cursor: pointer;
    transition: background .16s ease, border-color .16s ease, color .16s ease;
  }
  .admin-logout-button:hover { border-color: #f0cfcd; background: #fff7f6; color: #b93832; }
  .admin-logout-button:focus-visible,
  .admin-nav-item:focus-visible,
  .admin-mobile-menu:focus-visible,
  .admin-mobile-close:focus-visible,
  .admin-brand:focus-visible { outline: 3px solid rgba(40,95,219,.24); outline-offset: 2px; }

  .admin-sidebar-overlay {
    position: fixed;
    inset: 0;
    z-index: 40;
    display: block;
    width: 100%;
    height: 100%;
    border: 0;
    background: rgba(16, 27, 42, .38);
    backdrop-filter: blur(3px);
    -webkit-backdrop-filter: blur(3px);
    cursor: pointer;
  }
  @media (min-width: 1024px) { .admin-sidebar-overlay { display: none; } }

  .admin-main {
    display: flex;
    min-width: 0;
    min-height: 100vh;
    flex: 1;
    flex-direction: column;
    background: #f7f8fa;
  }
  .admin-main-content { min-width: 0; flex: 1; padding: 0; }

  .admin-mobile-header {
    position: sticky;
    top: 0;
    z-index: 30;
    display: none;
    min-height: 62px;
    align-items: center;
    gap: 12px;
    padding: 0 16px;
    border-bottom: 1px solid #e9edf2;
    background: rgba(255,255,255,.94);
    backdrop-filter: blur(16px);
    -webkit-backdrop-filter: blur(16px);
  }
  .admin-mobile-menu {
    display: flex;
    width: 42px;
    height: 42px;
    flex: 0 0 42px;
    align-items: center;
    justify-content: center;
    border: 1px solid #e6eaf0;
    border-radius: 12px;
    background: #fff;
    color: #344252;
    cursor: pointer;
    transition: background .16s ease, border-color .16s ease;
    -webkit-tap-highlight-color: transparent;
  }
  .admin-mobile-menu:hover { border-color: #d7dfe8; background: #f7f9fc; }
  .admin-mobile-brand { display: flex; min-width: 0; align-items: center; gap: 9px; color: #18212b; text-decoration: none; }
  .admin-mobile-brand-mark {
    display: flex;
    width: 34px;
    height: 34px;
    flex: 0 0 34px;
    align-items: center;
    justify-content: center;
    border: 1px solid #dce7ff;
    border-radius: 10px;
    background: #edf3ff;
    color: #285fdb;
  }
  .admin-mobile-brand-name { overflow: hidden; color: #18212b; font-size: 13px; line-height: 1; font-weight: 800; letter-spacing: .025em; white-space: nowrap; }
  .admin-mobile-brand-name span { color: #285fdb; }
  .admin-mobile-header-spacer { flex: 1; }
  @media (max-width: 1023px) { .admin-mobile-header { display: flex; } }
  @media (max-width: 700px) {
    .admin-sidebar { width: min(300px, 88vw); flex-basis: min(300px, 88vw); }
    .admin-sidebar-header { min-height: 78px; padding: 0 16px; }
    .admin-sidebar-navigation { padding: 19px 11px 12px; }
    .admin-nav-item { min-height: 50px; }
    .admin-sidebar-bottom { padding-bottom: max(14px, env(safe-area-inset-bottom)); }
  }
  @media (max-width: 380px) {
    .admin-mobile-header { padding: 0 12px; gap: 9px; }
    .admin-mobile-brand-name { font-size: 12px; }
    .admin-mobile-menu { width: 40px; height: 40px; flex-basis: 40px; }
  }
  @media (prefers-reduced-motion: reduce) {
    .admin-shell *, .admin-shell *::before, .admin-shell *::after {
      animation-duration: .01ms !important;
      animation-iteration-count: 1 !important;
      transition-duration: .01ms !important;
      scroll-behavior: auto !important;
    }
  }
`
