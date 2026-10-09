import {
  useCallback,
  useEffect,
  useMemo,
  useState,
} from "react";

import { useNavigate } from "react-router-dom";

import { fetchPlants } from "../../services/plantService";
import { fetchZones } from "../../services/zoneService";
import { fetchAudits } from "../../services/auditService";
import apiClient from "../../services/apiClient";

// ============================================================
// META
// ============================================================

const STATUS_META = {
  SUBMITTED: {
    label: "Submitted",
    tone: "success",
  },

  IN_PROGRESS: {
    label: "In Progress",
    tone: "warning",
  },

  DRAFT: {
    label: "Draft",
    tone: "neutral",
  },
};

const SEVERITY_META = {
  HIGH: {
    label: "High",
    tone: "danger",
  },

  MEDIUM: {
    label: "Medium",
    tone: "warning",
  },

  LOW: {
    label: "Low",
    tone: "neutral",
  },
};

// ============================================================
// HELPERS
// ============================================================

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

function formatNumber(value) {
  return Number(value || 0).toLocaleString(
    "en-IN"
  );
}

function StatusBadge({ status }) {
  const meta =
    STATUS_META[status] || {
      label: status || "Unknown",
      tone: "neutral",
    };

  const toneClasses = {
    success:
      "border-[#cfe5d7] bg-[#eef8f1] text-[#397452]",

    warning:
      "border-[#eadfca] bg-[#faf6eb] text-[#927033]",

    neutral:
      "border-[#dce5e9] bg-[#f5f7f8] text-[#687a84]",
  };

  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-[9px] font-bold ${
        toneClasses[meta.tone]
      }`}
    >
      {meta.tone === "success" && (
        <span className="h-1.5 w-1.5 rounded-full bg-[#4d9a6d]" />
      )}

      {meta.tone === "warning" && (
        <span className="h-1.5 w-1.5 rounded-full bg-[#b38b42]" />
      )}

      {meta.tone === "neutral" && (
        <span className="h-1.5 w-1.5 rounded-full bg-[#89979e]" />
      )}

      {meta.label}
    </span>
  );
}

function SeverityBadge({
  severity,
  count,
}) {
  if (!count) {
    return null;
  }

  const meta =
    SEVERITY_META[severity];

  const toneClasses = {
    danger:
      "border-[#efd4d4] bg-[#fdf1f1] text-[#a54d4d]",

    warning:
      "border-[#eadfca] bg-[#faf6eb] text-[#927033]",

    neutral:
      "border-[#dce5e9] bg-[#f5f7f8] text-[#687a84]",
  };

  return (
    <span
      className={`inline-flex items-center rounded-full border px-2.5 py-1 text-[9px] font-bold ${
        toneClasses[meta.tone]
      }`}
    >
      {meta.label}: {count}
    </span>
  );
}

// ============================================================
// ICONS
// ============================================================

function ReportIcon({
  size = 18,
}) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.7"
      strokeLinecap="round"
      strokeLinejoin="round"
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
  );
}

function CheckIcon({
  size = 18,
}) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="m5 12 4 4L19 6" />
    </svg>
  );
}

function ClockIcon({
  size = 18,
}) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.7"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <circle
        cx="12"
        cy="12"
        r="8"
      />

      <path d="M12 8v5l3 2" />
    </svg>
  );
}

function DraftIcon({
  size = 18,
}) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.7"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M4 20h16" />
      <path d="M6 16l9-9 3 3-9 9H6z" />
    </svg>
  );
}

function ObservationIcon({
  size = 18,
}) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.7"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <circle
        cx="12"
        cy="12"
        r="8"
      />

      <path d="M12 8v5" />
      <path d="M12 16h.01" />
    </svg>
  );
}

function AlertIcon({
  size = 18,
}) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.7"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M12 4l9 16H3L12 4z" />
      <path d="M12 9v5" />
      <path d="M12 17h.01" />
    </svg>
  );
}

function OpenIcon({
  size = 18,
}) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.7"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <circle
        cx="12"
        cy="12"
        r="8"
      />

      <path d="M12 8v4" />
      <path d="M12 16h.01" />
    </svg>
  );
}

function ClosedIcon({
  size = 18,
}) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.7"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <circle
        cx="12"
        cy="12"
        r="8"
      />

      <path d="m8 12 3 3 5-6" />
    </svg>
  );
}

function RefreshIcon() {
  return (
    <svg
      width="15"
      height="15"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M20 11a8 8 0 0 0-15-4" />
      <path d="M5 3v4h4" />
      <path d="M4 13a8 8 0 0 0 15 4" />
      <path d="M19 21v-4h-4" />
    </svg>
  );
}

function FilterIcon() {
  return (
    <svg
      width="15"
      height="15"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.7"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M4 6h16" />
      <path d="M7 12h10" />
      <path d="M10 18h4" />
    </svg>
  );
}

function ArrowRightIcon() {
  return (
    <svg
      width="14"
      height="14"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M5 12h14" />
      <path d="m13 6 6 6-6 6" />
    </svg>
  );
}

function DownloadIcon() {
  return (
    <svg
      width="14"
      height="14"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M12 4v11" />
      <path d="m7 11 5 5 5-5" />
      <path d="M5 20h14" />
    </svg>
  );
}

function BuildingIcon() {
  return (
    <svg
      width="18"
      height="18"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.7"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M4 21V7l8-4 8 4v14" />
      <path d="M8 10h1" />
      <path d="M8 14h1" />
      <path d="M8 18h1" />
      <path d="M15 10h1" />
      <path d="M15 14h1" />
      <path d="M15 18h1" />
    </svg>
  );
}

// ============================================================
// METRIC CARD
// ============================================================

function MetricCard({
  title,
  value,
  subtitle,
  icon,
  iconClass,
  onClick,
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="group rounded-xl border border-[#dfe7ec] bg-white p-4 text-left shadow-[0_1px_2px_rgba(25,55,72,0.025)] transition-all hover:-translate-y-0.5 hover:border-[#c6d8e2] hover:shadow-[0_6px_20px_rgba(25,55,72,0.06)] sm:p-5"
    >
      <div className="flex items-start justify-between gap-3">

        <div className="min-w-0">

          <p className="text-[9px] font-bold uppercase tracking-[0.13em] text-[#84949e]">
            {title}
          </p>

          <p className="mt-2 text-[25px] font-bold tracking-[-0.035em] text-[#253d4c]">
            {formatNumber(value)}
          </p>

          <p className="mt-1 text-[10px] text-[#8998a1]">
            {subtitle}
          </p>

        </div>

        <div
          className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-lg ${iconClass}`}
        >
          {icon}
        </div>

      </div>
    </button>
  );
}

// ============================================================
// SECTION HEADER
// ============================================================

function SectionHeader({
  title,
  description,
  action,
}) {
  return (
    <div className="mb-5 flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">

      <div>

        <h2 className="text-[13px] font-bold text-[#293f4e] sm:text-[14px]">
          {title}
        </h2>

        {description && (
          <p className="mt-1 text-[10px] leading-5 text-[#8998a1] sm:text-[11px]">
            {description}
          </p>
        )}

      </div>

      {action}

    </div>
  );
}

// ============================================================
// EMPTY STATE
// ============================================================

function EmptyState({
  icon,
  text,
}) {
  return (
    <div className="flex min-h-[190px] flex-col items-center justify-center rounded-lg border border-dashed border-[#dce5e9] bg-[#fafcfd] px-5 text-center">

      <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-lg bg-[#eef4f7] text-[#52748a]">
        {icon || (
          <ObservationIcon />
        )}
      </div>

      <p className="max-w-[360px] text-[11px] leading-5 text-[#84939c]">
        {text}
      </p>

    </div>
  );
}

// ============================================================
// MAIN
// ============================================================

export default function AdminReportsPage() {
  const navigate = useNavigate();

  const [plants, setPlants] =
    useState([]);

  const [zones, setZones] =
    useState([]);

  const [audits, setAudits] =
    useState([]);

  const [
    selectedPlant,
    setSelectedPlant,
  ] = useState("");

  const [
    selectedZone,
    setSelectedZone,
  ] = useState("");

  const [
    selectedStatus,
    setSelectedStatus,
  ] = useState("");

  const [dateFrom, setDateFrom] =
    useState("");

  const [dateTo, setDateTo] =
    useState("");

  const [loading, setLoading] =
    useState(true);

  const [error, setError] =
    useState("");

  const [exporting, setExporting] =
    useState(null);

  // ==========================================================
  // LOAD DATA
  // ==========================================================

  const loadData = useCallback(
    async () => {
      setLoading(true);
      setError("");

      try {
        const [
          plantsData,
          zonesData,
          auditsData,
        ] = await Promise.all([
          fetchPlants(true),

          fetchZones(),

          fetchAudits({
            page: 1,
            pageSize: 100,
            sort: "newest",
          }),
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
            auditsData?.items
          )
            ? auditsData.items
            : []
        );
      } catch (err) {
        console.error(err);

        setError(
          err?.response?.data
            ?.detail ||
            "Unable to load report data."
        );
      } finally {
        setLoading(false);
      }
    },
    []
  );

  useEffect(() => {
    loadData();
  }, [loadData]);

  // ==========================================================
  // ZONE MAP
  // ==========================================================

  const zoneMap = useMemo(() => {
    return Object.fromEntries(
      zones.map((zone) => [
        String(zone.id),
        zone,
      ])
    );
  }, [zones]);

  // ==========================================================
  // FILTERED ZONES
  // ==========================================================

  const filteredZones = useMemo(() => {
    if (!selectedPlant) {
      return zones;
    }

    return zones.filter(
      (zone) =>
        String(zone.plant_id) ===
        String(selectedPlant)
    );
  }, [
    zones,
    selectedPlant,
  ]);

  useEffect(() => {
    if (
      selectedZone &&
      !filteredZones.some(
        (zone) =>
          String(zone.id) ===
          String(selectedZone)
      )
    ) {
      setSelectedZone("");
    }
  }, [
    filteredZones,
    selectedZone,
  ]);

  // ==========================================================
  // FILTERED AUDITS
  // ==========================================================

  const filteredAudits = useMemo(() => {
    return audits.filter(
      (audit) => {
        const zone =
          zoneMap[
            String(audit.zone_id)
          ] ||
          audit.zone;

        const plantId =
          zone?.plant_id ||
          zone?.plant?.id ||
          "";

        const zoneId =
          audit.zone_id ||
          audit.zone?.id ||
          "";

        if (
          selectedPlant &&
          String(plantId) !==
            String(selectedPlant)
        ) {
          return false;
        }

        if (
          selectedZone &&
          String(zoneId) !==
            String(selectedZone)
        ) {
          return false;
        }

        if (
          selectedStatus &&
          audit.status !==
            selectedStatus
        ) {
          return false;
        }

        if (dateFrom) {
          const auditDate =
            audit.audit_date?.slice(
              0,
              10
            );

          if (
            !auditDate ||
            auditDate < dateFrom
          ) {
            return false;
          }
        }

        if (dateTo) {
          const auditDate =
            audit.audit_date?.slice(
              0,
              10
            );

          if (
            !auditDate ||
            auditDate > dateTo
          ) {
            return false;
          }
        }

        return true;
      }
    );
  }, [
    audits,
    zoneMap,
    selectedPlant,
    selectedZone,
    selectedStatus,
    dateFrom,
    dateTo,
  ]);

  // ==========================================================
  // METRICS
  // ==========================================================

  const metrics = useMemo(() => {
    const total =
      filteredAudits.length;

    const submitted =
      filteredAudits.filter(
        (audit) =>
          audit.status ===
          "SUBMITTED"
      ).length;

    const ongoing =
      filteredAudits.filter(
        (audit) =>
          audit.status ===
          "IN_PROGRESS"
      ).length;

    const draft =
      filteredAudits.filter(
        (audit) =>
          audit.status ===
          "DRAFT"
      ).length;

    const observations =
      filteredAudits.reduce(
        (sum, audit) =>
          sum +
          Number(
            audit.total_observations ||
              0
          ),
        0
      );

    const high =
      filteredAudits.reduce(
        (sum, audit) =>
          sum +
          Number(
            audit.high_observations ||
              0
          ),
        0
      );

    const medium =
      filteredAudits.reduce(
        (sum, audit) =>
          sum +
          Number(
            audit.medium_observations ||
              0
          ),
        0
      );

    const low =
      filteredAudits.reduce(
        (sum, audit) =>
          sum +
          Number(
            audit.low_observations ||
              0
          ),
        0
      );

    const closed =
      filteredAudits.reduce(
        (sum, audit) =>
          sum +
          Number(
            audit.closed_observations ||
              0
          ),
        0
      );

    const open = Math.max(
      0,
      observations - closed
    );

    return {
      total,
      submitted,
      ongoing,
      draft,
      observations,
      high,
      medium,
      low,
      open,
      closed,
    };
  }, [filteredAudits]);

  // ==========================================================
  // PLANT PERFORMANCE
  // ==========================================================

  const plantPerformance =
    useMemo(() => {
      return plants
        .map((plant) => {
          const plantAudits =
            filteredAudits.filter(
              (audit) => {
                const zone =
                  zoneMap[
                    String(
                      audit.zone_id
                    )
                  ] ||
                  audit.zone;

                return (
                  String(
                    zone?.plant_id
                  ) ===
                    String(
                      plant.id
                    ) ||
                  String(
                    zone?.plant?.id
                  ) ===
                    String(
                      plant.id
                    )
                );
              }
            );

          const submitted =
            plantAudits.filter(
              (audit) =>
                audit.status ===
                "SUBMITTED"
            );

          const totalObservations =
            plantAudits.reduce(
              (sum, audit) =>
                sum +
                Number(
                  audit.total_observations ||
                    0
                ),
              0
            );

          const highObservations =
            plantAudits.reduce(
              (sum, audit) =>
                sum +
                Number(
                  audit.high_observations ||
                    0
                ),
              0
            );

          const scores =
            submitted
              .map((audit) =>
                Number(
                  audit.score ??
                    audit.total_score ??
                    audit.overall_score ??
                    0
                )
              )
              .filter(
                (score) =>
                  Number.isFinite(
                    score
                  ) &&
                  score > 0
              );

          const score =
            scores.length > 0
              ? Math.round(
                  scores.reduce(
                    (
                      sum,
                      value
                    ) =>
                      sum + value,
                    0
                  ) /
                    scores.length
                )
              : 0;

          return {
            ...plant,

            auditCount:
              plantAudits.length,

            submittedCount:
              submitted.length,

            observationCount:
              totalObservations,

            highObservationCount:
              highObservations,

            score,
          };
        })
        .filter(
          (plant) =>
            plant.auditCount >
            0
        )
        .sort(
          (a, b) =>
            b.auditCount -
            a.auditCount
        );
    }, [
      plants,
      filteredAudits,
      zoneMap,
    ]);

  // ==========================================================
  // SEVERITY
  // ==========================================================

  const severityTotal =
    metrics.high +
    metrics.medium +
    metrics.low;

  const highPercent =
    severityTotal > 0
      ? Math.round(
          (metrics.high /
            severityTotal) *
            100
        )
      : 0;

  const mediumPercent =
    severityTotal > 0
      ? Math.round(
          (metrics.medium /
            severityTotal) *
            100
        )
      : 0;

  const lowPercent =
    severityTotal > 0
      ? Math.round(
          (metrics.low /
            severityTotal) *
            100
        )
      : 0;

  // ==========================================================
  // EXPORT
  // ==========================================================

  async function exportAudit(
    auditId,
    type
  ) {
    const key =
      `${auditId}-${type}`;

    try {
      setExporting(key);

      const response =
        await apiClient.get(
          `/audits/${auditId}/export/${type}`,
          {
            responseType: "blob",
          }
        );

      const contentType =
        response.headers[
          "content-type"
        ] ||
        "application/octet-stream";

      const blob = new Blob(
        [response.data],
        {
          type: contentType,
        }
      );

      const url =
        window.URL.createObjectURL(
          blob
        );

      const link =
        document.createElement(
          "a"
        );

      link.href = url;

      const extension =
        type === "pdf"
          ? "pdf"
          : "xlsx";

      link.download =
        `${auditId}-audit-report.${extension}`;

      document.body.appendChild(
        link
      );

      link.click();

      link.remove();

      window.URL.revokeObjectURL(
        url
      );
    } catch (err) {
      console.error(
        "Report export failed:",
        err
      );

      window.alert(
        `Unable to export ${type.toUpperCase()} report.`
      );
    } finally {
      setExporting(null);
    }
  }

  // ==========================================================
  // CLEAR FILTERS
  // ==========================================================

  function clearFilters() {
    setSelectedPlant("");
    setSelectedZone("");
    setSelectedStatus("");
    setDateFrom("");
    setDateTo("");
  }

  const hasFilters =
    Boolean(
      selectedPlant ||
        selectedZone ||
        selectedStatus ||
        dateFrom ||
        dateTo
    );

  // ==========================================================
  // LOADING
  // ==========================================================

  if (loading) {
    return (
      <div className="min-h-full bg-[#f4f7f9]">
        <div className="mx-auto max-w-[1500px] px-5 py-6 sm:px-6 lg:px-8">

          <div className="animate-pulse">

            <div className="h-3 w-28 rounded bg-[#e2e9ed]" />

            <div className="mt-3 h-8 w-36 rounded bg-[#e2e9ed]" />

            <div className="mt-2 h-4 w-96 max-w-full rounded bg-[#e8eef1]" />

            <div className="mt-7 grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-4">

              {Array.from({
                length: 4,
              }).map((_, index) => (
                <div
                  key={index}
                  className="h-28 rounded-xl border border-[#e0e7eb] bg-white"
                />
              ))}

            </div>

            <div className="mt-5 h-64 rounded-xl border border-[#e0e7eb] bg-white" />

            <div className="mt-5 h-80 rounded-xl border border-[#e0e7eb] bg-white" />

          </div>

        </div>
      </div>
    );
  }

  // ==========================================================
  // PAGE
  // ==========================================================

  return (
    <div className="min-h-full bg-[#f4f7f9]">

      <div className="mx-auto max-w-[1500px] px-5 py-6 sm:px-6 lg:px-8 xl:px-10">

        {/* ====================================================
            HEADER
        ==================================================== */}

        <div className="mb-6 flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">

          <div>

            <div className="mb-2 flex items-center gap-2 text-[10px] font-bold uppercase tracking-[0.16em] text-[#83939d]">

              <span>
                Administration
              </span>

              <span className="text-[#b9c4ca]">
                /
              </span>

              <span className="text-[#3d6d8a]">
                Reporting
              </span>

            </div>

            <h1 className="text-[29px] font-bold tracking-[-0.035em] text-[#172d3d]">
              Reports
            </h1>

            <p className="mt-2 max-w-[720px] text-[12px] leading-6 text-[#71828d]">
              Review audit performance, observation
              trends and plant-level activity from one
              management reporting view.
            </p>

          </div>

          <button
            type="button"
            onClick={loadData}
            className="inline-flex h-10 items-center justify-center gap-2 rounded-lg border border-[#d5e0e6] bg-white px-4 text-[11px] font-bold text-[#607480] transition hover:bg-[#f7f9fa]"
          >
            <RefreshIcon />
            Refresh Reports
          </button>

        </div>

        {/* ====================================================
            ERROR
        ==================================================== */}

        {error && (
          <div className="mb-5 flex items-start justify-between gap-4 rounded-lg border border-[#efd4d4] bg-[#fdf3f3] px-4 py-3 text-[11px] font-semibold text-[#a54d4d]">

            <span>
              {error}
            </span>

            <button
              type="button"
              onClick={loadData}
              className="shrink-0 font-bold underline"
            >
              Retry
            </button>

          </div>
        )}

        {/* ====================================================
            FILTER PANEL
        ==================================================== */}

        <section className="mb-5 overflow-hidden rounded-xl border border-[#dfe7ec] bg-white shadow-[0_1px_2px_rgba(25,55,72,0.025)]">

          <div className="flex flex-col gap-3 border-b border-[#e5ebef] px-5 py-4 sm:flex-row sm:items-center sm:justify-between">

            <div className="flex items-center gap-3">

              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#eef5f9] text-[#3d6e8d]">
                <FilterIcon />
              </div>

              <div>

                <h2 className="text-[12px] font-bold text-[#293f4e]">
                  Report Filters
                </h2>

                <p className="mt-0.5 text-[10px] text-[#8998a1]">
                  Refine the reporting dataset.
                </p>

              </div>

            </div>

            {hasFilters && (
              <button
                type="button"
                onClick={
                  clearFilters
                }
                className="text-left text-[10px] font-bold text-[#356d8c] hover:underline sm:text-right"
              >
                Clear all filters
              </button>
            )}

          </div>

          <div className="grid gap-3 p-4 sm:grid-cols-2 lg:grid-cols-5">

            {/* PLANT */}

            <div>
              <label className="mb-1.5 block text-[9px] font-bold uppercase tracking-[0.1em] text-[#83939d]">
                Plant
              </label>

              <select
                value={
                  selectedPlant
                }
                onChange={(event) =>
                  setSelectedPlant(
                    event.target
                      .value
                  )
                }
                className="h-10 w-full rounded-lg border border-[#d7e1e6] bg-white px-3 text-[11px] font-medium text-[#405764] outline-none transition focus:border-[#4d7d98] focus:ring-4 focus:ring-[#e8f1f5]"
              >
                <option value="">
                  All Plants
                </option>

                {plants.map(
                  (plant) => (
                    <option
                      key={
                        plant.id
                      }
                      value={
                        plant.id
                      }
                    >
                      {
                        plant.name
                      }
                    </option>
                  )
                )}

              </select>

            </div>

            {/* ZONE */}

            <div>
              <label className="mb-1.5 block text-[9px] font-bold uppercase tracking-[0.1em] text-[#83939d]">
                Zone
              </label>

              <select
                value={
                  selectedZone
                }
                onChange={(event) =>
                  setSelectedZone(
                    event.target
                      .value
                  )
                }
                className="h-10 w-full rounded-lg border border-[#d7e1e6] bg-white px-3 text-[11px] font-medium text-[#405764] outline-none transition focus:border-[#4d7d98] focus:ring-4 focus:ring-[#e8f1f5]"
              >
                <option value="">
                  All Zones
                </option>

                {filteredZones.map(
                  (zone) => (
                    <option
                      key={
                        zone.id
                      }
                      value={
                        zone.id
                      }
                    >
                      {
                        zone.name
                      }
                    </option>
                  )
                )}

              </select>

            </div>

            {/* STATUS */}

            <div>
              <label className="mb-1.5 block text-[9px] font-bold uppercase tracking-[0.1em] text-[#83939d]">
                Status
              </label>

              <select
                value={
                  selectedStatus
                }
                onChange={(event) =>
                  setSelectedStatus(
                    event.target
                      .value
                  )
                }
                className="h-10 w-full rounded-lg border border-[#d7e1e6] bg-white px-3 text-[11px] font-medium text-[#405764] outline-none transition focus:border-[#4d7d98] focus:ring-4 focus:ring-[#e8f1f5]"
              >
                <option value="">
                  All Status
                </option>

                <option value="SUBMITTED">
                  Submitted
                </option>

                <option value="IN_PROGRESS">
                  In Progress
                </option>

                <option value="DRAFT">
                  Draft
                </option>

              </select>

            </div>

            {/* FROM */}

            <div>
              <label className="mb-1.5 block text-[9px] font-bold uppercase tracking-[0.1em] text-[#83939d]">
                From Date
              </label>

              <input
                type="date"
                value={
                  dateFrom
                }
                onChange={(event) =>
                  setDateFrom(
                    event.target
                      .value
                  )
                }
                className="h-10 w-full rounded-lg border border-[#d7e1e6] bg-white px-3 text-[11px] font-medium text-[#405764] outline-none transition focus:border-[#4d7d98] focus:ring-4 focus:ring-[#e8f1f5]"
              />
            </div>

            {/* TO */}

            <div>
              <label className="mb-1.5 block text-[9px] font-bold uppercase tracking-[0.1em] text-[#83939d]">
                To Date
              </label>

              <input
                type="date"
                value={
                  dateTo
                }
                onChange={(event) =>
                  setDateTo(
                    event.target
                      .value
                  )
                }
                className="h-10 w-full rounded-lg border border-[#d7e1e6] bg-white px-3 text-[11px] font-medium text-[#405764] outline-none transition focus:border-[#4d7d98] focus:ring-4 focus:ring-[#e8f1f5]"
              />
            </div>

          </div>

          <div className="border-t border-[#edf1f3] px-5 py-3">

            <span className="text-[10px] text-[#8797a1]">
              Showing{" "}
              <strong className="font-bold text-[#304856]">
                {filteredAudits.length}
              </strong>{" "}
              of{" "}
              <strong className="font-bold text-[#304856]">
                {audits.length}
              </strong>{" "}
              loaded audits
            </span>

          </div>

        </section>

        {/* ====================================================
            KPI SUMMARY
        ==================================================== */}

        <div className="mb-5 grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-4">

          <MetricCard
            title="Total Audits"
            value={metrics.total}
            subtitle="Matching filters"
            onClick={() =>
              navigate(
                "/admin/audits"
              )
            }
            icon={
              <ReportIcon />
            }
            iconClass="bg-[#eef5f9] text-[#3d6e8d]"
          />

          <MetricCard
            title="Submitted"
            value={
              metrics.submitted
            }
            subtitle="Completed reports"
            onClick={() =>
              navigate(
                "/admin/audits?status=SUBMITTED"
              )
            }
            icon={
              <CheckIcon />
            }
            iconClass="bg-[#eef7f1] text-[#43805e]"
          />

          <MetricCard
            title="In Progress"
            value={
              metrics.ongoing
            }
            subtitle="Active audits"
            onClick={() =>
              navigate(
                "/admin/audits?status=IN_PROGRESS"
              )
            }
            icon={
              <ClockIcon />
            }
            iconClass="bg-[#faf6eb] text-[#9a7838]"
          />

          <MetricCard
            title="Draft"
            value={
              metrics.draft
            }
            subtitle="Not submitted"
            onClick={() =>
              navigate(
                "/admin/audits?status=DRAFT"
              )
            }
            icon={
              <DraftIcon />
            }
            iconClass="bg-[#f2f4f5] text-[#70818a]"
          />

        </div>

        {/* ====================================================
            OBSERVATION SUMMARY
        ==================================================== */}

        <div className="mb-5 grid gap-5 xl:grid-cols-[1.05fr_.95fr]">

          {/* AUDIT WORKFLOW */}

          <section className="rounded-xl border border-[#dfe7ec] bg-white p-5 shadow-[0_1px_2px_rgba(25,55,72,0.025)]">

            <SectionHeader
              title="Audit Workflow"
              description="Current distribution of audits by workflow status."
            />

            <div className="grid gap-6 sm:grid-cols-[180px_1fr] sm:items-center">

              {/* DONUT */}

              <div className="flex justify-center">

                <div
                  className="flex h-[150px] w-[150px] items-center justify-center rounded-full"
                  style={{
                    background:
                      `conic-gradient(
                        #4a7e9b 0 ${
                          metrics.total
                            ? (metrics.submitted /
                                metrics.total) *
                              100
                            : 0
                        }%,
                        #b18a45 ${
                          metrics.total
                            ? (metrics.submitted /
                                metrics.total) *
                              100
                            : 0
                        }% ${
                          metrics.total
                            ? ((metrics.submitted +
                                metrics.ongoing) /
                                metrics.total) *
                              100
                            : 0
                        }%,
                        #d5dde1 ${
                          metrics.total
                            ? ((metrics.submitted +
                                metrics.ongoing) /
                                metrics.total) *
                              100
                            : 0
                        }% 100%
                      )`,
                  }}
                >

                  <div className="flex h-[96px] w-[96px] flex-col items-center justify-center rounded-full bg-white">

                    <span className="text-[25px] font-bold tracking-[-0.04em] text-[#293f4e]">
                      {formatNumber(
                        metrics.total
                      )}
                    </span>

                    <span className="text-[8px] font-bold uppercase tracking-[0.12em] text-[#8998a1]">
                      Audits
                    </span>

                  </div>

                </div>

              </div>

              {/* LEGEND */}

              <div className="space-y-4">

                <div className="flex items-center justify-between gap-4 border-b border-[#edf1f3] pb-3">

                  <div className="flex items-center gap-2">

                    <span className="h-2 w-2 rounded-full bg-[#4a7e9b]" />

                    <span className="text-[11px] font-medium text-[#506671]">
                      Submitted
                    </span>

                  </div>

                  <strong className="text-[12px] text-[#293f4e]">
                    {formatNumber(
                      metrics.submitted
                    )}
                  </strong>

                </div>

                <div className="flex items-center justify-between gap-4 border-b border-[#edf1f3] pb-3">

                  <div className="flex items-center gap-2">

                    <span className="h-2 w-2 rounded-full bg-[#b18a45]" />

                    <span className="text-[11px] font-medium text-[#506671]">
                      In Progress
                    </span>

                  </div>

                  <strong className="text-[12px] text-[#293f4e]">
                    {formatNumber(
                      metrics.ongoing
                    )}
                  </strong>

                </div>

                <div className="flex items-center justify-between gap-4">

                  <div className="flex items-center gap-2">

                    <span className="h-2 w-2 rounded-full bg-[#9aa7ad]" />

                    <span className="text-[11px] font-medium text-[#506671]">
                      Draft
                    </span>

                  </div>

                  <strong className="text-[12px] text-[#293f4e]">
                    {formatNumber(
                      metrics.draft
                    )}
                  </strong>

                </div>

              </div>

            </div>

          </section>

          {/* OBSERVATIONS */}

          <section className="rounded-xl border border-[#dfe7ec] bg-white p-5 shadow-[0_1px_2px_rgba(25,55,72,0.025)]">

            <SectionHeader
              title="Observation Analysis"
              description="Severity and closure status across selected audits."
            />

            <div className="space-y-5">

              {/* HIGH */}

              <div>

                <div className="mb-2 flex items-center justify-between">

                  <span className="text-[10px] font-bold uppercase tracking-[0.08em] text-[#687a84]">
                    High
                  </span>

                  <span className="text-[11px] font-bold text-[#a54d4d]">
                    {formatNumber(
                      metrics.high
                    )}{" "}
                    <span className="ml-1 text-[9px] font-medium text-[#9aa6ad]">
                      ({highPercent}%)
                    </span>
                  </span>

                </div>

                <div className="h-2 overflow-hidden rounded-full bg-[#f0f3f4]">

                  <div
                    className="h-full rounded-full bg-[#b95c5c] transition-all"
                    style={{
                      width: `${highPercent}%`,
                    }}
                  />

                </div>

              </div>

              {/* MEDIUM */}

              <div>

                <div className="mb-2 flex items-center justify-between">

                  <span className="text-[10px] font-bold uppercase tracking-[0.08em] text-[#687a84]">
                    Medium
                  </span>

                  <span className="text-[11px] font-bold text-[#927033]">
                    {formatNumber(
                      metrics.medium
                    )}{" "}
                    <span className="ml-1 text-[9px] font-medium text-[#9aa6ad]">
                      ({mediumPercent}%)
                    </span>
                  </span>

                </div>

                <div className="h-2 overflow-hidden rounded-full bg-[#f0f3f4]">

                  <div
                    className="h-full rounded-full bg-[#b38b42] transition-all"
                    style={{
                      width: `${mediumPercent}%`,
                    }}
                  />

                </div>

              </div>

              {/* LOW */}

              <div>

                <div className="mb-2 flex items-center justify-between">

                  <span className="text-[10px] font-bold uppercase tracking-[0.08em] text-[#687a84]">
                    Low
                  </span>

                  <span className="text-[11px] font-bold text-[#6c7d85]">
                    {formatNumber(
                      metrics.low
                    )}{" "}
                    <span className="ml-1 text-[9px] font-medium text-[#9aa6ad]">
                      ({lowPercent}%)
                    </span>
                  </span>

                </div>

                <div className="h-2 overflow-hidden rounded-full bg-[#f0f3f4]">

                  <div
                    className="h-full rounded-full bg-[#8b999f] transition-all"
                    style={{
                      width: `${lowPercent}%`,
                    }}
                  />

                </div>

              </div>

            </div>

            <div className="mt-6 grid grid-cols-2 gap-3">

              <div className="rounded-lg border border-[#e3e9ec] bg-[#fafcfd] p-4">

                <div className="flex items-center gap-2">

                  <div className="text-[#9a7838]">
                    <OpenIcon size={15} />
                  </div>

                  <span className="text-[9px] font-bold uppercase tracking-[0.1em] text-[#84949e]">
                    Open
                  </span>

                </div>

                <div className="mt-2 text-[21px] font-bold tracking-[-0.03em] text-[#304856]">
                  {formatNumber(
                    metrics.open
                  )}
                </div>

              </div>

              <div className="rounded-lg border border-[#e3e9ec] bg-[#fafcfd] p-4">

                <div className="flex items-center gap-2">

                  <div className="text-[#43805e]">
                    <ClosedIcon size={15} />
                  </div>

                  <span className="text-[9px] font-bold uppercase tracking-[0.1em] text-[#84949e]">
                    Closed
                  </span>

                </div>

                <div className="mt-2 text-[21px] font-bold tracking-[-0.03em] text-[#304856]">
                  {formatNumber(
                    metrics.closed
                  )}
                </div>

              </div>

            </div>

          </section>

        </div>

        {/* ====================================================
            PLANT PERFORMANCE
        ==================================================== */}

        <section className="mb-5 overflow-hidden rounded-xl border border-[#dfe7ec] bg-white shadow-[0_1px_2px_rgba(25,55,72,0.025)]">

          <div className="border-b border-[#e5ebef] px-5 py-4">

            <SectionHeader
              title="Plant Performance"
              description="Audit activity and observation status by plant."
            />

          </div>

          {plantPerformance.length ===
          0 ? (
            <div className="p-4">
              <EmptyState
                icon={
                  <BuildingIcon />
                }
                text="No plant performance data is available for the selected filters."
              />
            </div>
          ) : (

            <div className="divide-y divide-[#edf1f3]">

              {/* TABLE HEADER */}

              <div className="hidden grid-cols-[minmax(220px,1.5fr)_110px_130px_minmax(180px,1fr)_80px] items-center bg-[#f8fafb] px-5 py-3 md:grid">

                <div className="text-[9px] font-bold uppercase tracking-[0.11em] text-[#7d8e98]">
                  Plant
                </div>

                <div className="text-[9px] font-bold uppercase tracking-[0.11em] text-[#7d8e98]">
                  Audits
                </div>

                <div className="text-[9px] font-bold uppercase tracking-[0.11em] text-[#7d8e98]">
                  Observations
                </div>

                <div className="text-[9px] font-bold uppercase tracking-[0.11em] text-[#7d8e98]">
                  Submission
                </div>

                <div className="text-right text-[9px] font-bold uppercase tracking-[0.11em] text-[#7d8e98]">
                  Score
                </div>

              </div>

              {plantPerformance.map(
                (plant) => {
                  const submissionPercent =
                    plant.auditCount
                      ? Math.min(
                          100,
                          (plant.submittedCount /
                            plant.auditCount) *
                            100
                        )
                      : 0;

                  return (
                    <button
                      key={plant.id}
                      type="button"
                      onClick={() =>
                        navigate(
                          `/admin/zones?plant_id=${plant.id}`
                        )
                      }
                      className="group w-full text-left transition hover:bg-[#fbfcfd]"
                    >

                      {/* DESKTOP */}

                      <div className="hidden grid-cols-[minmax(220px,1.5fr)_110px_130px_minmax(180px,1fr)_80px] items-center px-5 py-4 md:grid">

                        <div className="min-w-0">

                          <div className="flex items-center gap-2">

                            <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-[#eef5f9] text-[#47748d]">
                              <BuildingIcon size={16} />
                            </span>

                            <div className="min-w-0">

                              <div className="truncate text-[11px] font-bold text-[#304856] group-hover:text-[#245d80]">
                                {
                                  plant.name
                                }
                              </div>

                              {plant.code && (
                                <div className="mt-0.5 text-[8px] font-bold uppercase tracking-[0.08em] text-[#8b9aa3]">
                                  {
                                    plant.code
                                  }
                                </div>
                              )}

                            </div>

                          </div>

                        </div>

                        <div className="text-[11px] font-bold text-[#506671]">
                          {
                            plant.auditCount
                          }
                        </div>

                        <div>

                          <div className="text-[11px] font-bold text-[#506671]">
                            {
                              plant.observationCount
                            }
                          </div>

                          {plant.highObservationCount >
                            0 && (
                            <div className="mt-0.5 text-[8px] font-semibold text-[#a54d4d]">
                              {
                                plant.highObservationCount
                              }{" "}
                              high
                            </div>
                          )}

                        </div>

                        <div className="pr-6">

                          <div className="mb-1 flex items-center justify-between">

                            <span className="text-[8px] font-semibold text-[#8998a1]">
                              Submitted
                            </span>

                            <span className="text-[9px] font-bold text-[#607480]">
                              {
                                plant.submittedCount
                              }
                              /
                              {
                                plant.auditCount
                              }
                            </span>

                          </div>

                          <div className="h-1.5 overflow-hidden rounded-full bg-[#edf1f3]">

                            <div
                              className="h-full rounded-full bg-[#4d7e99]"
                              style={{
                                width: `${submissionPercent}%`,
                              }}
                            />

                          </div>

                        </div>

                        <div className="text-right">

                          <span className="text-[11px] font-bold text-[#304856]">
                            {plant.score
                              ? `${plant.score}%`
                              : "—"}
                          </span>

                        </div>

                      </div>

                      {/* MOBILE */}

                      <div className="flex items-center gap-3 px-4 py-4 md:hidden">

                        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-[#eef5f9] text-[#47748d]">
                          <BuildingIcon />
                        </div>

                        <div className="min-w-0 flex-1">

                          <div className="truncate text-[11px] font-bold text-[#304856]">
                            {
                              plant.name
                            }
                          </div>

                          <div className="mt-1 text-[9px] text-[#8998a1]">
                            {
                              plant.auditCount
                            }{" "}
                            audits ·{" "}
                            {
                              plant.observationCount
                            }{" "}
                            observations
                          </div>

                          <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-[#edf1f3]">

                            <div
                              className="h-full rounded-full bg-[#4d7e99]"
                              style={{
                                width: `${submissionPercent}%`,
                              }}
                            />

                          </div>

                        </div>

                        <div className="shrink-0 text-right">

                          <div className="text-[11px] font-bold text-[#304856]">
                            {plant.score
                              ? `${plant.score}%`
                              : "—"}
                          </div>

                          <div className="mt-1 text-[#81929d]">
                            <ArrowRightIcon />
                          </div>

                        </div>

                      </div>

                    </button>
                  );
                }
              )}

            </div>
          )}

        </section>

        {/* ====================================================
            RECENT REPORTS
        ==================================================== */}

        <section className="overflow-hidden rounded-xl border border-[#dfe7ec] bg-white shadow-[0_1px_2px_rgba(25,55,72,0.025)]">

          <div className="border-b border-[#e5ebef] px-5 py-4">

            <SectionHeader
              title="Recent Audit Reports"
              description="Open, review or export audit reports."
              action={
                <button
                  type="button"
                  onClick={() =>
                    navigate(
                      "/admin/audits"
                    )
                  }
                  className="text-[10px] font-bold text-[#356d8c] hover:underline"
                >
                  View All Audits →
                </button>
              }
            />

          </div>

          {filteredAudits.length ===
          0 ? (
            <div className="p-4">
              <EmptyState
                icon={
                  <ReportIcon />
                }
                text="No audits match the selected filters."
              />
            </div>
          ) : (

            <div className="divide-y divide-[#edf1f3]">

              {filteredAudits
                .slice(0, 8)
                .map((audit) => {
                  const zone =
                    zoneMap[
                      String(
                        audit.zone_id
                      )
                    ] ||
                    audit.zone;

                  const plant =
                    zone?.plant ||
                    plants.find(
                      (item) =>
                        String(
                          item.id
                        ) ===
                        String(
                          zone?.plant_id
                        )
                    );

                  return (
                    <div
                      key={
                        audit.id
                      }
                      className="group px-4 py-4 transition hover:bg-[#fbfcfd] sm:px-5"
                    >

                      <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">

                        {/* AUDIT INFO */}

                        <button
                          type="button"
                          onClick={() =>
                            navigate(
                              `/admin/audits/${audit.id}`
                            )
                          }
                          className="flex min-w-0 items-start gap-3 text-left"
                        >

                          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-[#eef5f9] text-[#47748d]">
                            <ReportIcon
                              size={17}
                            />
                          </div>

                          <div className="min-w-0">

                            <div className="flex flex-wrap items-center gap-2">

                              <span className="text-[11px] font-bold text-[#315d77]">
                                {
                                  audit.audit_number
                                }
                              </span>

                              <StatusBadge
                                status={
                                  audit.status
                                }
                              />

                            </div>

                            <p className="mt-1.5 truncate text-[10px] font-semibold text-[#536a76]">
                              {plant?.name ||
                                "Plant not assigned"}
                              {" · "}
                              {zone?.name ||
                                "Zone not assigned"}
                            </p>

                            <p className="mt-1 text-[9px] text-[#8b9aa3]">
                              Audit Date:{" "}
                              {formatDate(
                                audit.audit_date
                              )}
                              {" · "}
                              {
                                audit.total_observations ||
                                0
                              }{" "}
                              observations
                            </p>

                          </div>

                        </button>

                        {/* ACTIONS */}

                        <div className="flex flex-wrap items-center gap-2 pl-12 lg:pl-0">

                          <SeverityBadge
                            severity="HIGH"
                            count={Number(
                              audit.high_observations ||
                                0
                            )}
                          />

                          <SeverityBadge
                            severity="MEDIUM"
                            count={Number(
                              audit.medium_observations ||
                                0
                            )}
                          />

                          <SeverityBadge
                            severity="LOW"
                            count={Number(
                              audit.low_observations ||
                                0
                            )}
                          />

                          <button
                            type="button"
                            onClick={() =>
                              navigate(
                                `/admin/audits/${audit.id}`
                              )
                            }
                            className="inline-flex h-8 items-center gap-1.5 rounded-lg border border-[#d5e0e6] bg-white px-3 text-[9px] font-bold text-[#607480] transition hover:bg-[#f6f9fa]"
                          >
                            View
                          </button>

                          <button
                            type="button"
                            disabled={
                              exporting ===
                              `${audit.id}-excel`
                            }
                            onClick={() =>
                              exportAudit(
                                audit.id,
                                "excel"
                              )
                            }
                            className="inline-flex h-8 items-center gap-1.5 rounded-lg border border-[#d5e0e6] bg-white px-3 text-[9px] font-bold text-[#607480] transition hover:bg-[#f6f9fa] disabled:cursor-not-allowed disabled:opacity-50"
                          >
                            <DownloadIcon />

                            {exporting ===
                            `${audit.id}-excel`
                              ? "Exporting..."
                              : "Excel"}
                          </button>

                          <button
                            type="button"
                            disabled={
                              exporting ===
                              `${audit.id}-pdf`
                            }
                            onClick={() =>
                              exportAudit(
                                audit.id,
                                "pdf"
                              )
                            }
                            className="inline-flex h-8 items-center gap-1.5 rounded-lg bg-[#315f79] px-3 text-[9px] font-bold text-white transition hover:bg-[#274f66] disabled:cursor-not-allowed disabled:opacity-50"
                          >
                            <DownloadIcon />

                            {exporting ===
                            `${audit.id}-pdf`
                              ? "Exporting..."
                              : "PDF"}
                          </button>

                        </div>

                      </div>

                    </div>
                  );
                })}

            </div>
          )}

        </section>

        {/* ====================================================
            QUICK ACCESS
        ==================================================== */}

        <div className="mt-5 grid gap-3 sm:grid-cols-3">

          <button
            type="button"
            onClick={() =>
              navigate(
                "/admin/plants"
              )
            }
            className="group rounded-xl border border-[#dfe7ec] bg-white p-5 text-left shadow-[0_1px_2px_rgba(25,55,72,0.025)] transition hover:-translate-y-0.5 hover:border-[#c6d8e2] hover:shadow-[0_5px_18px_rgba(25,55,72,0.05)]"
          >

            <div className="flex items-center justify-between">

              <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-[#eef5f9] text-[#47748d]">
                <BuildingIcon />
              </div>

              <ArrowRightIcon />

            </div>

            <p className="mt-4 text-[12px] font-bold text-[#304856]">
              Plant Management
            </p>

            <p className="mt-1 text-[10px] leading-5 text-[#8998a1]">
              View and manage plant
              structures.
            </p>

          </button>

          <button
            type="button"
            onClick={() =>
              navigate(
                "/admin/zones"
              )
            }
            className="group rounded-xl border border-[#dfe7ec] bg-white p-5 text-left shadow-[0_1px_2px_rgba(25,55,72,0.025)] transition hover:-translate-y-0.5 hover:border-[#c6d8e2] hover:shadow-[0_5px_18px_rgba(25,55,72,0.05)]"
          >

            <div className="flex items-center justify-between">

              <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-[#eef5f9] text-[#47748d]">
                <ReportIcon />
              </div>

              <ArrowRightIcon />

            </div>

            <p className="mt-4 text-[12px] font-bold text-[#304856]">
              Zone Management
            </p>

            <p className="mt-1 text-[10px] leading-5 text-[#8998a1]">
              Explore plant-wise zones
              and activity.
            </p>

          </button>

          <button
            type="button"
            onClick={() =>
              navigate(
                "/admin/audits"
              )
            }
            className="group rounded-xl border border-[#dfe7ec] bg-white p-5 text-left shadow-[0_1px_2px_rgba(25,55,72,0.025)] transition hover:-translate-y-0.5 hover:border-[#c6d8e2] hover:shadow-[0_5px_18px_rgba(25,55,72,0.05)]"
          >

            <div className="flex items-center justify-between">

              <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-[#eef5f9] text-[#47748d]">
                <ReportIcon />
              </div>

              <ArrowRightIcon />

            </div>

            <p className="mt-4 text-[12px] font-bold text-[#304856]">
              Audit Management
            </p>

            <p className="mt-1 text-[10px] leading-5 text-[#8998a1]">
              Search and manage all
              audit records.
            </p>

          </button>

        </div>

      </div>
    </div>
  );
}