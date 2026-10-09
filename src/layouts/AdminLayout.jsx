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
  /* ================================================================
     SHELL
  ================================================================ */

  .admin-shell {
    --sidebar-bg: #102b43;
    --sidebar-bg-deep: #0d263b;
    --sidebar-surface: rgba(255,255,255,.045);

    --sidebar-text: #f4f7f9;
    --sidebar-text-secondary: #aebbc5;
    --sidebar-text-muted: #738492;

    --sidebar-blue: #4386b5;
    --sidebar-blue-soft: rgba(67,134,181,.14);

    --sidebar-border: rgba(255,255,255,.085);

    display: flex;
    min-height: 100vh;
    width: 100%;
    background: #f4f6f8;
    color: #17222d;
  }

  /* ================================================================
     SIDEBAR
  ================================================================ */

  .admin-sidebar {
    position: fixed;
    inset: 0 auto 0 0;
    z-index: 50;

    display: flex;
    width: 264px;
    flex: 0 0 264px;
    flex-direction: column;

    overflow: hidden;

    background:
      linear-gradient(
        180deg,
        #102b43 0%,
        #0f2a42 54%,
        #0d263b 100%
      );

    color: var(--sidebar-text);

    transform: translateX(-100%);

    transition:
      transform .28s cubic-bezier(.4,0,.2,1),
      box-shadow .28s ease;
  }

  .admin-sidebar.admin-sidebar-open {
    transform: translateX(0);
    box-shadow: 18px 0 45px rgba(7,23,37,.22);
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

  /* ================================================================
     BRAND
  ================================================================ */

  .admin-sidebar-header {
    position: relative;

    display: flex;
    align-items: center;

    min-height: 88px;
    padding: 0 18px;

    border-bottom: 1px solid var(--sidebar-border);
  }

  .admin-brand {
    display: flex;
    min-width: 0;
    align-items: center;
    gap: 11px;

    color: inherit;
    text-decoration: none;
  }

  .admin-brand-mark {
    display: flex;
    width: 40px;
    height: 40px;
    flex: 0 0 40px;

    align-items: center;
    justify-content: center;

    border: 1px solid rgba(255,255,255,.11);
    border-radius: 9px;

    background:
      linear-gradient(
        145deg,
        #286b9a,
        #1e5278
      );

    color: #fff;

    box-shadow:
      0 5px 14px rgba(4,18,31,.18),
      inset 0 1px 0 rgba(255,255,255,.08);
  }

  .admin-brand-copy {
    min-width: 0;
  }

  .admin-brand-name {
    overflow: hidden;

    color: #f8fafb;

    font-size: 14px;
    line-height: 1.2;
    font-weight: 800;

    letter-spacing: .035em;

    text-overflow: ellipsis;
    white-space: nowrap;
  }

  .admin-brand-name span {
    color: #67a2ca;
  }

  .admin-brand-subtitle {
    margin-top: 4px;

    overflow: hidden;

    color: #7f93a3;

    font-size: 8px;
    line-height: 1;
    font-weight: 700;

    letter-spacing: .13em;
    text-transform: uppercase;

    text-overflow: ellipsis;
    white-space: nowrap;
  }

  .admin-mobile-close {
    display: none;

    width: 34px;
    height: 34px;
    flex: 0 0 34px;

    align-items: center;
    justify-content: center;

    margin-left: auto;

    border: 1px solid rgba(255,255,255,.1);
    border-radius: 7px;

    background: rgba(255,255,255,.04);

    color: #b9c5ce;

    cursor: pointer;
  }

  .admin-mobile-close:hover {
    background: rgba(255,255,255,.08);
    color: #fff;
  }

  @media (max-width: 1023px) {
    .admin-mobile-close {
      display: flex;
    }
  }

  /* ================================================================
     NAVIGATION
  ================================================================ */

  .admin-sidebar-navigation {
    display: flex;
    min-height: 0;
    flex: 1;
    flex-direction: column;

    padding: 22px 11px 12px;
  }

  .admin-navigation-label {
    padding: 0 12px 9px;

    color: #647989;

    font-size: 8px;
    line-height: 1;
    font-weight: 800;

    letter-spacing: .17em;
  }

  .admin-navigation {
    display: flex;
    flex-direction: column;
    gap: 3px;

    overflow-y: auto;
    padding-right: 2px;

    scrollbar-width: thin;
    scrollbar-color: rgba(255,255,255,.12) transparent;
  }

  .admin-navigation::-webkit-scrollbar {
    width: 4px;
  }

  .admin-navigation::-webkit-scrollbar-track {
    background: transparent;
  }

  .admin-navigation::-webkit-scrollbar-thumb {
    border-radius: 10px;
    background: rgba(255,255,255,.12);
  }

  .admin-nav-item {
    position: relative;

    display: flex;
    align-items: center;

    min-height: 45px;
    width: 100%;

    padding: 0 11px;

    border: 1px solid transparent;
    border-radius: 8px;

    color: #9eafbb;

    text-decoration: none;

    transition:
      background .18s ease,
      border-color .18s ease,
      color .18s ease;
  }

  .admin-nav-item:hover {
    border-color: rgba(255,255,255,.045);
    background: rgba(255,255,255,.045);
    color: #e9eef2;
  }

  .admin-nav-item-active {
    border-color: rgba(91,151,193,.17);

    background:
      linear-gradient(
        90deg,
        rgba(55,116,158,.27),
        rgba(55,116,158,.11)
      );

    color: #f6f9fb;

    box-shadow:
      inset 0 1px 0 rgba(255,255,255,.025);
  }

  .admin-nav-active-line {
    position: absolute;
    left: -1px;
    top: 8px;
    bottom: 8px;

    width: 3px;

    border-radius: 0 4px 4px 0;

    background: #5d9bc3;

    opacity: 0;

    transform: scaleY(.4);

    transition:
      opacity .18s ease,
      transform .18s ease;
  }

  .admin-nav-item-active .admin-nav-active-line {
    opacity: 1;
    transform: scaleY(1);
  }

  .admin-nav-icon {
    display: flex;
    align-items: center;
    justify-content: center;

    width: 34px;
    height: 34px;
    flex: 0 0 34px;

    color: #7f94a2;

    transition: color .18s ease;
  }

  .admin-nav-icon svg {
    width: 18px;
    height: 18px;
  }

  .admin-nav-item:hover .admin-nav-icon,
  .admin-nav-item-active .admin-nav-icon {
    color: #72a9cb;
  }

  .admin-nav-label {
    min-width: 0;
    flex: 1;

    overflow: hidden;

    font-size: 12px;
    line-height: 1;
    font-weight: 650;

    text-overflow: ellipsis;
    white-space: nowrap;
  }

  .admin-nav-item-active .admin-nav-label {
    font-weight: 750;
  }

  .admin-audit-badge {
    display: inline-flex;

    min-width: 21px;
    height: 20px;

    align-items: center;
    justify-content: center;

    margin-left: 7px;
    padding: 0 6px;

    border: 1px solid rgba(255,255,255,.08);
    border-radius: 999px;

    background: #b84a43;

    color: #fff;

    font-size: 9px;
    line-height: 1;
    font-weight: 800;

    box-shadow: 0 3px 8px rgba(0,0,0,.12);
  }

  .admin-nav-arrow {
    display: flex;

    margin-left: 7px;

    color: #5f91b1;

    opacity: .9;
  }

  /* ================================================================
     LOWER SIDEBAR
  ================================================================ */

  .admin-sidebar-bottom {
    padding: 12px;

    border-top: 1px solid var(--sidebar-border);

    background: rgba(7,22,35,.13);
  }

  /* ================================================================
     SYSTEM STATUS
  ================================================================ */

  .admin-system-status {
    display: flex;
    align-items: center;
    gap: 9px;

    margin: 0 4px 10px;
    padding: 9px 10px;

    border: 1px solid rgba(255,255,255,.06);
    border-radius: 7px;

    background: rgba(255,255,255,.025);
  }

  .admin-system-dot {
    width: 6px;
    height: 6px;
    flex: 0 0 6px;

    border-radius: 50%;

    background: #54a978;

    box-shadow: 0 0 0 3px rgba(84,169,120,.09);
  }

  .admin-system-status > div {
    display: flex;
    min-width: 0;
    flex-direction: column;
    gap: 2px;
  }

  .admin-system-label {
    color: #778b9a;

    font-size: 8px;
    line-height: 1;
    font-weight: 700;

    text-transform: uppercase;
    letter-spacing: .1em;
  }

  .admin-system-value {
    color: #afbec8;

    font-size: 10px;
    line-height: 1;
    font-weight: 600;
  }

  /* ================================================================
     USER CARD
  ================================================================ */

  .admin-user-card {
    display: flex;
    align-items: center;
    gap: 10px;

    min-width: 0;

    padding: 10px;

    border: 1px solid rgba(255,255,255,.07);
    border-radius: 8px;

    background: rgba(255,255,255,.035);
  }

  .admin-user-avatar {
    display: flex;

    width: 35px;
    height: 35px;
    flex: 0 0 35px;

    align-items: center;
    justify-content: center;

    border: 1px solid rgba(255,255,255,.1);
    border-radius: 8px;

    background: #244964;

    color: #eaf2f7;

    font-size: 10px;
    font-weight: 800;

    letter-spacing: .03em;
  }

  .admin-user-information {
    min-width: 0;
    flex: 1;
  }

  .admin-user-name {
    overflow: hidden;

    color: #e4ebef;

    font-size: 11px;
    line-height: 1.25;
    font-weight: 700;

    text-overflow: ellipsis;
    white-space: nowrap;
  }

  .admin-user-role {
    margin-top: 3px;

    color: #718594;

    font-size: 8px;
    line-height: 1;

    font-weight: 700;

    text-transform: uppercase;
    letter-spacing: .1em;
  }

  .admin-user-status {
    display: flex;
    align-items: center;
    justify-content: center;

    width: 15px;
    height: 15px;
  }

  .admin-user-status span {
    width: 6px;
    height: 6px;

    border-radius: 50%;

    background: #54a978;

    box-shadow: 0 0 0 3px rgba(84,169,120,.08);
  }

  /* ================================================================
     LOGOUT
  ================================================================ */

  .admin-logout-button {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 8px;

    width: 100%;
    min-height: 38px;

    margin-top: 8px;

    border: 1px solid rgba(255,255,255,.08);
    border-radius: 7px;

    background: transparent;

    color: #8294a1;

    font-size: 10px;
    font-weight: 700;

    cursor: pointer;

    transition:
      background .18s ease,
      border-color .18s ease,
      color .18s ease;
  }

  .admin-logout-button:hover {
    border-color: rgba(255,255,255,.12);
    background: rgba(255,255,255,.05);
    color: #d5dfe5;
  }

  .admin-logout-button:focus-visible,
  .admin-nav-item:focus-visible,
  .admin-mobile-menu:focus-visible,
  .admin-mobile-close:focus-visible,
  .admin-brand:focus-visible {
    outline: 3px solid rgba(93,155,195,.3);
    outline-offset: 2px;
  }

  /* ================================================================
     MOBILE OVERLAY
  ================================================================ */

  .admin-sidebar-overlay {
    position: fixed;
    inset: 0;
    z-index: 40;

    display: block;

    width: 100%;
    height: 100%;

    border: 0;

    background: rgba(7,21,33,.46);

    backdrop-filter: blur(3px);
    -webkit-backdrop-filter: blur(3px);

    cursor: pointer;
  }

  @media (min-width: 1024px) {
    .admin-sidebar-overlay {
      display: none;
    }
  }

  /* ================================================================
     MAIN AREA
  ================================================================ */

  .admin-main {
    display: flex;
    min-width: 0;
    min-height: 100vh;
    flex: 1;
    flex-direction: column;

    background: #f4f6f8;
  }

  .admin-main-content {
    min-width: 0;
    flex: 1;

    padding: 0;
  }

  /* ================================================================
     MOBILE HEADER
  ================================================================ */

  .admin-mobile-header {
    position: sticky;
    top: 0;
    z-index: 30;

    display: none;

    height: 58px;

    align-items: center;
    gap: 10px;

    padding: 0 15px;

    border-bottom: 1px solid #e1e6eb;

    background: rgba(255,255,255,.94);

    backdrop-filter: blur(14px);
    -webkit-backdrop-filter: blur(14px);
  }

  .admin-mobile-menu {
    display: flex;

    width: 36px;
    height: 36px;
    flex: 0 0 36px;

    align-items: center;
    justify-content: center;

    border: 1px solid #e1e6eb;
    border-radius: 7px;

    background: #fff;

    color: #52636f;

    cursor: pointer;

    transition:
      background .18s ease,
      border-color .18s ease;
  }

  .admin-mobile-menu:hover {
    border-color: #ccd5dc;
    background: #f8fafb;
  }

  .admin-mobile-brand {
    display: flex;
    align-items: center;
    gap: 9px;

    color: #18364f;

    text-decoration: none;
  }

  .admin-mobile-brand-mark {
    display: flex;

    width: 31px;
    height: 31px;

    align-items: center;
    justify-content: center;

    border-radius: 7px;

    background: #18364f;

    color: #fff;
  }

  .admin-mobile-brand-name {
    color: #18364f;

    font-size: 12px;
    line-height: 1;
    font-weight: 800;

    letter-spacing: .035em;
  }

  .admin-mobile-brand-name span {
    color: #286b9a;
  }

  .admin-mobile-header-spacer {
    flex: 1;
  }

  @media (max-width: 1023px) {
    .admin-mobile-header {
      display: flex;
    }
  }

  /* ================================================================
     TABLET
  ================================================================ */

  @media (max-width: 700px) {
    .admin-sidebar {
      width: 282px;
      flex-basis: 282px;
    }
  }

  /* ================================================================
     SMALL MOBILE
  ================================================================ */

  @media (max-width: 390px) {
    .admin-sidebar {
      width: min(286px, 88vw);
    }

    .admin-sidebar-header {
      min-height: 78px;
      padding: 0 15px;
    }

    .admin-sidebar-navigation {
      padding-top: 18px;
    }

    .admin-nav-item {
      min-height: 44px;
    }
  }

  /* ================================================================
     REDUCED MOTION
  ================================================================ */

  @media (prefers-reduced-motion: reduce) {
    .admin-shell *,
    .admin-shell *::before,
    .admin-shell *::after {
      animation-duration: .01ms !important;
      animation-iteration-count: 1 !important;
      transition-duration: .01ms !important;
      scroll-behavior: auto !important;
    }
  }
`