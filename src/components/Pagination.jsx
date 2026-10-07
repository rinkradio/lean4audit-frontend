import { ChevronLeft, ChevronRight } from 'lucide-react'

export default function Pagination({
  page = 1,
  pageSize = 10,
  total = 0,
  onPageChange,
  disabled = false,
  className = '',
}) {
  const totalPages = Math.max(1, Math.ceil(total / pageSize))

  if (totalPages <= 1) return null

  const safePage = Math.min(Math.max(page, 1), totalPages)

  const pages = []
  const maxVisible = 5

  if (totalPages <= maxVisible) {
    for (let value = 1; value <= totalPages; value += 1) {
      pages.push(value)
    }
  } else {
    pages.push(1)

    let start = Math.max(2, safePage - 1)
    let end = Math.min(totalPages - 1, safePage + 1)

    if (safePage <= 3) {
      start = 2
      end = 4
    }

    if (safePage >= totalPages - 2) {
      start = totalPages - 3
      end = totalPages - 1
    }

    if (start > 2) pages.push('left-ellipsis')

    for (let value = start; value <= end; value += 1) {
      pages.push(value)
    }

    if (end < totalPages - 1) pages.push('right-ellipsis')

    pages.push(totalPages)
  }

  return (
    <div
      className={`flex flex-col gap-3 border-t border-line px-4 py-3 sm:flex-row sm:items-center sm:justify-between ${className}`}
    >
      <div className="text-xs font-medium text-ink2-muted">
        Showing{' '}
        <span className="font-semibold text-ink2">
          {total === 0 ? 0 : (safePage - 1) * pageSize + 1}
        </span>{' '}
        to{' '}
        <span className="font-semibold text-ink2">
          {Math.min(safePage * pageSize, total)}
        </span>{' '}
        of{' '}
        <span className="font-semibold text-ink2">{total}</span>
      </div>

      <div className="flex items-center gap-1">
        <button
          type="button"
          disabled={disabled || safePage <= 1}
          onClick={() => onPageChange(safePage - 1)}
          className="inline-flex h-9 items-center gap-1 rounded-lg border border-line-strong bg-surface px-2.5 text-xs font-semibold text-ink2 transition hover:bg-canvas disabled:cursor-not-allowed disabled:opacity-40"
        >
          <ChevronLeft className="h-3.5 w-3.5" />
          <span className="hidden sm:inline">Previous</span>
        </button>

        {pages.map((item) => {
          if (typeof item !== 'number') {
            return (
              <span
                key={item}
                className="flex h-9 min-w-9 items-center justify-center px-1 text-xs text-ink2-muted"
              >
                …
              </span>
            )
          }

          const active = item === safePage

          return (
            <button
              key={item}
              type="button"
              disabled={disabled}
              onClick={() => onPageChange(item)}
              className={`flex h-9 min-w-9 items-center justify-center rounded-lg px-2 text-xs font-semibold transition ${
                active
                  ? 'bg-brand text-white shadow-sm'
                  : 'border border-transparent text-ink2 hover:border-line-strong hover:bg-canvas'
              }`}
            >
              {item}
            </button>
          )
        })}

        <button
          type="button"
          disabled={disabled || safePage >= totalPages}
          onClick={() => onPageChange(safePage + 1)}
          className="inline-flex h-9 items-center gap-1 rounded-lg border border-line-strong bg-surface px-2.5 text-xs font-semibold text-ink2 transition hover:bg-canvas disabled:cursor-not-allowed disabled:opacity-40"
        >
          <span className="hidden sm:inline">Next</span>
          <ChevronRight className="h-3.5 w-3.5" />
        </button>
      </div>
    </div>
  )
}
