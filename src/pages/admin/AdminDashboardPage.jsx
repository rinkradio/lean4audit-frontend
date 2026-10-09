import { useEffect, useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'

import { fetchPlants } from '../../services/plantService'
import { fetchZones } from '../../services/zoneService'
import { fetchAudits } from '../../services/auditService'

const STATUS_LABELS = {
  DRAFT: 'Draft',
  IN_PROGRESS: 'Ongoing',
  SUBMITTED: 'Submitted',
}

const STATUS_CLASSES = {
  DRAFT: 'status-badge draft',
  IN_PROGRESS: 'status-badge ongoing',
  SUBMITTED: 'status-badge submitted',
}

function formatDate(value) {
  if (!value) return '—'

  return new Date(value).toLocaleDateString('en-GB', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  })
}

function getAuditDate(audit) {
  return (
    audit?.updated_at ||
    audit?.submitted_at ||
    audit?.audit_date ||
    audit?.created_at ||
    null
  )
}

function sortAudits(audits) {
  return [...audits].sort((a, b) => {
    const statusPriority = {
      IN_PROGRESS: 0,
      DRAFT: 1,
      SUBMITTED: 2,
    }

    const statusA = statusPriority[a.status] ?? 3
    const statusB = statusPriority[b.status] ?? 3

    if (statusA !== statusB) {
      return statusA - statusB
    }

    return (
      new Date(getAuditDate(b) || 0) -
      new Date(getAuditDate(a) || 0)
    )
  })
}

/* ================================================================
   ICON SYSTEM
================================================================ */

function Icon({ name, size = 20 }) {
  const common = {
    width: size,
    height: size,
    viewBox: '0 0 24 24',
    fill: 'none',
    stroke: 'currentColor',
    strokeWidth: 1.8,
    strokeLinecap: 'round',
    strokeLinejoin: 'round',
    'aria-hidden': true,
  }

  const paths = {
    plant: (
      <>
        <path d="M3 21h18" />
        <path d="M5 21V9l7-4v16" />
        <path d="M12 21V3l7 4v14" />
        <path d="M8 12h1" />
        <path d="M8 16h1" />
        <path d="M15 10h1" />
        <path d="M15 14h1" />
        <path d="M15 18h1" />
      </>
    ),

    zone: (
      <>
        <rect x="3" y="4" width="18" height="16" rx="2" />
        <path d="M7 8h10" />
        <path d="M7 12h6" />
        <path d="M7 16h4" />
      </>
    ),

    audit: (
      <>
        <path d="M7 3h10v18H7z" />
        <path d="M9 7h6" />
        <path d="M9 11h6" />
        <path d="M9 15h4" />
      </>
    ),

    activity: (
      <>
        <path d="M3 12h4l2-7 4 14 2-7h6" />
      </>
    ),

    check: (
      <>
        <path d="m5 12 4 4L19 6" />
      </>
    ),

    clock: (
      <>
        <circle cx="12" cy="12" r="8.5" />
        <path d="M12 7v5l3 2" />
      </>
    ),

    draft: (
      <>
        <path d="M6 3h9l3 3v15H6z" />
        <path d="M14 3v4h4" />
        <path d="M9 12h6" />
        <path d="M9 16h4" />
      </>
    ),

    arrow: (
      <>
        <path d="M5 12h14" />
        <path d="m13 6 6 6-6 6" />
      </>
    ),

    refresh: (
      <>
        <path d="M20 11a8.1 8.1 0 0 0-14.8-4L3 10" />
        <path d="M3 5v5h5" />
        <path d="M4 13a8.1 8.1 0 0 0 14.8 4L21 14" />
        <path d="M21 19v-5h-5" />
      </>
    ),

    chevron: (
      <>
        <path d="m9 18 6-6-6-6" />
      </>
    ),

    alert: (
      <>
        <path d="M12 9v4" />
        <path d="M12 17h.01" />
        <path d="m10.3 4.8-7.2 12.5A2 2 0 0 0 4.8 20h14.4a2 2 0 0 0 1.7-2.7L13.7 4.8a2 2 0 0 0-3.4 0Z" />
      </>
    ),

    shield: (
      <>
        <path d="M12 3 20 6v5.5c0 4.7-3.1 7.8-8 9.5-4.9-1.7-8-4.8-8-9.5V6l8-3Z" />
        <path d="m8.5 12 2.2 2.2 4.8-4.8" />
      </>
    ),
  }

  return <svg {...common}>{paths[name]}</svg>
}

/* ================================================================
   KPI CARD
================================================================ */

function StatCard({
  title,
  value,
  subtitle,
  icon,
  tone = 'neutral',
  onClick,
}) {
  return (
    <button
      type="button"
      className={`admin-stat-card ${tone}`}
      onClick={onClick}
    >
      <div className="stat-card-top">
        <span className="stat-card-icon">
          <Icon name={icon} size={19} />
        </span>

        <span className="stat-card-arrow">
          <Icon name="arrow" size={15} />
        </span>
      </div>

      <div className="stat-card-value">
        {value}
      </div>

      <div className="stat-card-title">
        {title}
      </div>

      <div className="stat-card-subtitle">
        {subtitle}
      </div>
    </button>
  )
}

/* ================================================================
   EMPTY STATE
================================================================ */

function EmptyState({ message }) {
  return (
    <div className="admin-empty-state">
      <div className="empty-state-icon">
        <Icon name="audit" size={19} />
      </div>

      <span>{message}</span>
    </div>
  )
}

/* ================================================================
   SECTION HEADER
================================================================ */

function SectionHeader({
  eyebrow,
  title,
  description,
  actionLabel,
  onAction,
}) {
  return (
    <div className="section-header">
      <div className="section-header-content">
        {eyebrow && (
          <span className="section-eyebrow">
            {eyebrow}
          </span>
        )}

        <h2>{title}</h2>

        {description && (
          <p>{description}</p>
        )}
      </div>

      {actionLabel && (
        <button
          type="button"
          className="section-action"
          onClick={onAction}
        >
          {actionLabel}
          <Icon name="arrow" size={14} />
        </button>
      )}
    </div>
  )
}

/* ================================================================
   MAIN DASHBOARD
================================================================ */

export default function AdminDashboardPage() {
  const navigate = useNavigate()

  const [plants, setPlants] = useState([])
  const [zones, setZones] = useState([])
  const [audits, setAudits] = useState([])

  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  const loadDashboard = async () => {
    setLoading(true)
    setError('')

    try {
      const [plantsData, zonesData, auditsData] =
        await Promise.all([
          fetchPlants(true),
          fetchZones({ includeInactive: true }),
          fetchAudits({
            page: 1,
            pageSize: 100,
            sort: 'newest',
          }),
        ])

      setPlants(
        Array.isArray(plantsData)
          ? plantsData
          : plantsData?.items || []
      )

      setZones(
        Array.isArray(zonesData)
          ? zonesData
          : zonesData?.items || []
      )

      setAudits(
        Array.isArray(auditsData)
          ? auditsData
          : auditsData?.items || []
      )
    } catch (err) {
      console.error(err)

      setError(
        'Unable to load dashboard data. Please try again.'
      )
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadDashboard()
  }, [])

  /* ==============================================================
     DERIVED DATA
  ============================================================== */

  const sortedAudits = useMemo(
    () => sortAudits(audits),
    [audits]
  )

  const ongoingAudits = useMemo(
    () =>
      audits.filter(
        (audit) => audit.status === 'IN_PROGRESS'
      ),
    [audits]
  )

  const submittedAudits = useMemo(
    () =>
      audits.filter(
        (audit) => audit.status === 'SUBMITTED'
      ),
    [audits]
  )

  const draftAudits = useMemo(
    () =>
      audits.filter(
        (audit) => audit.status === 'DRAFT'
      ),
    [audits]
  )

  const completionPercentage = useMemo(() => {
    if (!audits.length) return 0

    return Math.round(
      (submittedAudits.length / audits.length) * 100
    )
  }, [audits.length, submittedAudits.length])

  const plantPerformance = useMemo(() => {
    return plants
      .map((plant) => {
        const plantZones = zones.filter(
          (zone) =>
            String(zone.plant_id) ===
            String(plant.id)
        )

        const zoneIds = new Set(
          plantZones.map((zone) =>
            String(zone.id)
          )
        )

        const plantAudits = audits.filter((audit) => {
          const zoneId =
            audit.zone_id ||
            audit.zone?.id

          return (
            zoneId &&
            zoneIds.has(String(zoneId))
          )
        })

        const completed = plantAudits.filter(
          (audit) =>
            audit.status === 'SUBMITTED'
        ).length

        const total = plantAudits.length

        const percentage =
          total > 0
            ? Math.round((completed / total) * 100)
            : 0

        return {
          ...plant,
          zoneCount: plantZones.length,
          auditCount: total,
          completed,
          percentage,
        }
      })
      .sort((a, b) => {
        if (b.auditCount !== a.auditCount) {
          return b.auditCount - a.auditCount
        }

        return a.name.localeCompare(b.name)
      })
      .slice(0, 8)
  }, [plants, zones, audits])

  const maxPlantAudits = Math.max(
    ...plantPerformance.map(
      (plant) => plant.auditCount
    ),
    1
  )

  /* ==============================================================
     LOADING
  ============================================================== */

  if (loading) {
    return (
      <div className="admin-dashboard">
        <div className="dashboard-loading">
          <div className="loading-spinner" />

          <div>
            <strong>Loading dashboard</strong>
            <span>Preparing your audit overview</span>
          </div>
        </div>

        <style>{dashboardStyles}</style>
      </div>
    )
  }

  /* ==============================================================
     RENDER
  ============================================================== */

  return (
    <div className="admin-dashboard">
      <div className="admin-dashboard-container">

        {/* ========================================================
            PAGE HEADER
        ========================================================= */}

        <header className="dashboard-page-header">

          <div className="dashboard-title-block">

            <div className="dashboard-breadcrumb">
              <span>ADMIN</span>
              <span className="breadcrumb-separator">
                /
              </span>
              <span>OVERVIEW</span>
            </div>

            <h1>Audit Dashboard</h1>

            <p>
              A clear view of plant activity, audit progress
              and operational follow-up.
            </p>
          </div>

          <div className="dashboard-header-actions">

            <button
              type="button"
              className="dashboard-refresh-button"
              onClick={loadDashboard}
              title="Refresh dashboard"
            >
              <Icon name="refresh" size={16} />

              <span>Refresh</span>
            </button>

            <button
              type="button"
              className="dashboard-primary-button"
              onClick={() =>
                navigate('/admin/audits')
              }
            >
              <span>View audits</span>

              <Icon name="arrow" size={16} />
            </button>

          </div>
        </header>

        {/* ========================================================
            ERROR
        ========================================================= */}

        {error && (
          <div className="dashboard-error">

            <div className="dashboard-error-content">
              <span className="dashboard-error-icon">
                <Icon name="alert" size={16} />
              </span>

              <div>
                <strong>Dashboard unavailable</strong>
                <p>{error}</p>
              </div>
            </div>

            <button
              type="button"
              onClick={loadDashboard}
            >
              Retry
            </button>

          </div>
        )}

        {/* ========================================================
            KPI OVERVIEW
        ========================================================= */}

        <section className="dashboard-overview">

          <div className="overview-heading">
            <div>
              <span className="section-eyebrow">
                OPERATIONS
              </span>

              <h2>At a glance</h2>
            </div>

            <span className="overview-note">
              Live dashboard metrics
            </span>
          </div>

          <div className="dashboard-stats">

            <StatCard
              title="Plants"
              value={plants.length}
              subtitle="Configured plants"
              icon="plant"
              onClick={() =>
                navigate('/admin/plants')
              }
            />

            <StatCard
              title="Zones"
              value={zones.length}
              subtitle="Across all plants"
              icon="zone"
              onClick={() =>
                navigate('/admin/zones')
              }
            />

            <StatCard
              title="Total audits"
              value={audits.length}
              subtitle="All audit records"
              icon="audit"
              onClick={() =>
                navigate('/admin/audits')
              }
            />

            <StatCard
              title="Ongoing"
              value={ongoingAudits.length}
              subtitle="Require attention"
              icon="activity"
              tone="attention"
              onClick={() =>
                navigate(
                  '/admin/audits?status=IN_PROGRESS'
                )
              }
            />

            <StatCard
              title="Submitted"
              value={submittedAudits.length}
              subtitle="Completed submissions"
              icon="check"
              tone="success"
              onClick={() =>
                navigate(
                  '/admin/audits?status=SUBMITTED'
                )
              }
            />

            <StatCard
              title="Drafts"
              value={draftAudits.length}
              subtitle="Not yet submitted"
              icon="draft"
              tone="draft"
              onClick={() =>
                navigate(
                  '/admin/audits?status=DRAFT'
                )
              }
            />

          </div>
        </section>

        {/* ========================================================
            PRIMARY INSIGHT GRID
        ========================================================= */}

        <section className="dashboard-primary-grid">

          {/* ======================================================
              AUDIT STATUS
          ======================================================= */}

          <article className="dashboard-panel audit-status-panel">

            <SectionHeader
              eyebrow="AUDIT CONTROL"
              title="Audit status"
              description="Current distribution of all audit records."
              actionLabel="View all"
              onAction={() =>
                navigate('/admin/audits')
              }
            />

            <div className="audit-status-content">

              <div className="completion-block">

                <div
                  className="completion-ring"
                  style={{
                    '--completion': `${completionPercentage}%`,
                  }}
                >
                  <div className="completion-ring-inner">

                    <strong>
                      {completionPercentage}%
                    </strong>

                    <span>
                      completion
                    </span>

                  </div>
                </div>

                <div className="completion-caption">
                  <span className="completion-caption-dot" />
                  <span>
                    {submittedAudits.length} of{' '}
                    {audits.length || 0} submitted
                  </span>
                </div>

              </div>

              <div className="status-breakdown">

                <button
                  type="button"
                  onClick={() =>
                    navigate(
                      '/admin/audits?status=IN_PROGRESS'
                    )
                  }
                >
                  <span className="status-breakdown-left">
                    <span className="status-indicator ongoing" />

                    <span>
                      <strong>Ongoing</strong>
                      <small>
                        Currently active
                      </small>
                    </span>
                  </span>

                  <span className="status-count">
                    {ongoingAudits.length}
                  </span>

                  <Icon
                    name="chevron"
                    size={14}
                  />
                </button>

                <button
                  type="button"
                  onClick={() =>
                    navigate(
                      '/admin/audits?status=SUBMITTED'
                    )
                  }
                >
                  <span className="status-breakdown-left">
                    <span className="status-indicator submitted" />

                    <span>
                      <strong>Submitted</strong>
                      <small>
                        Completed audits
                      </small>
                    </span>
                  </span>

                  <span className="status-count">
                    {submittedAudits.length}
                  </span>

                  <Icon
                    name="chevron"
                    size={14}
                  />
                </button>

                <button
                  type="button"
                  onClick={() =>
                    navigate(
                      '/admin/audits?status=DRAFT'
                    )
                  }
                >
                  <span className="status-breakdown-left">
                    <span className="status-indicator draft" />

                    <span>
                      <strong>Draft</strong>
                      <small>
                        Awaiting submission
                      </small>
                    </span>
                  </span>

                  <span className="status-count">
                    {draftAudits.length}
                  </span>

                  <Icon
                    name="chevron"
                    size={14}
                  />
                </button>

              </div>

            </div>
          </article>

          {/* ======================================================
              QUICK ACCESS
          ======================================================= */}

          <article className="dashboard-panel quick-access-panel">

            <SectionHeader
              eyebrow="NAVIGATION"
              title="Quick access"
              description="Frequently used administration areas."
            />

            <div className="quick-access-list">

              <button
                type="button"
                onClick={() =>
                  navigate('/admin/plants')
                }
              >
                <span className="quick-access-icon">
                  <Icon name="plant" size={18} />
                </span>

                <span className="quick-access-copy">
                  <strong>Plants</strong>
                  <small>
                    Manage plant hierarchy
                  </small>
                </span>

                <span className="quick-access-arrow">
                  <Icon name="arrow" size={15} />
                </span>
              </button>

              <button
                type="button"
                onClick={() =>
                  navigate('/admin/zones')
                }
              >
                <span className="quick-access-icon">
                  <Icon name="zone" size={18} />
                </span>

                <span className="quick-access-copy">
                  <strong>Zones</strong>
                  <small>
                    Manage plant zones
                  </small>
                </span>

                <span className="quick-access-arrow">
                  <Icon name="arrow" size={15} />
                </span>
              </button>

              <button
                type="button"
                onClick={() =>
                  navigate('/admin/audits')
                }
              >
                <span className="quick-access-icon">
                  <Icon name="audit" size={18} />
                </span>

                <span className="quick-access-copy">
                  <strong>Audits</strong>
                  <small>
                    Review audit activity
                  </small>
                </span>

                <span className="quick-access-arrow">
                  <Icon name="arrow" size={15} />
                </span>
              </button>

            </div>
          </article>

        </section>

        {/* ========================================================
            PLANT PERFORMANCE
        ========================================================= */}

        <section className="dashboard-panel plant-performance-panel">

          <SectionHeader
            eyebrow="PLANT ACTIVITY"
            title="Plant performance"
            description="Audit activity and completion across your plants."
            actionLabel="All plants"
            onAction={() =>
              navigate('/admin/plants')
            }
          />

          {plantPerformance.length === 0 ? (
            <EmptyState message="No plant data available." />
          ) : (
            <div className="plant-table">

              <div className="plant-table-header">
                <span>Plant</span>
                <span>Audit activity</span>
                <span>Completion</span>
                <span />
              </div>

              <div className="plant-performance-list">

                {plantPerformance.map((plant) => (
                  <button
                    type="button"
                    key={plant.id}
                    className="plant-performance-row"
                    onClick={() =>
                      navigate(
                        `/admin/zones?plant_id=${plant.id}`
                      )
                    }
                  >

                    <div className="plant-info">

                      <div className="plant-avatar">
                        <Icon
                          name="plant"
                          size={17}
                        />
                      </div>

                      <div className="plant-copy">
                        <strong>
                          {plant.name}
                        </strong>

                        <span>
                          {plant.zoneCount} zone
                          {plant.zoneCount !== 1
                            ? 's'
                            : ''}{' '}
                          · {plant.auditCount} audit
                          {plant.auditCount !== 1
                            ? 's'
                            : ''}
                        </span>
                      </div>

                    </div>

                    <div className="plant-activity">

                      <div className="plant-activity-track">
                        <span
                          style={{
                            width: `${
                              (plant.auditCount /
                                maxPlantAudits) *
                              100
                            }%`,
                          }}
                        />
                      </div>

                      <span>
                        {plant.auditCount}
                      </span>

                    </div>

                    <div className="plant-completion">

                      <span
                        className={
                          plant.percentage >= 75
                            ? 'completion-high'
                            : plant.percentage >= 40
                              ? 'completion-medium'
                              : 'completion-low'
                        }
                      >
                        {plant.percentage}%
                      </span>

                    </div>

                    <span className="row-chevron">
                      <Icon
                        name="chevron"
                        size={15}
                      />
                    </span>

                  </button>
                ))}

              </div>
            </div>
          )}

        </section>

        {/* ========================================================
            RECENT AUDITS
        ========================================================= */}

        <section className="dashboard-panel recent-audits-panel">

          <SectionHeader
            eyebrow="RECENT ACTIVITY"
            title="Recent audits"
            description="Ongoing and recently updated audit records."
            actionLabel="View all"
            onAction={() =>
              navigate('/admin/audits')
            }
          />

          {sortedAudits.length === 0 ? (
            <EmptyState message="No audits available." />
          ) : (
            <div className="recent-audit-list">

              {sortedAudits
                .slice(0, 8)
                .map((audit) => {

                  const zoneName =
                    audit.zone?.name ||
                    audit.zone_name ||
                    'Unknown zone'

                  const plantName =
                    audit.zone?.plant?.name ||
                    audit.plant?.name ||
                    'Unknown plant'

                  return (
                    <button
                      type="button"
                      key={audit.id}
                      className="recent-audit-row"
                      onClick={() =>
                        navigate(
                          `/admin/audits/${audit.id}`
                        )
                      }
                    >

                      <div className="recent-audit-main">

                        <div className="recent-audit-icon">
                          <Icon
                            name="audit"
                            size={17}
                          />
                        </div>

                        <div className="recent-audit-copy">

                          <div className="recent-audit-title">

                            <strong>
                              {audit.audit_number ||
                                `Audit ${String(
                                  audit.id
                                ).slice(0, 8)}`}
                            </strong>

                            <span
                              className={
                                STATUS_CLASSES[
                                  audit.status
                                ] ||
                                'status-badge'
                              }
                            >
                              {STATUS_LABELS[
                                audit.status
                              ] ||
                                audit.status ||
                                'Unknown'}
                            </span>

                          </div>

                          <div className="recent-audit-meta">

                            <span>
                              {plantName}
                            </span>

                            <span className="meta-dot">
                              •
                            </span>

                            <span>
                              {zoneName}
                            </span>

                          </div>

                        </div>

                      </div>

                      <div className="recent-audit-date">
                        {formatDate(
                          getAuditDate(audit)
                        )}
                      </div>

                      <span className="recent-audit-chevron">
                        <Icon
                          name="chevron"
                          size={15}
                        />
                      </span>

                    </button>
                  )
                })}

            </div>
          )}

        </section>

        {/* ========================================================
            FOOTER CONTEXT
        ========================================================= */}

        <footer className="dashboard-footer">

          <div className="dashboard-footer-brand">
            <span className="footer-brand-mark">
              <Icon name="shield" size={14} />
            </span>

            <span>
              Lean4Audit
            </span>
          </div>

          <span>
            Plant audit & continuous improvement platform
          </span>

        </footer>

      </div>

      <style>{dashboardStyles}</style>
    </div>
  )
}

/* ================================================================
   DASHBOARD STYLES
================================================================ */

const dashboardStyles = `
  .admin-dashboard {
    --dashboard-bg: #f4f6f8;
    --dashboard-surface: #ffffff;
    --dashboard-surface-soft: #f8fafb;
    --dashboard-border: #e1e6eb;
    --dashboard-border-soft: #edf0f3;

    --dashboard-text: #17222d;
    --dashboard-text-secondary: #53616d;
    --dashboard-text-muted: #7f8b95;
    --dashboard-text-faint: #a0aab3;

    --dashboard-navy: #18364f;
    --dashboard-blue: #23689b;
    --dashboard-blue-soft: #edf5fa;

    width: 100%;
    min-height: 100%;
    background: var(--dashboard-bg);
    color: var(--dashboard-text);
  }

  .admin-dashboard-container {
    width: 100%;
    max-width: 1540px;
    margin: 0 auto;
    padding: 30px 32px 24px;
  }

  /* ============================================================
     PAGE HEADER
  ============================================================ */

  .dashboard-page-header {
    display: flex;
    align-items: flex-end;
    justify-content: space-between;
    gap: 30px;
    margin-bottom: 27px;
  }

  .dashboard-title-block {
    min-width: 0;
  }

  .dashboard-breadcrumb {
    display: flex;
    align-items: center;
    gap: 8px;
    margin-bottom: 8px;
    color: #87929c;
    font-size: 9px;
    line-height: 1;
    font-weight: 800;
    letter-spacing: .16em;
  }

  .breadcrumb-separator {
    color: #c2c9cf;
  }

  .dashboard-title-block h1 {
    margin: 0;
    color: var(--dashboard-text);
    font-size: clamp(27px, 2.6vw, 36px);
    line-height: 1.1;
    font-weight: 700;
    letter-spacing: -.035em;
  }

  .dashboard-title-block p {
    max-width: 600px;
    margin: 9px 0 0;
    color: var(--dashboard-text-muted);
    font-size: 13px;
    line-height: 1.55;
  }

  .dashboard-header-actions {
    display: flex;
    align-items: center;
    gap: 9px;
    flex-shrink: 0;
  }

  .dashboard-refresh-button,
  .dashboard-primary-button {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    gap: 8px;
    min-height: 42px;
    border-radius: 8px;
    padding: 0 14px;
    font-size: 12px;
    font-weight: 700;
    cursor: pointer;
    transition:
      background .18s ease,
      border-color .18s ease,
      color .18s ease,
      transform .18s ease,
      box-shadow .18s ease;
  }

  .dashboard-refresh-button {
    border: 1px solid var(--dashboard-border);
    background: #fff;
    color: var(--dashboard-text-secondary);
  }

  .dashboard-refresh-button:hover {
    border-color: #c8d0d7;
    background: #f9fafb;
    color: var(--dashboard-text);
  }

  .dashboard-refresh-button:active,
  .dashboard-primary-button:active {
    transform: translateY(1px);
  }

  .dashboard-primary-button {
    border: 1px solid var(--dashboard-navy);
    background: var(--dashboard-navy);
    color: #fff;
    box-shadow: 0 4px 12px rgba(24, 54, 79, .12);
  }

  .dashboard-primary-button:hover {
    background: #214964;
    box-shadow: 0 6px 16px rgba(24, 54, 79, .17);
  }

  /* ============================================================
     ERROR
  ============================================================ */

  .dashboard-error {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 18px;
    margin-bottom: 20px;
    padding: 13px 15px;
    border: 1px solid #e7c9c6;
    border-radius: 9px;
    background: #fff9f8;
  }

  .dashboard-error-content {
    display: flex;
    align-items: center;
    min-width: 0;
    gap: 11px;
  }

  .dashboard-error-icon {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 32px;
    height: 32px;
    flex: 0 0 32px;
    border-radius: 7px;
    background: #f9e5e2;
    color: #ae443b;
  }

  .dashboard-error-content strong {
    display: block;
    color: #8f342d;
    font-size: 12px;
    font-weight: 800;
  }

  .dashboard-error-content p {
    margin: 2px 0 0;
    color: #aa615a;
    font-size: 11px;
  }

  .dashboard-error > button {
    border: 0;
    background: transparent;
    color: #963b34;
    font-size: 11px;
    font-weight: 800;
    cursor: pointer;
  }

  /* ============================================================
     OVERVIEW
  ============================================================ */

  .dashboard-overview {
    margin-bottom: 20px;
  }

  .overview-heading {
    display: flex;
    align-items: flex-end;
    justify-content: space-between;
    margin-bottom: 11px;
  }

  .section-eyebrow {
    display: block;
    margin-bottom: 4px;
    color: #87929c;
    font-size: 9px;
    line-height: 1;
    font-weight: 800;
    letter-spacing: .15em;
  }

  .overview-heading h2 {
    margin: 0;
    color: #27343f;
    font-size: 14px;
    font-weight: 750;
    letter-spacing: -.01em;
  }

  .overview-note {
    color: #a0aab2;
    font-size: 10px;
  }

  .dashboard-stats {
    display: grid;
    grid-template-columns: repeat(6, minmax(0, 1fr));
    gap: 11px;
  }

  .admin-stat-card {
    position: relative;
    min-width: 0;
    min-height: 153px;
    padding: 16px;
    border: 1px solid var(--dashboard-border);
    border-radius: 11px;
    background: var(--dashboard-surface);
    color: inherit;
    text-align: left;
    cursor: pointer;
    box-shadow: 0 1px 2px rgba(20, 32, 42, .02);
    transition:
      border-color .18s ease,
      box-shadow .18s ease,
      transform .18s ease;
  }

  .admin-stat-card:hover {
    transform: translateY(-2px);
    border-color: #cbd3da;
    box-shadow: 0 9px 24px rgba(24, 40, 52, .065);
  }

  .admin-stat-card:focus-visible,
  .dashboard-refresh-button:focus-visible,
  .dashboard-primary-button:focus-visible,
  .section-action:focus-visible,
  .quick-access-list button:focus-visible,
  .status-breakdown button:focus-visible,
  .plant-performance-row:focus-visible,
  .recent-audit-row:focus-visible {
    outline: 3px solid rgba(35, 104, 155, .18);
    outline-offset: 2px;
  }

  .admin-stat-card.attention {
    border-color: #ead9bd;
    background:
      linear-gradient(
        135deg,
        #fffdf9 0%,
        #fff 62%
      );
  }

  .admin-stat-card.success {
    border-color: #d6e4dc;
  }

  .admin-stat-card.draft {
    border-color: #dde3e8;
  }

  .stat-card-top {
    display: flex;
    align-items: center;
    justify-content: space-between;
  }

  .stat-card-icon {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 38px;
    height: 38px;
    border-radius: 8px;
    background: #f1f4f6;
    color: #536574;
  }

  .attention .stat-card-icon {
    background: #fff2dd;
    color: #a76b20;
  }

  .success .stat-card-icon {
    background: #edf7f1;
    color: #397b59;
  }

  .draft .stat-card-icon {
    background: #f1f3f5;
    color: #687680;
  }

  .stat-card-arrow {
    display: flex;
    color: #b6bec5;
    transition:
      color .18s ease,
      transform .18s ease;
  }

  .admin-stat-card:hover .stat-card-arrow {
    color: #657580;
    transform: translateX(2px);
  }

  .stat-card-value {
    margin-top: 18px;
    color: #182630;
    font-size: 28px;
    line-height: 1;
    font-weight: 750;
    letter-spacing: -.045em;
  }

  .stat-card-title {
    margin-top: 8px;
    color: #384752;
    font-size: 12px;
    line-height: 1.25;
    font-weight: 750;
  }

  .stat-card-subtitle {
    margin-top: 4px;
    color: #98a2aa;
    font-size: 10px;
    line-height: 1.4;
  }

  /* ============================================================
     PRIMARY GRID
  ============================================================ */

  .dashboard-primary-grid {
    display: grid;
    grid-template-columns: minmax(0, 1.35fr) minmax(330px, .65fr);
    gap: 17px;
    margin-bottom: 17px;
  }

  .dashboard-panel {
    min-width: 0;
    overflow: hidden;
    border: 1px solid var(--dashboard-border);
    border-radius: 11px;
    background: var(--dashboard-surface);
    box-shadow: 0 1px 2px rgba(20, 32, 42, .018);
  }

  .section-header {
    display: flex;
    align-items: flex-start;
    justify-content: space-between;
    gap: 20px;
    padding: 17px 19px;
    border-bottom: 1px solid var(--dashboard-border-soft);
  }

  .section-header-content {
    min-width: 0;
  }

  .section-header h2 {
    margin: 0;
    color: #263640;
    font-size: 14px;
    line-height: 1.3;
    font-weight: 750;
    letter-spacing: -.01em;
  }

  .section-header p {
    margin: 4px 0 0;
    color: #929da6;
    font-size: 11px;
    line-height: 1.45;
  }

  .section-action {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    gap: 5px;
    flex-shrink: 0;
    padding: 3px 0;
    border: 0;
    background: transparent;
    color: #557080;
    font-size: 11px;
    font-weight: 750;
    cursor: pointer;
    transition: color .18s ease;
  }

  .section-action:hover {
    color: #1f5f8a;
  }

  /* ============================================================
     AUDIT STATUS
  ============================================================ */

  .audit-status-content {
    display: grid;
    grid-template-columns: 210px minmax(0, 1fr);
    align-items: center;
    gap: 22px;
    min-height: 226px;
    padding: 22px 24px;
  }

  .completion-block {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
  }

  .completion-ring {
    position: relative;
    display: flex;
    align-items: center;
    justify-content: center;
    width: 144px;
    height: 144px;
    border-radius: 50%;
    background:
      conic-gradient(
        #397b59 0 var(--completion),
        #edf0f2 var(--completion) 100%
      );
  }

  .completion-ring::before {
    content: '';
    position: absolute;
    inset: 10px;
    border-radius: 50%;
    background: #fff;
  }

  .completion-ring-inner {
    position: relative;
    z-index: 1;
    display: flex;
    flex-direction: column;
    align-items: center;
  }

  .completion-ring-inner strong {
    color: #1c2a34;
    font-size: 27px;
    line-height: 1;
    font-weight: 750;
    letter-spacing: -.04em;
  }

  .completion-ring-inner span {
    margin-top: 5px;
    color: #8b969e;
    font-size: 9px;
    font-weight: 650;
    text-transform: uppercase;
    letter-spacing: .07em;
  }

  .completion-caption {
    display: flex;
    align-items: center;
    gap: 6px;
    margin-top: 12px;
    color: #89949d;
    font-size: 10px;
  }

  .completion-caption-dot {
    width: 6px;
    height: 6px;
    border-radius: 50%;
    background: #397b59;
  }

  .status-breakdown {
    display: flex;
    flex-direction: column;
    gap: 3px;
  }

  .status-breakdown button {
    display: grid;
    grid-template-columns: minmax(0, 1fr) auto 14px;
    align-items: center;
    gap: 10px;
    width: 100%;
    min-height: 57px;
    padding: 9px 10px;
    border: 1px solid transparent;
    border-radius: 8px;
    background: transparent;
    text-align: left;
    cursor: pointer;
    transition:
      background .18s ease,
      border-color .18s ease;
  }

  .status-breakdown button:hover {
    border-color: #e5e9ed;
    background: #fafbfc;
  }

  .status-breakdown-left {
    display: flex;
    align-items: center;
    min-width: 0;
    gap: 10px;
  }

  .status-indicator {
    width: 8px;
    height: 8px;
    flex: 0 0 8px;
    border-radius: 50%;
  }

  .status-indicator.ongoing {
    background: #c98935;
  }

  .status-indicator.submitted {
    background: #438262;
  }

  .status-indicator.draft {
    background: #9aa5ad;
  }

  .status-breakdown-left strong,
  .status-breakdown-left small {
    display: block;
  }

  .status-breakdown-left strong {
    color: #394853;
    font-size: 11px;
    font-weight: 750;
  }

  .status-breakdown-left small {
    margin-top: 3px;
    color: #a0a9b0;
    font-size: 9px;
  }

  .status-count {
    color: #283943;
    font-size: 14px;
    font-weight: 750;
  }

  .status-breakdown button > svg {
    color: #bdc5cb;
  }

  /* ============================================================
     QUICK ACCESS
  ============================================================ */

  .quick-access-list {
    padding: 8px;
  }

  .quick-access-list button {
    display: grid;
    grid-template-columns: 40px minmax(0, 1fr) 17px;
    align-items: center;
    gap: 11px;
    width: 100%;
    min-height: 67px;
    padding: 10px;
    border: 1px solid transparent;
    border-radius: 8px;
    background: transparent;
    color: var(--dashboard-text);
    text-align: left;
    cursor: pointer;
    transition:
      background .18s ease,
      border-color .18s ease;
  }

  .quick-access-list button:hover {
    border-color: #e5e9ed;
    background: #fafbfc;
  }

  .quick-access-icon {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 40px;
    height: 40px;
    border-radius: 8px;
    background: #f1f4f6;
    color: #526775;
  }

  .quick-access-copy {
    min-width: 0;
  }

  .quick-access-copy strong,
  .quick-access-copy small {
    display: block;
  }

  .quick-access-copy strong {
    color: #33444f;
    font-size: 12px;
    font-weight: 750;
  }

  .quick-access-copy small {
    margin-top: 3px;
    overflow: hidden;
    color: #9aa4ac;
    font-size: 10px;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  .quick-access-arrow {
    display: flex;
    color: #b9c1c7;
  }

  /* ============================================================
     PLANT PERFORMANCE
  ============================================================ */

  .plant-performance-panel {
    margin-bottom: 17px;
  }

  .plant-table {
    width: 100%;
  }

  .plant-table-header {
    display: grid;
    grid-template-columns: minmax(190px, 1.15fr) minmax(160px, 1fr) 110px 18px;
    align-items: center;
    gap: 18px;
    padding: 10px 21px;
    border-bottom: 1px solid var(--dashboard-border-soft);
    background: #fafbfc;
    color: #9aa4ac;
    font-size: 9px;
    font-weight: 800;
    text-transform: uppercase;
    letter-spacing: .09em;
  }

  .plant-performance-list {
    padding: 3px 20px 10px;
  }

  .plant-performance-row {
    display: grid;
    grid-template-columns: minmax(190px, 1.15fr) minmax(160px, 1fr) 110px 18px;
    align-items: center;
    gap: 18px;
    width: 100%;
    min-height: 65px;
    padding: 7px 0;
    border: 0;
    border-bottom: 1px solid #f0f2f4;
    background: transparent;
    color: inherit;
    text-align: left;
    cursor: pointer;
  }

  .plant-performance-row:last-child {
    border-bottom: 0;
  }

  .plant-info {
    display: flex;
    align-items: center;
    min-width: 0;
    gap: 10px;
  }

  .plant-avatar {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 34px;
    height: 34px;
    flex: 0 0 34px;
    border: 1px solid #e1e6ea;
    border-radius: 7px;
    background: #f7f9fa;
    color: #617481;
  }

  .plant-copy {
    min-width: 0;
  }

  .plant-copy strong,
  .plant-copy span {
    display: block;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  .plant-copy strong {
    color: #344550;
    font-size: 11px;
    font-weight: 750;
  }

  .plant-copy span {
    margin-top: 3px;
    color: #9aa4ac;
    font-size: 9px;
  }

  .plant-activity {
    display: flex;
    align-items: center;
    min-width: 0;
    gap: 9px;
  }

  .plant-activity-track {
    width: 100%;
    height: 5px;
    overflow: hidden;
    border-radius: 999px;
    background: #edf0f2;
  }

  .plant-activity-track span {
    display: block;
    height: 100%;
    min-width: 3px;
    border-radius: inherit;
    background: #668497;
    transition: width .4s ease;
  }

  .plant-activity > span {
    width: 24px;
    flex: 0 0 24px;
    color: #6f7e88;
    font-size: 9px;
    font-weight: 750;
    text-align: right;
  }

  .plant-completion {
    text-align: right;
  }

  .plant-completion span {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    min-width: 48px;
    padding: 5px 7px;
    border-radius: 5px;
    font-size: 9px;
    font-weight: 800;
  }

  .completion-high {
    background: #edf7f1;
    color: #397b59;
  }

  .completion-medium {
    background: #fff6e7;
    color: #a36d25;
  }

  .completion-low {
    background: #f3f5f6;
    color: #6e7c85;
  }

  .row-chevron {
    display: flex;
    justify-content: flex-end;
    color: #c1c8cd;
    transition:
      color .18s ease,
      transform .18s ease;
  }

  .plant-performance-row:hover .row-chevron {
    color: #728590;
    transform: translateX(2px);
  }

  .plant-performance-row:hover .plant-copy strong {
    color: #235f88;
  }

  /* ============================================================
     RECENT AUDITS
  ============================================================ */

  .recent-audits-panel {
    margin-bottom: 17px;
  }

  .recent-audit-list {
    padding: 3px 20px 9px;
  }

  .recent-audit-row {
    display: grid;
    grid-template-columns: minmax(0, 1fr) 100px 17px;
    align-items: center;
    gap: 18px;
    width: 100%;
    min-height: 67px;
    padding: 7px 0;
    border: 0;
    border-bottom: 1px solid #f0f2f4;
    background: transparent;
    color: inherit;
    text-align: left;
    cursor: pointer;
  }

  .recent-audit-row:last-child {
    border-bottom: 0;
  }

  .recent-audit-main {
    display: flex;
    align-items: center;
    min-width: 0;
    gap: 10px;
  }

  .recent-audit-icon {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 34px;
    height: 34px;
    flex: 0 0 34px;
    border: 1px solid #e1e6ea;
    border-radius: 7px;
    background: #f7f9fa;
    color: #617481;
  }

  .recent-audit-copy {
    min-width: 0;
  }

  .recent-audit-title {
    display: flex;
    align-items: center;
    flex-wrap: wrap;
    gap: 8px;
  }

  .recent-audit-title strong {
    overflow: hidden;
    color: #344550;
    font-size: 11px;
    font-weight: 750;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  .status-badge {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    width: fit-content;
    padding: 3px 7px;
    border-radius: 999px;
    font-size: 8px;
    line-height: 1.2;
    font-weight: 800;
    letter-spacing: .01em;
  }

  .status-badge.ongoing {
    background: #fff4e5;
    color: #a56c22;
  }

  .status-badge.submitted {
    background: #edf7f1;
    color: #397b59;
  }

  .status-badge.draft {
    background: #f1f3f5;
    color: #6f7c85;
  }

  .recent-audit-meta {
    display: flex;
    align-items: center;
    gap: 6px;
    max-width: 100%;
    margin-top: 4px;
    overflow: hidden;
    color: #99a3aa;
    font-size: 9px;
  }

  .recent-audit-meta span {
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  .meta-dot {
    color: #c2c9ce;
  }

  .recent-audit-date {
    color: #7f8b94;
    font-size: 9px;
    font-weight: 600;
    text-align: right;
    white-space: nowrap;
  }

  .recent-audit-chevron {
    display: flex;
    justify-content: flex-end;
    color: #c2c9ce;
    transition:
      color .18s ease,
      transform .18s ease;
  }

  .recent-audit-row:hover .recent-audit-chevron {
    color: #71828e;
    transform: translateX(2px);
  }

  .recent-audit-row:hover .recent-audit-title strong {
    color: #235f88;
  }

  /* ============================================================
     EMPTY STATE
  ============================================================ */

  .admin-empty-state {
    display: flex;
    min-height: 160px;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    gap: 9px;
    color: #9aa4ac;
    font-size: 11px;
    text-align: center;
  }

  .empty-state-icon {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 36px;
    height: 36px;
    border: 1px solid #e2e7eb;
    border-radius: 8px;
    background: #f8fafb;
    color: #8b98a1;
  }

  /* ============================================================
     LOADING
  ============================================================ */

  .dashboard-loading {
    display: flex;
    min-height: 65vh;
    align-items: center;
    justify-content: center;
    gap: 12px;
    color: #7e8a94;
  }

  .dashboard-loading > div:last-child {
    display: flex;
    flex-direction: column;
    gap: 3px;
  }

  .dashboard-loading strong {
    color: #40515d;
    font-size: 12px;
    font-weight: 750;
  }

  .dashboard-loading span {
    color: #9aa4ac;
    font-size: 10px;
  }

  .loading-spinner {
    width: 21px;
    height: 21px;
    border: 2px solid #dfe5e9;
    border-top-color: #3d718f;
    border-radius: 50%;
    animation: dashboard-spin .7s linear infinite;
  }

  /* ============================================================
     FOOTER
  ============================================================ */

  .dashboard-footer {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 20px;
    padding: 5px 2px 0;
    color: #a1aab1;
    font-size: 9px;
  }

  .dashboard-footer-brand {
    display: flex;
    align-items: center;
    gap: 6px;
    color: #76838c;
    font-weight: 750;
  }

  .footer-brand-mark {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 22px;
    height: 22px;
    border-radius: 5px;
    background: #e9eef1;
    color: #5e7380;
  }

  @keyframes dashboard-spin {
    to {
      transform: rotate(360deg);
    }
  }

  /* ============================================================
     1250
  ============================================================ */

  @media (max-width: 1250px) {
    .dashboard-stats {
      grid-template-columns: repeat(3, minmax(0, 1fr));
    }

    .dashboard-primary-grid {
      grid-template-columns: minmax(0, 1fr) minmax(300px, .72fr);
    }
  }

  /* ============================================================
     1050
  ============================================================ */

  @media (max-width: 1050px) {
    .dashboard-primary-grid {
      grid-template-columns: 1fr;
    }

    .audit-status-content {
      grid-template-columns: 210px minmax(0, 1fr);
    }
  }

  /* ============================================================
     800
  ============================================================ */

  @media (max-width: 800px) {
    .admin-dashboard-container {
      padding: 23px 20px 20px;
    }

    .dashboard-page-header {
      align-items: flex-start;
      flex-direction: column;
      gap: 18px;
    }

    .dashboard-header-actions {
      width: 100%;
    }

    .dashboard-refresh-button,
    .dashboard-primary-button {
      flex: 1;
    }

    .audit-status-content {
      grid-template-columns: 180px minmax(0, 1fr);
      gap: 15px;
      padding: 20px;
    }

    .completion-ring {
      width: 132px;
      height: 132px;
    }

    .plant-table-header,
    .plant-performance-row {
      grid-template-columns: minmax(175px, 1.2fr) minmax(130px, 1fr) 90px 16px;
    }
  }

  /* ============================================================
     650
  ============================================================ */

  @media (max-width: 650px) {
    .admin-dashboard-container {
      padding: 17px 14px 18px;
    }

    .dashboard-page-header {
      margin-bottom: 21px;
    }

    .dashboard-breadcrumb {
      margin-bottom: 7px;
    }

    .dashboard-title-block h1 {
      font-size: 26px;
    }

    .dashboard-title-block p {
      margin-top: 7px;
      font-size: 12px;
    }

    .dashboard-header-actions {
      display: grid;
      grid-template-columns: 1fr 1fr;
    }

    .dashboard-refresh-button,
    .dashboard-primary-button {
      min-height: 44px;
    }

    .overview-heading {
      align-items: flex-start;
    }

    .overview-note {
      display: none;
    }

    .dashboard-stats {
      grid-template-columns: repeat(2, minmax(0, 1fr));
      gap: 9px;
    }

    .admin-stat-card {
      min-height: 143px;
      padding: 13px;
      border-radius: 9px;
    }

    .stat-card-icon {
      width: 35px;
      height: 35px;
    }

    .stat-card-value {
      margin-top: 15px;
      font-size: 24px;
    }

    .stat-card-title {
      margin-top: 7px;
      font-size: 11px;
    }

    .stat-card-subtitle {
      font-size: 9px;
    }

    .dashboard-panel {
      border-radius: 10px;
    }

    .section-header {
      padding: 15px;
    }

    .section-header h2 {
      font-size: 13px;
    }

    .section-header p {
      font-size: 10px;
    }

    .audit-status-content {
      grid-template-columns: 1fr;
      gap: 18px;
      padding: 19px 14px;
    }

    .completion-ring {
      width: 125px;
      height: 125px;
    }

    .status-breakdown {
      gap: 2px;
    }

    .status-breakdown button {
      min-height: 52px;
    }

    .quick-access-list {
      padding: 7px;
    }

    .quick-access-list button {
      min-height: 62px;
    }

    /*
      Mobile plant rows intentionally remain wider than the viewport.
      This preserves the information hierarchy while allowing
      horizontal scrolling instead of crushing the table.
    */

    .plant-table {
      overflow-x: auto;
    }

    .plant-table-header,
    .plant-performance-list {
      min-width: 620px;
    }

    .plant-table-header {
      padding-left: 15px;
      padding-right: 15px;
    }

    .plant-performance-list {
      padding-left: 15px;
      padding-right: 15px;
    }

    .recent-audit-list {
      padding-left: 15px;
      padding-right: 15px;
    }

    .recent-audit-row {
      grid-template-columns: minmax(0, 1fr) 16px;
      gap: 10px;
      min-height: 68px;
    }

    .recent-audit-date {
      display: none;
    }

    .dashboard-footer {
      align-items: flex-start;
      flex-direction: column;
      gap: 5px;
      padding-top: 3px;
    }
  }

  /* ============================================================
     390
  ============================================================ */

  @media (max-width: 390px) {
    .admin-dashboard-container {
      padding: 13px 10px 15px;
    }

    .dashboard-title-block h1 {
      font-size: 24px;
    }

    .dashboard-header-actions {
      grid-template-columns: 1fr;
    }

    .dashboard-stats {
      gap: 7px;
    }

    .admin-stat-card {
      min-height: 137px;
      padding: 11px;
    }

    .stat-card-value {
      font-size: 22px;
    }

    .stat-card-subtitle {
      display: none;
    }

    .status-breakdown-left small {
      display: none;
    }

    .dashboard-footer > span:last-child {
      line-height: 1.4;
    }
  }

  /* ============================================================
     LARGE DESKTOP
  ============================================================ */

  @media (min-width: 1600px) {
    .admin-dashboard-container {
      padding: 34px 38px 27px;
    }

    .dashboard-stats {
      gap: 13px;
    }

    .admin-stat-card {
      min-height: 160px;
      padding: 18px;
    }

    .dashboard-primary-grid {
      gap: 19px;
    }

    .dashboard-panel {
      border-radius: 12px;
    }
  }

  /* ============================================================
     REDUCED MOTION
  ============================================================ */

  @media (prefers-reduced-motion: reduce) {
    .admin-dashboard *,
    .admin-dashboard *::before,
    .admin-dashboard *::after {
      animation-duration: .01ms !important;
      animation-iteration-count: 1 !important;
      transition-duration: .01ms !important;
      scroll-behavior: auto !important;
    }
  }
`