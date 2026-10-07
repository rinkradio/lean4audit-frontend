import apiClient from './apiClient'


// ---------------------------------------------------------
// LOCATIONS
// ---------------------------------------------------------

export async function fetchLocations(
  zoneId
) {
  const response = await apiClient.get(
    `/locations/zone/${zoneId}`
  )

  return response.data
}


// ---------------------------------------------------------
// CREATE OBSERVATION
// ---------------------------------------------------------

export async function createObservation(
  auditId,
  payload
) {
  const response = await apiClient.post(
    `/audits/${auditId}/observations`,
    payload
  )

  return response.data
}


// ---------------------------------------------------------
// FETCH OBSERVATIONS
// ---------------------------------------------------------

export async function fetchObservations(
  auditId,
  {
    page = 1,
    pageSize = 20,
  } = {}
) {
  const response = await apiClient.get(
    `/audits/${auditId}/observations`,
    {
      params: {
        page,
        page_size: pageSize,
      },
    }
  )

  return response.data
}


// ---------------------------------------------------------
// FETCH SINGLE OBSERVATION
// ---------------------------------------------------------

export async function fetchObservation(
  observationId
) {
  const response = await apiClient.get(
    `/audits/observation/${observationId}`
  )

  return response.data
}


// ---------------------------------------------------------
// UPDATE OBSERVATION
// ---------------------------------------------------------

export async function updateObservation(
  observationId,
  payload
) {
  const response = await apiClient.patch(
    `/audits/observation/${observationId}`,
    payload
  )

  return response.data
}


// ---------------------------------------------------------
// DELETE OBSERVATION
// ---------------------------------------------------------

export async function deleteObservation(
  observationId
) {
  await apiClient.delete(
    `/audits/observation/${observationId}`
  )
}