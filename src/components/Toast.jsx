import { useEffect } from 'react'

export default function Toast({
  message,
  type = 'success',
  onClose,
}) {
  useEffect(() => {
    if (!message) return

    const timer = setTimeout(() => {
      onClose?.()
    }, 4000)

    return () => clearTimeout(timer)
  }, [message, onClose])

  if (!message) {
    return null
  }

  function getMessageText(value) {
    if (typeof value === 'string') {
      return value
    }

    if (Array.isArray(value)) {
      return value
        .map((item) => getMessageText(item))
        .filter(Boolean)
        .join(', ')
    }

    if (value && typeof value === 'object') {
      if (typeof value.msg === 'string') {
        return value.msg
      }

      if (typeof value.detail === 'string') {
        return value.detail
      }

      if (Array.isArray(value.detail)) {
        return getMessageText(value.detail)
      }

      return 'Request validation failed.'
    }

    return String(value ?? '')
  }

  const text = getMessageText(message)

  return (
    <div
      className="rounded-lg border border-line bg-surface px-4 py-3 shadow-lg"
      role="alert"
    >
      <span className="text-sm text-ink2">
        {text}
      </span>
    </div>
  )
}
