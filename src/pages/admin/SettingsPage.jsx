import React, { useEffect, useState } from "react";
import {
  User,
  Lock,
  Bell,
  Building2,
  ClipboardCheck,
  FileBarChart,
  Palette,
  ChevronRight,
  Check,
  Moon,
  Sun,
  Shield,
  Save,
} from "lucide-react";

const STORAGE_KEY = "lean4audit_settings";

const defaultSettings = {
  notifications: {
    auditSubmitted: true,
    newAuditAssigned: true,
    observationAdded: true,
    reportGenerated: true,
    emailNotifications: false,
    inAppNotifications: true,
  },

  audit: {
    requireEvidenceCritical: true,
    allowReopenSubmitted: false,
    autoSave: true,
  },

  reports: {
    defaultFormat: "PDF",
    includeEvidence: true,
    includeObservations: true,
    includeAuditor: true,
  },

  appearance: {
    theme: "light",
    compactMode: false,
  },
};

function Toggle({ checked, onChange }) {
  return (
    <button
      type="button"
      onClick={() => onChange(!checked)}
      className={`relative h-6 w-11 rounded-full transition-all duration-200 ${
        checked ? "bg-blue-600" : "bg-slate-300"
      }`}
    >
      <span
        className={`absolute top-1 h-4 w-4 rounded-full bg-white shadow-sm transition-all duration-200 ${
          checked ? "left-6" : "left-1"
        }`}
      />
    </button>
  );
}

function SettingRow({
  title,
  description,
  checked,
  onChange,
}) {
  return (
    <div className="flex items-center justify-between gap-5 border-b border-slate-100 py-4 last:border-0">
      <div>
        <p className="text-sm font-medium text-slate-800">{title}</p>

        {description && (
          <p className="mt-1 max-w-2xl text-xs leading-5 text-slate-500">
            {description}
          </p>
        )}
      </div>

      <Toggle checked={checked} onChange={onChange} />
    </div>
  );
}

function SectionHeader({ icon: Icon, title, description }) {
  return (
    <div className="mb-5 flex items-start gap-3">
      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-blue-50 text-blue-600">
        <Icon size={19} strokeWidth={2} />
      </div>

      <div>
        <h2 className="text-base font-semibold text-slate-900">
          {title}
        </h2>

        <p className="mt-1 text-xs text-slate-500">
          {description}
        </p>
      </div>
    </div>
  );
}

function SettingsCard({ children }) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
      {children}
    </div>
  );
}

export default function SettingsPage() {
  const [activeSection, setActiveSection] = useState("profile");
  const [saved, setSaved] = useState(false);

  const [settings, setSettings] = useState(defaultSettings);

  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);

      if (stored) {
        setSettings({
          ...defaultSettings,
          ...JSON.parse(stored),
        });
      }
    } catch (error) {
      console.error("Unable to load settings:", error);
    }
  }, []);

  const updateNestedSetting = (section, key, value) => {
    setSettings((prev) => ({
      ...prev,
      [section]: {
        ...prev[section],
        [key]: value,
      },
    }));

    setSaved(false);
  };

  const saveSettings = () => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(settings));

    setSaved(true);

    setTimeout(() => {
      setSaved(false);
    }, 2500);
  };

  const sections = [
    {
      id: "profile",
      label: "My Profile",
      description: "Personal information",
      icon: User,
    },
    {
      id: "security",
      label: "Security",
      description: "Password & sessions",
      icon: Lock,
    },
    {
      id: "notifications",
      label: "Notifications",
      description: "Alerts & notifications",
      icon: Bell,
    },
    {
      id: "organization",
      label: "Organization",
      description: "Company information",
      icon: Building2,
    },
    {
      id: "audit",
      label: "Audit Settings",
      description: "Audit behaviour",
      icon: ClipboardCheck,
    },
    {
      id: "reports",
      label: "Report Settings",
      description: "Report preferences",
      icon: FileBarChart,
    },
    {
      id: "appearance",
      label: "Appearance",
      description: "Display preferences",
      icon: Palette,
    },
  ];

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">

        {/* HEADER */}
        <div className="mb-6">
          <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
            <div>
              <h1 className="text-2xl font-bold tracking-tight text-slate-900">
                Settings
              </h1>

              <p className="mt-1 text-sm text-slate-500">
                Manage your Lean4Audit preferences and configuration.
              </p>
            </div>

            <button
              type="button"
              onClick={saveSettings}
              className="inline-flex items-center justify-center gap-2 rounded-xl bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-blue-700"
            >
              {saved ? (
                <>
                  <Check size={17} />
                  Saved
                </>
              ) : (
                <>
                  <Save size={17} />
                  Save Changes
                </>
              )}
            </button>
          </div>
        </div>

        {/* SETTINGS LAYOUT */}
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-[250px_minmax(0,1fr)]">

          {/* LEFT MENU */}
          <aside className="h-fit rounded-2xl border border-slate-200 bg-white p-2 shadow-sm">
            {sections.map((section) => {
              const Icon = section.icon;
              const active = activeSection === section.id;

              return (
                <button
                  key={section.id}
                  type="button"
                  onClick={() => setActiveSection(section.id)}
                  className={`mb-1 flex w-full items-center gap-3 rounded-xl px-3 py-3 text-left transition last:mb-0 ${
                    active
                      ? "bg-blue-50 text-blue-700"
                      : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
                  }`}
                >
                  <div
                    className={`flex h-9 w-9 items-center justify-center rounded-lg ${
                      active
                        ? "bg-blue-100 text-blue-600"
                        : "bg-slate-100 text-slate-500"
                    }`}
                  >
                    <Icon size={17} />
                  </div>

                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-medium">
                      {section.label}
                    </p>

                    <p
                      className={`truncate text-[11px] ${
                        active
                          ? "text-blue-500"
                          : "text-slate-400"
                      }`}
                    >
                      {section.description}
                    </p>
                  </div>

                  <ChevronRight
                    size={15}
                    className={active ? "text-blue-500" : "text-slate-300"}
                  />
                </button>
              );
            })}
          </aside>

          {/* RIGHT CONTENT */}
          <main className="min-w-0">

            {/* PROFILE */}
            {activeSection === "profile" && (
              <SettingsCard>
                <SectionHeader
                  icon={User}
                  title="My Profile"
                  description="View your account information."
                />

                <div className="grid grid-cols-1 gap-5 md:grid-cols-2">

                  <div>
                    <label className="text-xs font-medium text-slate-600">
                      Full Name
                    </label>

                    <input
                      type="text"
                      placeholder="Your full name"
                      className="mt-1.5 w-full rounded-xl border border-slate-200 bg-slate-50 px-3.5 py-2.5 text-sm text-slate-800 outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-100"
                    />
                  </div>

                  <div>
                    <label className="text-xs font-medium text-slate-600">
                      Employee ID
                    </label>

                    <input
                      type="text"
                      placeholder="Employee ID"
                      className="mt-1.5 w-full rounded-xl border border-slate-200 bg-slate-50 px-3.5 py-2.5 text-sm text-slate-800 outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-100"
                    />
                  </div>

                  <div>
                    <label className="text-xs font-medium text-slate-600">
                      Email
                    </label>

                    <input
                      type="email"
                      placeholder="email@company.com"
                      className="mt-1.5 w-full rounded-xl border border-slate-200 bg-slate-50 px-3.5 py-2.5 text-sm text-slate-800 outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-100"
                    />
                  </div>

                  <div>
                    <label className="text-xs font-medium text-slate-600">
                      Phone
                    </label>

                    <input
                      type="tel"
                      placeholder="+91 XXXXX XXXXX"
                      className="mt-1.5 w-full rounded-xl border border-slate-200 bg-slate-50 px-3.5 py-2.5 text-sm text-slate-800 outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-100"
                    />
                  </div>

                  <div>
                    <label className="text-xs font-medium text-slate-600">
                      Designation
                    </label>

                    <input
                      type="text"
                      placeholder="Designation"
                      className="mt-1.5 w-full rounded-xl border border-slate-200 bg-slate-50 px-3.5 py-2.5 text-sm text-slate-800 outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-100"
                    />
                  </div>

                  <div>
                    <label className="text-xs font-medium text-slate-600">
                      Role
                    </label>

                    <input
                      type="text"
                      value="Administrator"
                      readOnly
                      className="mt-1.5 w-full rounded-xl border border-slate-200 bg-slate-100 px-3.5 py-2.5 text-sm text-slate-500 outline-none"
                    />
                  </div>
                </div>
              </SettingsCard>
            )}

            {/* SECURITY */}
            {activeSection === "security" && (
              <SettingsCard>
                <SectionHeader
                  icon={Lock}
                  title="Security"
                  description="Manage password and account security."
                />

                <div className="space-y-4">

                  <div className="rounded-xl border border-slate-200 p-4">
                    <div className="flex items-start gap-3">
                      <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-blue-50 text-blue-600">
                        <Shield size={17} />
                      </div>

                      <div>
                        <p className="text-sm font-semibold text-slate-800">
                          Change Password
                        </p>

                        <p className="mt-1 text-xs text-slate-500">
                          Update your account password regularly to keep
                          your account secure.
                        </p>
                      </div>
                    </div>

                    <button
                      type="button"
                      className="mt-4 rounded-xl border border-slate-200 px-4 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-50"
                    >
                      Change Password
                    </button>
                  </div>

                  <div className="rounded-xl border border-slate-200 p-4">
                    <p className="text-sm font-semibold text-slate-800">
                      Active Sessions
                    </p>

                    <p className="mt-1 text-xs text-slate-500">
                      Manage devices where your Lean4Audit account is
                      currently signed in.
                    </p>

                    <button
                      type="button"
                      className="mt-4 rounded-xl border border-red-200 px-4 py-2 text-sm font-medium text-red-600 transition hover:bg-red-50"
                    >
                      Logout From All Devices
                    </button>
                  </div>
                </div>
              </SettingsCard>
            )}

            {/* NOTIFICATIONS */}
            {activeSection === "notifications" && (
              <SettingsCard>
                <SectionHeader
                  icon={Bell}
                  title="Notifications"
                  description="Choose which Lean4Audit events should notify you."
                />

                <SettingRow
                  title="Audit Submitted"
                  description="Notify me when an audit is submitted for review."
                  checked={settings.notifications.auditSubmitted}
                  onChange={(value) =>
                    updateNestedSetting(
                      "notifications",
                      "auditSubmitted",
                      value
                    )
                  }
                />

                <SettingRow
                  title="New Audit Assigned"
                  description="Notify me when a new audit is assigned to me."
                  checked={settings.notifications.newAuditAssigned}
                  onChange={(value) =>
                    updateNestedSetting(
                      "notifications",
                      "newAuditAssigned",
                      value
                    )
                  }
                />

                <SettingRow
                  title="Observation Added"
                  description="Notify me when a new observation is added to an audit."
                  checked={settings.notifications.observationAdded}
                  onChange={(value) =>
                    updateNestedSetting(
                      "notifications",
                      "observationAdded",
                      value
                    )
                  }
                />

                <SettingRow
                  title="Report Generated"
                  description="Notify me when an audit report is generated."
                  checked={settings.notifications.reportGenerated}
                  onChange={(value) =>
                    updateNestedSetting(
                      "notifications",
                      "reportGenerated",
                      value
                    )
                  }
                />

                <SettingRow
                  title="Email Notifications"
                  description="Receive important Lean4Audit notifications through email."
                  checked={settings.notifications.emailNotifications}
                  onChange={(value) =>
                    updateNestedSetting(
                      "notifications",
                      "emailNotifications",
                      value
                    )
                  }
                />

                <SettingRow
                  title="In-App Notifications"
                  description="Show notifications inside the Lean4Audit application."
                  checked={settings.notifications.inAppNotifications}
                  onChange={(value) =>
                    updateNestedSetting(
                      "notifications",
                      "inAppNotifications",
                      value
                    )
                  }
                />
              </SettingsCard>
            )}

            {/* ORGANIZATION */}
            {activeSection === "organization" && (
              <SettingsCard>
                <SectionHeader
                  icon={Building2}
                  title="Organization"
                  description="Basic organization information used throughout Lean4Audit."
                />

                <div className="grid grid-cols-1 gap-5 md:grid-cols-2">

                  <div className="md:col-span-2">
                    <label className="text-xs font-medium text-slate-600">
                      Organization Name
                    </label>

                    <input
                      type="text"
                      placeholder="Company name"
                      className="mt-1.5 w-full rounded-xl border border-slate-200 px-3.5 py-2.5 text-sm outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-100"
                    />
                  </div>

                  <div>
                    <label className="text-xs font-medium text-slate-600">
                      Email
                    </label>

                    <input
                      type="email"
                      placeholder="company@example.com"
                      className="mt-1.5 w-full rounded-xl border border-slate-200 px-3.5 py-2.5 text-sm outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-100"
                    />
                  </div>

                  <div>
                    <label className="text-xs font-medium text-slate-600">
                      Phone
                    </label>

                    <input
                      type="tel"
                      placeholder="+91 XXXXX XXXXX"
                      className="mt-1.5 w-full rounded-xl border border-slate-200 px-3.5 py-2.5 text-sm outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-100"
                    />
                  </div>

                  <div>
                    <label className="text-xs font-medium text-slate-600">
                      Website
                    </label>

                    <input
                      type="url"
                      placeholder="https://company.com"
                      className="mt-1.5 w-full rounded-xl border border-slate-200 px-3.5 py-2.5 text-sm outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-100"
                    />
                  </div>

                  <div>
                    <label className="text-xs font-medium text-slate-600">
                      Timezone
                    </label>

                    <select className="mt-1.5 w-full rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 text-sm outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-100">
                      <option>Asia/Kolkata</option>
                      <option>UTC</option>
                    </select>
                  </div>

                  <div className="md:col-span-2">
                    <label className="text-xs font-medium text-slate-600">
                      Address
                    </label>

                    <textarea
                      rows={3}
                      placeholder="Organization address"
                      className="mt-1.5 w-full resize-none rounded-xl border border-slate-200 px-3.5 py-2.5 text-sm outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-100"
                    />
                  </div>
                </div>
              </SettingsCard>
            )}

            {/* AUDIT */}
            {activeSection === "audit" && (
              <SettingsCard>
                <SectionHeader
                  icon={ClipboardCheck}
                  title="Audit Settings"
                  description="Control how audits behave inside Lean4Audit."
                />

                <SettingRow
                  title="Require Evidence for Critical Observations"
                  description="Require supporting evidence before critical observations can be completed."
                  checked={settings.audit.requireEvidenceCritical}
                  onChange={(value) =>
                    updateNestedSetting(
                      "audit",
                      "requireEvidenceCritical",
                      value
                    )
                  }
                />

                <SettingRow
                  title="Allow Reopening Submitted Audits"
                  description="Allow authorized users to reopen an audit after submission."
                  checked={settings.audit.allowReopenSubmitted}
                  onChange={(value) =>
                    updateNestedSetting(
                      "audit",
                      "allowReopenSubmitted",
                      value
                    )
                  }
                />

                <SettingRow
                  title="Auto Save Audit"
                  description="Automatically save audit progress while working."
                  checked={settings.audit.autoSave}
                  onChange={(value) =>
                    updateNestedSetting(
                      "audit",
                      "autoSave",
                      value
                    )
                  }
                />
              </SettingsCard>
            )}

            {/* REPORTS */}
            {activeSection === "reports" && (
              <SettingsCard>
                <SectionHeader
                  icon={FileBarChart}
                  title="Report Settings"
                  description="Configure your default audit report preferences."
                />

                <div className="mb-5">
                  <label className="text-xs font-medium text-slate-600">
                    Default Report Format
                  </label>

                  <select
                    value={settings.reports.defaultFormat}
                    onChange={(e) =>
                      updateNestedSetting(
                        "reports",
                        "defaultFormat",
                        e.target.value
                      )
                    }
                    className="mt-1.5 w-full max-w-sm rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 text-sm outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-100"
                  >
                    <option value="PDF">PDF</option>
                    <option value="EXCEL">Excel</option>
                  </select>
                </div>

                <SettingRow
                  title="Include Evidence"
                  description="Include observation evidence in generated reports."
                  checked={settings.reports.includeEvidence}
                  onChange={(value) =>
                    updateNestedSetting(
                      "reports",
                      "includeEvidence",
                      value
                    )
                  }
                />

                <SettingRow
                  title="Include Observations"
                  description="Include observation details in generated reports."
                  checked={settings.reports.includeObservations}
                  onChange={(value) =>
                    updateNestedSetting(
                      "reports",
                      "includeObservations",
                      value
                    )
                  }
                />

                <SettingRow
                  title="Include Auditor Information"
                  description="Include auditor name and audit information in reports."
                  checked={settings.reports.includeAuditor}
                  onChange={(value) =>
                    updateNestedSetting(
                      "reports",
                      "includeAuditor",
                      value
                    )
                  }
                />
              </SettingsCard>
            )}

            {/* APPEARANCE */}
            {activeSection === "appearance" && (
              <SettingsCard>
                <SectionHeader
                  icon={Palette}
                  title="Appearance"
                  description="Customize the way Lean4Audit looks on your device."
                />

                <div className="mb-6">
                  <p className="mb-3 text-sm font-medium text-slate-800">
                    Theme
                  </p>

                  <div className="grid max-w-xl grid-cols-1 gap-3 sm:grid-cols-2">

                    <button
                      type="button"
                      onClick={() =>
                        updateNestedSetting(
                          "appearance",
                          "theme",
                          "light"
                        )
                      }
                      className={`flex items-center gap-3 rounded-xl border p-4 text-left transition ${
                        settings.appearance.theme === "light"
                          ? "border-blue-400 bg-blue-50"
                          : "border-slate-200 hover:bg-slate-50"
                      }`}
                    >
                      <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-white text-amber-500 shadow-sm">
                        <Sun size={19} />
                      </div>

                      <div>
                        <p className="text-sm font-semibold text-slate-800">
                          Light
                        </p>
                        <p className="text-xs text-slate-500">
                          Clean enterprise interface
                        </p>
                      </div>
                    </button>

                    <button
                      type="button"
                      onClick={() =>
                        updateNestedSetting(
                          "appearance",
                          "theme",
                          "dark"
                        )
                      }
                      className={`flex items-center gap-3 rounded-xl border p-4 text-left transition ${
                        settings.appearance.theme === "dark"
                          ? "border-blue-400 bg-blue-50"
                          : "border-slate-200 hover:bg-slate-50"
                      }`}
                    >
                      <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-slate-900 text-white">
                        <Moon size={18} />
                      </div>

                      <div>
                        <p className="text-sm font-semibold text-slate-800">
                          Dark
                        </p>
                        <p className="text-xs text-slate-500">
                          Reduced brightness interface
                        </p>
                      </div>
                    </button>

                  </div>
                </div>

                <SettingRow
                  title="Compact Mode"
                  description="Use a more compact layout for tables and settings."
                  checked={settings.appearance.compactMode}
                  onChange={(value) =>
                    updateNestedSetting(
                      "appearance",
                      "compactMode",
                      value
                    )
                  }
                />
              </SettingsCard>
            )}

          </main>
        </div>
      </div>
    </div>
  );
}