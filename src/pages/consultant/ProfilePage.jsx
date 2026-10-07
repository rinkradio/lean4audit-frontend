import { useAuth } from '../../hooks/useAuth'

export default function ProfilePage() {
  const { user } = useAuth()

  const rows = [
    { label: 'Full Name', value: user?.full_name },
    { label: 'Employee ID', value: user?.employee_id },
    { label: 'Role', value: 'Lean Consultant' },
  ]

  return (
    <div className="mx-auto max-w-xl">
      <h1 className="text-xl font-bold text-ink2 sm:text-2xl">Profile</h1>

      <div className="mt-5 rounded-xl border border-line bg-surface p-6 shadow-xs">
        {rows.map((row) => (
          <div key={row.label} className="flex items-center justify-between border-b border-line py-3 last:border-b-0">
            <span className="text-sm font-medium text-ink2-secondary">{row.label}</span>
            <span className="text-sm font-semibold text-ink2">{row.value}</span>
          </div>
        ))}
      </div>
    </div>
  )
}
