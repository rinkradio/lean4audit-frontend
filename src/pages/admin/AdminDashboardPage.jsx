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
  DRAFT: 'dashboard-status draft',
  IN_PROGRESS: 'dashboard-status ongoing',
  SUBMITTED: 'dashboard-status submitted',
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

function Icon({ name }) {
  const common = {
    width: 22,
    height: 22,
    viewBox: '0 0 24 24',
    fill: 'none',
    stroke: 'currentColor',
    strokeWidth: 1.8,
    strokeLinecap: 'round',
    strokeLinejoin: 'round',
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
  }

  return <svg {...common}>{paths[name]}</svg>
}

function StatCard({
  title,
  value,
  subtitle,
  icon,
  className = '',
  onClick,
}) {
  return (
    <button
      type="button"
      className={`dashboard-stat-card ${className}`}
      onClick={onClick}
    >
      <div className="dashboard-stat-top">
        <span className="dashboard-stat-icon">
          <Icon name={icon} />
        </span>

        <span className="dashboard-stat-arrow">
          <Icon name="arrow" />
        </span>
      </div>

      <div className="dashboard-stat-value">
        {value}
      </div>

      <div className="dashboard-stat-title">
        {title}
      </div>

      <div className="dashboard-stat-subtitle">
        {subtitle}
      </div>
    </button>
  )
}

function EmptyState({ message }) {
  return (
    <div className="dashboard-empty">
      {message}
    </div>
  )
}

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

  const plantPerformance = useMemo(() => {
    return plants
      .map((plant) => {
        const plantZones = zones.filter(
          (zone) =>
            String(zone.plant_id) ===
            String(plant.id)
        )

        const zoneIds = new Set(
          plantZones.map((zone) => String(zone.id))
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

  if (loading) {
    return (
      <div className="dashboard-page">
        <div className="dashboard-loading">
          <div className="dashboard-spinner" />
          <span>Loading dashboard...</span>
        </div>
      </div>
    )
  }

  return (
    <div className="dashboard-page">
      <div className="dashboard-container">

        {/* HEADER */}
        <header className="dashboard-header">
          <div>
            <div className="dashboard-eyebrow">
              LEAN4AUDIT
            </div>

            <h1 className="dashboard-heading">
              Audit Dashboard
            </h1>

            <p className="dashboard-description">
              Monitor plants, zones and audit activity
              from one place.
            </p>
          </div>

          <div className="dashboard-header-actions">
            <button
              type="button"
              className="dashboard-refresh"
              onClick={loadDashboard}
              title="Refresh dashboard"
            >
              <Icon name="refresh" />
              <span>Refresh</span>
            </button>

            <button
              type="button"
              className="dashboard-primary-action"
              onClick={() =>
                navigate('/admin/audits')
              }
            >
              View Audits
              <Icon name="arrow" />
            </button>
          </div>
        </header>

        {error && (
          <div className="dashboard-error">
            {error}

            <button
              type="button"
              onClick={loadDashboard}
            >
              Retry
            </button>
          </div>
        )}

        {/* KPI */}
        <section className="dashboard-stats">

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
            title="Total Audits"
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
            subtitle="Audits requiring attention"
            icon="activity"
            className="dashboard-stat-highlight"
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
            icon="audit"
            onClick={() =>
              navigate(
                '/admin/audits?status=SUBMITTED'
              )
            }
          />

          <StatCard
            title="Drafts"
            value={draftAudits.length}
            subtitle="Audits not submitted"
            icon="audit"
            onClick={() =>
              navigate(
                '/admin/audits?status=DRAFT'
              )
            }
          />

        </section>

        {/* MAIN GRID */}
        <section className="dashboard-main-grid">

          {/* AUDIT STATUS */}
          <article className="dashboard-panel status-panel">
            <div className="dashboard-panel-header">
              <div>
                <h2>Audit Status</h2>
                <p>Current audit distribution</p>
              </div>

              <button
                type="button"
                className="dashboard-link"
                onClick={() =>
                  navigate('/admin/audits')
                }
              >
                View all
                <Icon name="arrow" />
              </button>
            </div>

            <div className="status-content">

              <div className="status-ring-wrapper">
                <div
                  className="status-ring"
                  style={{
                    '--submitted':
                      audits.length
                        ? `${(submittedAudits.length / audits.length) * 100}%`
                        : '0%',
                  }}
                >
                  <div className="status-ring-inner">
                    <strong>
                      {audits.length}
                    </strong>
                    <span>Total</span>
                  </div>
                </div>
              </div>

              <div className="status-legend">

                <button
                  type="button"
                  onClick={() =>
                    navigate(
                      '/admin/audits?status=IN_PROGRESS'
                    )
                  }
                >
                  <span className="legend-dot ongoing" />
                  <span>Ongoing</span>
                  <strong>
                    {ongoingAudits.length}
                  </strong>
                </button>

                <button
                  type="button"
                  onClick={() =>
                    navigate(
                      '/admin/audits?status=SUBMITTED'
                    )
                  }
                >
                  <span className="legend-dot submitted" />
                  <span>Submitted</span>
                  <strong>
                    {submittedAudits.length}
                  </strong>
                </button>

                <button
                  type="button"
                  onClick={() =>
                    navigate(
                      '/admin/audits?status=DRAFT'
                    )
                  }
                >
                  <span className="legend-dot draft" />
                  <span>Draft</span>
                  <strong>
                    {draftAudits.length}
                  </strong>
                </button>

              </div>
            </div>
          </article>

          {/* QUICK ACTIONS */}
          <article className="dashboard-panel">
            <div className="dashboard-panel-header">
              <div>
                <h2>Quick Access</h2>
                <p>Frequently used areas</p>
              </div>
            </div>

            <div className="quick-actions">

              <button
                type="button"
                onClick={() =>
                  navigate('/admin/plants')
                }
              >
                <span className="quick-icon">
                  <Icon name="plant" />
                </span>

                <span>
                  <strong>Plants</strong>
                  <small>
                    Manage plant hierarchy
                  </small>
                </span>

                <Icon name="arrow" />
              </button>

              <button
                type="button"
                onClick={() =>
                  navigate('/admin/zones')
                }
              >
                <span className="quick-icon">
                  <Icon name="zone" />
                </span>

                <span>
                  <strong>Zones</strong>
                  <small>
                    Manage plant zones
                  </small>
                </span>

                <Icon name="arrow" />
              </button>

              <button
                type="button"
                onClick={() =>
                  navigate('/admin/audits')
                }
              >
                <span className="quick-icon">
                  <Icon name="audit" />
                </span>

                <span>
                  <strong>Audits</strong>
                  <small>
                    Review audit activity
                  </small>
                </span>

                <Icon name="arrow" />
              </button>

            </div>
          </article>

        </section>

        {/* PLANT PERFORMANCE */}
        <section className="dashboard-panel plant-panel">

          <div className="dashboard-panel-header">
            <div>
              <h2>Plant Performance</h2>
              <p>
                Audit activity across plants
              </p>
            </div>

            <button
              type="button"
              className="dashboard-link"
              onClick={() =>
                navigate('/admin/plants')
              }
            >
              All plants
              <Icon name="arrow" />
            </button>
          </div>

          {plantPerformance.length === 0 ? (
            <EmptyState message="No plant data available." />
          ) : (
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
                  <div className="plant-performance-info">
                    <strong>{plant.name}</strong>

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

                  <div className="plant-performance-bar">
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

                  <div className="plant-performance-value">
                    {plant.percentage}%
                  </div>

                  <Icon name="arrow" />
                </button>
              ))}
            </div>
          )}

        </section>

        {/* RECENT AUDITS */}
        <section className="dashboard-panel recent-panel">

          <div className="dashboard-panel-header">
            <div>
              <h2>Recent Audit Activity</h2>
              <p>
                Ongoing and most recently updated audits
              </p>
            </div>

            <button
              type="button"
              className="dashboard-link"
              onClick={() =>
                navigate('/admin/audits')
              }
            >
              View all
              <Icon name="arrow" />
            </button>
          </div>

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
                      className="recent-audit-card"
                      onClick={() =>
                        navigate(
                          `/admin/audits/${audit.id}`
                        )
                      }
                    >
                      <div className="recent-audit-icon">
                        <Icon name="audit" />
                      </div>

                      <div className="recent-audit-content">

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
                              'dashboard-status'
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

                          <span>•</span>

                          <span>
                            {zoneName}
                          </span>
                        </div>

                      </div>

                      <div className="recent-audit-date">
                        {formatDate(
                          getAuditDate(audit)
                        )}
                      </div>

                      <span className="recent-audit-arrow">
                        <Icon name="arrow" />
                      </span>
                    </button>
                  )
                })}
            </div>
          )}

        </section>

      </div>

      <style>{`
        .dashboard-page {
          width: 100%;
          min-height: 100%;
          background: #f7f9fc;
          color: #172033;
        }

        .dashboard-container {
          width: 100%;
          max-width: 1500px;
          margin: 0 auto;
          padding: 24px;
        }

        .dashboard-header {
          display: flex;
          align-items: flex-end;
          justify-content: space-between;
          gap: 24px;
          margin-bottom: 24px;
        }

        .dashboard-eyebrow {
          margin-bottom: 6px;
          color: #64748b;
          font-size: 11px;
          font-weight: 800;
          letter-spacing: .12em;
        }

        .dashboard-heading {
          margin: 0;
          color: #111827;
          font-size: clamp(25px, 3vw, 34px);
          line-height: 1.1;
          font-weight: 800;
          letter-spacing: -.03em;
        }

        .dashboard-description {
          margin: 8px 0 0;
          color: #64748b;
          font-size: 14px;
        }

        .dashboard-header-actions {
          display: flex;
          align-items: center;
          gap: 10px;
          flex-shrink: 0;
        }

        .dashboard-refresh,
        .dashboard-primary-action,
        .dashboard-link {
          min-height: 42px;
          border-radius: 10px;
          cursor: pointer;
          transition: .2s ease;
        }

        .dashboard-refresh {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          gap: 8px;
          padding: 0 13px;
          border: 1px solid #dce2eb;
          background: #fff;
          color: #475569;
          font-size: 13px;
          font-weight: 700;
        }

        .dashboard-refresh:hover {
          background: #f8fafc;
          border-color: #cbd5e1;
        }

        .dashboard-primary-action {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          gap: 8px;
          padding: 0 15px;
          border: 1px solid #172033;
          background: #172033;
          color: #fff;
          font-size: 13px;
          font-weight: 700;
        }

        .dashboard-primary-action:hover {
          background: #273449;
        }

        .dashboard-primary-action svg,
        .dashboard-link svg {
          width: 16px;
          height: 16px;
        }

        .dashboard-stats {
          display: grid;
          grid-template-columns: repeat(6, minmax(0, 1fr));
          gap: 14px;
          margin-bottom: 18px;
        }

        .dashboard-stat-card {
          position: relative;
          min-width: 0;
          min-height: 166px;
          padding: 17px;
          text-align: left;
          border: 1px solid #e2e8f0;
          border-radius: 15px;
          background: #fff;
          color: inherit;
          cursor: pointer;
          box-shadow: 0 2px 8px rgba(15, 23, 42, .025);
          transition:
            transform .2s ease,
            box-shadow .2s ease,
            border-color .2s ease;
        }

        .dashboard-stat-card:hover {
          transform: translateY(-2px);
          border-color: #cbd5e1;
          box-shadow: 0 10px 28px rgba(15, 23, 42, .07);
        }

        .dashboard-stat-highlight {
          border-color: #fed7aa;
          background: linear-gradient(
            145deg,
            #fff,
            #fffaf5
          );
        }

        .dashboard-stat-top {
          display: flex;
          align-items: center;
          justify-content: space-between;
        }

        .dashboard-stat-icon {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          width: 42px;
          height: 42px;
          border-radius: 11px;
          background: #f1f5f9;
          color: #334155;
        }

        .dashboard-stat-highlight .dashboard-stat-icon {
          background: #fff1e6;
          color: #c2410c;
        }

        .dashboard-stat-arrow {
          display: inline-flex;
          color: #94a3b8;
        }

        .dashboard-stat-arrow svg {
          width: 17px;
          height: 17px;
        }

        .dashboard-stat-value {
          margin-top: 19px;
          color: #111827;
          font-size: 29px;
          line-height: 1;
          font-weight: 800;
          letter-spacing: -.04em;
        }

        .dashboard-stat-title {
          margin-top: 8px;
          color: #334155;
          font-size: 13px;
          font-weight: 800;
        }

        .dashboard-stat-subtitle {
          margin-top: 4px;
          color: #94a3b8;
          font-size: 11px;
          line-height: 1.4;
        }

        .dashboard-main-grid {
          display: grid;
          grid-template-columns: minmax(0, 1.15fr) minmax(320px, .85fr);
          gap: 18px;
          margin-bottom: 18px;
        }

        .dashboard-panel {
          min-width: 0;
          border: 1px solid #e2e8f0;
          border-radius: 16px;
          background: #fff;
          box-shadow: 0 2px 8px rgba(15, 23, 42, .025);
        }

        .dashboard-panel-header {
          display: flex;
          align-items: flex-start;
          justify-content: space-between;
          gap: 16px;
          padding: 19px 20px;
          border-bottom: 1px solid #eef2f7;
        }

        .dashboard-panel-header h2 {
          margin: 0;
          color: #172033;
          font-size: 15px;
          font-weight: 800;
        }

        .dashboard-panel-header p {
          margin: 4px 0 0;
          color: #94a3b8;
          font-size: 12px;
        }

        .dashboard-link {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          gap: 5px;
          min-height: auto;
          padding: 5px 0;
          border: 0;
          background: transparent;
          color: #475569;
          font-size: 12px;
          font-weight: 800;
          white-space: nowrap;
        }

        .dashboard-link:hover {
          color: #111827;
        }

        .status-content {
          display: grid;
          grid-template-columns: 190px minmax(0, 1fr);
          align-items: center;
          gap: 25px;
          min-height: 225px;
          padding: 25px;
        }

        .status-ring-wrapper {
          display: flex;
          justify-content: center;
        }

        .status-ring {
          position: relative;
          display: flex;
          align-items: center;
          justify-content: center;
          width: 145px;
          height: 145px;
          border-radius: 50%;
          background:
            conic-gradient(
              #22c55e 0 var(--submitted),
              #f59e0b var(--submitted) 75%,
              #94a3b8 75% 100%
            );
        }

        .status-ring::before {
          content: '';
          position: absolute;
          inset: 11px;
          border-radius: 50%;
          background: #fff;
        }

        .status-ring-inner {
          position: relative;
          z-index: 1;
          display: flex;
          flex-direction: column;
          align-items: center;
        }

        .status-ring-inner strong {
          color: #111827;
          font-size: 27px;
          line-height: 1;
          font-weight: 800;
        }

        .status-ring-inner span {
          margin-top: 5px;
          color: #94a3b8;
          font-size: 11px;
        }

        .status-legend {
          display: flex;
          flex-direction: column;
          gap: 12px;
        }

        .status-legend button {
          display: grid;
          grid-template-columns: 10px minmax(0, 1fr) auto;
          align-items: center;
          gap: 9px;
          width: 100%;
          padding: 9px;
          border: 0;
          border-radius: 9px;
          background: transparent;
          text-align: left;
          cursor: pointer;
        }

        .status-legend button:hover {
          background: #f8fafc;
        }

        .status-legend button span:not(.legend-dot) {
          color: #64748b;
          font-size: 12px;
          font-weight: 600;
        }

        .status-legend button strong {
          color: #172033;
          font-size: 13px;
        }

        .legend-dot {
          width: 8px;
          height: 8px;
          border-radius: 50%;
        }

        .legend-dot.ongoing {
          background: #f59e0b;
        }

        .legend-dot.submitted {
          background: #22c55e;
        }

        .legend-dot.draft {
          background: #94a3b8;
        }

        .quick-actions {
          display: grid;
          gap: 1px;
          padding: 8px;
        }

        .quick-actions button {
          display: grid;
          grid-template-columns: 40px minmax(0, 1fr) 17px;
          align-items: center;
          gap: 12px;
          width: 100%;
          min-height: 70px;
          padding: 10px 12px;
          border: 0;
          border-radius: 11px;
          background: transparent;
          text-align: left;
          color: #172033;
          cursor: pointer;
        }

        .quick-actions button:hover {
          background: #f8fafc;
        }

        .quick-actions button > svg {
          width: 16px;
          height: 16px;
          color: #94a3b8;
        }

        .quick-icon {
          display: flex;
          align-items: center;
          justify-content: center;
          width: 40px;
          height: 40px;
          border-radius: 10px;
          background: #f1f5f9;
          color: #475569;
        }

        .quick-actions strong,
        .quick-actions small {
          display: block;
        }

        .quick-actions strong {
          font-size: 13px;
          font-weight: 800;
        }

        .quick-actions small {
          margin-top: 3px;
          color: #94a3b8;
          font-size: 11px;
        }

        .plant-panel {
          margin-bottom: 18px;
        }

        .plant-performance-list {
          padding: 8px 20px 17px;
        }

        .plant-performance-row {
          display: grid;
          grid-template-columns: minmax(150px, 1.1fr) minmax(100px, 2fr) 50px 18px;
          align-items: center;
          gap: 16px;
          width: 100%;
          min-height: 61px;
          padding: 8px 0;
          border: 0;
          border-bottom: 1px solid #f1f5f9;
          background: transparent;
          text-align: left;
          cursor: pointer;
        }

        .plant-performance-row:last-child {
          border-bottom: 0;
        }

        .plant-performance-row:hover .plant-performance-info strong {
          color: #475569;
        }

        .plant-performance-info {
          min-width: 0;
        }

        .plant-performance-info strong,
        .plant-performance-info span {
          display: block;
          overflow: hidden;
          text-overflow: ellipsis;
          white-space: nowrap;
        }

        .plant-performance-info strong {
          color: #172033;
          font-size: 12px;
          font-weight: 800;
        }

        .plant-performance-info span {
          margin-top: 3px;
          color: #94a3b8;
          font-size: 10px;
        }

        .plant-performance-bar {
          height: 7px;
          overflow: hidden;
          border-radius: 999px;
          background: #eef2f7;
        }

        .plant-performance-bar span {
          display: block;
          height: 100%;
          border-radius: inherit;
          background: #475569;
          transition: width .4s ease;
        }

        .plant-performance-value {
          color: #475569;
          font-size: 11px;
          font-weight: 800;
          text-align: right;
        }

        .plant-performance-row > svg {
          width: 15px;
          height: 15px;
          color: #cbd5e1;
        }

        .recent-panel {
          margin-bottom: 20px;
        }

        .recent-audit-list {
          padding: 8px 20px 18px;
        }

        .recent-audit-card {
          display: grid;
          grid-template-columns: 40px minmax(0, 1fr) auto 18px;
          align-items: center;
          gap: 13px;
          width: 100%;
          min-height: 72px;
          padding: 9px 0;
          border: 0;
          border-bottom: 1px solid #f1f5f9;
          background: transparent;
          text-align: left;
          cursor: pointer;
        }

        .recent-audit-card:last-child {
          border-bottom: 0;
        }

        .recent-audit-card:hover .recent-audit-title strong {
          color: #475569;
        }

        .recent-audit-icon {
          display: flex;
          align-items: center;
          justify-content: center;
          width: 40px;
          height: 40px;
          border-radius: 10px;
          background: #f8fafc;
          color: #64748b;
        }

        .recent-audit-icon svg {
          width: 18px;
          height: 18px;
        }

        .recent-audit-content {
          min-width: 0;
        }

        .recent-audit-title {
          display: flex;
          align-items: center;
          flex-wrap: wrap;
          gap: 8px;
        }

        .recent-audit-title strong {
          color: #172033;
          font-size: 12px;
          font-weight: 800;
        }

        .dashboard-status {
          display: inline-flex;
          align-items: center;
          width: fit-content;
          padding: 3px 7px;
          border-radius: 999px;
          font-size: 9px;
          line-height: 1.2;
          font-weight: 800;
        }

        .dashboard-status.ongoing {
          background: #fff7ed;
          color: #c2410c;
        }

        .dashboard-status.submitted {
          background: #f0fdf4;
          color: #15803d;
        }

        .dashboard-status.draft {
          background: #f1f5f9;
          color: #64748b;
        }

        .recent-audit-meta {
          display: flex;
          align-items: center;
          gap: 6px;
          margin-top: 4px;
          overflow: hidden;
          color: #94a3b8;
          font-size: 10px;
        }

        .recent-audit-meta span {
          overflow: hidden;
          text-overflow: ellipsis;
          white-space: nowrap;
        }

        .recent-audit-date {
          color: #64748b;
          font-size: 10px;
          white-space: nowrap;
        }

        .recent-audit-arrow {
          color: #cbd5e1;
        }

        .recent-audit-arrow svg {
          width: 15px;
          height: 15px;
        }

        .dashboard-empty {
          padding: 45px 20px;
          color: #94a3b8;
          font-size: 12px;
          text-align: center;
        }

        .dashboard-error {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 12px;
          margin-bottom: 18px;
          padding: 12px 14px;
          border: 1px solid #fecaca;
          border-radius: 10px;
          background: #fef2f2;
          color: #b91c1c;
          font-size: 12px;
        }

        .dashboard-error button {
          border: 0;
          background: transparent;
          color: inherit;
          font-weight: 800;
          cursor: pointer;
        }

        .dashboard-loading {
          display: flex;
          min-height: 60vh;
          align-items: center;
          justify-content: center;
          gap: 10px;
          color: #64748b;
          font-size: 13px;
        }

        .dashboard-spinner {
          width: 20px;
          height: 20px;
          border: 2px solid #e2e8f0;
          border-top-color: #475569;
          border-radius: 50%;
          animation: dashboard-spin .7s linear infinite;
        }

        @keyframes dashboard-spin {
          to {
            transform: rotate(360deg);
          }
        }

        @media (max-width: 1250px) {
          .dashboard-stats {
            grid-template-columns: repeat(3, minmax(0, 1fr));
          }
        }

        @media (max-width: 900px) {
          .dashboard-container {
            padding: 20px;
          }

          .dashboard-main-grid {
            grid-template-columns: 1fr;
          }

          .status-content {
            grid-template-columns: 180px minmax(0, 1fr);
          }
        }

        @media (max-width: 680px) {
          .dashboard-container {
            padding: 14px;
          }

          .dashboard-header {
            align-items: stretch;
            flex-direction: column;
            gap: 15px;
            margin-bottom: 18px;
          }

          .dashboard-description {
            font-size: 12px;
            line-height: 1.5;
          }

          .dashboard-header-actions {
            display: grid;
            grid-template-columns: 1fr 1fr;
            width: 100%;
          }

          .dashboard-refresh,
          .dashboard-primary-action {
            width: 100%;
            min-height: 44px;
          }

          .dashboard-refresh span {
            display: inline;
          }

          .dashboard-stats {
            grid-template-columns: repeat(2, minmax(0, 1fr));
            gap: 10px;
            margin-bottom: 12px;
          }

          .dashboard-stat-card {
            min-height: 143px;
            padding: 13px;
            border-radius: 13px;
          }

          .dashboard-stat-icon {
            width: 36px;
            height: 36px;
            border-radius: 9px;
          }

          .dashboard-stat-icon svg {
            width: 19px;
            height: 19px;
          }

          .dashboard-stat-value {
            margin-top: 15px;
            font-size: 25px;
          }

          .dashboard-stat-title {
            margin-top: 7px;
            font-size: 12px;
          }

          .dashboard-stat-subtitle {
            font-size: 10px;
          }

          .dashboard-panel {
            border-radius: 13px;
          }

          .dashboard-panel-header {
            padding: 15px;
          }

          .dashboard-panel-header h2 {
            font-size: 14px;
          }

          .dashboard-panel-header p {
            max-width: 220px;
            line-height: 1.4;
          }

          .dashboard-link {
            font-size: 11px;
          }

          .status-content {
            grid-template-columns: 1fr;
            gap: 20px;
            min-height: auto;
            padding: 20px 15px;
          }

          .status-ring {
            width: 130px;
            height: 130px;
          }

          .status-legend {
            gap: 4px;
          }

          .status-legend button {
            min-height: 43px;
          }

          .quick-actions button {
            min-height: 65px;
          }

          .plant-performance-list {
            overflow-x: auto;
            padding: 6px 15px 12px;
          }

          .plant-performance-row {
            min-width: 520px;
            grid-template-columns: 150px 1fr 45px 16px;
          }

          .recent-audit-list {
            padding: 5px 15px 12px;
          }

          .recent-audit-card {
            grid-template-columns: 36px minmax(0, 1fr) 15px;
            gap: 10px;
            min-height: 76px;
          }

          .recent-audit-icon {
            width: 36px;
            height: 36px;
          }

          .recent-audit-date {
            display: none;
          }

          .recent-audit-meta {
            max-width: 100%;
          }
        }

        @media (max-width: 390px) {
          .dashboard-container {
            padding: 11px;
          }

          .dashboard-stats {
            gap: 8px;
          }

          .dashboard-stat-card {
            min-height: 138px;
            padding: 11px;
          }

          .dashboard-stat-value {
            font-size: 23px;
          }

          .dashboard-stat-subtitle {
            display: none;
          }

          .dashboard-header-actions {
            grid-template-columns: 1fr;
          }

          .recent-audit-title {
            align-items: flex-start;
            flex-direction: column;
            gap: 5px;
          }
        }

        @media (min-width: 1600px) {
          .dashboard-container {
            padding: 30px;
          }

          .dashboard-stats {
            gap: 18px;
          }

          .dashboard-stat-card {
            min-height: 180px;
            padding: 20px;
          }

          .dashboard-panel-header {
            padding: 21px 23px;
          }
        }
      `}</style>
    </div>
  )
}