import apiClient from './apiClient'

export const fetchPlants = async (includeInactive = false) => {
  const response = await apiClient.get('/plants', {
    params: {
      include_inactive: includeInactive,
    },
  })

  return response.data
}

export const fetchPlantsPage = async ({
  includeInactive = true,
  search = '',
  status = '',
  page = 1,
  pageSize = 10,
} = {}) => {
  const params = {
    include_inactive: includeInactive,
    page,
    page_size: pageSize,
  }

  if (search) params.search = search
  if (status && status !== 'all') params.status = status

  const response = await apiClient.get('/plants', { params })
  return response.data
}

export const fetchPlant = async (plantId) => {
  const response = await apiClient.get(`/plants/${plantId}`)
  return response.data
}

export const createPlant = async (plantData) => {
  const response = await apiClient.post('/plants', plantData)
  return response.data
}

export const updatePlant = async (plantId, plantData) => {
  const response = await apiClient.put(`/plants/${plantId}`, plantData)
  return response.data
}

export const deletePlant = async (plantId) => {
  await apiClient.delete(`/plants/${plantId}`)
  return true
}
