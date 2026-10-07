import apiClient from './apiClient'

export async function fetchZones(params = {}) {
  const response = await apiClient.get('/zones', { params })
  return response.data
}

export async function fetchZonesPage({
  search = '',
  plantId = '',
  includeInactive = true,
  page = 1,
  pageSize = 10,
} = {}) {
  const params = {
    page,
    page_size: pageSize,
    include_inactive: includeInactive,
  }

  if (search) params.search = search
  if (plantId) params.plant_id = plantId

  const response = await apiClient.get('/zones', { params })
  return response.data
}

export async function fetchZone(zoneId) {
  const response = await apiClient.get(`/zones/${zoneId}`)
  return response.data
}

export async function createZone(payload) {
  const response = await apiClient.post('/zones', {
    name: payload.name,
    plant_id: payload.plant_id,
    code: payload.code ?? payload.zone_code ?? '',
    description: payload.description ?? '',
    zone_leader: payload.zone_leader ?? '',
    is_active: payload.is_active === undefined ? true : Boolean(payload.is_active),
  })
  return response.data
}

export async function updateZone(zoneId, payload) {
  const response = await apiClient.put(`/zones/${zoneId}`, {
    name: payload.name,
    plant_id: payload.plant_id,
    code: payload.code ?? payload.zone_code ?? '',
    description: payload.description ?? '',
    zone_leader: payload.zone_leader ?? '',
    is_active: payload.is_active === undefined ? true : Boolean(payload.is_active),
  })
  return response.data
}

export async function updateZoneStatus(zoneId, isActive) {
  const response = await apiClient.patch(`/zones/${zoneId}/status`, {
    is_active: Boolean(isActive),
  })
  return response.data
}

export async function deleteZone(zoneId) {
  const response = await apiClient.delete(`/zones/${zoneId}`)
  return response.data
}

export async function downloadZoneTemplate() {
  const response = await apiClient.get('/zones/template', {
    responseType: 'blob',
  })
  return response.data
}

export async function fetchZoneTemplate() {
  return downloadZoneTemplate()
}

export async function bulkUploadZones(plantId, file) {
  const formData = new FormData()
  formData.append('plant_id', plantId)
  formData.append('file', file)

  const response = await apiClient.post('/zones/bulk-upload', formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  })

  return response.data
}

export async function uploadZonesBulk(plantId, file) {
  return bulkUploadZones(plantId, file)
}
