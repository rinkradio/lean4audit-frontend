import apiClient from './apiClient'

export async function fetchAudits({
  search = '',
  status = '',
  consultantId = '',
  zoneId = '',
  severity = '',
  dateFrom = '',
  dateTo = '',
  sort = 'newest',
  page = 1,
  pageSize = 10,
} = {}) {
  const params = { page, page_size: pageSize, sort }
  if (search) params.search = search
  if (status) params.status = status
  if (consultantId) params.consultant_id = consultantId
  if (zoneId) params.zone_id = zoneId
  if (severity) params.severity = severity
  if (dateFrom) params.date_from = dateFrom
  if (dateTo) params.date_to = dateTo
  const response = await apiClient.get('/audits', { params })
  return response.data
}

export async function fetchAudit(auditId) {
  const response = await apiClient.get(`/audits/${auditId}`)
  return response.data
}

export async function createAudit(payload) {
  const response = await apiClient.post('/audits', payload)
  return response.data
}

export async function updateAudit(auditId, payload) {
  const response = await apiClient.put(`/audits/${auditId}`, payload)
  return response.data
}

export async function submitAudit(auditId) {
  const response = await apiClient.post(`/audits/${auditId}/submit`)
  return response.data
}
