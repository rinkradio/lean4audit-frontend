import apiClient from './apiClient'

// ---------------------------------------------------------
// CONSULTANTS
// ---------------------------------------------------------

export async function fetchConsultants(params = {}) {
  const response = await apiClient.get(
    '/users/consultants',
    {
      params,
    }
  )

  return response.data
}

export async function fetchConsultant(
  consultantId
) {
  const response = await apiClient.get(
    `/users/consultants/${consultantId}`
  )

  return response.data
}

export async function createConsultant(
  payload
) {
  const response = await apiClient.post(
    '/users/consultants',
    payload
  )

  return response.data
}

export async function updateConsultant(
  consultantId,
  payload
) {
  const response = await apiClient.put(
    `/users/consultants/${consultantId}`,
    payload
  )

  return response.data
}

export async function setConsultantStatus(
  consultantId,
  isActive
) {
  const response = await apiClient.patch(
    `/users/consultants/${consultantId}/status`,
    {
      is_active: isActive,
    }
  )

  return response.data
}

export async function updateConsultantStatus(
  consultantId,
  isActive
) {
  return setConsultantStatus(
    consultantId,
    isActive
  )
}

export async function resetConsultantPassword(
  consultantId,
  payload
) {
  const response = await apiClient.post(
    `/users/consultants/${consultantId}/reset-password`,
    payload
  )

  return response.data
}

// ---------------------------------------------------------
// ADMIN — PLANT / ZONE ACCESS OPTIONS
// ---------------------------------------------------------

export async function fetchConsultantPlants() {
  const response = await apiClient.get(
    '/users/consultants/access/plants'
  )

  return response.data
}

export async function fetchConsultantZones(
  plantId
) {
  const response = await apiClient.get(
    '/users/consultants/access/zones',
    {
      params: {
        plant_id: plantId,
      },
    }
  )

  return response.data
}

// ---------------------------------------------------------
// ADMIN — SPECIFIC CONSULTANT ACCESS
// ---------------------------------------------------------

export async function fetchConsultantAccessById(
  consultantId
) {
  const response = await apiClient.get(
    `/users/consultants/${consultantId}/access`
  )

  return response.data
}

// ---------------------------------------------------------
// CONSULTANT — OWN ACCESS
// ---------------------------------------------------------

export async function fetchConsultantAccess() {
  const response = await apiClient.get(
    '/consultant/access'
  )

  return response.data
}