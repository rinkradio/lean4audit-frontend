import apiClient from './apiClient'

export async function fetchAuditNotificationSummary() {
  const response = await apiClient.get(
    '/audit-notifications/unread-summary'
  )

  return response.data
}

export async function markAuditNotificationRead(auditId) {
  const response = await apiClient.post(
    `/audit-notifications/${auditId}/read`
  )

  return response.data
}
