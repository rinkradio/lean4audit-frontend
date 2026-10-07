import { useEffect, useRef, useState } from "react";
import {
  fetchPlantsPage,
  createPlant,
  updatePlant,
  deletePlant,
} from "../../services/plantService";
import Pagination from "../../components/Pagination";

const emptyForm = {
  name: "",
  code: "",
  description: "",
  is_active: true,
};

export default function PlantsPage() {
  const [plants, setPlants] = useState([]);
  const [total, setTotal] = useState(0);
  const [activeCount, setActiveCount] = useState(0);
  const [inactiveCount, setInactiveCount] = useState(0);
  const [page, setPage] = useState(1);
  const PAGE_SIZE = 10;
  const [form, setForm] = useState(emptyForm);
  const [editingId, setEditingId] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");

  const plantNameRef = useRef(null);

  const loadPlants = async () => {
    try {
      setLoading(true);
      setError("");

      const data = await fetchPlantsPage({
        includeInactive: true,
        search,
        status: statusFilter,
        page,
        pageSize: PAGE_SIZE,
      });

      setPlants(data?.items || []);
      setTotal(Number(data?.total || 0));
      setActiveCount(Number(data?.active_count || 0));
      setInactiveCount(Number(data?.inactive_count || 0));
    } catch (err) {
      console.error(err);

      setError(
        err?.response?.data?.detail ||
          "Unable to load plant data."
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    setPage(1);
  }, [search, statusFilter]);

  useEffect(() => {
    const timer = setTimeout(() => {
      loadPlants();
    }, 250);

    return () => clearTimeout(timer);
  }, [page, search, statusFilter]);

  const handleChange = (event) => {
    const { name, value, type, checked } =
      event.target;

    setForm((prev) => ({
      ...prev,
      [name]:
        type === "checkbox"
          ? checked
          : value,
    }));
  };

  const resetForm = () => {
    setForm(emptyForm);
    setEditingId(null);
    setError("");
  };

  const handleAddPlant = () => {
    setForm({ ...emptyForm });
    setEditingId(null);
    setError("");

    setTimeout(() => {
      plantNameRef.current?.focus();
    }, 100);
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (!form.name.trim()) {
      setError("Plant name is required.");
      plantNameRef.current?.focus();
      return;
    }

    if (!form.code.trim()) {
      setError("Plant code is required.");
      return;
    }

    try {
      setSaving(true);
      setError("");

      const payload = {
        name: form.name.trim(),
        code: form.code.trim().toUpperCase(),
        description:
          form.description.trim() || null,
        is_active: form.is_active,
      };

      if (editingId) {
        await updatePlant(
          editingId,
          payload
        );
      } else {
        await createPlant(payload);
      }

      resetForm();
      await loadPlants();
    } catch (err) {
      console.error(err);

      setError(
        err?.response?.data?.detail ||
          "Unable to save plant."
      );
    } finally {
      setSaving(false);
    }
  };

  const handleEdit = (plant) => {
    setEditingId(plant.id);

    setForm({
      name: plant.name || "",
      code: plant.code || "",
      description:
        plant.description || "",
      is_active:
        plant.is_active ?? true,
    });

    setError("");

    setTimeout(() => {
      plantNameRef.current?.focus();
    }, 100);

    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  };

  const handleDelete = async (plant) => {
    const confirmed = window.confirm(
      `Are you sure you want to delete "${plant.name}"?`
    );

    if (!confirmed) return;

    try {
      setError("");

      await deletePlant(plant.id);

      if (editingId === plant.id) {
        resetForm();
      }

      await loadPlants();
    } catch (err) {
      console.error(err);

      setError(
        err?.response?.data?.detail ||
          "Unable to delete plant."
      );
    }
  };



  return (
    <div className="plants-page">

      <style>{`
        .plants-page {
          min-height: 100%;
          background:
            radial-gradient(
              circle at 90% 0%,
              rgba(37, 99, 235, 0.06),
              transparent 28%
            ),
            #f6f8fb;
          padding: 28px;
        }

        .plants-container {
          max-width: 1500px;
          margin: 0 auto;
        }

        .plants-header {
          display: flex;
          justify-content: space-between;
          align-items: flex-end;
          gap: 24px;
          margin-bottom: 26px;
        }

        .eyebrow {
          display: inline-flex;
          align-items: center;
          gap: 8px;
          color: #2563eb;
          font-size: 11px;
          font-weight: 800;
          letter-spacing: 0.14em;
          text-transform: uppercase;
          margin-bottom: 8px;
        }

        .eyebrow-dot {
          width: 7px;
          height: 7px;
          border-radius: 50%;
          background: #2563eb;
          box-shadow: 0 0 0 4px rgba(37, 99, 235, 0.1);
        }

        .page-title {
          color: #111827;
          font-size: 30px;
          line-height: 1.15;
          font-weight: 800;
          letter-spacing: -0.04em;
          margin: 0;
        }

        .page-subtitle {
          color: #6b7280;
          font-size: 14px;
          margin: 8px 0 0;
        }

        .header-action {
          display: inline-flex;
          align-items: center;
          gap: 9px;
          padding: 11px 17px;
          border: 0;
          border-radius: 10px;
          background: #111827;
          color: #fff;
          font-size: 13px;
          font-weight: 700;
          cursor: pointer;
          box-shadow: 0 8px 20px rgba(17, 24, 39, 0.12);
          transition: 0.2s ease;
        }

        .header-action:hover {
          transform: translateY(-1px);
          background: #1f2937;
        }

        .header-action:active {
          transform: translateY(0);
        }

        .stats-grid {
          display: grid;
          grid-template-columns:
            repeat(3, minmax(0, 1fr));
          gap: 16px;
          margin-bottom: 22px;
        }

        .stat-card {
          position: relative;
          overflow: hidden;
          background: #fff;
          border: 1px solid #e7ebf1;
          border-radius: 14px;
          padding: 18px 20px;
          box-shadow:
            0 2px 5px rgba(15, 23, 42, 0.025),
            0 10px 30px rgba(15, 23, 42, 0.035);
        }

        .stat-card::after {
          content: "";
          position: absolute;
          width: 80px;
          height: 80px;
          right: -28px;
          bottom: -35px;
          border-radius: 50%;
          background: rgba(37, 99, 235, 0.06);
        }

        .stat-label {
          color: #6b7280;
          font-size: 12px;
          font-weight: 700;
          margin-bottom: 7px;
        }

        .stat-value {
          color: #111827;
          font-size: 26px;
          font-weight: 800;
          letter-spacing: -0.03em;
        }

        .stat-meta {
          color: #9ca3af;
          font-size: 11px;
          margin-left: 7px;
          font-weight: 500;
        }

        .main-grid {
          display: grid;
          grid-template-columns: 350px minmax(0, 1fr);
          gap: 20px;
          align-items: start;
        }

        .enterprise-card {
          background: #fff;
          border: 1px solid #e7ebf1;
          border-radius: 15px;
          box-shadow:
            0 2px 5px rgba(15, 23, 42, 0.025),
            0 14px 35px rgba(15, 23, 42, 0.035);
        }

        .form-card {
          position: sticky;
          top: 20px;
          overflow: hidden;
        }

        .card-header {
          padding: 18px 20px;
          border-bottom: 1px solid #edf0f4;
        }

        .card-title {
          color: #111827;
          font-size: 14px;
          font-weight: 800;
          margin: 0;
        }

        .card-description {
          color: #9ca3af;
          font-size: 11px;
          margin: 5px 0 0;
        }

        .form-body {
          padding: 20px;
        }

        .form-label-custom {
          display: block;
          color: #374151;
          font-size: 11px;
          font-weight: 800;
          margin-bottom: 7px;
          text-transform: uppercase;
          letter-spacing: 0.04em;
        }

        .custom-input {
          width: 100%;
          border: 1px solid #dfe4ea;
          border-radius: 9px;
          background: #fbfcfd;
          color: #111827;
          font-size: 13px;
          padding: 10px 12px;
          outline: none;
          transition: 0.2s ease;
          box-sizing: border-box;
        }

        .custom-input:focus {
          background: #fff;
          border-color: #2563eb;
          box-shadow:
            0 0 0 3px
            rgba(37, 99, 235, 0.09);
        }

        .custom-input::placeholder {
          color: #b0b7c3;
        }

        .custom-textarea {
          min-height: 92px;
          resize: vertical;
        }

        .code-input {
          text-transform: uppercase;
          letter-spacing: 0.08em;
          font-weight: 700;
        }

        .status-toggle {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 12px;
          padding: 12px 13px;
          border: 1px solid #e7ebf1;
          border-radius: 9px;
          background: #fafbfc;
          margin-top: 18px;
        }

        .status-toggle-title {
          color: #374151;
          font-size: 12px;
          font-weight: 700;
        }

        .status-toggle-subtitle {
          color: #9ca3af;
          font-size: 10px;
          margin-top: 2px;
        }

        .switch {
          position: relative;
          width: 40px;
          height: 22px;
          flex-shrink: 0;
        }

        .switch input {
          opacity: 0;
          width: 0;
          height: 0;
        }

        .slider {
          position: absolute;
          inset: 0;
          cursor: pointer;
          background: #d1d5db;
          border-radius: 30px;
          transition: 0.2s ease;
        }

        .slider::before {
          content: "";
          position: absolute;
          width: 16px;
          height: 16px;
          left: 3px;
          top: 3px;
          background: #fff;
          border-radius: 50%;
          box-shadow: 0 1px 3px rgba(0,0,0,0.2);
          transition: 0.2s ease;
        }

        .switch input:checked + .slider {
          background: #2563eb;
        }

        .switch input:checked + .slider::before {
          transform: translateX(18px);
        }

        .form-actions {
          display: flex;
          gap: 8px;
          margin-top: 20px;
        }

        .btn-primary-custom {
          flex: 1;
          border: 0;
          border-radius: 9px;
          background: #2563eb;
          color: #fff;
          padding: 10px 14px;
          font-size: 12px;
          font-weight: 800;
          cursor: pointer;
          transition: 0.2s ease;
        }

        .btn-primary-custom:hover {
          background: #1d4ed8;
        }

        .btn-primary-custom:disabled,
        .btn-secondary-custom:disabled {
          opacity: 0.6;
          cursor: not-allowed;
        }

        .btn-secondary-custom {
          border: 1px solid #dfe4ea;
          border-radius: 9px;
          background: #fff;
          color: #4b5563;
          padding: 10px 14px;
          font-size: 12px;
          font-weight: 700;
          cursor: pointer;
        }

        .btn-secondary-custom:hover {
          background: #f8fafc;
        }

        .alert-custom {
          padding: 10px 12px;
          margin-bottom: 16px;
          border: 1px solid #fecaca;
          border-radius: 9px;
          background: #fff7f7;
          color: #b91c1c;
          font-size: 11px;
          font-weight: 600;
        }

        .table-card {
          min-width: 0;
          overflow: hidden;
        }

        .toolbar {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 15px;
          padding: 17px 20px;
          border-bottom: 1px solid #edf0f4;
        }

        .toolbar-title {
          color: #111827;
          font-size: 14px;
          font-weight: 800;
          margin: 0;
        }

        .toolbar-count {
          color: #9ca3af;
          font-size: 11px;
          margin-top: 4px;
        }

        .toolbar-controls {
          display: flex;
          gap: 8px;
        }

        .search-box {
          position: relative;
        }

        .search-icon {
          position: absolute;
          left: 11px;
          top: 50%;
          transform: translateY(-50%);
          color: #9ca3af;
          pointer-events: none;
        }

        .search-input {
          width: 210px;
          border: 1px solid #e1e6ec;
          border-radius: 8px;
          padding: 8px 10px 8px 32px;
          outline: none;
          font-size: 11px;
          color: #374151;
          background: #fafbfc;
        }

        .search-input:focus {
          border-color: #2563eb;
          background: #fff;
        }

        .filter-select {
          border: 1px solid #e1e6ec;
          border-radius: 8px;
          padding: 8px 10px;
          outline: none;
          font-size: 11px;
          color: #4b5563;
          background: #fff;
          cursor: pointer;
        }

        .table-wrap {
          overflow-x: auto;
        }

        .enterprise-table {
          width: 100%;
          border-collapse: collapse;
          min-width: 650px;
        }

        .enterprise-table thead th {
          padding: 11px 20px;
          background: #fafbfc;
          color: #8b95a5;
          font-size: 9px;
          font-weight: 800;
          letter-spacing: 0.08em;
          text-transform: uppercase;
          border-bottom: 1px solid #edf0f4;
          white-space: nowrap;
        }

        .enterprise-table tbody td {
          padding: 14px 20px;
          border-bottom: 1px solid #f0f2f5;
          vertical-align: middle;
        }

        .enterprise-table tbody tr {
          transition: 0.15s ease;
        }

        .enterprise-table tbody tr:hover {
          background: #fbfcfe;
        }

        .plant-identity {
          display: flex;
          align-items: center;
          gap: 11px;
        }

        .plant-avatar {
          width: 36px;
          height: 36px;
          flex-shrink: 0;
          display: flex;
          align-items: center;
          justify-content: center;
          border-radius: 9px;
          background: #eff6ff;
          color: #2563eb;
          font-size: 13px;
          font-weight: 900;
          border: 1px solid #dbeafe;
        }

        .plant-name {
          color: #1f2937;
          font-size: 12px;
          font-weight: 800;
        }

        .plant-description {
          max-width: 280px;
          overflow: hidden;
          text-overflow: ellipsis;
          white-space: nowrap;
          color: #9ca3af;
          font-size: 10px;
          margin-top: 3px;
        }

        .plant-code {
          display: inline-flex;
          align-items: center;
          padding: 5px 8px;
          border: 1px solid #e5e7eb;
          border-radius: 6px;
          background: #f9fafb;
          color: #4b5563;
          font-size: 10px;
          font-weight: 800;
          letter-spacing: 0.06em;
        }

        .status-badge {
          display: inline-flex;
          align-items: center;
          gap: 5px;
          padding: 5px 8px;
          border-radius: 20px;
          font-size: 9px;
          font-weight: 800;
        }

        .status-dot {
          width: 5px;
          height: 5px;
          border-radius: 50%;
        }

        .status-active {
          background: #ecfdf3;
          color: #15803d;
        }

        .status-active .status-dot {
          background: #22c55e;
        }

        .status-inactive {
          background: #f3f4f6;
          color: #6b7280;
        }

        .status-inactive .status-dot {
          background: #9ca3af;
        }

        .row-actions {
          display: flex;
          justify-content: flex-end;
          gap: 6px;
        }

        .icon-action {
          width: 30px;
          height: 30px;
          display: inline-flex;
          align-items: center;
          justify-content: center;
          border: 1px solid #e5e7eb;
          border-radius: 7px;
          background: #fff;
          color: #6b7280;
          cursor: pointer;
          transition: 0.15s ease;
        }

        .icon-action:hover {
          background: #f8fafc;
          color: #2563eb;
          border-color: #bfdbfe;
        }

        .icon-action.delete:hover {
          color: #dc2626;
          border-color: #fecaca;
          background: #fff7f7;
        }

        .empty-state {
          padding: 60px 20px;
          text-align: center;
        }

        .empty-icon {
          width: 48px;
          height: 48px;
          display: inline-flex;
          align-items: center;
          justify-content: center;
          border-radius: 13px;
          background: #f1f5f9;
          color: #64748b;
          margin-bottom: 12px;
        }

        .empty-title {
          color: #374151;
          font-size: 13px;
          font-weight: 800;
        }

        .empty-text {
          color: #9ca3af;
          font-size: 11px;
          margin-top: 4px;
        }

        .loading-state {
          padding: 65px 20px;
          text-align: center;
          color: #9ca3af;
          font-size: 11px;
        }

        .spinner {
          width: 24px;
          height: 24px;
          border: 2px solid #e5e7eb;
          border-top-color: #2563eb;
          border-radius: 50%;
          animation: spin 0.7s linear infinite;
          margin: 0 auto 10px;
        }

        @keyframes spin {
          to {
            transform: rotate(360deg);
          }
        }

        @media (max-width: 1100px) {
          .main-grid {
            grid-template-columns: 1fr;
          }

          .form-card {
            position: static;
          }
        }

        @media (max-width: 700px) {
          .plants-page {
            padding: 16px;
          }

          .plants-header {
            align-items: flex-start;
            flex-direction: column;
          }

          .stats-grid {
            grid-template-columns: 1fr;
          }

          .toolbar {
            align-items: flex-start;
            flex-direction: column;
          }

          .toolbar-controls {
            width: 100%;
          }

          .search-box,
          .search-input {
            width: 100%;
          }

          .filter-select {
            width: 130px;
          }
        }
      `}</style>

      <div className="plants-container">

        <div className="plants-header">
          <div>
            <div className="eyebrow">
              <span className="eyebrow-dot" />
              Master Data
            </div>

            <h1 className="page-title">
              Plant Management
            </h1>

            <p className="page-subtitle">
              Configure manufacturing plants and
              maintain your organizational hierarchy.
            </p>
          </div>

          <button
            type="button"
            className="header-action"
            onClick={handleAddPlant}
          >
            <span style={{ fontSize: 17 }}>
              +
            </span>
            Add Plant
          </button>
        </div>

        <div className="stats-grid">

          <div className="stat-card">
            <div className="stat-label">
              Total Plants
            </div>

            <div className="stat-value">
              {total}
            </div>
          </div>

          <div className="stat-card">
            <div className="stat-label">
              Active Plants
            </div>

            <div className="stat-value">
              {activeCount}

              <span className="stat-meta">
                operational
              </span>
            </div>
          </div>

          <div className="stat-card">
            <div className="stat-label">
              Inactive Plants
            </div>

            <div className="stat-value">
              {inactiveCount}

              <span className="stat-meta">
                archived
              </span>
            </div>
          </div>

        </div>

        {error && (
          <div className="alert-custom">
            {error}
          </div>
        )}

        <div className="main-grid">

          <div className="enterprise-card form-card">

            <div className="card-header">
              <h2 className="card-title">
                {editingId
                  ? "Edit Plant"
                  : "Create New Plant"}
              </h2>

              <p className="card-description">
                Define the basic plant master information.
              </p>
            </div>

            <div className="form-body">

              <form onSubmit={handleSubmit}>

                <div style={{ marginBottom: 17 }}>
                  <label className="form-label-custom">
                    Plant Name
                  </label>

                  <input
                    ref={plantNameRef}
                    type="text"
                    name="name"
                    value={form.name}
                    onChange={handleChange}
                    className="custom-input"
                    placeholder="e.g. Chandigarh Manufacturing Plant"
                    disabled={saving}
                  />
                </div>

                <div style={{ marginBottom: 17 }}>
                  <label className="form-label-custom">
                    Plant Code
                  </label>

                  <input
                    type="text"
                    name="code"
                    value={form.code}
                    onChange={handleChange}
                    className="custom-input code-input"
                    placeholder="e.g. CHD01"
                    disabled={saving}
                  />
                </div>

                <div>
                  <label className="form-label-custom">
                    Description
                  </label>

                  <textarea
                    name="description"
                    value={form.description}
                    onChange={handleChange}
                    className="custom-input custom-textarea"
                    placeholder="Briefly describe this manufacturing plant..."
                    disabled={saving}
                  />
                </div>

                <div className="status-toggle">
                  <div>
                    <div className="status-toggle-title">
                      Plant Status
                    </div>

                    <div className="status-toggle-subtitle">
                      {form.is_active
                        ? "Plant is currently active"
                        : "Plant is currently inactive"}
                    </div>
                  </div>

                  <label className="switch">
                    <input
                      type="checkbox"
                      name="is_active"
                      checked={form.is_active}
                      onChange={handleChange}
                      disabled={saving}
                    />

                    <span className="slider" />
                  </label>
                </div>

                <div className="form-actions">

                  <button
                    type="submit"
                    className="btn-primary-custom"
                    disabled={saving}
                  >
                    {saving
                      ? "Saving..."
                      : editingId
                      ? "Update Plant"
                      : "Create Plant"}
                  </button>

                  {editingId && (
                    <button
                      type="button"
                      className="btn-secondary-custom"
                      onClick={resetForm}
                      disabled={saving}
                    >
                      Cancel
                    </button>
                  )}

                </div>

              </form>

            </div>
          </div>

          <div className="enterprise-card table-card">

            <div className="toolbar">

              <div>
                <h2 className="toolbar-title">
                  Plant Directory
                </h2>

                <div className="toolbar-count">
                  Showing {plants.length} of{" "}
                  {total} plants
                </div>
              </div>

              <div className="toolbar-controls">

                <div className="search-box">
                  <span className="search-icon">
                    <svg
                      width="13"
                      height="13"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                    >
                      <circle
                        cx="11"
                        cy="11"
                        r="7"
                      />
                      <path d="m20 20-4-4" />
                    </svg>
                  </span>

                  <input
                    type="text"
                    className="search-input"
                    placeholder="Search plants..."
                    value={search}
                    onChange={(e) =>
                      setSearch(e.target.value)
                    }
                  />
                </div>

                <select
                  className="filter-select"
                  value={statusFilter}
                  onChange={(e) =>
                    setStatusFilter(
                      e.target.value
                    )
                  }
                >
                  <option value="all">
                    All Status
                  </option>

                  <option value="active">
                    Active
                  </option>

                  <option value="inactive">
                    Inactive
                  </option>
                </select>

              </div>

            </div>

            {loading ? (
              <div className="loading-state">
                <div className="spinner" />
                Loading plant directory...
              </div>
            ) : plants.length === 0 ? (
              <div className="empty-state">

                <div className="empty-icon">
                  <svg
                    width="22"
                    height="22"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="1.7"
                  >
                    <path d="M3 21h18" />
                    <path d="M5 21V8l7-5 7 5v13" />
                    <path d="M9 21v-5h6v5" />
                    <path d="M9 10h.01" />
                    <path d="M15 10h.01" />
                  </svg>
                </div>

                <div className="empty-title">
                  No plants found
                </div>

                <div className="empty-text">
                  Try changing your search or create
                  your first plant.
                </div>

              </div>
            ) : (
              <div className="table-wrap">

                <table className="enterprise-table">

                  <thead>
                    <tr>
                      <th>Plant</th>
                      <th>Plant Code</th>
                      <th>Status</th>

                      <th
                        style={{
                          textAlign: "right",
                        }}
                      >
                        Actions
                      </th>
                    </tr>
                  </thead>

                  <tbody>

                    {plants.map(
                      (plant) => (
                        <tr key={plant.id}>

                          <td>
                            <div className="plant-identity">

                              <div className="plant-avatar">
                                {plant.name
                                  ?.charAt(0)
                                  ?.toUpperCase() ||
                                  "P"}
                              </div>

                              <div>
                                <div className="plant-name">
                                  {plant.name}
                                </div>

                                {plant.description && (
                                  <div className="plant-description">
                                    {plant.description}
                                  </div>
                                )}
                              </div>

                            </div>
                          </td>

                          <td>
                            <span className="plant-code">
                              {plant.code}
                            </span>
                          </td>

                          <td>
                            <span
                              className={`status-badge ${
                                plant.is_active
                                  ? "status-active"
                                  : "status-inactive"
                              }`}
                            >
                              <span className="status-dot" />

                              {plant.is_active
                                ? "Active"
                                : "Inactive"}
                            </span>
                          </td>

                          <td>
                            <div className="row-actions">

                              <button
                                type="button"
                                className="icon-action"
                                title="Edit plant"
                                onClick={() =>
                                  handleEdit(
                                    plant
                                  )
                                }
                              >
                                <svg
                                  width="14"
                                  height="14"
                                  viewBox="0 0 24 24"
                                  fill="none"
                                  stroke="currentColor"
                                  strokeWidth="2"
                                >
                                  <path d="M12 20h9" />
                                  <path d="M16.5 3.5a2.1 2.1 0 0 1 3 3L8 18l-4 1 1-4Z" />
                                </svg>
                              </button>

                              <button
                                type="button"
                                className="icon-action delete"
                                title="Delete plant"
                                onClick={() =>
                                  handleDelete(
                                    plant
                                  )
                                }
                              >
                                <svg
                                  width="14"
                                  height="14"
                                  viewBox="0 0 24 24"
                                  fill="none"
                                  stroke="currentColor"
                                  strokeWidth="2"
                                >
                                  <path d="M3 6h18" />
                                  <path d="M8 6V4h8v2" />
                                  <path d="M19 6l-1 14H6L5 6" />
                                  <path d="M10 11v5" />
                                  <path d="M14 11v5" />
                                </svg>
                              </button>

                            </div>
                          </td>

                        </tr>
                      )
                    )}

                  </tbody>

                </table>

              </div>
            )}

            <Pagination
              page={page}
              pageSize={PAGE_SIZE}
              total={total}
              onPageChange={setPage}
              disabled={loading}
            />

          </div>

        </div>

      </div>
    </div>
  );
}