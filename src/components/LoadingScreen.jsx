export default function LoadingScreen() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-canvas">
      <div
        className="h-9 w-9 animate-spin rounded-full border-[3px] border-line border-t-brand"
        aria-label="Loading"
        role="status"
      />
    </div>
  )
}
