import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'

import { AuthProvider } from './context/AuthContext'
import { ToastProvider } from './context/ToastContext'

import ProtectedRoute from './routes/ProtectedRoute'
import PublicOnlyRoute from './routes/PublicOnlyRoute'

import LoginPage from './pages/LoginPage'
import ConsultantPage from './pages/ConsultantPage'
import NotFoundPage from './pages/NotFoundPage'

import AdminDashboardPage from './pages/admin/AdminDashboardPage'
import AdminLayout from './layouts/AdminLayout'
import AdminReportsPage from './pages/admin/AdminReportsPage'
import SectionPlaceholder from './pages/admin/SectionPlaceholder'
import ConsultantsListPage from './pages/admin/ConsultantsListPage'
import ConsultantDetailPage from './pages/admin/ConsultantDetailPage'
import ZonesPage from './pages/admin/ZonesPage'
import PlantsPage from './pages/admin/PlantsPage'
import AdminAuditsPage from './pages/admin/AdminAuditsPage'
import AuditDetailPage from './pages/admin/AuditDetailPage'

import ConsultantLayout from './layouts/ConsultantLayout'
import ProfilePage from './pages/consultant/ProfilePage'
import ZoneSelectPage from './pages/consultant/ZoneSelectPage'
import AuditInfoPage from './pages/consultant/AuditInfoPage'
import MyAuditsPage from './pages/consultant/MyAuditsPage'
import AuditWorkspacePage from './pages/consultant/AuditWorkspacePage'
import ObservationFormPage from './pages/consultant/ObservationFormPage'
import ObservationTypeSelectionPage from './pages/consultant/ObservationTypeSelectionPage'
import GembaObservationFormPage from './pages/consultant/GembaObservationFormPage'
import SafetyObservationFormPage from './pages/consultant/SafetyObservationFormPage'
import ObservationEditPage from './pages/consultant/ObservationEditPage'
import SettingsPage from "./pages/admin/SettingsPage";


export default function App() {
  return (
    <BrowserRouter>

      <AuthProvider>

        <ToastProvider>

          <Routes>

            {/* -------------------------------------------------
                ROOT
            ------------------------------------------------- */}

            <Route
              path="/"
              element={
                <Navigate
                  to="/login"
                  replace
                />
              }
            />


            {/* -------------------------------------------------
                PUBLIC ROUTES
            ------------------------------------------------- */}

            <Route
              element={
                <PublicOnlyRoute />
              }
            >

              <Route
                path="/login"
                element={<LoginPage />}
              />

            </Route>


            {/* -------------------------------------------------
                ADMIN ROUTES
            ------------------------------------------------- */}

            <Route
              element={
                <ProtectedRoute
                  allowedRoles={['ADMIN']}
                />
              }
            >

              <Route
                path="/admin"
                element={<AdminLayout />}
              >

              <Route
  index
  element={
    <AdminDashboardPage />
  }
/>


                <Route
                  path="consultants"
                  element={
                    <ConsultantsListPage />
                  }
                />


                <Route
                  path="consultants/:id"
                  element={
                    <ConsultantDetailPage />
                  }
                />


                <Route
                  path="clients"
                  element={
                    <SectionPlaceholder
                      title="Clients"
                    />
                  }
                />


                {/* -------------------------------------------------
                    PLANTS
                ------------------------------------------------- */}

                <Route
                  path="plants"
                  element={
                    <PlantsPage />
                  }
                />


                {/* -------------------------------------------------
                    ZONES
                ------------------------------------------------- */}

                <Route
                  path="zones"
                  element={
                    <ZonesPage />
                  }
                />


                {/* -------------------------------------------------
                    AUDITS
                ------------------------------------------------- */}

                <Route
                  path="audits"
                  element={
                    <AdminAuditsPage />
                  }
                />


                <Route
                  path="audits/:auditId"
                  element={
                    <AuditDetailPage />
                  }
                />


                {/* -------------------------------------------------
                    REPORTS
                ------------------------------------------------- */}

                <Route
  path="reports"
  element={
    <AdminReportsPage />
  }
/>


                {/* -------------------------------------------------
                    SETTINGS
                ------------------------------------------------- */}

                <Route
  path="settings"
  element={
    <SettingsPage />
  }
/>

              </Route>

            </Route>


            {/* -------------------------------------------------
                CONSULTANT ROUTES
            ------------------------------------------------- */}

            <Route
              element={
                <ProtectedRoute
                  allowedRoles={['SUB_ADMIN']}
                />
              }
            >

              <Route
                path="/consultant"
                element={<ConsultantLayout />}
              >

                {/* Consultant Dashboard */}

                <Route
                  index
                  element={<ConsultantPage />}
                />


                {/* Profile */}

                <Route
                  path="profile"
                  element={<ProfilePage />}
                />


                {/* -------------------------------------------------
                    MY AUDITS
                ------------------------------------------------- */}

                <Route
                  path="audits"
                  element={<MyAuditsPage />}
                />


                {/* -------------------------------------------------
                    START NEW AUDIT
                ------------------------------------------------- */}

                <Route
                  path="audits/new"
                  element={<ZoneSelectPage />}
                />


                {/* -------------------------------------------------
                    AUDIT INFORMATION
                ------------------------------------------------- */}

                <Route
                  path="audits/new/details"
                  element={<AuditInfoPage />}
                />


                {/* -------------------------------------------------
                    AUDIT WORKSPACE
                ------------------------------------------------- */}

                <Route
                  path="audits/:auditId"
                  element={<AuditWorkspacePage />}
                />


                {/* -------------------------------------------------
                    ADD OBSERVATION
                ------------------------------------------------- */}

                <Route
                  path="audits/:auditId/observations/new"
                  element={<ObservationTypeSelectionPage />}
                />

                <Route
                  path="audits/:auditId/observations/new/5s"
                  element={<ObservationFormPage />}
                />

                <Route
                  path="audits/:auditId/observations/new/gemba"
                  element={<GembaObservationFormPage />}
                />

                <Route
                  path="audits/:auditId/observations/new/safety"
                  element={<SafetyObservationFormPage />}
                />


                {/* -------------------------------------------------
                    EDIT OBSERVATION
                ------------------------------------------------- */}

                <Route
                  path="audits/:auditId/observations/:observationId/edit"
                  element={<ObservationEditPage />}
                />

              </Route>

            </Route>


            {/* -------------------------------------------------
                404
            ------------------------------------------------- */}

            <Route
              path="*"
              element={<NotFoundPage />}
            />

          </Routes>

        </ToastProvider>

      </AuthProvider>

    </BrowserRouter>
  )
}