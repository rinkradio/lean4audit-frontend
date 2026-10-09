import apiClient from './apiClient'

const MAX_UPLOAD_BYTES = 8 * 1024 * 1024
const MAX_SOURCE_BYTES = 25 * 1024 * 1024
const MAX_IMAGE_DIMENSION = 1920
const ALLOWED_TYPES = new Set([
  'image/jpeg',
  'image/png',
  'image/webp',
])
const ALLOWED_EXTENSIONS = new Set(['jpg', 'jpeg', 'png', 'webp'])

function fileExtension(name = '') {
  return name.split('.').pop()?.toLowerCase() || ''
}

function canvasToBlob(canvas, type, quality) {
  return new Promise((resolve, reject) => {
    canvas.toBlob((blob) => {
      if (blob) resolve(blob)
      else reject(new Error('Could not process this image. Please choose a JPG, PNG or WEBP image.'))
    }, type, quality)
  })
}

/**
 * Normalizes large mobile photos to a smaller JPEG before upload.
 * HEIC/HEIF can only be converted when the current browser can decode it.
 */
export async function prepareEvidenceFile(file) {
  if (!file) throw new Error('Evidence file is required.')

  if (file.size > MAX_SOURCE_BYTES) {
    throw new Error('This image is larger than 25 MB. Please choose a smaller photo.')
  }

  const ext = fileExtension(file.name)
  const isPotentialImage = file.type.startsWith('image/') || ALLOWED_EXTENSIONS.has(ext) || ['heic', 'heif'].includes(ext)
  if (!isPotentialImage) {
    throw new Error('Please choose an image file.')
  }

  if (ALLOWED_TYPES.has(file.type) && ALLOWED_EXTENSIONS.has(ext) && file.size <= MAX_UPLOAD_BYTES) {
    return file
  }

  let bitmap
  try {
    if ('createImageBitmap' in window) {
      bitmap = await createImageBitmap(file)
    } else {
      bitmap = await new Promise((resolve, reject) => {
        const image = new Image()
        const url = URL.createObjectURL(file)
        image.onload = () => {
          URL.revokeObjectURL(url)
          resolve(image)
        }
        image.onerror = () => {
          URL.revokeObjectURL(url)
          reject(new Error('Your browser cannot read this photo format. Please choose JPG, PNG or WEBP, or take a new photo using the camera option.'))
        }
        image.src = url
      })
    }
  } catch {
    throw new Error('Your browser cannot read this photo format. Please choose JPG, PNG or WEBP, or take a new photo using the camera option.')
  }

  try {
    const sourceWidth = bitmap.width
    const sourceHeight = bitmap.height
    if (!sourceWidth || !sourceHeight) {
      throw new Error('Could not read the selected image. Please choose another photo.')
    }

    const scale = Math.min(1, MAX_IMAGE_DIMENSION / Math.max(sourceWidth, sourceHeight))
    const canvas = document.createElement('canvas')
    canvas.width = Math.max(1, Math.round(sourceWidth * scale))
    canvas.height = Math.max(1, Math.round(sourceHeight * scale))

    const context = canvas.getContext('2d')
    if (!context) throw new Error('Image processing is not supported by this browser.')
    context.drawImage(bitmap, 0, 0, canvas.width, canvas.height)

    let quality = 0.86
    let blob = await canvasToBlob(canvas, 'image/jpeg', quality)
    while (blob.size > MAX_UPLOAD_BYTES && quality > 0.5) {
      quality -= 0.1
      blob = await canvasToBlob(canvas, 'image/jpeg', quality)
    }

    if (blob.size > MAX_UPLOAD_BYTES) {
      throw new Error('This image could not be reduced below 8 MB. Please choose a smaller photo.')
    }

    const baseName = file.name.replace(/\.[^.]+$/, '') || 'evidence'
    return new File([blob], `${baseName}.jpg`, {
      type: 'image/jpeg',
      lastModified: Date.now(),
    })
  } finally {
    if (bitmap && typeof bitmap.close === 'function') bitmap.close()
  }
}

function getUploadErrorMessage(error) {
  const detail = error?.response?.data?.detail
  if (typeof detail === 'string') return detail
  if (error?.code === 'ERR_NETWORK' || (!error?.response && error?.request)) {
    return 'Could not reach the server while uploading the photo. Check your connection and try again. If this continues, contact support.'
  }
  return error?.message || 'Unable to upload evidence. Please try again.'
}

// ---------------------------------------------------------
// UPLOAD OBSERVATION EVIDENCE
// ---------------------------------------------------------
export async function uploadObservationEvidence(observationId, file) {
  if (!observationId) throw new Error('Observation ID is required.')
  if (!file) throw new Error('Evidence file is required.')

  const uploadFile = await prepareEvidenceFile(file)
  const formData = new FormData()
  formData.append('file', uploadFile, uploadFile.name || 'evidence.jpg')

  try {
    // Do not manually set Content-Type. The browser must add the multipart boundary.
    const response = await apiClient.post(
      `/observations/${observationId}/evidence`,
      formData
    )
    return response.data
  } catch (error) {
    if (error?.code === 'ERR_NETWORK' || (!error?.response && error?.request)) {
      error.userMessage = getUploadErrorMessage(error)
    }
    throw error
  }
}

// ---------------------------------------------------------
// FETCH OBSERVATION EVIDENCE
// ---------------------------------------------------------
export async function fetchObservationEvidence(observationId) {
  if (!observationId) throw new Error('Observation ID is required.')
  const response = await apiClient.get(`/observations/${observationId}/evidence`)
  return response.data
}

// ---------------------------------------------------------
// FETCH AUTHENTICATED EVIDENCE FILE
// ---------------------------------------------------------
export async function fetchObservationEvidenceFile(evidenceId) {
  if (!evidenceId) throw new Error('Evidence ID is required.')
  const response = await apiClient.get(
    `/observations/evidence/${evidenceId}/file`,
    { responseType: 'blob' }
  )
  return URL.createObjectURL(response.data)
}

// ---------------------------------------------------------
// DELETE OBSERVATION EVIDENCE
// ---------------------------------------------------------
export async function deleteObservationEvidence(evidenceId) {
  if (!evidenceId) throw new Error('Evidence ID is required.')
  await apiClient.delete(`/observations/evidence/${evidenceId}`)
}
