import { useEffect } from 'react'


export default function EvidenceLightbox({
  images = [],
  index = 0,
  onClose,
  onPrevious,
  onNext,
}) {
  const image = images[index]

  useEffect(() => {
    function handleKeyDown(event) {
      if (event.key === 'Escape') {
        onClose()
      }

      if (event.key === 'ArrowLeft') {
        onPrevious()
      }

      if (event.key === 'ArrowRight') {
        onNext()
      }
    }

    document.addEventListener(
      'keydown',
      handleKeyDown
    )

    const previousOverflow =
      document.body.style.overflow

    document.body.style.overflow = 'hidden'

    return () => {
      document.removeEventListener(
        'keydown',
        handleKeyDown
      )

      document.body.style.overflow =
        previousOverflow
    }
  }, [
    onClose,
    onPrevious,
    onNext,
  ])

  if (!image) {
    return null
  }

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center bg-black/90 p-4 backdrop-blur-sm"
      role="dialog"
      aria-modal="true"
      aria-label="Evidence photo viewer"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) {
          onClose()
        }
      }}
    >

      <button
        type="button"
        aria-label="Close photo viewer"
        onClick={onClose}
        className="absolute right-4 top-4 z-10 flex h-10 w-10 items-center justify-center rounded-full bg-white/10 text-2xl text-white transition hover:bg-white/20"
      >
        ×
      </button>


      {images.length > 1 && (
        <button
          type="button"
          aria-label="Previous photo"
          onClick={onPrevious}
          className="absolute left-3 top-1/2 z-10 flex h-11 w-11 -translate-y-1/2 items-center justify-center rounded-full bg-white/10 text-2xl text-white transition hover:bg-white/20 sm:left-6"
        >
          ‹
        </button>
      )}


      <div className="flex max-h-full max-w-6xl flex-col items-center">

        <img
          src={image.url}
          alt={image.name || 'Evidence photo'}
          className="max-h-[82vh] max-w-[90vw] rounded-lg object-contain shadow-2xl"
        />

        <div className="mt-3 max-w-[90vw] truncate text-center text-sm text-white/80">
          {image.name || 'Evidence photo'}
        </div>

        {images.length > 1 && (
          <div className="mt-1 text-xs text-white/50">
            {index + 1} / {images.length}
          </div>
        )}

      </div>


      {images.length > 1 && (
        <button
          type="button"
          aria-label="Next photo"
          onClick={onNext}
          className="absolute right-3 top-1/2 z-10 flex h-11 w-11 -translate-y-1/2 items-center justify-center rounded-full bg-white/10 text-2xl text-white transition hover:bg-white/20 sm:right-6"
        >
          ›
        </button>
      )}

    </div>
  )
}
