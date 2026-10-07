import apiClient from './apiClient'

export async function loginRequest(employeeId, password) {
  const response = await apiClient.post('/auth/login', {
    employee_id: employeeId,
    password,
  })
  return response.data
}

export async function fetchCurrentUser() {
  const response = await apiClient.get('/auth/me')
  return response.data
}
