// frontend/src/pages/admin/AdminAuditsPage.jsx

import {
  useCallback,
  useEffect,
  useMemo,
  useState,
} from "react";

import { useNavigate } from "react-router-dom";

import AuditStatusBadge from "../../components/AuditStatusBadge";

import { fetchAudits } from "../../services/auditService";
import { fetchPlants } from "../../services/plantService";
import { fetchZones } from "../../services/zoneService";
import {
  fetchAuditNotificationSummary,
  markAuditNotificationRead,
} from "../../services/auditNotificationService";


const PAGE_SIZE = 100;


function formatDate(value) {
  if (!value) {
    return "—";
  }

  return new Date(value).toLocaleDateString(
    "en-GB",
    {
      day: "2-digit",
      month: "short",
      year: "numeric",
    }
  );
}


function formatDateTime(value) {
  if (!value) {
    return "—";
  }

  return new Date(value).toLocaleString(
    "en-GB",
    {
      day: "2-digit",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    }
  );
}


function getAuditActivityDate(audit) {
  return new Date(
    audit.updated_at ||
      audit.submitted_at ||
      audit.created_at ||
      audit.audit_date ||
      0
  ).getTime();
}


function getAuditPriority(audit) {
  if (
    audit.status ===
    "IN_PROGRESS"
  ) {
    return 0;
  }

  if (
    audit.status ===
    "DRAFT"
  ) {
    return 1;
  }

  return 2;
}


function sortAudits(audits) {
  return [...audits].sort((a, b) => {
    // The most recently active audit must determine the plant/zone card status.
    // Do not force IN_PROGRESS audits ahead of newer SUBMITTED audits.
    const activityDifference =
      getAuditActivityDate(b) - getAuditActivityDate(a);

    if (activityDifference !== 0) {
      return activityDifference;
    }

    // If activity timestamps match, use status only as a tie-breaker.
    const priorityDifference =
      getAuditPriority(a) - getAuditPriority(b);

    if (priorityDifference !== 0) {
      return priorityDifference;
    }

    return 0;
  });
}


function getLatestAudit(audits) {
  const sorted =
    sortAudits(audits);

  return sorted[0] || null;
}


function PlantIcon() {
  return (
    <div className="audit-plant-icon">
      <svg
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.7"
      >
        <path d="M3 21h18" />
        <path d="M5 21V8l7-4v17" />
        <path d="M12 21V9l7-3v15" />
        <path d="M8 11h1" />
        <path d="M8 15h1" />
        <path d="M15 12h1" />
        <path d="M15 16h1" />
      </svg>
    </div>
  );
}


function ZoneIcon() {
  return (
    <div className="audit-zone-icon">
      <svg
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.7"
      >
        <rect
          x="4"
          y="4"
          width="16"
          height="16"
          rx="3"
        />
        <path d="M8 8h8" />
        <path d="M8 12h8" />
        <path d="M8 16h5" />
      </svg>
    </div>
  );
}


function AuditIcon() {
  return (
    <div className="audit-card-icon">
      <svg
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.7"
      >
        <rect
          x="5"
          y="3"
          width="14"
          height="18"
          rx="2"
        />
        <path d="M9 7h6" />
        <path d="M9 11h6" />
        <path d="M9 15h3" />
      </svg>
    </div>
  );
}


function Stat({
  label,
  value,
}) {
  return (
    <div>
      <div className="audit-stat-value">
        {value}
      </div>

      <div className="audit-stat-label">
        {label}
      </div>
    </div>
  );
}


export default function AdminAuditsPage() {
  const navigate =
    useNavigate();


  const [
    plants,
    setPlants,
  ] = useState([]);

  const [
    zones,
    setZones,
  ] = useState([]);

  const [
    audits,
    setAudits,
  ] = useState([]);


  const [
    selectedPlant,
    setSelectedPlant,
  ] = useState(null);

  const [
    selectedZone,
    setSelectedZone,
  ] = useState(null);


  const [
    search,
    setSearch,
  ] = useState("");


  const [
    isLoading,
    setIsLoading,
  ] = useState(true);

  const [
    loadError,
    setLoadError,
  ] = useState("");

  const [
    unreadAuditIds,
    setUnreadAuditIds,
  ] = useState(new Set());

  const [
    unreadPlantCounts,
    setUnreadPlantCounts,
  ] = useState({});


  // ==========================================================
  // LOAD ALL AUDITS
  // ==========================================================

  const loadAllAudits =
    useCallback(
      async () => {
        const allAudits = [];

        let page = 1;

        while (true) {
          const response =
            await fetchAudits({
              page,
              pageSize:
                PAGE_SIZE,
              sort: "newest",
            });

          const items =
            response?.items || [];

          allAudits.push(
            ...items
          );

          if (
            items.length <
              PAGE_SIZE ||
            allAudits.length >=
              Number(
                response?.total || 0
              )
          ) {
            break;
          }

          page += 1;
        }

        return allAudits;
      },
      []
    );


  // ==========================================================
  // LOAD DATA
  // ==========================================================

  const loadData =
    useCallback(
      async () => {
        try {
          setIsLoading(true);
          setLoadError("");

          const [
            plantsData,
            zonesData,
            auditsData,
            notificationData,
          ] =
            await Promise.all([
              fetchPlants(true),
              fetchZones({
                includeInactive:
                  true,
              }),
              loadAllAudits(),
              fetchAuditNotificationSummary(),
            ]);

          setPlants(
            Array.isArray(
              plantsData
            )
              ? plantsData
              : []
          );

          setZones(
            Array.isArray(
              zonesData
            )
              ? zonesData
              : []
          );

          setAudits(
            Array.isArray(
              auditsData
            )
              ? auditsData
              : []
          );

          setUnreadAuditIds(
            new Set(
              Array.isArray(
                notificationData?.audit_ids
              )
                ? notificationData.audit_ids.map(
                    (id) => String(id)
                  )
                : []
            )
          );

          setUnreadPlantCounts(
            notificationData?.plant_counts || {}
          );

        } catch (error) {
          console.error(
            error
          );

          setLoadError(
            "Unable to load audits. Please try again."
          );
        } finally {
          setIsLoading(false);
        }
      },
      [
        loadAllAudits,
      ]
    );


  useEffect(() => {
    loadData();
  }, [loadData]);


  // ==========================================================
  // MAP ZONES
  // ==========================================================

  const zoneMap =
    useMemo(() => {
      const map = new Map();

      zones.forEach(
        (zone) => {
          map.set(
            String(zone.id),
            zone
          );
        }
      );

      return map;
    }, [zones]);


  // ==========================================================
  // AUDITS WITH PLANT / ZONE
  // ==========================================================

  const enrichedAudits =
    useMemo(() => {
      return audits.map(
        (audit) => {
          const zone =
            zoneMap.get(
              String(
                audit.zone_id ||
                  audit.zone?.id
              )
            );

          return {
            ...audit,

            resolvedZone:
              zone ||
              audit.zone ||
              null,

            resolvedPlantId:
              zone?.plant_id ||
              audit.zone?.plant_id ||
              null,
          };
        }
      );
    }, [
      audits,
      zoneMap,
    ]);


  // ==========================================================
  // SEARCH
  // ==========================================================

  const normalizedSearch =
    search
      .trim()
      .toLowerCase();


  const filteredAudits =
    useMemo(() => {
      if (!normalizedSearch) {
        return enrichedAudits;
      }

      return enrichedAudits.filter(
        (audit) => {
          const plant =
            plants.find(
              (item) =>
                String(item.id) ===
                String(
                  audit.resolvedPlantId
                )
            );

          const values = [
            audit.audit_number,
            audit.status,
            audit.resolvedZone?.name,
            plant?.name,
            plant?.code,
            audit.auditor?.full_name,
            audit.auditor?.employee_id,
          ];

          return values.some(
            (value) =>
              String(
                value || ""
              )
                .toLowerCase()
                .includes(
                  normalizedSearch
                )
          );
        }
      );
    }, [
      enrichedAudits,
      normalizedSearch,
      plants,
    ]);


  // ==========================================================
  // PLANT CARDS
  // ==========================================================

  const plantCards =
    useMemo(() => {
      return plants
        .map((plant) => {
          const plantZones =
            zones.filter(
              (zone) =>
                String(
                  zone.plant_id
                ) ===
                String(
                  plant.id
                )
            );

          const plantAudits =
            filteredAudits.filter(
              (audit) =>
                String(
                  audit.resolvedPlantId
                ) ===
                String(
                  plant.id
                )
            );

          const sortedAudits =
            sortAudits(
              plantAudits
            );

          const latestAudit =
            sortedAudits[0] ||
            null;

          const ongoingCount =
            plantAudits.filter(
              (audit) =>
                audit.status ===
                "IN_PROGRESS"
            ).length;

          const completedCount =
            plantAudits.filter(
              (audit) =>
                audit.status ===
                "SUBMITTED"
            ).length;

          return {
            ...plant,

            plantZones,
            plantAudits:
              sortedAudits,

            totalZones:
              plantZones.length,

            totalAudits:
              plantAudits.length,

            ongoingCount,

            completedCount,

            latestAudit,

            unreadCount:
              Number(
                unreadPlantCounts[
                  String(plant.id)
                ] || 0
              ),
          };
        })
        .filter((plant) => {
          if (!normalizedSearch) {
            return true;
          }

          return (
            plant.name
              ?.toLowerCase()
              .includes(
                normalizedSearch
              ) ||
            plant.code
              ?.toLowerCase()
              .includes(
                normalizedSearch
              ) ||
            plant.totalAudits >
              0
          );
        })
        .sort((a, b) => {
          const auditA =
            a.latestAudit;

          const auditB =
            b.latestAudit;

          if (
            !auditA &&
            !auditB
          ) {
            return a.name.localeCompare(
              b.name
            );
          }

          if (!auditA) {
            return 1;
          }

          if (!auditB) {
            return -1;
          }

          const priority =
            getAuditPriority(
              auditA
            ) -
            getAuditPriority(
              auditB
            );

          if (priority !== 0) {
            return priority;
          }

          return (
            getAuditActivityDate(
              auditB
            ) -
            getAuditActivityDate(
              auditA
            )
          );
        });
    }, [
      plants,
      zones,
      filteredAudits,
      normalizedSearch,
    ]);


  // ==========================================================
  // ZONE CARDS
  // ==========================================================

  const zoneCards =
    useMemo(() => {
      if (!selectedPlant) {
        return [];
      }

      return zones
        .filter(
          (zone) =>
            String(
              zone.plant_id
            ) ===
            String(
              selectedPlant.id
            )
        )
        .map((zone) => {
          const zoneAudits =
            filteredAudits.filter(
              (audit) =>
                String(
                  audit.resolvedZone?.id
                ) ===
                String(zone.id)
            );

          const sortedAudits =
            sortAudits(
              zoneAudits
            );

          const latestAudit =
            sortedAudits[0] ||
            null;

          const ongoingCount =
            zoneAudits.filter(
              (audit) =>
                audit.status ===
                "IN_PROGRESS"
            ).length;

          const submittedCount =
            zoneAudits.filter(
              (audit) =>
                audit.status ===
                "SUBMITTED"
            ).length;

          return {
            ...zone,

            zoneAudits:
              sortedAudits,

            totalAudits:
              zoneAudits.length,

            ongoingCount,

            submittedCount,

            latestAudit,

            unreadCount:
              zoneAudits.filter(
                (audit) =>
                  unreadAuditIds.has(
                    String(audit.id)
                  )
              ).length,
          };
        })
        .filter((zone) => {
          if (!normalizedSearch) {
            return true;
          }

          return (
            zone.name
              ?.toLowerCase()
              .includes(
                normalizedSearch
              ) ||
            zone.totalAudits >
              0
          );
        })
        .sort((a, b) => {
          const auditA =
            a.latestAudit;

          const auditB =
            b.latestAudit;

          if (
            !auditA &&
            !auditB
          ) {
            return a.name.localeCompare(
              b.name
            );
          }

          if (!auditA) {
            return 1;
          }

          if (!auditB) {
            return -1;
          }

          const priority =
            getAuditPriority(
              auditA
            ) -
            getAuditPriority(
              auditB
            );

          if (priority !== 0) {
            return priority;
          }

          return (
            getAuditActivityDate(
              auditB
            ) -
            getAuditActivityDate(
              auditA
            )
          );
        });
    }, [
      selectedPlant,
      zones,
      filteredAudits,
      normalizedSearch,
    ]);


  // ==========================================================
  // SELECT PLANT
  // ==========================================================

  const openPlant =
    (plant) => {
      setSelectedPlant(
        plant
      );

      setSelectedZone(
        null
      );

      setSearch("");
    };


  // ==========================================================
  // SELECT ZONE
  // ==========================================================

  const openZone =
    (zone) => {
      setSelectedZone(
        zone
      );

      setSearch("");
    };


  // ==========================================================
  // BACK
  // ==========================================================

  const backToPlants =
    () => {
      setSelectedPlant(
        null
      );

      setSelectedZone(
        null
      );

      setSearch("");
    };


  const backToZones =
    () => {
      setSelectedZone(
        null
      );

      setSearch("");
    };


  const openAudit = async (audit) => {
    const auditId = String(audit.id);
    const wasUnread = unreadAuditIds.has(auditId);

    if (wasUnread) {
      try {
        await markAuditNotificationRead(audit.id);

        setUnreadAuditIds((current) => {
          const next = new Set(current);
          next.delete(auditId);
          return next;
        });

        setUnreadPlantCounts((current) => {
          const plantId = String(
            audit.resolvedPlantId ||
              audit.zone?.plant_id ||
              ''
          );

          if (!plantId) return current;

          const next = { ...current };
          const nextCount = Number(next[plantId] || 0) - 1;

          if (nextCount > 0) {
            next[plantId] = nextCount;
          } else {
            delete next[plantId];
          }

          return next;
        });

        window.dispatchEvent(
          new CustomEvent('audit-notification-read', {
            detail: { auditId },
          })
        );
      } catch (error) {
        console.error(
          'Unable to mark audit notification as read',
          error
        );
      }
    }

    navigate(`/admin/audits/${audit.id}`);
  };


  // ==========================================================
  // LOADING
  // ==========================================================

  if (isLoading) {
    return (
      <div className="audit-page-loading">
        <div className="audit-loading-spinner" />
        <div>
          Loading audit structure...
        </div>
      </div>
    );
  }


  // ==========================================================
  // ERROR
  // ==========================================================

  if (loadError) {
    return (
      <div className="audit-error-page">

        <div className="audit-error-icon">
          !
        </div>

        <h2>
          Unable to load audits
        </h2>

        <p>
          {loadError}
        </p>

        <button
          type="button"
          onClick={
            loadData
          }
          className="audit-retry-button"
        >
          Retry
        </button>

      </div>
    );
  }


  return (
    <div className="admin-audits-page">

      <style>{`

        .admin-audits-page {
          min-height: 100%;
          padding: 28px;
          background: #f8fafc;
          color: #0f172a;
        }

        .admin-audits-container {
          max-width: 1500px;
          margin: 0 auto;
        }

        .audit-page-header {
          display: flex;
          align-items: flex-start;
          justify-content: space-between;
          gap: 20px;
          margin-bottom: 24px;
        }

        .audit-eyebrow {
          margin-bottom: 6px;
          color: #2563eb;
          font-size: 10px;
          font-weight: 800;
          letter-spacing: .14em;
        }

        .audit-page-title {
          margin: 0;
          color: #0f172a;
          font-size: 28px;
          font-weight: 800;
          letter-spacing: -.025em;
        }

        .audit-page-subtitle {
          margin-top: 7px;
          color: #64748b;
          font-size: 13px;
        }

        .audit-search {
          width: 320px;
          height: 42px;
          padding: 0 13px;
          border: 1px solid #cbd5e1;
          border-radius: 9px;
          outline: none;
          background: #fff;
          color: #0f172a;
          font-size: 12px;
        }

        .audit-search:focus {
          border-color: #2563eb;
          box-shadow:
            0 0 0 3px rgba(37,99,235,.1);
        }

        .audit-breadcrumb {
          display: flex;
          align-items: center;
          gap: 7px;
          margin-bottom: 20px;
          color: #64748b;
          font-size: 11px;
        }

        .audit-breadcrumb button {
          padding: 0;
          border: 0;
          background: transparent;
          color: #2563eb;
          font-size: 11px;
          font-weight: 700;
          cursor: pointer;
        }

        .audit-breadcrumb-current {
          color: #0f172a;
          font-weight: 700;
        }

        .audit-plant-grid {
          display: grid;
          grid-template-columns:
            repeat(3, minmax(0, 1fr));
          gap: 17px;
        }

        .audit-plant-card {
          position: relative;
          overflow: hidden;
          min-height: 230px;
          padding: 21px;
          border: 1px solid #e2e8f0;
          border-radius: 15px;
          background: #fff;
          box-shadow:
            0 5px 18px rgba(15,23,42,.04);
          cursor: pointer;
          transition:
            transform .2s ease,
            box-shadow .2s ease,
            border-color .2s ease;
        }

        .audit-plant-card:hover {
          transform: translateY(-2px);
          border-color: #bfdbfe;
          box-shadow:
            0 14px 32px rgba(15,23,42,.08);
        }

        .audit-plant-card.ongoing {
          border-color: #93c5fd;
        }

        .audit-card-top {
          display: flex;
          align-items: flex-start;
          justify-content: space-between;
          gap: 12px;
        }

        .audit-plant-icon {
          width: 48px;
          height: 48px;
          display: flex;
          align-items: center;
          justify-content: center;
          border-radius: 13px;
          background: #eff6ff;
          color: #2563eb;
        }

        .audit-plant-icon svg {
          width: 25px;
          height: 25px;
        }

        .audit-card-top-badges {
          display: flex;
          align-items: center;
          justify-content: flex-end;
          flex-wrap: wrap;
          gap: 6px;
        }

        .audit-new-pill {
          display: inline-flex;
          align-items: center;
          gap: 5px;
          padding: 5px 9px;
          border-radius: 999px;
          background: #fff1f2;
          color: #e11d48;
          font-size: 9px;
          font-weight: 800;
          box-shadow: 0 0 0 1px #fecdd3 inset;
        }

        .audit-new-dot {
          width: 6px;
          height: 6px;
          border-radius: 50%;
          background: #f43f5e;
          box-shadow: 0 0 0 3px rgba(244,63,94,.12);
        }

        .audit-active-pill {
          display: inline-flex;
          align-items: center;
          gap: 5px;
          padding: 5px 9px;
          border-radius: 999px;
          background: #dcfce7;
          color: #15803d;
          font-size: 9px;
          font-weight: 800;
        }

        .audit-active-dot {
          width: 6px;
          height: 6px;
          border-radius: 50%;
          background: #22c55e;
        }

        .audit-plant-name {
          margin-top: 18px;
          color: #0f172a;
          font-size: 17px;
          font-weight: 800;
        }

        .audit-plant-code {
          margin-top: 4px;
          color: #94a3b8;
          font-family: monospace;
          font-size: 10px;
        }

        .audit-plant-stats {
          display: flex;
          gap: 28px;
          margin-top: 21px;
        }

        .audit-stat-value {
          color: #0f172a;
          font-size: 18px;
          font-weight: 800;
        }

        .audit-stat-label {
          margin-top: 2px;
          color: #94a3b8;
          font-size: 9px;
        }

        .audit-latest-box {
          margin-top: 18px;
          padding: 10px 11px;
          border: 1px solid #e2e8f0;
          border-radius: 9px;
          background: #f8fafc;
        }

        .audit-latest-label {
          color: #94a3b8;
          font-size: 9px;
          font-weight: 800;
          text-transform: uppercase;
          letter-spacing: .05em;
        }

        .audit-latest-number {
          margin-top: 4px;
          color: #334155;
          font-size: 11px;
          font-weight: 750;
        }

        .audit-latest-zone {
          margin-top: 2px;
          color: #64748b;
          font-size: 9px;
        }

        .audit-card-arrow {
          position: absolute;
          right: 21px;
          bottom: 20px;
          color: #2563eb;
          font-size: 11px;
          font-weight: 750;
        }

        .audit-zone-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 18px;
          margin-bottom: 18px;
        }

        .audit-zone-heading {
          display: flex;
          align-items: center;
          gap: 12px;
        }

        .audit-back-button {
          width: 36px;
          height: 36px;
          border: 1px solid #cbd5e1;
          border-radius: 8px;
          background: #fff;
          color: #475569;
          cursor: pointer;
        }

        .audit-back-button:hover {
          background: #f8fafc;
        }

        .audit-zone-title {
          color: #0f172a;
          font-size: 18px;
          font-weight: 800;
        }

        .audit-zone-subtitle {
          margin-top: 3px;
          color: #64748b;
          font-size: 11px;
        }

        .audit-zone-grid {
          display: grid;
          grid-template-columns:
            repeat(3, minmax(0, 1fr));
          gap: 16px;
        }

        .audit-zone-card {
          position: relative;
          min-height: 205px;
          padding: 19px;
          border: 1px solid #e2e8f0;
          border-radius: 14px;
          background: #fff;
          box-shadow:
            0 4px 15px rgba(15,23,42,.035);
          cursor: pointer;
          transition: .2s ease;
        }

        .audit-zone-card:hover {
          transform: translateY(-2px);
          border-color: #bfdbfe;
          box-shadow:
            0 12px 28px rgba(15,23,42,.07);
        }

        .audit-zone-card.ongoing {
          border-color: #93c5fd;
        }

        .audit-zone-icon {
          width: 42px;
          height: 42px;
          display: flex;
          align-items: center;
          justify-content: center;
          border-radius: 11px;
          background: #f0fdf4;
          color: #16a34a;
        }

        .audit-zone-icon svg {
          width: 22px;
          height: 22px;
        }

        .audit-zone-card-name {
          margin-top: 16px;
          color: #0f172a;
          font-size: 15px;
          font-weight: 800;
        }

        .audit-zone-card-stats {
          display: flex;
          gap: 25px;
          margin-top: 19px;
        }

        .audit-zone-latest {
          margin-top: 17px;
          color: #64748b;
          font-size: 10px;
        }

        .audit-zone-latest strong {
          color: #334155;
        }

        .audit-audit-list {
          overflow: hidden;
          border: 1px solid #e2e8f0;
          border-radius: 14px;
          background: #fff;
          box-shadow:
            0 5px 18px rgba(15,23,42,.04);
        }

        .audit-list-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 15px;
          padding: 19px 21px;
          border-bottom: 1px solid #e2e8f0;
        }

        .audit-list-title {
          color: #0f172a;
          font-size: 16px;
          font-weight: 800;
        }

        .audit-list-subtitle {
          margin-top: 3px;
          color: #64748b;
          font-size: 10px;
        }

        .audit-list-count {
          padding: 5px 9px;
          border-radius: 999px;
          background: #eff6ff;
          color: #2563eb;
          font-size: 10px;
          font-weight: 800;
        }

        .audit-items {
          display: flex;
          flex-direction: column;
        }

        .audit-item {
          position: relative;
          display: grid;
          grid-template-columns:
            auto minmax(180px, 1fr)
            minmax(130px, .7fr)
            minmax(120px, .6fr)
            auto;
          align-items: center;
          gap: 18px;
          padding: 17px 21px;
          border-bottom: 1px solid #f1f5f9;
          cursor: pointer;
          transition: .15s ease;
        }

        .audit-item:last-child {
          border-bottom: 0;
        }

        .audit-item:hover {
          background: #f8fafc;
        }

        .audit-item.ongoing {
          background: #f8fbff;
        }

        .audit-item.unread {
          background: #fffafc;
          box-shadow: inset 3px 0 0 #f43f5e;
        }

        .audit-item.unread:hover {
          background: #fff5f7;
        }

        .audit-number-row {
          display: flex;
          align-items: center;
          gap: 7px;
        }

        .audit-new-badge {
          display: inline-flex;
          align-items: center;
          padding: 3px 6px;
          border-radius: 999px;
          background: #ffe4e6;
          color: #be123c;
          font-size: 8px;
          font-weight: 900;
          letter-spacing: .05em;
        }

        .audit-card-icon {
          width: 40px;
          height: 40px;
          display: flex;
          align-items: center;
          justify-content: center;
          border-radius: 10px;
          background: #eff6ff;
          color: #2563eb;
        }

        .audit-card-icon svg {
          width: 21px;
          height: 21px;
        }

        .audit-number {
          color: #0f172a;
          font-size: 12px;
          font-weight: 800;
        }

        .audit-zone-name {
          margin-top: 3px;
          color: #64748b;
          font-size: 10px;
        }

        .audit-info-label {
          color: #94a3b8;
          font-size: 9px;
          font-weight: 700;
          text-transform: uppercase;
        }

        .audit-info-value {
          margin-top: 3px;
          color: #334155;
          font-size: 11px;
          font-weight: 650;
        }

        .audit-current-badge {
          display: inline-flex;
          align-items: center;
          gap: 5px;
          margin-top: 5px;
          padding: 3px 7px;
          border-radius: 999px;
          background: #dbeafe;
          color: #1d4ed8;
          font-size: 8px;
          font-weight: 800;
        }

        .audit-empty {
          padding: 65px 25px;
          text-align: center;
          color: #64748b;
        }

        .audit-empty-title {
          margin-top: 10px;
          color: #334155;
          font-size: 14px;
          font-weight: 750;
        }

        .audit-empty-text {
          margin-top: 5px;
          font-size: 11px;
        }

        .audit-page-loading {
          min-height: 450px;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          gap: 12px;
          color: #64748b;
          font-size: 12px;
        }

        .audit-loading-spinner {
          width: 30px;
          height: 30px;
          border: 3px solid #dbeafe;
          border-top-color: #2563eb;
          border-radius: 50%;
          animation: auditSpin .8s linear infinite;
        }

        @keyframes auditSpin {
          to {
            transform: rotate(360deg);
          }
        }

        .audit-error-page {
          min-height: 450px;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          text-align: center;
        }

        .audit-error-icon {
          width: 42px;
          height: 42px;
          display: flex;
          align-items: center;
          justify-content: center;
          border-radius: 50%;
          background: #fef2f2;
          color: #dc2626;
          font-weight: 800;
        }

        .audit-error-page h2 {
          margin: 13px 0 0;
          color: #0f172a;
          font-size: 16px;
        }

        .audit-error-page p {
          margin: 5px 0 15px;
          color: #64748b;
          font-size: 12px;
        }

        .audit-retry-button {
          padding: 8px 14px;
          border: 0;
          border-radius: 8px;
          background: #2563eb;
          color: #fff;
          font-size: 11px;
          font-weight: 750;
          cursor: pointer;
        }

        @media (max-width: 1100px) {
          .audit-plant-grid,
          .audit-zone-grid {
            grid-template-columns:
              repeat(2, minmax(0, 1fr));
          }

          .audit-item {
            grid-template-columns:
              auto 1fr 1fr auto;
          }

          .audit-item > :nth-child(4) {
            display: none;
          }
        }

        @media (max-width: 750px) {
          .admin-audits-page {
            padding: 18px;
          }

          .audit-page-header {
            flex-direction: column;
          }

          .audit-search {
            width: 100%;
          }

          .audit-plant-grid,
          .audit-zone-grid {
            grid-template-columns: 1fr;
          }

          .audit-zone-header {
            align-items: flex-start;
          }

          .audit-item {
            grid-template-columns:
              auto 1fr auto;
          }

          .audit-item > :nth-child(3),
          .audit-item > :nth-child(4) {
            display: none;
          }
        }



        /* ======================================================
           MOBILE-FIRST VISUAL REFRESH — STYLING ONLY
           Keep the existing audit hierarchy and event handlers.
        ====================================================== */
        .admin-audits-page {
          min-height: 100%;
          padding: clamp(14px, 2.6vw, 30px);
          background: #f7f9fc;
          color: #111827;
          -webkit-tap-highlight-color: transparent;
        }

        .admin-audits-container {
          width: 100%;
          max-width: 1480px;
        }

        .audit-page-header {
          align-items: center;
          margin-bottom: 22px;
          padding-bottom: 20px;
          border-bottom: 1px solid #e8edf4;
        }

        .audit-eyebrow {
          margin-bottom: 8px;
          color: #2563eb;
          font-size: 10px;
          font-weight: 800;
          letter-spacing: .13em;
        }

        .audit-page-title {
          font-size: clamp(25px, 3vw, 32px);
          line-height: 1.15;
          letter-spacing: -.035em;
          font-weight: 750;
        }

        .audit-page-subtitle {
          max-width: 620px;
          margin: 8px 0 0;
          font-size: 13px;
          line-height: 1.6;
          color: #64748b;
        }

        .audit-search {
          width: min(100%, 360px);
          min-height: 46px;
          padding: 0 15px;
          border: 1px solid #dce3ed;
          border-radius: 12px;
          background: #fff;
          font-size: 14px;
          box-shadow: 0 1px 2px rgba(15,23,42,.025);
          transition: border-color .18s ease, box-shadow .18s ease;
        }

        .audit-search::placeholder { color: #94a3b8; }
        .audit-search:focus {
          border-color: #8bb7ff;
          box-shadow: 0 0 0 4px rgba(37,99,235,.09);
        }

        .audit-breadcrumb {
          margin: 0 0 18px;
          font-size: 12px;
        }

        .audit-plant-grid,
        .audit-zone-grid {
          gap: 14px;
        }

        .audit-plant-card,
        .audit-zone-card {
          min-width: 0;
          padding: 20px;
          border: 1px solid #e5eaf2;
          border-radius: 17px;
          background: #fff;
          box-shadow: 0 2px 8px rgba(15,23,42,.025);
          transition: border-color .18s ease, box-shadow .18s ease, transform .18s ease;
          -webkit-tap-highlight-color: transparent;
        }

        .audit-plant-card:hover,
        .audit-zone-card:hover {
          border-color: #bfd5fb;
          box-shadow: 0 8px 24px rgba(15,23,42,.06);
          transform: translateY(-1px);
        }

        .audit-plant-card.ongoing,
        .audit-zone-card.ongoing {
          border-color: #b9d2ff;
          background: linear-gradient(180deg, #fff 0%, #fbfdff 100%);
        }

        .audit-plant-icon,
        .audit-zone-icon {
          flex: 0 0 auto;
          border: 1px solid #e4edff;
          background: #f1f6ff;
          color: #2864d9;
        }

        .audit-plant-name { font-size: 17px; line-height: 1.4; overflow-wrap: anywhere; }
        .audit-plant-code { font-size: 11px; color: #8b98ab; }
        .audit-plant-stats,
        .audit-zone-card-stats {
          gap: clamp(16px, 3vw, 30px);
          flex-wrap: wrap;
        }

        .audit-stat-value { font-size: 20px; font-weight: 750; }
        .audit-stat-label { font-size: 11px; color: #7b8798; }

        .audit-latest-box {
          border-color: #e9eef5;
          border-radius: 11px;
          background: #f8fafc;
          padding: 12px;
        }
        .audit-latest-label { font-size: 10px; color: #7b8798; }
        .audit-latest-number { font-size: 12px; overflow-wrap: anywhere; }
        .audit-latest-zone { font-size: 11px; }

        .audit-active-pill,
        .audit-new-pill {
          max-width: 100%;
          padding: 6px 9px;
          font-size: 10px;
          line-height: 1.2;
          white-space: normal;
        }

        .audit-zone-header {
          padding: 16px;
          margin-bottom: 16px;
          border: 1px solid #e8edf4;
          border-radius: 15px;
          background: #fff;
        }

        .audit-zone-heading { min-width: 0; }
        .audit-zone-title { font-size: 19px; line-height: 1.35; overflow-wrap: anywhere; }
        .audit-zone-subtitle { font-size: 12px; line-height: 1.5; }

        .audit-back-button {
          flex: 0 0 auto;
          width: 42px;
          height: 42px;
          border-color: #dbe3ef;
          border-radius: 12px;
          color: #334155;
          font-size: 16px;
        }

        .audit-audit-list {
          border-color: #e5eaf2;
          border-radius: 16px;
          box-shadow: 0 2px 8px rgba(15,23,42,.025);
        }

        .audit-list-header {
          gap: 12px;
          padding: 18px 20px;
          background: #fff;
          border-bottom: 1px solid #edf1f6;
        }

        .audit-list-title { font-size: 16px; font-weight: 750; }
        .audit-list-subtitle { margin-top: 4px; font-size: 12px; line-height: 1.5; color: #718096; }
        .audit-list-count { font-size: 11px; }

        .audit-items { padding: 0 16px; }
        .audit-item {
          min-width: 0;
          gap: 14px;
          padding: 17px 4px;
          border-bottom-color: #edf1f6;
        }
        .audit-item:last-child { border-bottom: 0; }
        .audit-number { font-size: 13px; font-weight: 750; overflow-wrap: anywhere; }
        .audit-number-row { min-width: 0; gap: 8px; flex-wrap: wrap; }
        .audit-info-label { font-size: 10px; color: #8a96a8; }
        .audit-info-value { font-size: 12px; color: #334155; overflow-wrap: anywhere; }

        .audit-empty,
        .audit-error-page {
          border: 1px dashed #d8e1ed;
          border-radius: 16px;
          background: #fff;
          padding: 36px 20px;
        }
        .audit-empty-title { font-size: 16px; font-weight: 750; }
        .audit-empty-text { max-width: 340px; margin: 6px auto 0; font-size: 12px; line-height: 1.6; }

        .audit-retry-button {
          min-height: 42px;
          padding: 0 16px;
          border-radius: 11px;
          font-size: 13px;
        }

        @media (max-width: 750px) {
          .admin-audits-page { padding: 14px; }
          .audit-page-header {
            align-items: stretch;
            gap: 14px;
            margin-bottom: 18px;
            padding-bottom: 18px;
          }
          .audit-page-title { font-size: 27px; }
          .audit-page-subtitle { font-size: 13px; }
          .audit-search { width: 100%; min-height: 48px; font-size: 14px; }
          .audit-plant-grid,
          .audit-zone-grid { grid-template-columns: minmax(0, 1fr); gap: 12px; }
          .audit-plant-card,
          .audit-zone-card { min-height: 0; padding: 17px; border-radius: 15px; }
          .audit-plant-name { margin-top: 14px; font-size: 16px; }
          .audit-plant-stats { margin-top: 17px; gap: 24px; }
          .audit-card-arrow { right: 17px; bottom: 17px; }
          .audit-zone-header { align-items: stretch; padding: 13px; }
          .audit-zone-heading { align-items: flex-start; gap: 10px; }
          .audit-zone-title { font-size: 17px; }
          .audit-zone-card-stats { gap: 22px; margin-top: 16px; }
          .audit-list-header { align-items: flex-start; padding: 15px; }
          .audit-items { padding: 0 13px; }
          .audit-item { grid-template-columns: auto minmax(0, 1fr) auto; gap: 10px; padding: 15px 0; }
          .audit-item > :nth-child(3),
          .audit-item > :nth-child(4) { display: none; }
          .audit-number { font-size: 12px; }
          .audit-info-value { font-size: 12px; }
          .audit-breadcrumb { margin-bottom: 14px; }
        }

        @media (max-width: 380px) {
          .admin-audits-page { padding: 10px; }
          .audit-plant-card,
          .audit-zone-card { padding: 14px; }
          .audit-card-top { gap: 8px; }
          .audit-card-top-badges { gap: 5px; }
          .audit-plant-stats,
          .audit-zone-card-stats { gap: 16px; }
          .audit-items { padding: 0 10px; }
          .audit-item { gap: 8px; }
        }

        @media (prefers-reduced-motion: reduce) {
          .audit-plant-card,
          .audit-zone-card,
          .audit-search { transition: none; }
        }

      `}</style>


      <div className="admin-audits-container">


        {/* ==================================================
            HEADER
        ================================================== */}

        <div className="audit-page-header">

          <div>

            <div className="audit-eyebrow">
              AUDIT MANAGEMENT
            </div>

            <h1 className="audit-page-title">
              Audits
            </h1>

            <p className="audit-page-subtitle">
              Navigate from Plant → Zone →
              Audits. Ongoing and most recent
              audits always appear first.
            </p>

          </div>


          <input
            type="text"
            className="audit-search"
            placeholder={
              selectedZone
                ? "Search audits..."
                : selectedPlant
                  ? "Search zones..."
                  : "Search plants, zones or audits..."
            }
            value={search}
            onChange={(event) =>
              setSearch(
                event.target.value
              )
            }
          />

        </div>


        {/* ==================================================
            PLANT LEVEL
        ================================================== */}

        {!selectedPlant && (

          <>

            <div className="audit-breadcrumb">

              <span className="audit-breadcrumb-current">
                Plants
              </span>

            </div>


            {plantCards.length === 0 ? (

              <div className="audit-empty">

                <PlantIcon />

                <div className="audit-empty-title">
                  No plants found
                </div>

                <div className="audit-empty-text">
                  No plants or audits match
                  your search.
                </div>

              </div>

            ) : (

              <div className="audit-plant-grid">

                {plantCards.map(
                  (plant) => {

                    const hasOngoing =
                      plant.ongoingCount >
                      0;

                    return (
                      <div
                        key={plant.id}
                        className={`audit-plant-card ${
                          hasOngoing
                            ? "ongoing"
                            : ""
                        }`}
                        onClick={() =>
                          openPlant(
                            plant
                          )
                        }
                      >

                        <div className="audit-card-top">

                          <PlantIcon />

                          <div className="audit-card-top-badges">
                            {plant.unreadCount > 0 && (
                              <div className="audit-new-pill">
                                <span className="audit-new-dot" />
                                {plant.unreadCount} NEW
                              </div>
                            )}

                            {hasOngoing && (
                              <div className="audit-active-pill">
                                <span className="audit-active-dot" />
                                AUDIT ONGOING
                              </div>
                            )}
                          </div>

                        </div>


                        <div className="audit-plant-name">
                          {plant.name}
                        </div>


                        <div className="audit-plant-code">
                          {plant.code ||
                            "Plant"}
                        </div>


                        <div className="audit-plant-stats">

                          <Stat
                            label="Zones"
                            value={
                              plant.totalZones
                            }
                          />

                          <Stat
                            label="Audits"
                            value={
                              plant.totalAudits
                            }
                          />

                          <Stat
                            label="Ongoing"
                            value={
                              plant.ongoingCount
                            }
                          />

                        </div>


                        {plant.latestAudit && (
                          <div className="audit-latest-box">

                            <div className="audit-latest-label">
                              Latest Activity
                            </div>

                            <div className="audit-latest-number">
                              {
                                plant
                                  .latestAudit
                                  .audit_number
                              }
                            </div>

                            <div className="audit-latest-zone">
                              {
                                plant
                                  .latestAudit
                                  .resolvedZone
                                  ?.name
                              }{" "}
                              ·{" "}
                              {
                                plant
                                  .latestAudit
                                  .status
                              }

                            </div>

                          </div>
                        )}


                        <div className="audit-card-arrow">
                          View Zones →
                        </div>

                      </div>
                    );
                  }
                )}

              </div>

            )}

          </>

        )}


        {/* ==================================================
            ZONE LEVEL
        ================================================== */}

        {selectedPlant &&
          !selectedZone && (

          <>

            <div className="audit-breadcrumb">

              <button
                type="button"
                onClick={
                  backToPlants
                }
              >
                Plants
              </button>

              <span>
                /
              </span>

              <span className="audit-breadcrumb-current">
                {selectedPlant.name}
              </span>

            </div>


            <div className="audit-zone-header">

              <div className="audit-zone-heading">

                <button
                  type="button"
                  className="audit-back-button"
                  onClick={
                    backToPlants
                  }
                >
                  ←
                </button>

                <div>

                  <div className="audit-zone-title">
                    {selectedPlant.name}
                  </div>

                  <div className="audit-zone-subtitle">
                    Select a zone to view
                    its audits.
                  </div>

                </div>

              </div>

            </div>


            {zoneCards.length ===
            0 ? (

              <div className="audit-empty">

                <ZoneIcon />

                <div className="audit-empty-title">
                  No zones found
                </div>

                <div className="audit-empty-text">
                  No zones or audits match
                  your search.
                </div>

              </div>

            ) : (

              <div className="audit-zone-grid">

                {zoneCards.map(
                  (zone) => {

                    const hasOngoing =
                      zone.ongoingCount >
                      0;

                    return (
                      <div
                        key={zone.id}
                        className={`audit-zone-card ${
                          hasOngoing
                            ? "ongoing"
                            : ""
                        }`}
                        onClick={() =>
                          openZone(
                            zone
                          )
                        }
                      >

                        <div className="audit-card-top">

                          <ZoneIcon />

                          <div className="audit-card-top-badges">
                            {zone.unreadCount > 0 && (
                              <div className="audit-new-pill">
                                <span className="audit-new-dot" />
                                {zone.unreadCount} NEW
                              </div>
                            )}

                            {hasOngoing && (
                              <div className="audit-active-pill">
                                <span className="audit-active-dot" />
                                ONGOING
                              </div>
                            )}
                          </div>

                        </div>


                        <div className="audit-zone-card-name">
                          {zone.name}
                        </div>


                        <div className="audit-zone-card-stats">

                          <Stat
                            label="Audits"
                            value={
                              zone.totalAudits
                            }
                          />

                          <Stat
                            label="Ongoing"
                            value={
                              zone.ongoingCount
                            }
                          />

                          <Stat
                            label="Completed"
                            value={
                              zone.submittedCount
                            }
                          />

                        </div>


                        {zone.latestAudit && (
                          <div className="audit-zone-latest">

                            Latest:{" "}

                            <strong>
                              {
                                zone
                                  .latestAudit
                                  .audit_number
                              }
                            </strong>

                            {" · "}

                            {formatDate(
                              zone
                                .latestAudit
                                .audit_date
                            )}

                          </div>
                        )}

                      </div>
                    );
                  }
                )}

              </div>

            )}

          </>

        )}


        {/* ==================================================
            AUDIT LEVEL
        ================================================== */}

        {selectedPlant &&
          selectedZone && (

          <>

            <div className="audit-breadcrumb">

              <button
                type="button"
                onClick={
                  backToPlants
                }
              >
                Plants
              </button>

              <span>
                /
              </span>

              <button
                type="button"
                onClick={
                  backToZones
                }
              >
                {selectedPlant.name}
              </button>

              <span>
                /
              </span>

              <span className="audit-breadcrumb-current">
                {selectedZone.name}
              </span>

            </div>


            <div className="audit-audit-list">

              <div className="audit-list-header">

                <div>

                  <div className="audit-list-title">
                    {selectedZone.name}
                  </div>

                  <div className="audit-list-subtitle">
                    All audits conducted in
                    this zone
                  </div>

                </div>


                <div className="audit-list-count">
                  {
                    sortAudits(
                      filteredAudits.filter(
                        (audit) =>
                          String(
                            audit.resolvedZone?.id
                          ) ===
                          String(
                            selectedZone.id
                          )
                      )
                    ).length
                  }{" "}
                  audits
                </div>

              </div>


              {(() => {

                const zoneAudits =
                  sortAudits(
                    filteredAudits.filter(
                      (audit) =>
                        String(
                          audit.resolvedZone?.id
                        ) ===
                        String(
                          selectedZone.id
                        )
                    )
                  );


                if (
                  zoneAudits.length ===
                  0
                ) {
                  return (
                    <div className="audit-empty">

                      <AuditIcon />

                      <div className="audit-empty-title">
                        No audits found
                      </div>

                      <div className="audit-empty-text">
                        No audits are available
                        for this zone.
                      </div>

                    </div>
                  );
                }


                return (
                  <div className="audit-items">

                    {zoneAudits.map(
                      (audit) => {

                        const ongoing =
                          audit.status ===
                          "IN_PROGRESS";


                        const isUnread = unreadAuditIds.has(
                          String(audit.id)
                        );

                        return (
                          <div
                            key={audit.id}
                            className={`audit-item ${
                              ongoing
                                ? "ongoing"
                                : ""
                            } ${
                              isUnread
                                ? "unread"
                                : ""
                            }`}
                            onClick={() =>
                              openAudit(audit)
                            }
                          >

                            <AuditIcon />


                            <div>

                              <div className="audit-number-row">
                                <div className="audit-number">
                                  {
                                    audit.audit_number
                                  }
                                </div>

                                {isUnread && (
                                  <span className="audit-new-badge">
                                    NEW
                                  </span>
                                )}
                              </div>

                              <div className="audit-zone-name">
                                {audit.resolvedZone?.name}
                              </div>

                              {ongoing && (
                                <div className="audit-current-badge">
                                  <span className="audit-active-dot" />
                                  CURRENTLY ONGOING
                                </div>
                              )}

                            </div>


                            <div>

                              <div className="audit-info-label">
                                Audit Date
                              </div>

                              <div className="audit-info-value">
                                {formatDate(
                                  audit.audit_date
                                )}
                              </div>

                            </div>


                            <div>

                              <div className="audit-info-label">
                                Consultant
                              </div>

                              <div className="audit-info-value">
                                {
                                  audit
                                    .auditor
                                    ?.full_name ||
                                  "—"
                                }
                              </div>

                            </div>


                            <div>

                              <AuditStatusBadge
                                status={
                                  audit.status
                                }
                              />

                              <div
                                style={{
                                  marginTop:
                                    "5px",
                                  color:
                                    "#94a3b8",
                                  fontSize:
                                    "9px",
                                  textAlign:
                                    "right",
                                }}
                              >
                                {formatDateTime(
                                  audit.updated_at ||
                                    audit.created_at
                                )}
                              </div>

                            </div>

                          </div>
                        );
                      }
                    )}

                  </div>
                );

              })()}

            </div>

          </>

        )}

      </div>

    </div>
  );
}
