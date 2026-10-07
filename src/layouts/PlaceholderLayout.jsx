import { useAuth } from '../hooks/useAuth'

export default function PlaceholderLayout({ roleLabel, roleValue }) {
  const { user, logout } = useAuth()

  return (
    <div className="flex min-h-screen flex-col bg-canvas">
      <header className="flex items-center justify-between border-b border-line bg-surface px-4 py-4 sm:px-8">
        <div className="text-sm font-bold tracking-widest text-ink2">LEAN4AUDIT</div>
        <button
          className="rounded-md border border-line-strong px-4 py-2 text-sm font-medium text-ink2-secondary transition-colors hover:bg-canvas"
          onClick={logout}
        >
          Logout
        </button>
      </header>

      <main className="flex flex-1 items-center justify-center px-4 py-10">
        <div className="w-full max-w-md animate-slide-up rounded-xl border border-line bg-surface p-8 text-center shadow-card sm:p-10">
          <h1 className="text-xl font-bold text-ink2 sm:text-2xl">{roleLabel}</h1>
          <p className="mt-3 text-sm text-ink2-secondary">
            Welcome to Lean Audit Management System.
          </p>
          <p className="mt-1 text-sm font-medium text-success">Authentication successful.</p>
          <p className="mt-4 text-xs text-ink2-muted">
            Role: {roleValue} &middot; Signed in as {user?.full_name}
          </p>
        </div>
      </main>
    </div>
  )
}
