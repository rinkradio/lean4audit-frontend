import { useEffect, useRef, useState } from 'react'
import { createPortal } from 'react-dom'

export default function RowActionMenu({ items = [] }) {
  const [isOpen, setIsOpen] = useState(false)
  const [position, setPosition] = useState({
    top: 0,
    right: 0,
  })

  const buttonRef = useRef(null)
  const menuRef = useRef(null)

  const safeItems = Array.isArray(items) ? items : []

  function updatePosition() {
    if (!buttonRef.current) return

    const rect =
      buttonRef.current.getBoundingClientRect()

    const menuWidth = 190
    const menuHeight = Math.min(
      safeItems.length * 44 + 16,
      280
    )

    let top = rect.bottom + 6
    let right =
      window.innerWidth - rect.right

    if (
      top + menuHeight >
      window.innerHeight - 8
    ) {
      top = rect.top - menuHeight - 6
    }

    if (right < 8) {
      right = 8
    }

    if (
      window.innerWidth -
        right -
        menuWidth <
      8
    ) {
      right =
        window.innerWidth -
        rect.left +
        6
    }

    setPosition({
      top,
      right,
    })
  }

  function toggleMenu(event) {
    event.stopPropagation()

    if (!isOpen) {
      updatePosition()
    }

    setIsOpen((current) => !current)
  }

  function closeMenu() {
    setIsOpen(false)
  }

  function handleAction(item) {
    closeMenu()

    if (
      item &&
      typeof item.onClick === 'function'
    ) {
      item.onClick()
    }
  }

  useEffect(() => {
    if (!isOpen) return

    updatePosition()

    function handleOutsideClick(event) {
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

      closeMenu()
    }

    function handleEscape(event) {
      if (event.key === 'Escape') {
        closeMenu()
      }
    }

    function handleViewportChange() {
      updatePosition()
    }

    document.addEventListener(
      'mousedown',
      handleOutsideClick
    )

    document.addEventListener(
      'keydown',
      handleEscape
    )

    window.addEventListener(
      'resize',
      handleViewportChange
    )

    window.addEventListener(
      'scroll',
      handleViewportChange,
      true
    )

    return () => {
      document.removeEventListener(
        'mousedown',
        handleOutsideClick
      )

      document.removeEventListener(
        'keydown',
        handleEscape
      )

      window.removeEventListener(
        'resize',
        handleViewportChange
      )

      window.removeEventListener(
        'scroll',
        handleViewportChange,
        true
      )
    }
  }, [isOpen])

  return (
    <>
      <button
        ref={buttonRef}
        type="button"
        aria-label="Actions"
        aria-haspopup="menu"
        aria-expanded={isOpen}
        onClick={toggleMenu}
        className="inline-flex h-9 w-9 items-center justify-center rounded-lg text-ink2-muted transition-colors hover:bg-canvas hover:text-ink2 focus:outline-none focus:ring-2 focus:ring-brand-soft"
      >
        <span className="flex flex-col items-center justify-center gap-1">
          <span className="h-1 w-1 rounded-full bg-current" />
          <span className="h-1 w-1 rounded-full bg-current" />
          <span className="h-1 w-1 rounded-full bg-current" />
        </span>
      </button>

      {isOpen &&
        createPortal(
          <>
            <div
              className="fixed inset-0 z-[9998]"
              onClick={closeMenu}
              aria-hidden="true"
            />

            <div
              ref={menuRef}
              role="menu"
              className="fixed z-[9999] w-[190px] overflow-hidden rounded-xl border border-line bg-surface py-1.5 shadow-xl"
              style={{
                top: `${position.top}px`,
                right: `${position.right}px`,
              }}
            >
              {safeItems.length === 0 ? (
                <div className="px-4 py-3 text-sm text-ink2-muted">
                  No actions available
                </div>
              ) : (
                safeItems.map((item, index) => {
                  if (!item) return null

                  const label =
                    item.label ||
                    item.title ||
                    'Action'

                  return (
                    <button
                      key={`${label}-${index}`}
                      type="button"
                      role="menuitem"
                      onClick={() =>
                        handleAction(item)
                      }
                      disabled={
                        item.disabled === true
                      }
                      className={`flex w-full items-center px-4 py-2.5 text-left text-sm font-medium transition-colors disabled:cursor-not-allowed disabled:opacity-50 ${
                        item.danger
                          ? 'text-red-600 hover:bg-red-50'
                          : 'text-ink2-secondary hover:bg-canvas hover:text-ink2'
                      }`}
                    >
                      {item.icon && (
                        <span className="mr-2.5 flex h-4 w-4 items-center justify-center">
                          {typeof item.icon ===
                          'function'
                            ? item.icon()
                            : item.icon}
                        </span>
                      )}

                      <span className="truncate">
                        {label}
                      </span>
                    </button>
                  )
                })
              )}
            </div>
          </>,
          document.body
        )}
    </>
  )
}