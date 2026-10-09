import { useEffect, useState } from 'react'
import {
  NavLink,
  Outlet,
  useLocation,
  useNavigate,
} from 'react-router-dom'

import { useAuth } from '../hooks/useAuth'

const NAV_ITEMS = [
  {
    label: 'Workspace',
    path: '/consultant',
    end: true,
    icon: DashboardIcon,
  },
  {
    label: 'My Audits',
    path: '/consultant/audits',
    icon: AuditIcon,
  },
]

export default function ConsultantLayout() {
  const { user, logout } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()

  const [mobileOpen, setMobileOpen] = useState(false)

  const initials =
    user?.full_name
      ?.split(' ')
      .filter(Boolean)
      .map((part) => part[0])
      .slice(0, 2)
      .join('')
      .toUpperCase() || 'C'

  useEffect(() => {
    setMobileOpen(false)
  }, [location.pathname])

  const handleLogout = async () => {
    try {
      await logout()
    } finally {
      navigate('/login')
    }
  }

  return (
    <div className="consultant-shell min-h-screen bg-[#f5f7f9] text-[#101828]">

      {/* ======================================================
          DESKTOP SIDEBAR
      ======================================================= */}

      <aside className="consultant-sidebar fixed inset-y-0 left-0 z-40 hidden w-[264px] flex-col lg:flex">

        {/* BRAND */}
        <div className="consultant-brand">
          <div className="flex items-center gap-3">

            <div className="consultant-logo">
              <span>L4</span>
            </div>

            <div className="min-w-0">
              <div className="text-[15px] font-bold tracking-[-0.02em] text-white">
                Lean4Audit
              </div>

              <div className="mt-0.5 text-[9px] font-bold uppercase tracking-[0.18em] text-[#a9c8dc]">
                Consultant
              </div>
            </div>

          </div>
        </div>

        {/* CONSULTANT PROFILE */}
        <div className="px-4 pt-5">
          <div className="consultant-profile-card">

            <div className="flex items-center gap-3">

              <div className="consultant-avatar">
                {initials}
              </div>

              <div className="min-w-0">
                <div className="truncate text-sm font-semibold text-white">
                  {user?.full_name || 'Consultant'}
                </div>

                <div className="mt-0.5 text-[11px] text-[#a9c8dc]">
                  Audit Consultant
                </div>
              </div>

            </div>

            <div className="mt-4 flex items-center gap-2 border-t border-white/[0.08] pt-3">
              <span className="h-1.5 w-1.5 rounded-full bg-[#35c98b]" />

              <span className="text-[10px] font-semibold uppercase tracking-[0.12em] text-[#a9c8dc]">
                Workspace Active
              </span>
            </div>

          </div>
        </div>

        {/* ==================================================
            DESKTOP NAVIGATION
        =================================================== */}

        <div className="consultant-sidebar-scroll flex-1 overflow-y-auto px-4 py-6">

          <div className="mb-3 px-3 text-[9px] font-bold uppercase tracking-[0.18em] text-[#7fa3bb]">
            Audit Workspace
          </div>

          <nav className="space-y-1">
            {NAV_ITEMS.map((item) => {
              const Icon = item.icon

              return (
                <NavLink
                  key={item.path}
                  to={item.path}
                  end={item.end}
                  className={({ isActive }) =>
                    `consultant-nav-item ${
                      isActive
                        ? 'consultant-nav-active'
                        : ''
                    }`
                  }
                >
                  <span className="consultant-nav-icon">
                    <Icon />
                  </span>

                  <span className="flex-1">
                    {item.label}
                  </span>

                  <ChevronIcon />
                </NavLink>
              )
            })}
          </nav>

          {/* START NEW AUDIT */}

          <div className="mt-7">
            <button
              type="button"
              onClick={() =>
                navigate('/consultant/audits/new')
              }
              className="consultant-new-audit group w-full"
            >
              <span className="consultant-new-audit-icon">
                <PlusIcon />
              </span>

              <span className="flex-1 text-left">
                <span className="block text-xs font-semibold text-white">
                  Start New Audit
                </span>

                <span className="mt-0.5 block text-[10px] text-[#a9c8dc]">
                  Begin a plant assessment
                </span>
              </span>

              <ArrowIcon />
            </button>
          </div>

          {/* AUDIT FLOW */}

          <div className="mt-8">

            <div className="mb-3 px-3 text-[9px] font-bold uppercase tracking-[0.18em] text-[#7fa3bb]">
              Audit Flow
            </div>

            <div className="space-y-1">

              <WorkflowItem
                number="01"
                label="Select Zone"
              />

              <WorkflowItem
                number="02"
                label="Conduct Audit"
              />

              <WorkflowItem
                number="03"
                label="Submit Findings"
              />

            </div>
          </div>

        </div>

        {/* ==================================================
            DESKTOP FOOTER
        =================================================== */}

        <div className="border-t border-white/[0.08] p-4">

          <div className="mb-3 flex items-center gap-2 px-2">
            <span className="h-1.5 w-1.5 rounded-full bg-[#35c98b]" />

            <span className="text-[10px] font-medium text-[#8eacbd]">
              System operational
            </span>
          </div>

          <button
            type="button"
            onClick={handleLogout}
            className="consultant-signout"
          >
            <LogoutIcon />
            <span>Sign out</span>
          </button>

        </div>

      </aside>

      {/* ======================================================
          MOBILE HEADER
      ======================================================= */}

      <header className="consultant-mobile-header lg:hidden">

        <button
          type="button"
          onClick={() => setMobileOpen(true)}
          className="consultant-mobile-menu"
          aria-label="Open navigation"
        >
          <MenuIcon />
        </button>

        <div className="flex items-center gap-2.5">

          <div className="consultant-mobile-logo">
            L4
          </div>

          <div>
            <div className="text-sm font-bold text-[#102b43]">
              Lean4Audit
            </div>

            <div className="text-[9px] font-bold uppercase tracking-[0.14em] text-[#4386b5]">
              Consultant
            </div>
          </div>

        </div>

        <div className="ml-auto flex h-8 w-8 items-center justify-center rounded-full bg-[#102b43] text-[10px] font-bold text-white">
          {initials}
        </div>

      </header>

      {/* ======================================================
          MOBILE OVERLAY
      ======================================================= */}

      {mobileOpen && (
        <div
          className="fixed inset-0 z-50 bg-[#102b43]/45 backdrop-blur-[1px] lg:hidden"
          onClick={() => setMobileOpen(false)}
        />
      )}

      {/* ======================================================
          MOBILE DRAWER
      ======================================================= */}

      <aside
        className={`consultant-mobile-drawer fixed inset-y-0 left-0 z-[60] flex w-[285px] flex-col ${
          mobileOpen
            ? 'translate-x-0'
            : '-translate-x-full'
        }`}
      >

        {/* MOBILE DRAWER HEADER */}

        <div className="flex items-center justify-between border-b border-white/[0.08] px-5 py-5">

          <div className="flex items-center gap-3">

            <div className="consultant-logo">
              <span>L4</span>
            </div>

            <div>
              <div className="text-sm font-bold text-white">
                Lean4Audit
              </div>

              <div className="text-[9px] font-bold uppercase tracking-[0.15em] text-[#a9c8dc]">
                Consultant
              </div>
            </div>

          </div>

          <button
            type="button"
            onClick={() => setMobileOpen(false)}
            className="flex h-8 w-8 items-center justify-center rounded-lg text-[#a9c8dc] hover:bg-white/[0.06] hover:text-white"
            aria-label="Close navigation"
          >
            <CloseIcon />
          </button>

        </div>

        {/* MOBILE CONTENT */}

        <div className="consultant-mobile-scroll flex-1 overflow-y-auto px-4 py-5">

          {/* PROFILE */}

          <div className="consultant-profile-card">

            <div className="flex items-center gap-3">

              <div className="consultant-avatar">
                {initials}
              </div>

              <div className="min-w-0">

                <div className="truncate text-sm font-semibold text-white">
                  {user?.full_name || 'Consultant'}
                </div>

                <div className="text-[11px] text-[#a9c8dc]">
                  Audit Consultant
                </div>

              </div>

            </div>

          </div>

          {/* NAVIGATION */}

          <div className="mb-3 mt-7 px-3 text-[9px] font-bold uppercase tracking-[0.18em] text-[#7fa3bb]">
            Audit Workspace
          </div>

          <nav className="space-y-1">

            {NAV_ITEMS.map((item) => {
              const Icon = item.icon

              return (
                <NavLink
                  key={item.path}
                  to={item.path}
                  end={item.end}
                  className={({ isActive }) =>
                    `consultant-nav-item ${
                      isActive
                        ? 'consultant-nav-active'
                        : ''
                    }`
                  }
                >
                  <span className="consultant-nav-icon">
                    <Icon />
                  </span>

                  <span className="flex-1">
                    {item.label}
                  </span>

                  <ChevronIcon />
                </NavLink>
              )
            })}

          </nav>

          {/* NEW AUDIT */}

          <button
            type="button"
            onClick={() => {
              setMobileOpen(false)
              navigate('/consultant/audits/new')
            }}
            className="consultant-new-audit mt-7 w-full"
          >

            <span className="consultant-new-audit-icon">
              <PlusIcon />
            </span>

            <span className="flex-1 text-left">

              <span className="block text-xs font-semibold text-white">
                Start New Audit
              </span>

              <span className="mt-0.5 block text-[10px] text-[#a9c8dc]">
                Begin a plant assessment
              </span>

            </span>

            <ArrowIcon />

          </button>

          {/* AUDIT FLOW */}

          <div className="mt-8">

            <div className="mb-3 px-3 text-[9px] font-bold uppercase tracking-[0.18em] text-[#7fa3bb]">
              Audit Flow
            </div>

            <div className="space-y-1">

              <WorkflowItem
                number="01"
                label="Select Zone"
              />

              <WorkflowItem
                number="02"
                label="Conduct Audit"
              />

              <WorkflowItem
                number="03"
                label="Submit Findings"
              />

            </div>

          </div>

        </div>

        {/* MOBILE FOOTER */}

        <div className="border-t border-white/[0.08] p-4">

          <div className="mb-3 flex items-center gap-2 px-2">
            <span className="h-1.5 w-1.5 rounded-full bg-[#35c98b]" />

            <span className="text-[10px] font-medium text-[#8eacbd]">
              System operational
            </span>
          </div>

          <button
            type="button"
            onClick={handleLogout}
            className="consultant-signout"
          >
            <LogoutIcon />
            <span>Sign out</span>
          </button>

        </div>

      </aside>

      {/* ======================================================
          MAIN CONTENT
      ======================================================= */}

      <main className="min-h-screen lg:pl-[264px]">
        <Outlet />
      </main>

      {/* ======================================================
          STYLES
      ======================================================= */}

      <style>{`

        /* ====================================================
           ROOT
        ==================================================== */

        .consultant-shell {
          --consultant-navy: #102b43;
          --consultant-navy-deep: #0c2336;
          --consultant-steel: #4386b5;
          --consultant-line: rgba(255,255,255,0.08);
        }

        /* ====================================================
           SIDEBAR
        ==================================================== */

        .consultant-sidebar,
        .consultant-mobile-drawer {
          background:
            linear-gradient(
              180deg,
              var(--consultant-navy) 0%,
              var(--consultant-navy-deep) 100%
            );

          color: white;

          box-shadow:
            8px 0 30px rgba(16,42,67,0.08);
        }

        /* ====================================================
           HIDE SIDEBAR SCROLLBAR
        ==================================================== */

        .consultant-sidebar-scroll,
        .consultant-mobile-scroll {
          scrollbar-width: none;
          -ms-overflow-style: none;
        }

        .consultant-sidebar-scroll::-webkit-scrollbar,
        .consultant-mobile-scroll::-webkit-scrollbar {
          display: none;
          width: 0;
          height: 0;
        }

        /* ====================================================
           BRAND
        ==================================================== */

        .consultant-brand {
          height: 76px;

          display: flex;
          align-items: center;

          padding: 0 20px;

          border-bottom: 1px solid var(--consultant-line);
        }

        .consultant-logo {
          width: 40px;
          height: 40px;

          flex: 0 0 40px;

          display: flex;
          align-items: center;
          justify-content: center;

          border-radius: 11px;

          background:
            linear-gradient(
              145deg,
              #4386b5,
              #285d82
            );

          border: 1px solid rgba(255,255,255,0.14);

          box-shadow:
            0 4px 12px rgba(0,0,0,0.16);
        }

        .consultant-logo span {
          font-size: 12px;
          font-weight: 800;
          letter-spacing: -0.04em;
        }

        /* ====================================================
           PROFILE
        ==================================================== */

        .consultant-profile-card {
          padding: 13px;

          border: 1px solid rgba(255,255,255,0.08);

          border-radius: 13px;

          background:
            rgba(255,255,255,0.045);
        }

        .consultant-avatar {
          width: 36px;
          height: 36px;

          flex: 0 0 36px;

          display: flex;
          align-items: center;
          justify-content: center;

          border-radius: 10px;

          background: #4386b5;

          color: white;

          font-size: 11px;
          font-weight: 800;

          letter-spacing: 0.03em;
        }

        /* ====================================================
           NAVIGATION
        ==================================================== */

        .consultant-nav-item {
          position: relative;

          min-height: 44px;

          display: flex;
          align-items: center;

          gap: 11px;

          padding: 0 12px;

          border-radius: 9px;

          color: #b4c7d4;

          font-size: 13px;
          font-weight: 500;

          transition:
            background 160ms ease,
            color 160ms ease,
            transform 160ms ease;
        }

        .consultant-nav-item:hover {
          color: white;

          background:
            rgba(255,255,255,0.055);
        }

        .consultant-nav-item:focus-visible {
          outline:
            2px solid rgba(124,180,215,0.8);

          outline-offset: 2px;
        }

        .consultant-nav-active {
          color: white;

          background:
            linear-gradient(
              90deg,
              rgba(67,134,181,0.28),
              rgba(67,134,181,0.08)
            );

          box-shadow:
            inset 3px 0 0 #63a0c8;
        }

        .consultant-nav-active
        .consultant-nav-icon {
          color: #9fc9e2;
        }

        .consultant-nav-icon {
          width: 20px;
          height: 20px;

          display: flex;
          align-items: center;
          justify-content: center;

          color: #7f9caf;
        }

        .consultant-nav-icon svg {
          width: 17px;
          height: 17px;
        }

        .consultant-nav-item > svg {
          width: 13px;
          height: 13px;

          color: #58778b;
        }

        /* ====================================================
           NEW AUDIT
        ==================================================== */

        .consultant-new-audit {
          min-height: 58px;

          display: flex;
          align-items: center;

          gap: 11px;

          padding: 9px 11px;

          border: 1px solid rgba(99,160,200,0.25);

          border-radius: 11px;

          background:
            linear-gradient(
              90deg,
              rgba(67,134,181,0.22),
              rgba(67,134,181,0.09)
            );

          transition:
            border-color 160ms ease,
            background 160ms ease,
            transform 160ms ease;
        }

        .consultant-new-audit:hover {
          border-color:
            rgba(99,160,200,0.5);

          background:
            linear-gradient(
              90deg,
              rgba(67,134,181,0.3),
              rgba(67,134,181,0.13)
            );

          transform:
            translateY(-1px);
        }

        .consultant-new-audit-icon {
          width: 34px;
          height: 34px;

          flex: 0 0 34px;

          display: flex;
          align-items: center;
          justify-content: center;

          border-radius: 8px;

          background: #4386b5;

          color: white;
        }

        /* ====================================================
           SIGN OUT
        ==================================================== */

        .consultant-signout {
          width: 100%;
          height: 40px;

          display: flex;
          align-items: center;

          gap: 10px;

          padding: 0 11px;

          border-radius: 8px;

          color: #9eb2c0;

          font-size: 12px;
          font-weight: 600;

          transition:
            background 160ms ease,
            color 160ms ease;
        }

        .consultant-signout:hover {
          background:
            rgba(255,255,255,0.05);

          color: white;
        }

        /* ====================================================
           MOBILE HEADER
        ==================================================== */

        .consultant-mobile-header {
          position: sticky;

          top: 0;

          z-index: 30;

          height: 64px;

          display: flex;
          align-items: center;

          gap: 12px;

          padding: 0 16px;

          background: white;

          border-bottom:
            1px solid #dfe3e8;

          box-shadow:
            0 2px 8px rgba(16,42,67,0.04);
        }

        .consultant-mobile-menu {
          width: 38px;
          height: 38px;

          display: flex;
          align-items: center;
          justify-content: center;

          border-radius: 9px;

          color: #344054;
        }

        .consultant-mobile-menu:hover {
          background: #f2f4f7;
        }

        .consultant-mobile-logo {
          width: 32px;
          height: 32px;

          display: flex;
          align-items: center;
          justify-content: center;

          border-radius: 9px;

          background: #102b43;

          color: white;

          font-size: 10px;
          font-weight: 800;
        }

        /* ====================================================
           MOBILE DRAWER
        ==================================================== */

        .consultant-mobile-drawer {
          transition:
            transform 220ms ease;
        }

        /* ====================================================
           ACCESSIBILITY / REDUCED MOTION
        ==================================================== */

        @media (prefers-reduced-motion: reduce) {

          .consultant-nav-item,
          .consultant-new-audit,
          .consultant-signout,
          .consultant-mobile-drawer {
            transition: none;
          }

        }

      `}</style>
    </div>
  )
}

/* ============================================================
   WORKFLOW ITEM
============================================================ */

function WorkflowItem({
  number,
  label,
}) {
  return (
    <div className="flex items-center gap-3 rounded-lg px-3 py-2.5">

      <span className="flex h-6 w-6 items-center justify-center rounded-md border border-white/[0.08] text-[9px] font-bold text-[#7fa3bb]">
        {number}
      </span>

      <span className="text-[11px] font-medium text-[#829bab]">
        {label}
      </span>

    </div>
  )
}

/* ============================================================
   ICON HELPERS
============================================================ */

function iconProps(
  className = 'h-5 w-5'
) {
  return {
    className,
    viewBox: '0 0 24 24',
    fill: 'none',
    stroke: 'currentColor',
    strokeWidth: 1.8,
    strokeLinecap: 'round',
    strokeLinejoin: 'round',
    'aria-hidden': true,
  }
}

/* ============================================================
   DASHBOARD
============================================================ */

function DashboardIcon() {
  return (
    <svg {...iconProps()}>

      <rect
        x="4"
        y="4"
        width="6"
        height="6"
        rx="1"
      />

      <rect
        x="14"
        y="4"
        width="6"
        height="6"
        rx="1"
      />

      <rect
        x="4"
        y="14"
        width="6"
        height="6"
        rx="1"
      />

      <rect
        x="14"
        y="14"
        width="6"
        height="6"
        rx="1"
      />

    </svg>
  )
}

/* ============================================================
   AUDIT
============================================================ */

function AuditIcon() {
  return (
    <svg {...iconProps()}>

      <rect
        x="5"
        y="3.5"
        width="14"
        height="17"
        rx="2"
      />

      <path d="M9 3.5V2.5h6v1" />

      <path d="M8.5 9h7" />
      <path d="M8.5 13h7" />
      <path d="M8.5 17h4" />

    </svg>
  )
}

/* ============================================================
   PLUS
============================================================ */

function PlusIcon() {
  return (
    <svg {...iconProps('h-4 w-4')}>

      <path d="M12 5v14" />
      <path d="M5 12h14" />

    </svg>
  )
}

/* ============================================================
   ARROW
============================================================ */

function ArrowIcon() {
  return (
    <svg {...iconProps('h-4 w-4')}>

      <path d="M5 12h14" />
      <path d="m13 6 6 6-6 6" />

    </svg>
  )
}

/* ============================================================
   CHEVRON
============================================================ */

function ChevronIcon() {
  return (
    <svg {...iconProps('h-3.5 w-3.5')}>

      <path d="m9 18 6-6-6-6" />

    </svg>
  )
}

/* ============================================================
   LOGOUT
============================================================ */

function LogoutIcon() {
  return (
    <svg {...iconProps('h-4 w-4')}>

      <path d="M10 5H6a2 2 0 0 0-2 2v10a2 2 0 0 0 2 2h4" />

      <path d="M14 8l4 4-4 4" />

      <path d="M18 12H9" />

    </svg>
  )
}

/* ============================================================
   MENU
============================================================ */

function MenuIcon() {
  return (
    <svg {...iconProps('h-5 w-5')}>

      <path d="M4 6h16" />
      <path d="M4 12h16" />
      <path d="M4 18h16" />

    </svg>
  )
}

/* ============================================================
   CLOSE
============================================================ */

function CloseIcon() {
  return (
    <svg {...iconProps('h-4 w-4')}>

      <path d="m6 6 12 12" />
      <path d="m18 6-12 12" />

    </svg>
  )
}