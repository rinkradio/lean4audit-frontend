import { Link } from 'react-router-dom'

export default function NotFoundPage() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-3 bg-canvas px-4 text-center">
      <div className="mb-2 text-6xl font-black tracking-tight text-line-strong">404</div>
      <h1 className="text-xl font-bold text-ink2">Page not found</h1>
      <p className="max-w-xs text-sm text-ink2-secondary">
        The page you're looking for doesn't exist or has been moved.
      </p>
      <Link
        to="/login"
        className="mt-4 rounded-md bg-brand px-5 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-brand-hover"
      >
        Return to sign in
      </Link>
    </div>
  )
}
