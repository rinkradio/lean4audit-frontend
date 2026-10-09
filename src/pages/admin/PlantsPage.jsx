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

  // =========================================================
  // LOAD PLANTS
  // =========================================================

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

  // =========================================================
  // FORM
  // =========================================================

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

    setError("");
  };

  const resetForm = () => {
    setForm({ ...emptyForm });
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

  // =========================================================
  // CREATE / UPDATE
  // =========================================================

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

  // =========================================================
  // EDIT
  // =========================================================

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

  // =========================================================
  // DELETE
  // =========================================================

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

  // =========================================================
  // RENDER
  // =========================================================

  return (
    <div className="min-h-full w-full bg-[#f4f7f9]">

      <style>{`

        /* =====================================================
           PAGE
        ===================================================== */

        .plants-page {
          width: 100%;
        }

        .plants-container {
          width: 100%;
          max-width: 1480px;
          margin: 0 auto;
          padding: 28px 40px 40px;
          box-sizing: border-box;
        }

        /* =====================================================
           HEADER
        ===================================================== */

        .plants-header {
          display: flex;
          align-items: flex-end;
          justify-content: space-between;
          gap: 30px;
          margin-bottom: 26px;
        }

        .plants-header-content {
          min-width: 0;
        }

        .plants-breadcrumb {
          display: flex;
          align-items: center;
          gap: 9px;
          margin-bottom: 9px;
          color: #80919d;
          font-size: 10px;
          font-weight: 800;
          letter-spacing: 0.17em;
          text-transform: uppercase;
        }

        .plants-breadcrumb-separator {
          color: #b7c2c9;
        }

        .plants-breadcrumb-current {
          color: #3d6d8a;
        }

        .plants-title {
          margin: 0;
          color: #172d3d;
          font-size: 30px;
          line-height: 1.15;
          font-weight: 750;
          letter-spacing: -0.035em;
        }

        .plants-subtitle {
          max-width: 700px;
          margin: 9px 0 0;
          color: #71828d;
          font-size: 13px;
          line-height: 1.7;
        }

        .add-plant-button {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          gap: 8px;
          flex-shrink: 0;
          height: 40px;
          padding: 0 16px;
          border: 0;
          border-radius: 8px;
          background: #245d80;
          color: #ffffff;
          font-size: 13px;
          font-weight: 700;
          cursor: pointer;
          box-shadow:
            0 1px 2px rgba(16, 42, 59, 0.15);
          transition:
            background 0.18s ease,
            transform 0.18s ease,
            box-shadow 0.18s ease;
        }

        .add-plant-button:hover {
          background: #1e4f6d;
          box-shadow:
            0 4px 12px rgba(16, 42, 59, 0.13);
        }

        .add-plant-button:active {
          transform: translateY(1px);
        }

        .add-plant-icon {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          width: 17px;
          height: 17px;
          border: 1px solid rgba(255,255,255,0.55);
          border-radius: 5px;
          font-size: 14px;
          line-height: 1;
        }

        /* =====================================================
           STAT CARDS
        ===================================================== */

        .plants-stats {
          display: grid;
          grid-template-columns:
            repeat(3, minmax(0, 1fr));
          gap: 14px;
          margin-bottom: 18px;
        }

        .plant-stat-card {
          display: flex;
          align-items: center;
          justify-content: space-between;
          min-height: 92px;
          padding: 17px 19px;
          border: 1px solid #dfe7ec;
          border-radius: 11px;
          background: #ffffff;
          box-shadow:
            0 1px 2px rgba(25, 55, 72, 0.025);
          box-sizing: border-box;
        }

        .plant-stat-label {
          margin-bottom: 7px;
          color: #7d8e99;
          font-size: 10px;
          font-weight: 800;
          letter-spacing: 0.13em;
          text-transform: uppercase;
        }

        .plant-stat-value-row {
          display: flex;
          align-items: baseline;
          gap: 8px;
        }

        .plant-stat-value {
          color: #203746;
          font-size: 25px;
          line-height: 1;
          font-weight: 750;
          letter-spacing: -0.035em;
        }

        .plant-stat-meta {
          color: #96a3ab;
          font-size: 10px;
          font-weight: 600;
        }

        .plant-stat-icon {
          display: flex;
          align-items: center;
          justify-content: center;
          width: 38px;
          height: 38px;
          border-radius: 9px;
          background: #eef5f9;
          color: #3d6e8d;
        }

        .plant-stat-icon.active {
          background: #eef7f1;
          color: #43835f;
        }

        .plant-stat-icon.inactive {
          background: #f3f5f6;
          color: #7c8a92;
        }

        /* =====================================================
           ERROR
        ===================================================== */

        .plants-error {
          display: flex;
          align-items: flex-start;
          gap: 10px;
          margin-bottom: 18px;
          padding: 11px 13px;
          border: 1px solid #f0d4d4;
          border-radius: 9px;
          background: #fff8f8;
          color: #b34a4a;
          font-size: 12px;
          font-weight: 600;
          line-height: 1.5;
        }

        .plants-error-icon {
          display: flex;
          align-items: center;
          justify-content: center;
          width: 18px;
          height: 18px;
          flex-shrink: 0;
          border-radius: 50%;
          background: #f7dddd;
          color: #a53d3d;
          font-size: 11px;
          font-weight: 800;
        }

        /* =====================================================
           MAIN GRID
        ===================================================== */

        .plants-main-grid {
          display: grid;
          grid-template-columns: 330px minmax(0, 1fr);
          gap: 18px;
          align-items: start;
        }

        .plants-card {
          border: 1px solid #dfe7ec;
          border-radius: 12px;
          background: #ffffff;
          box-shadow:
            0 1px 2px rgba(25, 55, 72, 0.025);
          overflow: hidden;
        }

        /* =====================================================
           FORM
        ===================================================== */

        .plant-form-card {
          position: sticky;
          top: 20px;
        }

        .plant-card-header {
          padding: 17px 19px;
          border-bottom: 1px solid #e6ecef;
        }

        .plant-card-title {
          margin: 0;
          color: #293f4e;
          font-size: 13px;
          font-weight: 800;
        }

        .plant-card-description {
          margin: 5px 0 0;
          color: #8a99a2;
          font-size: 11px;
          line-height: 1.5;
        }

        .plant-form-body {
          padding: 19px;
        }

        .plant-field {
          margin-bottom: 16px;
        }

        .plant-label {
          display: block;
          margin-bottom: 7px;
          color: #526672;
          font-size: 10px;
          font-weight: 800;
          letter-spacing: 0.07em;
          text-transform: uppercase;
        }

        .plant-required {
          color: #9b4b4b;
        }

        .plant-input {
          width: 100%;
          min-height: 39px;
          padding: 9px 11px;
          border: 1px solid #d8e2e8;
          border-radius: 8px;
          outline: none;
          background: #fbfcfd;
          color: #253d4c;
          font-family: inherit;
          font-size: 12px;
          font-weight: 500;
          box-sizing: border-box;
          transition:
            border-color 0.18s ease,
            background 0.18s ease,
            box-shadow 0.18s ease;
        }

        .plant-input:hover {
          border-color: #c9d5dc;
        }

        .plant-input:focus {
          border-color: #4c7e9a;
          background: #ffffff;
          box-shadow:
            0 0 0 3px rgba(76, 126, 154, 0.09);
        }

        .plant-input::placeholder {
          color: #a1adb4;
          font-weight: 400;
        }

        .plant-input:disabled {
          cursor: not-allowed;
          opacity: 0.6;
        }

        .plant-code-input {
          text-transform: uppercase;
          letter-spacing: 0.09em;
          font-weight: 700;
        }

        .plant-textarea {
          min-height: 88px;
          resize: vertical;
          line-height: 1.55;
        }

        /* =====================================================
           STATUS SWITCH
        ===================================================== */

        .plant-status-control {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 12px;
          padding: 12px;
          border: 1px solid #e2e8ec;
          border-radius: 8px;
          background: #fafcfd;
        }

        .plant-status-title {
          color: #405663;
          font-size: 11px;
          font-weight: 750;
        }

        .plant-status-description {
          margin-top: 3px;
          color: #8b99a2;
          font-size: 10px;
        }

        .plant-switch {
          position: relative;
          width: 38px;
          height: 21px;
          flex-shrink: 0;
        }

        .plant-switch input {
          position: absolute;
          width: 0;
          height: 0;
          opacity: 0;
        }

        .plant-slider {
          position: absolute;
          inset: 0;
          border-radius: 20px;
          background: #cbd5da;
          cursor: pointer;
          transition: background 0.18s ease;
        }

        .plant-slider::before {
          content: "";
          position: absolute;
          top: 3px;
          left: 3px;
          width: 15px;
          height: 15px;
          border-radius: 50%;
          background: #ffffff;
          box-shadow:
            0 1px 3px rgba(15, 42, 60, 0.18);
          transition: transform 0.18s ease;
        }

        .plant-switch input:checked + .plant-slider {
          background: #3d7b5a;
        }

        .plant-switch input:checked + .plant-slider::before {
          transform: translateX(17px);
        }

        /* =====================================================
           FORM ACTIONS
        ===================================================== */

        .plant-form-actions {
          display: flex;
          gap: 8px;
          margin-top: 18px;
        }

        .plant-primary-button {
          flex: 1;
          min-height: 38px;
          border: 0;
          border-radius: 8px;
          background: #245d80;
          color: #ffffff;
          font-family: inherit;
          font-size: 12px;
          font-weight: 750;
          cursor: pointer;
          transition:
            background 0.18s ease,
            opacity 0.18s ease;
        }

        .plant-primary-button:hover {
          background: #1e4f6d;
        }

        .plant-primary-button:disabled {
          cursor: not-allowed;
          opacity: 0.55;
        }

        .plant-secondary-button {
          min-height: 38px;
          padding: 0 14px;
          border: 1px solid #d5e0e6;
          border-radius: 8px;
          background: #ffffff;
          color: #5b707d;
          font-family: inherit;
          font-size: 12px;
          font-weight: 700;
          cursor: pointer;
        }

        .plant-secondary-button:hover {
          background: #f6f9fa;
        }

        /* =====================================================
           DIRECTORY
        ===================================================== */

        .plant-directory-card {
          min-width: 0;
        }

        .plant-directory-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 20px;
          padding: 16px 19px;
          border-bottom: 1px solid #e5ebef;
        }

        .plant-directory-title {
          margin: 0;
          color: #293f4e;
          font-size: 13px;
          font-weight: 800;
        }

        .plant-directory-subtitle {
          margin: 4px 0 0;
          color: #8a99a2;
          font-size: 10px;
        }

        .plant-directory-count {
          flex-shrink: 0;
          color: #8797a1;
          font-size: 10px;
          font-weight: 700;
        }

        /* =====================================================
           TOOLBAR
        ===================================================== */

        .plant-toolbar {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 12px;
          padding: 12px 19px;
          border-bottom: 1px solid #edf1f3;
          background: #fbfcfd;
        }

        .plant-toolbar-controls {
          display: flex;
          align-items: center;
          gap: 8px;
          width: 100%;
          justify-content: flex-end;
        }

        .plant-search-wrapper {
          position: relative;
          width: 250px;
        }

        .plant-search-icon {
          position: absolute;
          top: 50%;
          left: 11px;
          display: flex;
          transform: translateY(-50%);
          color: #8999a4;
          pointer-events: none;
        }

        .plant-search {
          width: 100%;
          height: 36px;
          padding: 0 11px 0 33px;
          border: 1px solid #d9e2e7;
          border-radius: 8px;
          outline: none;
          background: #ffffff;
          color: #304957;
          font-family: inherit;
          font-size: 11px;
          box-sizing: border-box;
          transition:
            border-color 0.18s ease,
            box-shadow 0.18s ease;
        }

        .plant-search:focus {
          border-color: #4c7e9a;
          box-shadow:
            0 0 0 3px rgba(76, 126, 154, 0.08);
        }

        .plant-search::placeholder {
          color: #9aa7af;
        }

        .plant-filter {
          height: 36px;
          min-width: 115px;
          padding: 0 10px;
          border: 1px solid #d9e2e7;
          border-radius: 8px;
          outline: none;
          background: #ffffff;
          color: #5b707d;
          font-family: inherit;
          font-size: 11px;
          font-weight: 650;
          cursor: pointer;
        }

        .plant-filter:focus {
          border-color: #4c7e9a;
        }

        /* =====================================================
           TABLE
        ===================================================== */

        .plant-table-wrapper {
          overflow-x: auto;
        }

        .plant-table {
          width: 100%;
          min-width: 680px;
          border-collapse: collapse;
          table-layout: fixed;
        }

        .plant-table th {
          padding: 11px 19px;
          border-bottom: 1px solid #e4eaee;
          background: #f8fafb;
          color: #7a8c97;
          font-size: 9px;
          font-weight: 800;
          letter-spacing: 0.12em;
          text-align: left;
          text-transform: uppercase;
          white-space: nowrap;
        }

        .plant-table th:nth-child(1) {
          width: 42%;
        }

        .plant-table th:nth-child(2) {
          width: 19%;
        }

        .plant-table th:nth-child(3) {
          width: 17%;
        }

        .plant-table th:nth-child(4) {
          width: 22%;
          text-align: right;
        }

        .plant-table td {
          padding: 14px 19px;
          border-bottom: 1px solid #edf1f3;
          vertical-align: middle;
        }

        .plant-table tbody tr {
          transition: background 0.14s ease;
        }

        .plant-table tbody tr:hover {
          background: #fbfcfd;
        }

        .plant-table tbody tr:last-child td {
          border-bottom: 0;
        }

        /* =====================================================
           PLANT IDENTITY
        ===================================================== */

        .plant-identity {
          display: flex;
          align-items: center;
          gap: 11px;
          min-width: 0;
        }

        .plant-avatar {
          display: flex;
          align-items: center;
          justify-content: center;
          width: 36px;
          height: 36px;
          flex-shrink: 0;
          border: 1px solid #d7e4eb;
          border-radius: 9px;
          background: #eef5f9;
          color: #35627e;
          font-size: 12px;
          font-weight: 800;
        }

        .plant-identity-content {
          min-width: 0;
        }

        .plant-name {
          overflow: hidden;
          color: #294151;
          font-size: 12px;
          font-weight: 750;
          text-overflow: ellipsis;
          white-space: nowrap;
        }

        .plant-description {
          max-width: 360px;
          margin-top: 3px;
          overflow: hidden;
          color: #8b99a2;
          font-size: 10px;
          line-height: 1.4;
          text-overflow: ellipsis;
          white-space: nowrap;
        }

        /* =====================================================
           CODE
        ===================================================== */

        .plant-code {
          display: inline-flex;
          align-items: center;
          min-height: 26px;
          padding: 0 8px;
          border: 1px solid #dce5ea;
          border-radius: 6px;
          background: #f8fafb;
          color: #4f6876;
          font-size: 10px;
          font-weight: 800;
          letter-spacing: 0.07em;
        }

        /* =====================================================
           STATUS
        ===================================================== */

        .plant-status-badge {
          display: inline-flex;
          align-items: center;
          gap: 6px;
          min-height: 25px;
          padding: 0 9px;
          border-radius: 20px;
          font-size: 10px;
          font-weight: 750;
        }

        .plant-status-dot {
          width: 6px;
          height: 6px;
          border-radius: 50%;
        }

        .plant-status-active {
          background: #edf7f1;
          color: #367955;
        }

        .plant-status-active .plant-status-dot {
          background: #4b9a6d;
        }

        .plant-status-inactive {
          background: #f2f4f5;
          color: #77858d;
        }

        .plant-status-inactive .plant-status-dot {
          background: #9ca7ad;
        }

        /* =====================================================
           ACTIONS
        ===================================================== */

        .plant-actions {
          display: flex;
          justify-content: flex-end;
          gap: 6px;
        }

        .plant-action {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          width: 30px;
          height: 30px;
          border: 1px solid #dce5ea;
          border-radius: 7px;
          background: #ffffff;
          color: #70828e;
          cursor: pointer;
          transition:
            color 0.15s ease,
            background 0.15s ease,
            border-color 0.15s ease;
        }

        .plant-action:hover {
          border-color: #c4d5df;
          background: #f6f9fa;
          color: #2d6788;
        }

        .plant-action.delete:hover {
          border-color: #edcccc;
          background: #fff7f7;
          color: #b54848;
        }

        /* =====================================================
           EMPTY / LOADING
        ===================================================== */

        .plant-empty {
          display: flex;
          min-height: 280px;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          padding: 40px 20px;
          text-align: center;
        }

        .plant-empty-icon {
          display: flex;
          align-items: center;
          justify-content: center;
          width: 46px;
          height: 46px;
          margin-bottom: 12px;
          border: 1px solid #dfe8ed;
          border-radius: 12px;
          background: #f2f7fa;
          color: #58798e;
        }

        .plant-empty-title {
          color: #304856;
          font-size: 13px;
          font-weight: 750;
        }

        .plant-empty-description {
          max-width: 330px;
          margin-top: 5px;
          color: #8998a1;
          font-size: 11px;
          line-height: 1.5;
        }

        .plant-loading {
          display: flex;
          min-height: 280px;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          color: #8797a1;
          font-size: 11px;
          font-weight: 600;
        }

        .plant-spinner {
          width: 22px;
          height: 22px;
          margin-bottom: 11px;
          border: 2px solid #e0e7eb;
          border-top-color: #3d7190;
          border-radius: 50%;
          animation: plant-spin 0.75s linear infinite;
        }

        @keyframes plant-spin {
          to {
            transform: rotate(360deg);
          }
        }

        /* =====================================================
           MOBILE
        ===================================================== */

        @media (max-width: 1180px) {
          .plants-container {
            padding-left: 28px;
            padding-right: 28px;
          }

          .plants-main-grid {
            grid-template-columns: 300px minmax(0, 1fr);
          }
        }

        @media (max-width: 980px) {
          .plants-main-grid {
            grid-template-columns: 1fr;
          }

          .plant-form-card {
            position: static;
          }
        }

        @media (max-width: 720px) {
          .plants-container {
            padding: 20px 16px 30px;
          }

          .plants-header {
            align-items: flex-start;
            flex-direction: column;
            gap: 18px;
          }

          .plants-title {
            font-size: 26px;
          }

          .add-plant-button {
            width: 100%;
          }

          .plants-stats {
            grid-template-columns: 1fr;
          }

          .plant-directory-header {
            align-items: flex-start;
            flex-direction: column;
            gap: 5px;
          }

          .plant-toolbar {
            align-items: stretch;
            flex-direction: column;
          }

          .plant-toolbar-controls {
            flex-direction: column;
            align-items: stretch;
          }

          .plant-search-wrapper {
            width: 100%;
          }

          .plant-filter {
            width: 100%;
          }

          .plant-form-body {
            padding: 16px;
          }

          .plant-card-header {
            padding: 16px;
          }

          .plant-table {
            min-width: 650px;
          }
        }

      `}</style>

      <div className="plants-page">

        <div className="plants-container">

          {/* =================================================
              HEADER
          ================================================= */}

          <div className="plants-header">

            <div className="plants-header-content">

              <div className="plants-breadcrumb">

                <span>
                  Administration
                </span>

                <span className="plants-breadcrumb-separator">
                  /
                </span>

                <span className="plants-breadcrumb-current">
                  Master Data
                </span>

              </div>

              <h1 className="plants-title">
                Plants
              </h1>

              <p className="plants-subtitle">
                Manage manufacturing plants and maintain
                the organizational structure used across
                audits, zones, and operational reporting.
              </p>

            </div>

            <button
              type="button"
              className="add-plant-button"
              onClick={handleAddPlant}
            >
              <span className="add-plant-icon">
                +
              </span>

              Add Plant
            </button>

          </div>

          {/* =================================================
              STATS
          ================================================= */}

          <div className="plants-stats">

            {/* TOTAL */}

            <div className="plant-stat-card">

              <div>

                <div className="plant-stat-label">
                  Total Plants
                </div>

                <div className="plant-stat-value-row">

                  <span className="plant-stat-value">
                    {total}
                  </span>

                  <span className="plant-stat-meta">
                    registered
                  </span>

                </div>

              </div>

              <div className="plant-stat-icon">
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
                  <path d="M3 21h18" />
                  <path d="M5 21V8l7-5 7 5v13" />
                  <path d="M9 21v-5h6v5" />
                  <path d="M9 10h.01" />
                  <path d="M15 10h.01" />
                </svg>
              </div>

            </div>

            {/* ACTIVE */}

            <div className="plant-stat-card">

              <div>

                <div className="plant-stat-label">
                  Active Plants
                </div>

                <div className="plant-stat-value-row">

                  <span className="plant-stat-value">
                    {activeCount}
                  </span>

                  <span className="plant-stat-meta">
                    operational
                  </span>

                </div>

              </div>

              <div className="plant-stat-icon active">
                <span
                  style={{
                    width: 9,
                    height: 9,
                    borderRadius: "50%",
                    background: "#4b9a6d",
                  }}
                />
              </div>

            </div>

            {/* INACTIVE */}

            <div className="plant-stat-card">

              <div>

                <div className="plant-stat-label">
                  Inactive Plants
                </div>

                <div className="plant-stat-value-row">

                  <span className="plant-stat-value">
                    {inactiveCount}
                  </span>

                  <span className="plant-stat-meta">
                    archived
                  </span>

                </div>

              </div>

              <div className="plant-stat-icon inactive">
                <span
                  style={{
                    width: 9,
                    height: 9,
                    borderRadius: "50%",
                    background: "#9ca7ad",
                  }}
                />
              </div>

            </div>

          </div>

          {/* =================================================
              ERROR
          ================================================= */}

          {error && (
            <div className="plants-error">

              <span className="plants-error-icon">
                !
              </span>

              <span>
                {error}
              </span>

            </div>
          )}

          {/* =================================================
              MAIN CONTENT
          ================================================= */}

          <div className="plants-main-grid">

            {/* =================================================
                CREATE / EDIT FORM
            ================================================= */}

            <div className="plants-card plant-form-card">

              <div className="plant-card-header">

                <h2 className="plant-card-title">
                  {editingId
                    ? "Edit Plant"
                    : "Create New Plant"}
                </h2>

                <p className="plant-card-description">
                  Define the basic master information
                  for this manufacturing plant.
                </p>

              </div>

              <div className="plant-form-body">

                <form onSubmit={handleSubmit}>

                  {/* PLANT NAME */}

                  <div className="plant-field">

                    <label className="plant-label">
                      Plant Name{" "}
                      <span className="plant-required">
                        *
                      </span>
                    </label>

                    <input
                      ref={plantNameRef}
                      type="text"
                      name="name"
                      value={form.name}
                      onChange={handleChange}
                      className="plant-input"
                      placeholder="e.g. Chandigarh Manufacturing Plant"
                      disabled={saving}
                    />

                  </div>

                  {/* PLANT CODE */}

                  <div className="plant-field">

                    <label className="plant-label">
                      Plant Code{" "}
                      <span className="plant-required">
                        *
                      </span>
                    </label>

                    <input
                      type="text"
                      name="code"
                      value={form.code}
                      onChange={handleChange}
                      className="plant-input plant-code-input"
                      placeholder="e.g. CHD01"
                      disabled={saving}
                    />

                  </div>

                  {/* DESCRIPTION */}

                  <div className="plant-field">

                    <label className="plant-label">
                      Description
                    </label>

                    <textarea
                      name="description"
                      value={form.description}
                      onChange={handleChange}
                      className="plant-input plant-textarea"
                      placeholder="Briefly describe this manufacturing plant..."
                      disabled={saving}
                    />

                  </div>

                  {/* STATUS */}

                  <div className="plant-status-control">

                    <div>

                      <div className="plant-status-title">
                        Plant Status
                      </div>

                      <div className="plant-status-description">
                        {form.is_active
                          ? "Plant is currently active"
                          : "Plant is currently inactive"}
                      </div>

                    </div>

                    <label className="plant-switch">

                      <input
                        type="checkbox"
                        name="is_active"
                        checked={form.is_active}
                        onChange={handleChange}
                        disabled={saving}
                      />

                      <span className="plant-slider" />

                    </label>

                  </div>

                  {/* ACTIONS */}

                  <div className="plant-form-actions">

                    <button
                      type="submit"
                      className="plant-primary-button"
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
                        className="plant-secondary-button"
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

            {/* =================================================
                DIRECTORY
            ================================================= */}

            <div className="plants-card plant-directory-card">

              {/* DIRECTORY HEADER */}

              <div className="plant-directory-header">

                <div>

                  <h2 className="plant-directory-title">
                    Plant Directory
                  </h2>

                  <p className="plant-directory-subtitle">
                    Registered manufacturing locations
                    and their current operational status.
                  </p>

                </div>

                <div className="plant-directory-count">
                  {total}{" "}
                  {total === 1
                    ? "record"
                    : "records"}
                </div>

              </div>

              {/* TOOLBAR */}

              <div className="plant-toolbar">

                <div />

                <div className="plant-toolbar-controls">

                  {/* SEARCH */}

                  <div className="plant-search-wrapper">

                    <span className="plant-search-icon">

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
                      className="plant-search"
                      placeholder="Search plants..."
                      value={search}
                      onChange={(event) =>
                        setSearch(
                          event.target.value
                        )
                      }
                    />

                  </div>

                  {/* FILTER */}

                  <select
                    className="plant-filter"
                    value={statusFilter}
                    onChange={(event) =>
                      setStatusFilter(
                        event.target.value
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

              {/* =================================================
                  LOADING
              ================================================= */}

              {loading ? (

                <div className="plant-loading">

                  <div className="plant-spinner" />

                  Loading plant directory...

                </div>

              ) : plants.length === 0 ? (

                /* =================================================
                   EMPTY
                ================================================= */

                <div className="plant-empty">

                  <div className="plant-empty-icon">

                    <svg
                      width="21"
                      height="21"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="1.7"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <path d="M3 21h18" />
                      <path d="M5 21V8l7-5 7 5v13" />
                      <path d="M9 21v-5h6v5" />
                      <path d="M9 10h.01" />
                      <path d="M15 10h.01" />
                    </svg>

                  </div>

                  <div className="plant-empty-title">
                    No plants found
                  </div>

                  <div className="plant-empty-description">
                    No plants match the current search
                    or status filter. Try changing the
                    filters or create a new plant.
                  </div>

                </div>

              ) : (

                /* =================================================
                   TABLE
                ================================================= */

                <div className="plant-table-wrapper">

                  <table className="plant-table">

                    <thead>

                      <tr>

                        <th>
                          Plant
                        </th>

                        <th>
                          Plant Code
                        </th>

                        <th>
                          Status
                        </th>

                        <th>
                          Actions
                        </th>

                      </tr>

                    </thead>

                    <tbody>

                      {plants.map((plant) => (

                        <tr key={plant.id}>

                          {/* PLANT */}

                          <td>

                            <div className="plant-identity">

                              <div className="plant-avatar">

                                {plant.name
                                  ?.charAt(0)
                                  ?.toUpperCase() ||
                                  "P"}

                              </div>

                              <div className="plant-identity-content">

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

                          {/* CODE */}

                          <td>

                            <span className="plant-code">
                              {plant.code}
                            </span>

                          </td>

                          {/* STATUS */}

                          <td>

                            <span
                              className={`plant-status-badge ${
                                plant.is_active
                                  ? "plant-status-active"
                                  : "plant-status-inactive"
                              }`}
                            >

                              <span className="plant-status-dot" />

                              {plant.is_active
                                ? "Active"
                                : "Inactive"}

                            </span>

                          </td>

                          {/* ACTIONS */}

                          <td>

                            <div className="plant-actions">

                              {/* EDIT */}

                              <button
                                type="button"
                                className="plant-action"
                                title="Edit plant"
                                aria-label="Edit plant"
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
                                  strokeWidth="1.8"
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                >
                                  <path d="M12 20h9" />

                                  <path d="M16.5 3.5a2.1 2.1 0 0 1 3 3L8 18l-4 1 1-4Z" />
                                </svg>

                              </button>

                              {/* DELETE */}

                              <button
                                type="button"
                                className="plant-action delete"
                                title="Delete plant"
                                aria-label="Delete plant"
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
                                  strokeWidth="1.8"
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
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

                      ))}

                    </tbody>

                  </table>

                </div>

              )}

              {/* =================================================
                  PAGINATION
              ================================================= */}

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

    </div>
  );
}