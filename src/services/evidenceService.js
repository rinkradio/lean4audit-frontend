
import apiClient from './apiClient'

// ---------------------------------------------------------
// UPLOAD OBSERVATION EVIDENCE
// ---------------------------------------------------------

export async function uploadObservationEvidence(
  observationId,
  file
) {
  if (!observationId) {
    throw new Error('Observation ID is required.')
  }

  if (!file) {
    throw new Error('Evidence file is required.')
  }

  const formData = new FormData()

  formData.append(
    'file',
    file,
    file.name || 'evidence.jpg'
  )

  const response = await apiClient.post(
    `/observations/${observationId}/evidence`,
    formData
  )

  return response.data
}

// ---------------------------------------------------------
// FETCH OBSERVATION EVIDENCE
// ---------------------------------------------------------

export async function fetchObservationEvidence(
  observationId
) {
  if (!observationId) {
    throw new Error('Observation ID is required.')
  }

  const response = await apiClient.get(
    `/observations/${observationId}/evidence`
  )

  return response.data
}

// ---------------------------------------------------------
// FETCH AUTHENTICATED EVIDENCE FILE
// ---------------------------------------------------------

export async function fetchObservationEvidenceFile(
  evidenceId
) {
  if (!evidenceId) {
    throw new Error('Evidence ID is required.')
  }

  const response = await apiClient.get(
    `/observations/evidence/${evidenceId}/file`,
    {
      responseType: 'blob',
    }
  )

  return URL.createObjectURL(response.data)
}

// ---------------------------------------------------------
// DELETE OBSERVATION EVIDENCE
// ---------------------------------------------------------

export async function deleteObservationEvidence(
  evidenceId
) {
  if (!evidenceId) {
    throw new Error('Evidence ID is required.')
  }

  await apiClient.delete(
    `/observations/evidence/${evidenceId}`
  )
}
