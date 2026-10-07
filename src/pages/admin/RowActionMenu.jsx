import { useEffect, useRef, useState } from 'react'
import { createPortal } from 'react-dom'

export default function RowActionMenu({
  items = [],
  label = 'Actions',
}) {
  const buttonRef = useRef(null)
  const menuRef = useRef(null)

  const [open, setOpen] = useState(false)
  const [position, setPosition] = useState({
    top: 0,
    left: 0,
  })

  const updatePosition = () => {
    if (!buttonRef.current) return

    const rect =
      buttonRef.current.getBoundingClientRect()

    const menuWidth = 190
    const menuHeight = Math.min(
      items.length * 44 + 16,
      320
    )

    let left = rect.right - menuWidth
    let top = rect.bottom + 6

    if (left < 8) {
      left = 8
    }

    if (
      left + menuWidth >
      window.innerWidth - 8
    ) {
      left =
        window.innerWidth -
        menuWidth -
        8
    }

    if (
      top + menuHeight >
      window.innerHeight - 8
    ) {
      top = rect.top - menuHeight - 6
    }

    if (top < 8) {
      top = 8
    }

    setPosition({
      top,
      left,
    })
  }

  useEffect(() => {
    if (!open) return

    updatePosition()

    const handlePointerDown = (event) => {
      if (
        buttonRef.current?.contains(
          event.target
        )
      ) {
        return
      }

      if (
        menuRef.current?.contains(
          event.target
        )
      ) {
        return
      }

      setOpen(false)
    }

    const handleScroll = () => {
      updatePosition()
    }

    const handleResize = () => {
      updatePosition()
    }

    document.addEventListener(
      'mousedown',
      handlePointerDown
    )

    window.addEventListener(
      'scroll',
      handleScroll,
      true
    )

    window.addEventListener(
      'resize',
      handleResize
    )

    return () => {
      document.removeEventListener(
        'mousedown',
        handlePointerDown
      )

      window.removeEventListener(
        'scroll',
        handleScroll,
        true
      )

      window.removeEventListener(
        'resize',
        handleResize
      )
    }
  }, [open, items.length])

  const handleToggle = () => {
    if (!open) {
      updatePosition()
    }

    setOpen((value) => !value)
  }

  const handleItemClick = (item) => {
    setOpen(false)

    if (
      typeof item.onClick === 'function'
    ) {
      item.onClick()
    }
  }

  return (
    <>
      <button
        ref={buttonRef}
        type="button"
        aria-label={label}
        aria-expanded={open}
        onClick={handleToggle}
        className="inline-flex h-9 w-9 items-center justify-center rounded-lg border border-line bg-surface text-ink2-secondary transition hover:border-line-strong hover:bg-canvas hover:text-ink2 focus:outline-none focus:ring-2 focus:ring-brand/20"
      >
        <span className="flex items-center gap-0.5">
          <span className="h-1 w-1 rounded-full bg-current" />
          <span className="h-1 w-1 rounded-full bg-current" />
          <span className="h-1 w-1 rounded-full bg-current" />
        </span>
      </button>

      {open &&
        createPortal(
          <div
            ref={menuRef}
            className="fixed z-[99999] min-w-[190px] overflow-hidden rounded-xl border border-line bg-surface p-1.5 shadow-xl"
            style={{
              top: `${position.top}px`,
              left: `${position.left}px`,
            }}
          >
            {items.map((item, index) => {
              if (item.hidden) {
                return null
              }

              const danger =
                item.danger === true

              const disabled =
                item.disabled === true

              return (
                <button
                  key={
                    item.key ??
                    item.label ??
                    index
                  }
                  type="button"
                  disabled={disabled}
                  onClick={() =>
                    handleItemClick(item)
                  }
                  className={`flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-left text-sm font-medium transition ${
                    disabled
                      ? 'cursor-not-allowed opacity-50'
                      : danger
                        ? 'text-danger hover:bg-danger-soft'
                        : 'text-ink2 hover:bg-canvas'
                  }`}
                >
                  {item.icon && (
                    <span className="flex h-4 w-4 shrink-0 items-center justify-center">
                      {item.icon}
                    </span>
                  )}

                  <span className="flex-1">
                    {item.label}
                  </span>
                </button>
              )
            })}
          </div>,
          document.body
        )}
    </>
  )
}